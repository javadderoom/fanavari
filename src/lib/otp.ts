import { randomInt, createHash, timingSafeEqual } from 'node:crypto';
import { prisma } from './prisma';

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_LENGTH = 6;

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

function toLatinDigits(input: string): string {
  return input
    .split('')
    .map((ch) => {
      const fa = FA_DIGITS.indexOf(ch);
      if (fa >= 0) return String(fa);
      const ar = AR_DIGITS.indexOf(ch);
      if (ar >= 0) return String(ar);
      return ch;
    })
    .join('');
}

/**
 * Normalizes Iranian mobile input to E.164 (+989...).
 * Accepts 09..., +98..., 0098..., 98..., Persian/Arabic digits,
 * spaces and dashes. Returns null when not a valid mobile.
 */
export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  let digits = toLatinDigits(String(input)).replace(/[\s\-()]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('0098')) digits = digits.slice(4);
  else if (digits.startsWith('98')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  const e164 = `+98${digits}`;
  return /^\+989\d{9}$/.test(e164) ? e164 : null;
}

export function normalizeEmail(input: string | null | undefined): string | null {
  if (!input) return null;
  const email = String(input).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null;
}

/** Masks a contact for display: 0912***3456 / al***@domain.com */
export function maskContact(identifier: string): string {
  if (identifier.includes('@')) {
    const [local, domain] = identifier.split('@');
    const head = local.length > 2 ? local.slice(0, 2) : local;
    return `${head}***@${domain || 'domain'}`;
  }
  const digits = identifier.replace(/\D/g, '');
  if (digits.length >= 7) {
    return `${digits.slice(0, 4)}***${digits.slice(-4)}`;
  }
  return '***';
}

export function generateOtpCode(length = OTP_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i++) code += String(randomInt(0, 10));
  return code;
}

export function hashOtpCode(code: string): string {
  return createHash('sha256').update(code, 'utf8').digest('hex');
}

export class OtpTooSoonError extends Error {
  retryAfterSeconds: number;
  constructor(retryAfterSeconds: number) {
    super(`Resend cooldown active. Retry in ${retryAfterSeconds}s.`);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface IssueCodeInput {
  userId?: string | null;
  channel: 'sms' | 'email';
  /** Raw identifier — normalized inside */
  identifier: string;
}

/**
 * Creates a new verification code row and returns the plaintext code for
 * sending. Previous unconsumed codes for the same identifier stay valid
 * until expiry (latest-first verification), but resends are cooldown-gated.
 */
export async function issueVerificationCode(input: IssueCodeInput): Promise<{ code: string; expiresAt: Date }> {
  const identifier =
    input.channel === 'sms' ? normalizePhone(input.identifier) : normalizeEmail(input.identifier);
  if (!identifier) {
    throw new Error(input.channel === 'sms' ? 'شماره موبایل معتبر نیست.' : 'نشانی ایمیل معتبر نیست.');
  }

  const latest = await prisma.verificationCode.findFirst({
    where: { identifier, channel: input.channel, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (latest) {
    const waited = Date.now() - new Date(latest.createdAt).getTime();
    if (waited < OTP_RESEND_COOLDOWN_MS) {
      throw new OtpTooSoonError(Math.ceil((OTP_RESEND_COOLDOWN_MS - waited) / 1000));
    }
  }

  const code = generateOtpCode();
  const created = await prisma.verificationCode.create({
    data: {
      userId: input.userId || null,
      channel: input.channel,
      identifier,
      codeHash: hashOtpCode(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  return { code, expiresAt: created.expiresAt };
}

export interface VerifyCodeInput {
  channel: 'sms' | 'email';
  identifier: string;
  code: string;
}

export interface VerifyCodeResult {
  ok: boolean;
  reason?: 'expired' | 'mismatch' | 'locked' | 'not-found';
  userId?: string | null;
}

/** Verifies a code (latest-first), counting attempts and consuming on success. */
export async function verifyCode(input: VerifyCodeInput): Promise<VerifyCodeResult> {
  const identifier =
    input.channel === 'sms' ? normalizePhone(input.identifier) : normalizeEmail(input.identifier);
  if (!identifier) return { ok: false, reason: 'not-found' };

  const record = await prisma.verificationCode.findFirst({
    where: { identifier, channel: input.channel, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) return { ok: false, reason: 'not-found' };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'expired' };
  if (record.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: 'locked' };

  const candidate = hashOtpCode(String(input.code).trim());
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(record.codeHash, 'hex');
  const match = a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: 'mismatch' };
  }

  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date(), attempts: { increment: 1 } },
  });

  return { ok: true, userId: record.userId };
}

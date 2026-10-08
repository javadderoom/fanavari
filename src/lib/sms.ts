/**
 * SMS sending abstraction for OTP delivery.
 * Production driver: Kavenegar Verify Lookup (template-based OTP — the
 * reliable path on Iranian carriers). Uses global fetch, no extra deps.
 * Without KAVENEGAR_API_KEY configured, falls back to a log-only driver
 * so local development works without spending SMS credit.
 *
 * Env:
 *   KAVENEGAR_API_KEY      REST API key (account-wide, not per-project)
 *   KAVENEGAR_TEMPLATE     Verify-lookup template name (also accepts
 *                          KAVENEGAR_OTP_TEMPLATE as an alias). The template
 *                          must contain a %token% placeholder in the panel.
 */

export interface SmsProvider {
  sendOtp(phoneE164: string, code: string): Promise<void>;
}

function toNational(phoneE164: string): string {
  // Kavenegar receptors use national format: 0912...
  const digits = phoneE164.replace(/\D/g, '');
  if (digits.startsWith('98')) return `0${digits.slice(2)}`;
  return digits.startsWith('0') ? digits : `0${digits}`;
}

class KavenegarProvider implements SmsProvider {
  private apiKey: string;
  private template: string;

  constructor(apiKey: string, template: string) {
    this.apiKey = apiKey;
    this.template = template;
  }

  async sendOtp(phoneE164: string, code: string): Promise<void> {
    const url =
      `https://api.kavenegar.com/v1/${encodeURIComponent(this.apiKey)}` +
      `/verify/lookup.json?receptor=${encodeURIComponent(toNational(phoneE164))}` +
      `&token=${encodeURIComponent(code)}&template=${encodeURIComponent(this.template)}`;

    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      throw new Error(`Kavenegar HTTP ${res.status}`);
    }
    const body = (await res.json().catch(() => null)) as {
      return?: { status?: number; message?: string };
    } | null;
    const status = body?.return?.status;
    // Kavenegar returns HTTP 200 with return.status 200 on success.
    if (status !== 200) {
      throw new Error(`Kavenegar rejected SMS: ${body?.return?.message || `status ${status}`}`);
    }
  }
}

class LogSmsProvider implements SmsProvider {
  async sendOtp(phoneE164: string, code: string): Promise<void> {
    // Dev only: no SMS is sent. Never enable in production.
    console.log(`[sms:dev] OTP for ${phoneE164}: ${code}`);
  }
}

let cached: SmsProvider | null = null;
let warned = false;

export function getSmsProvider(): SmsProvider {
  if (cached) return cached;
  const apiKey = (process.env.KAVENEGAR_API_KEY || '').trim();
  const template = (
    process.env.KAVENEGAR_TEMPLATE ||
    process.env.KAVENEGAR_OTP_TEMPLATE ||
    'fanavari-otp'
  ).trim();
  if (apiKey) {
    cached = new KavenegarProvider(apiKey, template);
  } else {
    if (!warned) {
      console.warn('[sms] KAVENEGAR_API_KEY not set — using log-only SMS driver.');
      warned = true;
    }
    cached = new LogSmsProvider();
  }
  return cached;
}

/** Test seam: replace the provider (unit tests should never hit the network). */
export function __setSmsProvider(provider: SmsProvider | null) {
  cached = provider;
  warned = true;
}

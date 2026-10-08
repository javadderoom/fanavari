import { randomBytes, createHash } from 'node:crypto';
import { prisma } from './prisma';

export const SESSION_COOKIE = 'fanavari_session';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Demo header-trust is deny-by-default: allowed only when explicitly enabled. */
export function isDemoAuthAllowed(): boolean {
  return (
    process.env.ALLOW_DEMO_LOGIN === 'true' ||
    process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === 'true'
  );
}

export interface SessionUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  roleName: string;
  departmentId: string | null;
  departmentName?: string | null;
  permissions: number;
  avatarUrl?: string | null;
  otpEnabled: boolean;
  status: string;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function buildSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return (
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax` +
    `${secure}; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  );
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readSessionToken(req: Request): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE) return rest.join('=');
  }
  return null;
}

/** Creates a session row and returns the raw token to set as cookie. */
export async function createSession(
  userId: string,
  meta?: { userAgent?: string | null; ip?: string | null }
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await prisma.userSession.create({
    data: {
      userId,
      sessionTokenHash: hashToken(token),
      userAgent: meta?.userAgent || null,
      ip: meta?.ip || null,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return token;
}

/** Resolves the session cookie to an active, non-suspended user. */
export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const token = readSessionToken(req);
  if (!token) return null;

  const session = await prisma.userSession.findUnique({
    where: { sessionTokenHash: hashToken(token) },
    include: {
      user: { include: { department: { select: { name: true } } } },
    },
  });
  if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) return null;

  const u = session.user;
  if (u.status !== 'active') return null;

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    emailVerified: Boolean(u.emailVerifiedAt),
    phoneVerified: Boolean(u.phoneVerifiedAt),
    roleName: u.roleName,
    departmentId: u.departmentId,
    departmentName: u.department?.name || null,
    permissions: u.permissions,
    avatarUrl: u.avatarUrl,
    otpEnabled: u.otpEnabled,
    status: u.status,
  };
}

export async function revokeSession(req: Request): Promise<void> {
  const token = readSessionToken(req);
  if (!token) return;
  await prisma.userSession.updateMany({
    where: { sessionTokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Revokes every session of a user (used on password change). */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.userSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

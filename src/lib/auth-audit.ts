import { prisma } from './prisma';
import { maskContact } from './otp';

/**
 * Best-effort auth audit logging. Failures never break the auth flow —
 * callers intentionally don't await the result.
 */
export type AuthAuditAction =
  | 'signup'
  | 'verify'
  | 'login'
  | 'login-otp'
  | 'logout'
  | 'password-change'
  | 'password-reset-request'
  | 'password-reset-confirm'
  | 'otp-toggle'
  | 'contact-add';

export async function logAuthEvent(input: {
  action: AuthAuditAction;
  userId?: string | null;
  identifier?: string | null;
  success?: boolean;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    await prisma.authAuditLog.create({
      data: {
        action: input.action,
        userId: input.userId || null,
        identifierMasked: input.identifier ? maskContact(input.identifier) : null,
        success: input.success !== false,
        ip: input.ip || null,
        userAgent: input.userAgent ? input.userAgent.slice(0, 300) : null,
      },
    });
  } catch (err) {
    console.error('Auth audit log failed:', err);
  }
}

export function auditMeta(req: Request): { ip: string | null; userAgent: string | null } {
  return {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null,
    userAgent: req.headers.get('user-agent'),
  };
}

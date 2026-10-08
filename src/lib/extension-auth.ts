import { createHash, randomBytes } from 'crypto';
import { prisma } from './prisma';
import { getSessionUser, isDemoAuthAllowed } from './session';
import { Permissions, hasPermission } from './permissions';

export const EXTENSION_TOKEN_PREFIX = 'fanx_';

/** SHA-256 hash for at-rest token storage (raw token is shown only once at issue). */
export function hashExtensionToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export interface ExtensionUser {
  id: string;
  name: string;
  email: string | null;
  roleName: string;
  permissions: number;
}

/**
 * Resolves the calling author server-side. Priority:
 *  1. Session cookie (real dashboard login).
 *  2. Extension token (`x-extension-token: fanx_...`, cryptographic).
 *  3. Demo dashboard headers — only when demo auth is allowed.
 * Returns null when unknown.
 */
export async function resolveExtensionUser(req: Request): Promise<ExtensionUser | null> {
  const sessionUser = await getSessionUser(req).catch(() => null);
  if (sessionUser) {
    return {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      roleName: sessionUser.roleName,
      permissions: sessionUser.permissions,
    };
  }

  const rawToken = req.headers.get('x-extension-token');
  if (rawToken && rawToken.startsWith(EXTENSION_TOKEN_PREFIX)) {
    const user = await prisma.user.findFirst({
      where: { extensionToken: hashExtensionToken(rawToken) },
      select: { id: true, name: true, email: true, roleName: true, permissions: true },
    });
    if (user) return user;
  }

  if (!isDemoAuthAllowed()) return null;

  const userId = req.headers.get('x-user-id');
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, roleName: true, permissions: true },
    });
    if (user) {
      const permissions = Number(req.headers.get('x-user-permissions') || user.permissions);
      return { ...user, permissions };
    }
  }

  return null;
}

/** Authors need process-edit rights (or Super Admin bypass). */
export function canAuthor(user: ExtensionUser): boolean {
  return (
    hasPermission(user.permissions, Permissions.EDIT_PROCESSES) ||
    hasPermission(user.permissions, Permissions.ADMINISTRATOR)
  );
}

/** Mints a new raw token for a user and stores only its hash. */
export async function mintExtensionToken(userId: string): Promise<string> {
  const rawToken = `${EXTENSION_TOKEN_PREFIX}${randomBytes(32).toString('hex')}`;
  await prisma.user.update({
    where: { id: userId },
    data: { extensionToken: hashExtensionToken(rawToken) },
  });
  return rawToken;
}

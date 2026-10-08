import { prisma } from './prisma';
import { getSessionUser, isDemoAuthAllowed } from './session';
import { hashExtensionToken } from './extension-auth';

export { isDemoAuthAllowed };

export type ApiUserSource = 'session' | 'extension' | 'demo' | 'anonymous';

export interface ApiUser {
  /** Usable identity for ACL checks (DB id for session/extension, persona id for demo, null for anonymous). */
  id: string | null;
  /** Real database User id, or null (demo personas and guests have none). */
  dbUserId: string | null;
  roleName: string | null;
  departmentId: string | null;
  permissions: number;
  source: ApiUserSource;
}

/** Demo header-trust is defined in session.ts (single source of truth). */

function parseDemoHeaders(req: Request): ApiUser | null {
  const id = req.headers.get('x-user-id');
  const rawRole = req.headers.get('x-user-role');
  let roleName: string | null = rawRole;
  if (rawRole) {
    try {
      roleName = decodeURIComponent(rawRole);
    } catch {
      roleName = rawRole;
    }
  }
  const departmentId = req.headers.get('x-user-dept') || null;
  const permissions = Number(req.headers.get('x-user-permissions') || '0');
  if (!id && !roleName && !departmentId && !permissions) return null;
  return { id, dbUserId: null, roleName, departmentId, permissions, source: 'demo' };
}

/**
 * Resolves the caller server-side. Priority:
 *  1. Session cookie (real login) — permissions come from the database.
 *  2. Extension token (cryptographic authoring credential).
 *  3. Demo `x-user-*` headers — only when demo auth is allowed.
 *  4. Anonymous (reads see public data; writes are rejected).
 *
 * Route handlers must use this instead of reading `x-user-*` headers
 * directly — those headers are client-controlled and must never be trusted.
 */
export async function resolveApiUser(req: Request): Promise<ApiUser> {
  const sessionUser = await getSessionUser(req).catch(() => null);
  if (sessionUser) {
    return {
      id: sessionUser.id,
      dbUserId: sessionUser.id,
      roleName: sessionUser.roleName,
      departmentId: sessionUser.departmentId,
      permissions: sessionUser.permissions,
      source: 'session',
    };
  }

  const rawToken = req.headers.get('x-extension-token');
  if (rawToken) {
    const user = await prisma.user
      .findFirst({
        where: { extensionToken: hashExtensionToken(rawToken) },
        select: { id: true, roleName: true, departmentId: true, permissions: true, status: true },
      })
      .catch(() => null);
    if (user && user.status === 'active') {
      return {
        id: user.id,
        dbUserId: user.id,
        roleName: user.roleName,
        departmentId: user.departmentId,
        permissions: user.permissions,
        source: 'extension',
      };
    }
  }

  if (isDemoAuthAllowed()) {
    return (
      parseDemoHeaders(req) || {
        id: null,
        dbUserId: null,
        roleName: null,
        departmentId: null,
        permissions: 0,
        source: 'anonymous',
      }
    );
  }

  return {
    id: null,
    dbUserId: null,
    roleName: null,
    departmentId: null,
    permissions: 0,
    source: 'anonymous',
  };
}

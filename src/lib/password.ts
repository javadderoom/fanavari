import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt);

// Node scrypt defaults (N=16384, r=8, p=1) — interactive-login safe (~50ms).
// Stored with explicit parameters so verification stays pinned to them.
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

function encode(hash: Buffer, salt: Buffer): string {
  return `scrypt$${N}$${R}$${P}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

/** Hashes a password with a random salt. Format: scrypt$N$r$p$saltHex$keyHex */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scrypt(password, salt, KEYLEN)) as Buffer;
  return encode(key, salt);
}

/** Verifies a password against a hash produced by hashPassword. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltHex, keyHex] = parts;
  // Hashes are only ever written with the pinned parameters above; refuse
  // anything else rather than silently verifying under different settings.
  if (Number(n) !== N || Number(r) !== R || Number(p) !== P) return false;
  try {
    const key = (await scrypt(password, Buffer.from(saltHex, 'hex'), KEYLEN)) as Buffer;
    const expected = Buffer.from(keyHex, 'hex');
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

export function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8 && password.length <= 200;
}

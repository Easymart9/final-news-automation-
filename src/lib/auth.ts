import { cookies } from 'next/headers';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/db';
import { getAdminSessionToken } from '@/lib/admin-session';

const PASSWORD_HASH_PREFIX = 'scrypt';

export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${PASSWORD_HASH_PREFIX}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verifyPasswordHash(password: string, encodedHash: string): boolean {
  const [algorithm, saltHex, hashHex] = encodedHash.split('$');
  if (algorithm !== PASSWORD_HASH_PREFIX || !saltHex || !hashHex || !/^[a-f0-9]+$/i.test(saltHex + hashHex)) {
    return false;
  }
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  if (expected.length !== 64) return false;
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

export function verifyAdminPassword(password: string): boolean {
  if (typeof password !== 'string' || password.length === 0) return false;
  const storedHash = db.getStats().adminPasswordHash;
  if (storedHash) return verifyPasswordHash(password, storedHash);

  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return false;
  const provided = Buffer.from(password);
  const configured = Buffer.from(envPassword);
  return provided.length === configured.length && timingSafeEqual(provided, configured);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session_token');
  const sessionToken = getAdminSessionToken();
  return Boolean(sessionToken && token?.value === sessionToken);
}

export async function setAdminSessionCookie() {
  const sessionToken = getAdminSessionToken();
  if (!sessionToken) {
    throw new Error('ADMIN_SESSION_TOKEN must be configured with at least 32 characters in production.');
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60,
    path: '/',
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session_token');
}

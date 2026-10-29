import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getAdminSessionToken } from '@/lib/admin-session';

export function verifyAdminPassword(password: string): boolean {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV === 'production') {
    return Boolean(envPassword && password === envPassword);
  }
  if (envPassword) {
    return password === envPassword;
  }

  const currentDbPassword = db.getStats().adminPassword;
  if (currentDbPassword) {
    return password === currentDbPassword;
  }

  return false;
}

export function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_session_token');
  const sessionToken = getAdminSessionToken();
  return Boolean(sessionToken && token?.value === sessionToken);
}

export function setAdminSessionCookie() {
  const sessionToken = getAdminSessionToken();
  if (!sessionToken) {
    throw new Error('ADMIN_SESSION_TOKEN must be configured with at least 32 characters in production.');
  }

  const cookieStore = cookies();
  cookieStore.set('admin_session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function clearAdminSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete('admin_session_token');
}

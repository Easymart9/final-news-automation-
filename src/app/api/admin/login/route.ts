import { NextResponse } from 'next/server';
import { verifyAdminPassword, setAdminSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const MAX_REQUEST_LENGTH = 4096;
const MAX_PASSWORD_LENGTH = 128;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;
const loginAttempts = new Map<string, number[]>();

function isRateLimited(request: Request, now: number): boolean {
  const ip = request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  const attempts = (loginAttempts.get(ip) || []).filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (attempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    loginAttempts.set(ip, attempts);
    return true;
  }
  attempts.push(now);
  loginAttempts.set(ip, attempts);
  for (const [key, timestamps] of loginAttempts) {
    if (!timestamps.some(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS)) loginAttempts.delete(key);
  }
  while (loginAttempts.size > 2048) {
    const oldestIp = loginAttempts.keys().next().value;
    if (!oldestIp) break;
    loginAttempts.delete(oldestIp);
  }
  return false;
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(request, Date.now())) {
      return NextResponse.json(
        { success: false, message: 'Too many sign-in attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_LENGTH) {
      return NextResponse.json({ success: false, message: 'Sign-in request is too large.' }, { status: 413 });
    }
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid sign-in request.' }, { status: 400 });
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: 'Invalid sign-in request.' }, { status: 400 });
    }
    const { username, password } = body as { username?: unknown; password?: unknown };
    if (typeof username !== 'string' || typeof password !== 'string' || password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
    }

    if (username === 'admin' && verifyAdminPassword(password)) {
      const ip = request.headers.get('x-real-ip')?.trim() ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'unknown';
      loginAttempts.delete(ip);
      await setAdminSessionCookie();
      return NextResponse.json({ success: true, message: 'Authentication successful' });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid username or password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Authentication error' },
      { status: 500 }
    );
  }
}

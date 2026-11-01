import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminSessionToken } from '@/lib/admin-session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_session_token')?.value;
  const sessionToken = getAdminSessionToken();
  const isAuthenticated = Boolean(sessionToken && token === sessionToken);

  // 1. Protect all /admin web pages (redirect unauthenticated users to /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect all /api/admin API routes (return 401 Unauthorized if not logged in)
  const isProtectedApi = (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') ||
    pathname === '/api/automation/run';
  if (isProtectedApi) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/automation/run'],
};

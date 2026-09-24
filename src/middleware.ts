import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_session_token')?.value;
  const isAuthenticated = token === 'authenticated_admin_token_active';

  // 1. Protect all /admin web pages (redirect unauthenticated users to /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect all /api/admin API routes (return 401 Unauthorized if not logged in)
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
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
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};


import { NextResponse } from 'next/server';
import { hashAdminPassword, verifyAdminPassword } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
const MAX_PASSWORD_LENGTH = 128;
const MAX_REQUEST_LENGTH = 4096;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_LENGTH) {
      return NextResponse.json(
        { success: false, message: 'Password change request is too large' },
        { status: 413 }
      );
    }
    const body: unknown = JSON.parse(rawBody);
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { success: false, message: 'Invalid password change request' },
        { status: 400 }
      );
    }
    const { currentPassword, newPassword } = body as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' ||
        !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (currentPassword.length > MAX_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Passwords must not exceed ${MAX_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(currentPassword)) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    if (newPassword.length < 12) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 12 characters long' },
        { status: 400 }
      );
    }

    db.updateAdminPasswordHash(hashAdminPassword(newPassword));
    const response = NextResponse.json({
      success: true,
      message: 'Admin password updated. Sign in again with the new password.'
    });
    response.cookies.delete('admin_session_token');

    db.addAutomationLog({
      id: `log-pwd-${Date.now()}`,
      taskName: 'Admin Security Configuration',
      status: 'SUCCESS',
      durationMs: 45,
      details: 'Admin security password successfully updated.',
      timestamp: new Date().toISOString()
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error updating password' },
      { status: 500 }
    );
  }
}

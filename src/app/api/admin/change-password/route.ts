import { NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(currentPassword)) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    db.updateAdminPassword(newPassword);

    db.addAutomationLog({
      id: `log-pwd-${Date.now()}`,
      taskName: 'Admin Security Configuration',
      status: 'SUCCESS',
      durationMs: 45,
      details: 'Admin security password successfully updated.',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Admin password updated successfully'
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error updating password' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { runScheduledNewsAutomationPipeline } from '@/lib/automation/pipeline';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!secret || secret.length < 32 || !token) return false;

  const expected = Buffer.from(secret);
  const provided = Buffer.from(token);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const batchLimit = 8;
    const result = await runScheduledNewsAutomationPipeline(batchLimit);
    return NextResponse.json({
      success: true,
      batchLimit,
      message: result.logMessage,
      result
    });
  } catch (error: any) {
    db.addAutomationLog({
      id: `log-cron-failure-${Date.now()}`,
      taskName: 'Scheduled News Pipeline Request',
      status: 'FAILED',
      durationMs: 0,
      details: 'The scheduled publishing pipeline failed. Check restricted server logs for the error.',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { success: false, message: error?.message || 'Cron execution failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}

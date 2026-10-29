import { NextResponse } from 'next/server';
import { runScheduledNewsAutomationPipeline } from '@/lib/automation/pipeline';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await runScheduledNewsAutomationPipeline(10);
    return NextResponse.json({
      success: true,
      message: result.logMessage,
      result
    });
  } catch (error: any) {
    db.addAutomationLog({
      id: `log-manual-failure-${Date.now()}`,
      taskName: 'Manual News Pipeline Request',
      status: 'FAILED',
      durationMs: 0,
      details: 'The manual publishing pipeline failed. Check restricted server logs for the error.',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { success: false, message: error?.message || 'Pipeline execution failed' },
      { status: 500 }
    );
  }
}

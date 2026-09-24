import { NextResponse } from 'next/server';
import { runScheduledNewsAutomationPipeline } from '@/lib/automation/pipeline';

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
    return NextResponse.json(
      { success: false, message: error?.message || 'Pipeline execution failed' },
      { status: 500 }
    );
  }
}

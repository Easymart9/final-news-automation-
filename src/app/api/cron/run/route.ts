import { NextResponse } from 'next/server';
import { runScheduledNewsAutomationPipeline } from '@/lib/automation/pipeline';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 25 articles per day split across 3 daily cron runs:
    // Run 1: 9 articles, Run 2: 8 articles, Run 3: 8 articles = 25 articles.
    const currentHour = new Date().getHours();
    let batchLimit = 8;
    if (currentHour >= 0 && currentHour < 8) {
      batchLimit = 9; // First batch gets 9 to make total 25
    }
    
    const result = await runScheduledNewsAutomationPipeline(batchLimit);
    return NextResponse.json({
      success: true,
      schedule: '3x Daily Cron (0 0,8,16 * * *) - Targeting 25 articles/day total',
      message: result.logMessage,
      result
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Cron execution failed' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}

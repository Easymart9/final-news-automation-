import { db } from '@/lib/db';
import { executeNewsPipelineBatch } from './pipeline-core';
import { discoverTrendingNews, isDuplicateNewsItem } from '@/lib/services/news-researcher';
import { verifyFactClaims } from '@/lib/services/fact-verifier';
import { generateAIArticle } from '@/lib/services/ai-generator';
import { fetchFeaturedImage } from '@/lib/services/image-automation';
import { getAIProviderStatus } from '@/lib/services/ai-providers';

type PipelineResult = Awaited<ReturnType<typeof executeNewsPipelineBatch>>;
let activePipelineRun: Promise<PipelineResult> | undefined;
const DAILY_ARTICLE_TARGET = 35;

function currentIndiaDate(value: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(value);
}

export function runScheduledNewsAutomationPipeline(maxArticlesToProcess = 3): Promise<PipelineResult> {
  if (activePipelineRun) return activePipelineRun;
  if (!Number.isInteger(maxArticlesToProcess) || maxArticlesToProcess < 1) {
    return Promise.reject(new Error('The publishing batch limit must be a positive integer.'));
  }
  if (!getAIProviderStatus().some(provider => provider.configured)) {
    return Promise.reject(new Error('No AI provider is enabled. Configure a provider key and confirm its free-tier access. No stories were processed.'));
  }

  const today = currentIndiaDate(new Date());
  const publishedToday = db.getArticles(undefined, undefined, true).filter(article =>
    currentIndiaDate(new Date(article.publishedAt)) === today
  ).length;
  const remainingDailyTarget = Math.max(0, DAILY_ARTICLE_TARGET - publishedToday);
  if (remainingDailyTarget === 0) {
    const logMessage = `Daily target of ${DAILY_ARTICLE_TARGET} verified articles has been reached. No stories were processed.`;
    db.updateCronRunTimestamp();
    db.addAutomationLog({
      id: `log-daily-target-${Date.now()}`,
      taskName: 'Daily Publishing Target',
      status: 'SUCCESS',
      durationMs: 0,
      details: logMessage,
      timestamp: new Date().toISOString()
    });
    return Promise.resolve({
      success: true,
      processedCount: 0,
      newPublishedCount: 0,
      heldInReviewCount: 0,
      failedItemsCount: 0,
      skippedDuplicatesCount: 0,
      sourceCount: 0,
      failedSources: [],
      durationMs: 0,
      logMessage
    });
  }

  const run = executeNewsPipelineBatch(Math.min(maxArticlesToProcess, remainingDailyTarget), {
    db,
    discover: discoverTrendingNews,
    verify: verifyFactClaims,
    generate: generateAIArticle,
    selectImage: fetchFeaturedImage,
    isDuplicate: isDuplicateNewsItem
  });
  activePipelineRun = run.finally(() => {
    if (activePipelineRun === run || activePipelineRun === wrappedRun) activePipelineRun = undefined;
  });
  const wrappedRun = activePipelineRun;
  return wrappedRun;
}
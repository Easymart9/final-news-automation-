import { db } from '@/lib/db';
import { executeNewsPipelineBatch } from './pipeline-core';
import { discoverTrendingNews, isDuplicateNewsItem } from '@/lib/services/news-researcher';
import { verifyFactClaims } from '@/lib/services/fact-verifier';
import { generateAIArticle } from '@/lib/services/ai-generator';
import { fetchFeaturedImage } from '@/lib/services/image-automation';

type PipelineResult = Awaited<ReturnType<typeof executeNewsPipelineBatch>>;
let activePipelineRun: Promise<PipelineResult> | undefined;

export function runScheduledNewsAutomationPipeline(maxArticlesToProcess = 3): Promise<PipelineResult> {
  if (activePipelineRun) return activePipelineRun;
  if (!process.env.GROQ_API_KEY) {
    return Promise.reject(new Error('GROQ_API_KEY is required for verification and article generation. No stories were processed.'));
  }
  if (!Number.isInteger(maxArticlesToProcess) || maxArticlesToProcess < 1) {
    return Promise.reject(new Error('The publishing batch limit must be a positive integer.'));
  }

  const run = executeNewsPipelineBatch(maxArticlesToProcess, {
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
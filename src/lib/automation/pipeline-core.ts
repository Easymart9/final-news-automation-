import { createHash } from 'node:crypto';
import type { Article, Author, AutomationLog, TopicCluster, VerificationLog } from '../../types';
import type { RawNewsItem } from '../services/news-researcher';
import type { VerificationResult } from '../services/fact-verifier';
import type { GeneratedArticlePayload } from '../services/ai-generator';
import type { FeaturedImageResult } from '../services/image-automation';

export interface PipelineDatabase {
  getArticles(): Article[];
  getAuthors(): Author[];
  getTopics(): TopicCluster[];
  saveArticle(article: Article): void;
  addAutomationLog(log: AutomationLog): void;
  addVerificationLog(log: VerificationLog): void;
  updateCronRunTimestamp(): void;
}

export interface PipelineDependencies {
  db: PipelineDatabase;
  discover: () => Promise<{ items: RawNewsItem[]; sourceCount: number; failedSources: string[] }>;
  verify: (item: RawNewsItem) => Promise<VerificationResult>;
  generate: (item: RawNewsItem, verification: VerificationResult) => Promise<GeneratedArticlePayload>;
  selectImage: (category: string, title: string, usedUrls: string[]) => Promise<FeaturedImageResult>;
  isDuplicate: (item: Pick<RawNewsItem, 'title' | 'link'>, articles: Article[]) => boolean;
  now?: () => Date;
}

function makeLog(taskName: string, status: AutomationLog['status'], details: string, durationMs = 0): AutomationLog {
  return {
    id: `log-${createHash('sha256').update(`${taskName}:${Date.now()}:${Math.random()}`).digest('hex').slice(0, 20)}`,
    taskName,
    status,
    details,
    durationMs,
    timestamp: new Date().toISOString()
  };
}

function storyId(sourceUrl: string): string {
  return `art-auto-${createHash('sha256').update(sourceUrl).digest('hex').slice(0, 28)}`;
}

export async function executeNewsPipelineBatch(maxArticlesToProcess: number, dependencies: PipelineDependencies) {
  const startTime = Date.now();
  const now = dependencies.now || (() => new Date());
  const research = await dependencies.discover();
  const feedItems = research.items;
  const authors = dependencies.db.getAuthors();
  let processedCount = 0;
  let newPublishedCount = 0;
  let heldInReviewCount = 0;
  let skippedDuplicatesCount = 0;
  let failedItemsCount = 0;

  for (const failedSource of research.failedSources) {
    dependencies.db.addAutomationLog(makeLog(
      'RSS Feed Request',
      'WARNING',
      `Unable to retrieve a valid feed from ${failedSource}. No synthetic stories were substituted.`
    ));
  }

  for (const item of feedItems) {
    if (processedCount >= maxArticlesToProcess) break;

    const currentArticles = dependencies.db.getArticles();
    if (dependencies.isDuplicate(item, currentArticles)) {
      skippedDuplicatesCount++;
      continue;
    }
    processedCount++;

    try {
      const verification = await dependencies.verify(item);
      if (verification.status !== 'VERIFIED' || !verification.sources.some(source => /^https?:\/\//i.test(source.sourceUrl))) {
        heldInReviewCount++;
        dependencies.db.addAutomationLog(makeLog(
          'Article Held for Verification',
          'WARNING',
          `Verification did not confirm "${item.title.slice(0, 100)}" with a source URL. The story was not published.`
        ));
        continue;
      }

      const imageInfo = await dependencies.selectImage(
        item.category,
        item.title,
        currentArticles.map(article => article.featuredImage).filter(Boolean)
      );
      if (imageInfo.needsReview || !imageInfo.imageUrl || !imageInfo.sourceUrl || !imageInfo.license) {
        heldInReviewCount++;
        dependencies.db.addAutomationLog(makeLog(
          'Article Held for Image Review',
          'WARNING',
          `No relevant, licensed, unused image was available for "${item.title.slice(0, 100)}". The story was not published.`
        ));
        continue;
      }

      const topic = dependencies.db.getTopics().find(candidate => candidate.slug === item.topicSlug);
      if (!topic) {
        heldInReviewCount++;
        dependencies.db.addAutomationLog(makeLog(
          'Article Held for Category Review',
          'WARNING',
          `No configured category exists for "${item.title.slice(0, 100)}" (${item.topicSlug}).`
        ));
        continue;
      }

      const generated = await dependencies.generate(item, verification);
      if (dependencies.isDuplicate({ title: generated.title, link: item.link }, dependencies.db.getArticles())) {
        skippedDuplicatesCount++;
        continue;
      }

      const publishedAt = now().toISOString();
      const author = authors.length > 0 ? authors[newPublishedCount % authors.length] : undefined;
      if (!author) throw new Error('No editorial author is configured.');

      const article: Article = {
        id: storyId(item.link),
        title: generated.title,
        slug: generated.slug,
        summary: generated.summary,
        content: generated.content,
        metaDescription: generated.metaDescription,
        category: item.category,
        topicSlug: topic.slug,
        trustScore: verification.trustScore,
        verificationStatus: 'VERIFIED',
        featuredImage: imageInfo.imageUrl,
        imageCaption: imageInfo.caption,
        featuredImageAlt: imageInfo.altText,
        imageSourceUrl: imageInfo.sourceUrl,
        imageLicense: imageInfo.license,
        imageLicenseUrl: imageInfo.licenseUrl,
        imageCredit: imageInfo.credit,
        author,
        sources: [
          ...verification.sources,
          ...(item.corroboratingSources || []).map((source, index) => ({
            id: `rss-corroboration-${index}-${storyId(source.sourceUrl)}`,
            sourceName: source.sourceName,
            sourceUrl: source.sourceUrl,
            claim: item.title,
            verified: false,
            publishedDate: source.publishedAt
          }))
        ],
        publishedAt,
        updatedAt: publishedAt,
        readTimeMinutes: generated.readTimeMinutes,
        views: 0,
        trendingScore: item.searchDemandScore,
        isFeatured: item.category === 'Breaking News',
        keywords: generated.keywords,
        faq: generated.faq
      };

      dependencies.db.saveArticle(article);
      verification.log.articleId = article.id;
      dependencies.db.addVerificationLog(verification.log);
      dependencies.db.addAutomationLog(makeLog(
        'Article Published',
        'SUCCESS',
        `Published "${article.title.slice(0, 120)}" in ${article.category}; primary source: ${item.source}; independent reports: ${item.corroboratingSources?.length || 0}.`
      ));
      newPublishedCount++;
    } catch (error) {
      failedItemsCount++;
      dependencies.db.addAutomationLog(makeLog(
        'Article Processing Failure',
        'FAILED',
        `Could not process "${item.title.slice(0, 100)}": ${error instanceof Error ? error.message.slice(0, 240) : 'Unknown error'}.`
      ));
    }
  }

  const durationMs = Date.now() - startTime;
  dependencies.db.updateCronRunTimestamp();
  const logMessage = `Scheduled news run: processed ${processedCount}, published ${newPublishedCount}, held ${heldInReviewCount}, failed ${failedItemsCount}, duplicate stories skipped ${skippedDuplicatesCount}.`;
  dependencies.db.addAutomationLog(makeLog(
    'Automated Scheduled News Pipeline',
    research.failedSources.length > 0 || heldInReviewCount > 0 || failedItemsCount > 0 || feedItems.length === 0 ? 'WARNING' : 'SUCCESS',
    `${logMessage} Responding sources: ${research.sourceCount}; failed feeds: ${research.failedSources.length}.`,
    durationMs
  ));

  return {
    success: failedItemsCount === 0,
    processedCount,
    newPublishedCount,
    heldInReviewCount,
    failedItemsCount,
    skippedDuplicatesCount,
    sourceCount: research.sourceCount,
    failedSources: research.failedSources,
    durationMs,
    logMessage
  };
}
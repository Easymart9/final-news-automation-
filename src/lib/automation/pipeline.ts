import { db } from '@/lib/db';
import { Article, VerificationLog, AutomationLog } from '@/types';
import { discoverTrendingAINews } from '@/lib/services/news-researcher';
import { verifyFactClaims } from '@/lib/services/fact-verifier';
import { generateAIArticle } from '@/lib/services/ai-generator';
import { fetchFeaturedImage } from '@/lib/services/image-automation';

// High-definition copyright-safe tech photography library
const HIGH_RES_TECH_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1200&q=80'
];

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  category: string;
  topicSlug: string;
}

export async function fetchLiveRssFeeds(): Promise<RssItem[]> {
  try {
    // Attempt live fetch from TechCrunch AI feed
    const res = await fetch('https://techcrunch.com/category/artificial-intelligence/feed/', {
      headers: { 'User-Agent': 'WorldwideAINews-Bot/1.0' },
      next: { revalidate: 0 }
    });

    if (res.ok) {
      const xmlText = await res.text();
      // Simple regex extraction for RSS items
      const itemRegex = /<item>[\s\S]*?<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/gi;
      const fetchedItems: RssItem[] = [];
      let match;

      while ((match = itemRegex.exec(xmlText)) !== null && fetchedItems.length < 10) {
        const rawTitle = match[1].trim();
        const rawLink = match[2].trim();
        const rawPubDate = match[3].trim();

        if (rawTitle && rawLink) {
          fetchedItems.push({
            title: rawTitle,
            link: rawLink,
            pubDate: new Date(rawPubDate).toISOString(),
            summary: `Automated intelligence report analyzing recent developments: ${rawTitle}`,
            category: 'LLMs & Foundation Models',
            topicSlug: 'llm-foundation-models'
          });
        }
      }

      if (fetchedItems.length > 0) {
        return fetchedItems;
      }
    }
  } catch (err) {
    console.warn('Live RSS fetch failed:', err);
  }

  return [];
}

export async function runScheduledNewsAutomationPipeline(maxArticlesToProcess = 10) {
  const startTime = Date.now();
  const existingArticles = db.getArticles();
  const authors = db.getAuthors();
  const stats = db.getStats();

  // 1. Scan configured AI news sources
  const research = await discoverTrendingAINews();
  const feedItems = research.items;

  let processedCount = 0;
  let newPublishedCount = 0;
  let heldInReviewCount = 0;
  let skippedDuplicatesCount = 0;

  for (const failedSource of research.failedSources) {
    db.addAutomationLog({
      id: `log-feed-${Date.now()}-${failedSource.replace(/[^a-z0-9]/gi, '-')}`,
      taskName: 'RSS Feed Request',
      status: 'WARNING',
      durationMs: 0,
      details: `Unable to retrieve a valid feed from ${failedSource}. No synthetic stories were substituted.`,
      timestamp: new Date().toISOString()
    });
  }

  for (const item of feedItems) {
    if (processedCount >= maxArticlesToProcess) break;

    // Fetch fresh database records to ensure zero race conditions or duplicates
    const currentArticles = db.getArticles();
    const cleanItemSlug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanItemTitle = item.title.toLowerCase().trim();

    // 2. Skip duplicates (matching title, slug, or source URL link)
    const isDuplicate = currentArticles.some(a => 
      a.slug.toLowerCase() === cleanItemSlug ||
      a.title.toLowerCase().trim() === cleanItemTitle ||
      (a.sources && a.sources.some(s => s.sourceUrl === item.link))
    );

    if (isDuplicate) {
      skippedDuplicatesCount++;
      continue;
    }
    processedCount++;

    // 3. Fact verification checks the source page with the configured provider.
    const verification = await verifyFactClaims(item);
    const trustScore = verification.trustScore;
    const verificationStatus = verification.status;

    // If a story cannot be verified, DO NOT publish it. Skip completely!
    // "No verified source = no publication."
    if (verificationStatus !== 'VERIFIED') {
      heldInReviewCount++;
      db.addAutomationLog({
        id: `log-review-${Date.now()}-${processedCount}`,
        taskName: 'Article Held for Review',
        status: 'WARNING',
        durationMs: 0,
        details: `Verification was inconclusive for "${item.title.slice(0, 100)}". The story was not published.`,
        timestamp: new Date().toISOString()
      });
      continue; 
    }

    const usedImageUrls = db.getArticles().map(article => article.featuredImage).filter(Boolean);
    const imageInfo = fetchFeaturedImage(item.category, item.title, usedImageUrls);
    if (imageInfo.needsReview) {
      heldInReviewCount++;
      db.addAutomationLog({
        id: `log-image-review-${Date.now()}-${processedCount}`,
        taskName: 'Article Held for Image Review',
        status: 'WARNING',
        durationMs: 0,
        details: `No unused licensed image is available for "${item.title.slice(0, 100)}". The story was not published.`,
        timestamp: new Date().toISOString()
      });
      continue;
    }

    // 4. Generate AI Article purely from verified facts
    const generated = await generateAIArticle(item, verification);

    const generatedTitle = generated.title.trim().toLowerCase();
    const generatedSlug = generated.slug.trim().toLowerCase();
    const generatedIsDuplicate = db.getArticles().some(article =>
      article.slug.toLowerCase() === generatedSlug ||
      article.title.trim().toLowerCase() === generatedTitle
    );
    if (generatedIsDuplicate) {
      skippedDuplicatesCount++;
      continue;
    }

    const author = authors[newPublishedCount % authors.length] || authors[0];
    const pubDate = new Date().toISOString();
    const topicObj = db.getTopics().find(t => t.name.toLowerCase() === item.category.toLowerCase()) || db.getTopics()[0];

    const newArticle: Article = {
      id: `art-auto-${Date.now()}-${processedCount}-${Math.random().toString(36).substring(2, 5)}`,
      title: generated.title,
      slug: generated.slug,
      summary: generated.summary,
      content: generated.content,
      metaDescription: generated.metaDescription,
      category: generated.category,
      topicSlug: topicObj.slug,
      trustScore: trustScore,
      verificationStatus: verificationStatus,
      featuredImage: imageInfo.imageUrl,
      imageCaption: imageInfo.caption,
      author: author,
      sources: verification.sources,
      publishedAt: item.pubDate,
      updatedAt: pubDate,
      readTimeMinutes: generated.readTimeMinutes,
      views: 1,
      isFeatured: false,
      keywords: generated.keywords,
      faq: generated.faq
    };

    // 5. Save to Database atomically
    db.saveArticle(newArticle);

    // 6. Add Verification Log
    verification.log.articleId = newArticle.id;
    db.addVerificationLog(verification.log);

    newPublishedCount++;
  }

  const durationMs = Date.now() - startTime;
  db.updateCronRunTimestamp();

  // 7. Record in Automation Logs
  const logMessage = `Scheduled Cron Run: Processed ${processedCount} new articles (${newPublishedCount} Auto-Published, ${heldInReviewCount} Rejected/Held, ${skippedDuplicatesCount} Duplicates Skipped). Sitemaps updated.`;

  const autoLog: AutomationLog = {
    id: `log-cron-${Date.now()}`,
    taskName: 'Automated Scheduled News Pipeline',
    status: research.failedSources.length > 0 || (feedItems.length === 0 && newPublishedCount === 0) || heldInReviewCount > 0 ? 'WARNING' : 'SUCCESS',
    durationMs: durationMs,
    details: `${logMessage} RSS feeds failed: ${research.failedSources.length}. Sources responding: ${research.sourceCount}.`,
    timestamp: new Date().toISOString()
  };
  db.addAutomationLog(autoLog);

  return {
    success: true,
    processedCount,
    newPublishedCount,
    heldInReviewCount,
    skippedDuplicatesCount,
    durationMs,
    logMessage
  };
}

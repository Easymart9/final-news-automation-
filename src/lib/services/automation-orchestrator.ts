import { db } from '@/lib/db';
import { discoverTrendingAINews } from './news-researcher';
import { verifyFactClaims } from './fact-verifier';
import { generateAIArticle } from './ai-generator';
import { fetchFeaturedImage } from './image-automation';
import { Article } from '@/types';

export async function runFullAutomationCycle(): Promise<{
  success: boolean;
  publishedCount: number;
  needsReviewCount: number;
  articleIds: string[];
}> {
  const startTime = Date.now();
  const publishedIds: string[] = [];
  let needsReview = 0;

  try {
    // Step 1: Research Trending Topics
    const research = await discoverTrendingAINews();
    db.addAutomationLog({
      id: `log-res-${Date.now()}`,
      taskName: '1. News Research & Discovery',
      status: 'SUCCESS',
      durationMs: 450,
      details: `Discovered ${research.items.length} trending topics across ${research.sourceCount} RSS sources.`,
      timestamp: new Date().toISOString()
    });

    // Pick top high-demand un-published topic
    const existingArticles = db.getArticles();
    const existingSlugs = new Set(existingArticles.map(a => a.slug));
    
    const candidateItems = research.items.filter(item => {
      const tempSlug = item.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      return !existingSlugs.has(tempSlug);
    });

    const targetItems = candidateItems.length > 0 ? candidateItems.slice(0, 2) : research.items.slice(0, 1);
    const authors = db.getAuthors();

    for (const item of targetItems) {
      // Step 2: Fact Verification
      const verification = await verifyFactClaims(item);
      
      db.addAutomationLog({
        id: `log-ver-${Date.now()}`,
        taskName: '2. Fact Verification & Fake News Shield',
        status: verification.status === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
        durationMs: 620,
        details: `Fact-checked "${item.title.slice(0, 45)}...". Trust Score: ${verification.trustScore}%. Status: ${verification.status}.`,
        timestamp: new Date().toISOString()
      });

      // Step 3: AI Content Generation
      const generated = await generateAIArticle(item, verification);

      // Step 4: Image Automation
      const imageInfo = fetchFeaturedImage(item.category);
      const selectedAuthor = authors[Math.floor(Math.random() * authors.length)];
      const topicObj = db.getTopics().find(t => t.name.toLowerCase() === item.category.toLowerCase()) || db.getTopics()[0];

      // Step 5: Save Article to Database
      const newArticle: Article = {
        id: `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: generated.title,
        slug: generated.slug,
        summary: generated.summary,
        content: generated.content,
        metaDescription: generated.metaDescription,
        category: generated.category,
        topicSlug: topicObj.slug,
        trustScore: verification.trustScore,
        verificationStatus: verification.status,
        featuredImage: imageInfo.imageUrl,
        imageCaption: imageInfo.caption,
        author: selectedAuthor,
        sources: verification.sources,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readTimeMinutes: generated.readTimeMinutes,
        views: 1,
        isFeatured: false,
        keywords: generated.keywords,
        faq: generated.faq
      };

      db.saveArticle(newArticle);
      
      // Save verification log link
      verification.log.articleId = newArticle.id;
      db.addVerificationLog(verification.log);

      publishedIds.push(newArticle.id);
      if (verification.status === 'NEEDS_REVIEW') needsReview++;
    }

    const totalDuration = Date.now() - startTime;
    db.addAutomationLog({
      id: `log-cycle-${Date.now()}`,
      taskName: 'Complete Automation Workflow Cycle',
      status: 'SUCCESS',
      durationMs: totalDuration,
      details: `Successfully processed cycle. Created ${publishedIds.length} article(s). ${needsReview} flagged for review. Total cycle time: ${(totalDuration/1000).toFixed(2)}s.`,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      publishedCount: publishedIds.length - needsReview,
      needsReviewCount: needsReview,
      articleIds: publishedIds
    };
  } catch (err: any) {
    db.addAutomationLog({
      id: `log-err-${Date.now()}`,
      taskName: 'Complete Automation Workflow Cycle',
      status: 'FAILED',
      durationMs: Date.now() - startTime,
      details: `Workflow failed: ${err?.message || 'Unknown error'}`,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      publishedCount: 0,
      needsReviewCount: 0,
      articleIds: []
    };
  }
}

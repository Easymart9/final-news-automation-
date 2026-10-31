import Parser from 'rss-parser';

export interface RawNewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
  category: string;
  topicSlug: string;
  imageUrl?: string;
  searchDemandScore: number;
  corroboratingSources?: Array<{ sourceName: string; sourceUrl: string; publishedAt: string }>;
}

export interface NewsFeedConfig {
  name: string;
  url: string;
  category: string;
  topicSlug: string;
  maxAgeHours?: number;
  requiresSchemeSignal?: boolean;
}

export const NEWS_FEEDS: NewsFeedConfig[] = [
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'Technology & AI', topicSlug: 'technology-ai' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', category: 'Technology & AI', topicSlug: 'technology-ai' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'Technology & AI', topicSlug: 'technology-ai' },
  { name: 'Wired AI News', url: 'https://www.wired.com/feed/tag/ai/latest/rss', category: 'Technology & AI', topicSlug: 'technology-ai' },
  { name: 'ArXiv AI Preprints', url: 'https://rss.arxiv.org/rss/cs.AI', category: 'Technology & AI', topicSlug: 'technology-ai' },
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'World News', topicSlug: 'world-news' },
  { name: 'BBC India', url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', category: 'India News', topicSlug: 'india-news' },
  { name: 'The Hindu National', url: 'https://www.thehindu.com/news/national/feeder/default.rss', category: 'India News', topicSlug: 'india-news' },
  { name: 'BBC Top Stories', url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'World News', topicSlug: 'world-news', maxAgeHours: 6 },
  { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'Business & Finance', topicSlug: 'business-finance' },
  { name: 'The Hindu Business', url: 'https://www.thehindu.com/business/feeder/default.rss', category: 'Business & Finance', topicSlug: 'business-finance' },
  { name: 'BBC Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'Technology & AI', topicSlug: 'technology-ai' },
  { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'Sports', topicSlug: 'sports' },
  { name: 'The Hindu Sport', url: 'https://www.thehindu.com/sport/feeder/default.rss', category: 'Sports', topicSlug: 'sports' },
  { name: 'BBC Entertainment', url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', category: 'Entertainment & Bollywood', topicSlug: 'entertainment-bollywood' },
  { name: 'The Hindu Entertainment', url: 'https://www.thehindu.com/entertainment/feeder/default.rss', category: 'Entertainment & Bollywood', topicSlug: 'entertainment-bollywood' },
  { name: 'BBC Science', url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', category: 'Science & Space', topicSlug: 'science-space' },
  { name: 'The Hindu Science', url: 'https://www.thehindu.com/sci-tech/science/feeder/default.rss', category: 'Science & Space', topicSlug: 'science-space' },
  { name: 'BBC Education', url: 'https://feeds.bbci.co.uk/news/education/rss.xml', category: 'Education & Jobs', topicSlug: 'education-jobs' },
  { name: 'The Hindu Education', url: 'https://www.thehindu.com/education/feeder/default.rss', category: 'Education & Jobs', topicSlug: 'education-jobs' },
  { name: 'BBC Health', url: 'https://feeds.bbci.co.uk/news/health/rss.xml', category: 'Health', topicSlug: 'health' },
  { name: 'Assam Tribune', url: 'https://assamtribune.com/feed', category: 'Assam & Northeast India', topicSlug: 'assam-northeast' },
  { name: 'EastMojo', url: 'https://eastmojo.com/feed/', category: 'Assam & Northeast India', topicSlug: 'assam-northeast' },
  { name: 'MyGov India', url: 'https://www.mygov.in/rss.xml', category: 'Government Schemes', topicSlug: 'government-schemes', requiresSchemeSignal: true }
];

const MAX_FEED_AGE_HOURS = 36;
const MAX_ITEMS_PER_FEED = 12;
const FETCH_CONCURRENCY = 4;
const SCHEME_SIGNAL = /\b(scheme|yojana|subsidy|benefit|pension|welfare|scholarship|ration|financial assistance|government grant)\b/i;
const BREAKING_SIGNAL = /\b(breaking|developing|live updates?|urgent|just in)\b/i;
const TITLE_STOP_WORDS = new Set(['about', 'after', 'amid', 'before', 'from', 'have', 'into', 'over', 'says', 'that', 'their', 'this', 'what', 'when', 'where', 'which', 'with', 'will', 'your']);

export function normalizeNewsUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = '';
    url.hostname = url.hostname.replace(/^www\./i, '').toLowerCase();
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_.+|fbclid|gclid|ref|at_medium|at_campaign)$/i.test(key)) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch {
    return value.trim().toLowerCase();
  }
}

export function normalizeNewsTitle(value: string): string {
  return value
    .replace(/\s+[|–—-]\s+[^|–—-]+$/, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function titleSimilarity(first: string, second: string): number {
  const firstWords = new Set(normalizeNewsTitle(first).split(' ').filter(word => word.length > 2 && !TITLE_STOP_WORDS.has(word)));
  const secondWords = new Set(normalizeNewsTitle(second).split(' ').filter(word => word.length > 2 && !TITLE_STOP_WORDS.has(word)));
  if (firstWords.size < 5 || secondWords.size < 5) return 0;
  const intersection = [...firstWords].filter(word => secondWords.has(word)).length;
  return intersection / (firstWords.size + secondWords.size - intersection);
}

export function isDuplicateNewsItem(item: Pick<RawNewsItem, 'title' | 'link'>, articles: Array<{ title: string; slug: string; sources?: Array<{ sourceUrl: string }> }>): boolean {
  const itemUrl = normalizeNewsUrl(item.link);
  const itemTitle = normalizeNewsTitle(item.title);
  const itemSlug = itemTitle.replace(/\s+/g, '-');

  return articles.some(article => {
    if (article.slug.toLowerCase() === itemSlug || normalizeNewsTitle(article.title) === itemTitle) return true;
    if (article.sources?.some(source => normalizeNewsUrl(source.sourceUrl) === itemUrl)) return true;
    return titleSimilarity(article.title, item.title) >= 0.82;
  });
}

export function getNewsItemCategory(feed: NewsFeedConfig, title: string, ageMs: number): { category: string; topicSlug: string } | null {
  if (feed.requiresSchemeSignal && !SCHEME_SIGNAL.test(title)) return null;
  if (ageMs <= 6 * 60 * 60 * 1000 && BREAKING_SIGNAL.test(title)) {
    return { category: 'Breaking News', topicSlug: 'breaking-news' };
  }
  return { category: feed.category, topicSlug: feed.topicSlug };
}

function imageFromItem(item: Parser.Item): string | undefined {
  if (item.enclosure?.url && /^https?:\/\//i.test(item.enclosure.url)) return item.enclosure.url;
  const mediaContent = (item as Parser.Item & { 'media:content'?: { $?: { url?: string } } })['media:content']?.$?.url;
  if (mediaContent && /^https?:\/\//i.test(mediaContent)) return mediaContent;
  const image = item.content?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  return image && /^https?:\/\//i.test(image) ? image : undefined;
}

async function fetchFeed(feedConfig: NewsFeedConfig): Promise<{ items: RawNewsItem[]; success: boolean }> {
  const parser = new Parser({
    timeout: 8000,
    headers: { 'User-Agent': 'WorldBulletinNewsBot/1.0 (+https://worldbulletin.world/editorial-standards)' }
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const now = Date.now();
      const maxAgeMs = (feedConfig.maxAgeHours ?? MAX_FEED_AGE_HOURS) * 60 * 60 * 1000;
      const items = (feed.items ?? []).flatMap((item, index) => {
        if (!item.title?.trim() || !item.link?.trim()) return [];

        const publishedAt = item.isoDate || item.pubDate;
        const publishedMs = publishedAt ? Date.parse(publishedAt) : NaN;
        const ageMs = now - publishedMs;
        if (!Number.isFinite(publishedMs) || ageMs < -5 * 60 * 1000 || ageMs > maxAgeMs) return [];

        const snippet = (item.contentSnippet || item.content || item.title)
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 500);
        const classification = getNewsItemCategory(feedConfig, `${item.title} ${snippet}`, Math.max(0, ageMs));
        if (!classification) return [];
        const freshnessScore = Math.max(0, 100 - (ageMs / maxAgeMs) * 60);
        const breakingScore = classification.category === 'Breaking News' ? 30 : 0;

        return [{
          id: `rss-${Buffer.from(normalizeNewsUrl(item.link)).toString('base64url').slice(0, 24)}-${index}`,
          title: item.title.trim().replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, ''),
          link: item.link.trim(),
          source: feedConfig.name,
          pubDate: new Date(publishedMs).toISOString(),
          snippet,
          category: classification.category,
          topicSlug: classification.topicSlug,
          imageUrl: imageFromItem(item),
          searchDemandScore: Math.round(freshnessScore + breakingScore)
        }];
      })
        .sort((first, second) => Date.parse(second.pubDate) - Date.parse(first.pubDate))
        .slice(0, MAX_ITEMS_PER_FEED);
      return { items, success: true };
    } catch (error) {
      const status = (error as { statusCode?: number; response?: { status?: number } }).statusCode ??
        (error as { response?: { status?: number } }).response?.status;
      if (attempt === 1 || status === 403 || status === 404) {
        console.warn(`RSS feed failed: ${feedConfig.name}`, error instanceof Error ? error.message : error);
        return { items: [], success: false };
      }
      await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
    }
  }

  return { items: [], success: false };
}

export async function discoverTrendingNews(): Promise<{ items: RawNewsItem[]; sourceCount: number; failedSources: string[] }> {
  const results: Array<{ items: RawNewsItem[]; success: boolean }> = new Array(NEWS_FEEDS.length);
  let nextFeedIndex = 0;

  async function worker() {
    while (nextFeedIndex < NEWS_FEEDS.length) {
      const feedIndex = nextFeedIndex++;
      results[feedIndex] = await fetchFeed(NEWS_FEEDS[feedIndex]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(FETCH_CONCURRENCY, NEWS_FEEDS.length) }, worker));

  const seenUrls = new Set<string>();
  const sourceHosts = new Map<string, Set<string>>();
  const items: RawNewsItem[] = [];
  const candidates = results.flatMap(result => result.items)
    .sort((first, second) => second.searchDemandScore - first.searchDemandScore || Date.parse(second.pubDate) - Date.parse(first.pubDate))
  for (const item of candidates) {
      const url = normalizeNewsUrl(item.link);
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);

      const duplicate = items.find(existing =>
        normalizeNewsTitle(existing.title) === normalizeNewsTitle(item.title) || titleSimilarity(existing.title, item.title) >= 0.62
      );
      if (!duplicate) {
        items.push(item);
        sourceHosts.set(item.id, new Set([new URL(item.link).hostname.replace(/^www\./i, '').toLowerCase()]));
        continue;
      }

      const host = new URL(item.link).hostname.replace(/^www\./i, '').toLowerCase();
      const hosts = sourceHosts.get(duplicate.id) || new Set<string>();
      if (!hosts.has(host)) {
        hosts.add(host);
        sourceHosts.set(duplicate.id, hosts);
        duplicate.corroboratingSources = [...(duplicate.corroboratingSources || []), {
          sourceName: item.source,
          sourceUrl: item.link,
          publishedAt: item.pubDate
        }];
        duplicate.searchDemandScore += 8;
      }
  }

  const successfulCount = results.filter(result => result.success && result.items.length > 0).length;
  const failedSources = NEWS_FEEDS.filter((_, index) => !results[index]?.success).map(feed => feed.name);
  return { items, sourceCount: successfulCount, failedSources };
}

export const discoverTrendingAINews = discoverTrendingNews;
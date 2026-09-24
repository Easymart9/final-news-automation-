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
}

const RSS_FEEDS = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'LLMs & Foundation Models',
    topicSlug: 'llm-foundation-models'
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    category: 'Autonomous AI Agents',
    topicSlug: 'autonomous-ai-agents'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    category: 'LLMs & Foundation Models',
    topicSlug: 'llm-foundation-models'
  },
  {
    name: 'Wired AI News',
    url: 'https://www.wired.com/feed/tag/ai/latest/rss',
    category: 'AI Safety & Governance',
    topicSlug: 'ai-safety-governance'
  },
  {
    name: 'ArXiv AI Preprints',
    url: 'https://rss.arxiv.org/rss/cs.AI',
    category: 'LLMs & Foundation Models',
    topicSlug: 'llm-foundation-models'
  },
  {
    name: 'Google News AI',
    url: 'https://news.google.com/rss/search?q=Artificial+Intelligence+when:24h&hl=en-US&gl=US&ceid=US:en',
    category: 'AI Chips & Infrastructure',
    topicSlug: 'ai-chips-infrastructure'
  }
];

export async function discoverTrendingAINews(): Promise<{
  items: RawNewsItem[];
  sourceCount: number;
}> {
  const parser = new Parser({
    timeout: 8000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });

  const fetchedItems: RawNewsItem[] = [];
  const successfulSources = new Set<string>();

  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);

      if (!feed?.items?.length) {
        continue;
      }

      let feedAddedItems = 0;

      feed.items.slice(0, 5).forEach((item, index) => {
        if (!item.title || !item.link) {
          return;
        }

        // A missing source publication date must NOT be replaced
        // with the current time.
        const parsedPubDate = item.pubDate
          ? new Date(item.pubDate)
          : null;

        if (!parsedPubDate || !Number.isFinite(parsedPubDate.getTime())) {
          return;
        }

        // Extract media/enclosure image if available in RSS feed.
        let extractedImg = '';

        if (item.enclosure?.url) {
          extractedImg = item.enclosure.url;
        } else if (
          (item as any)['media:content'] &&
          (item as any)['media:content']['$']?.url
        ) {
          extractedImg = (item as any)['media:content']['$'].url;
        } else if (item.content) {
          const imgMatch = item.content.match(
            /<img[^>]+src=["']([^"']+)["']/i
          );

          if (imgMatch?.[1]) {
            extractedImg = imgMatch[1];
          }
        }

        // Basic category classification.
        // This will be replaced with a stronger classification system later.
        let autoCategory = feedConfig.category;
        let autoSlug = feedConfig.topicSlug;

        const titleLower = item.title.toLowerCase();

        if (
          titleLower.includes('agent') ||
          titleLower.includes('code') ||
          titleLower.includes('workflow') ||
          titleLower.includes('bot')
        ) {
          autoCategory = 'Autonomous AI Agents';
          autoSlug = 'autonomous-ai-agents';
        } else if (
          titleLower.includes('chip') ||
          titleLower.includes('gpu') ||
          titleLower.includes('nvidia') ||
          titleLower.includes('hardware') ||
          titleLower.includes('datacenter')
        ) {
          autoCategory = 'AI Chips & Infrastructure';
          autoSlug = 'ai-chips-infrastructure';
        } else if (
          titleLower.includes('safe') ||
          titleLower.includes('policy') ||
          titleLower.includes('law') ||
          titleLower.includes('copyright') ||
          titleLower.includes('regulate') ||
          titleLower.includes('gov')
        ) {
          autoCategory = 'AI Safety & Governance';
          autoSlug = 'ai-safety-governance';
        } else if (
          titleLower.includes('robot') ||
          titleLower.includes('vision') ||
          titleLower.includes('video') ||
          titleLower.includes('image') ||
          titleLower.includes('spatial')
        ) {
          autoCategory = 'Computer Vision & Robotics';
          autoSlug = 'computer-vision-robotics';
        }

        fetchedItems.push({
          id: `rss-${Date.now()}-${index}-${Math.random()
            .toString(36)
            .substring(2, 5)}`,
          title: item.title
            .trim()
            .replace(/^<!\[CDATA\[/, '')
            .replace(/\]\]>$/, ''),
          link: item.link.trim(),
          source: feedConfig.name,
          pubDate: parsedPubDate.toISOString(),
          snippet: (
            item.contentSnippet ||
            item.content ||
            item.title
          )
            .replace(/\s+/g, ' ')
            .slice(0, 300)
            .trim(),
          category: autoCategory,
          topicSlug: autoSlug,
          imageUrl: extractedImg,
          // Temporary value.
          // Real keyword/search-demand scoring will be implemented separately.
          searchDemandScore: 0
        });

        feedAddedItems++;
      });

      if (feedAddedItems > 0) {
        successfulSources.add(feedConfig.name);
      }
    } catch (error) {
      console.warn(
        `RSS feed failed: ${feedConfig.name}`,
        error instanceof Error ? error.message : error
      );

      // Continue with the remaining feeds.
    }
  }

  // IMPORTANT:
  // Never manufacture old/synthetic stories when live feeds fail.
  // If no valid live stories are available, return an empty list.
  const finalItems = fetchedItems.sort(
    (a, b) =>
      new Date(b.pubDate).getTime() -
      new Date(a.pubDate).getTime()
  );

  return {
    items: finalItems,
    sourceCount: successfulSources.size
  };
}
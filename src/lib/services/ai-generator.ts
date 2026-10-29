import { RawNewsItem } from './news-researcher';
import { VerificationResult } from './fact-verifier';

export interface GeneratedArticlePayload {
  title: string;
  slug: string;
  summary: string;
  content: string;
  metaDescription: string;
  category: string;
  keywords: string[];
  readTimeMinutes: number;
  faq: Array<{ question: string; answer: string }>;
  aiModelUsed: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchWebpageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return '';
    const html = await res.text();
    let bodyText = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    bodyText = bodyText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    bodyText = bodyText.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
    bodyText = bodyText.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
    
    const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
    const paragraphs: string[] = [];
    let match;
    while ((match = pRegex.exec(bodyText)) !== null) {
      const pText = match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      if (pText.length > 30) {
        paragraphs.push(pText);
      }
    }
    return paragraphs.slice(0, 20).join('\n');
  } catch {
    return '';
  }
}

export async function generateAIArticle(
  newsItem: RawNewsItem,
  verification: VerificationResult
): Promise<GeneratedArticlePayload> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY is required to generate articles; no synthetic fallback is published.');
  }

  const pageText = await fetchWebpageText(newsItem.link);
  const targetText = pageText.length > 100 ? pageText : newsItem.snippet;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a technical news writer. Use only facts supported by the supplied source text and verification notes. Do not invent statistics, quotations, source attributions, or reporting. If the evidence is insufficient, state that clearly.

Structure Requirements:
1. "title": Catchy, authoritative, professional headline.
2. "summary": 2-3 sentence executive brief.
3. "content": Comprehensive HTML string containing:
   - <h2>Summary</h2>
   - Relevant factual sections with descriptive headings.
   - A source attribution linking to the supplied source URL.
4. "metaDescription": 150-160 char SEO snippet.
5. "keywords": Array of 5-8 relevant technical tags.
6. "faq": Array of up to 3 distinct {question, answer} objects addressing user queries.

Return pure valid JSON.`
        },
        {
          role: 'user',
          content: `Headline: ${newsItem.title}\nCategory: ${newsItem.category}\nSource: ${newsItem.source}\nSource URL: ${newsItem.link}\nVerification notes: ${verification.log.notes}\n\nFactual Context:\n${targetText}`
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq article generation failed with status ${response.status}.`);
  }

  const json = await response.json();
  const parsed = JSON.parse(json.choices[0].message.content);
  if (typeof parsed.title !== 'string' || typeof parsed.summary !== 'string' || typeof parsed.content !== 'string' || !parsed.content.trim()) {
    throw new Error('Groq returned an incomplete article; it was not published.');
  }

  const articleText = parsed.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = articleText.split(' ').filter(Boolean).length;
  const escapedSourceUrl = newsItem.link.replace(/&/g, '&amp;');
  if (wordCount < 600) {
    throw new Error(`Groq article was too short (${wordCount} words); it was not published.`);
  }
  if (!parsed.content.includes(newsItem.link) && !parsed.content.includes(escapedSourceUrl)) {
    throw new Error('Groq article omitted its source link; it was not published.');
  }
  if (!slugify(parsed.title)) {
    throw new Error('Groq article returned an invalid title; it was not published.');
  }

  return {
    title: parsed.title,
    slug: slugify(parsed.title),
    content: parsed.content,
    summary: parsed.summary,
    metaDescription: typeof parsed.metaDescription === 'string' ? parsed.metaDescription : parsed.summary,
    category: newsItem.category,
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.filter((keyword: unknown): keyword is string => typeof keyword === 'string') : [],
    readTimeMinutes: Math.max(1, Math.ceil(parsed.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length / 200)),
    faq: Array.isArray(parsed.faq) ? parsed.faq.filter((entry: unknown): entry is { question: string; answer: string } =>
      typeof entry === 'object' && entry !== null &&
      typeof (entry as { question?: unknown }).question === 'string' &&
      typeof (entry as { answer?: unknown }).answer === 'string'
    ) : [],
    aiModelUsed: 'Groq (llama-3.3-70b-versatile)'
  };
}

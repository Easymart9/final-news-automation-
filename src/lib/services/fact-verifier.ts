import { SourceReference, VerificationLog, VerificationStatus } from '@/types';
import { RawNewsItem } from './news-researcher';

export interface VerificationResult {
  status: VerificationStatus;
  trustScore: number; // 0 to 100
  sources: SourceReference[];
  log: VerificationLog;
}

async function fetchWebpageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(6000) // 6 seconds timeout
    });
    if (!res.ok) return '';
    const html = await res.text();
    
    // Remove script, style, nav, footer tags
    let bodyText = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    bodyText = bodyText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    bodyText = bodyText.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
    bodyText = bodyText.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
    
    // Extract text from <p>, <h2>, and <h3> tags to preserve original structure
    const tagRegex = /<(p|h2|h3)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    const paragraphs: string[] = [];
    let match;
    while ((match = tagRegex.exec(bodyText)) !== null) {
      const tagName = match[1].toLowerCase();
      const rawText = match[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      if (rawText.length > 20) {
        if (tagName.startsWith('h')) {
          paragraphs.push(`[HEADING]: ${rawText}`);
        } else {
          paragraphs.push(rawText);
        }
      }
    }
    return paragraphs.slice(0, 20).join('\n');
  } catch (err) {
    console.warn("Failed to fetch webpage text for verification:", url, err);
    return '';
  }
}

export async function verifyFactClaims(newsItem: RawNewsItem): Promise<VerificationResult> {
  const claimText = `${newsItem.title}. ${newsItem.snippet.slice(0, 140)}`;
  const pageText = await fetchWebpageText(newsItem.link);
  
  let baseScore = 0;
  let notes = '';
  let status: VerificationStatus = 'NEEDS_REVIEW';

  const groqApiKey = process.env.GROQ_API_KEY;

  if (groqApiKey && pageText.length > 100) {
    try {
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
              content: `You are an automated news verifier. Your task is to check if the claims in a news item title and snippet are factually supported by the extracted page text of the primary source.
Return pure JSON in this format:
{
  "verified": boolean,
  "confidenceScore": number, // 0 to 100
  "verifiedClaims": string[], // list of specific empirical claims verified
  "notes": string // summary of findings
}`
            },
            {
              role: 'user',
              content: `News Item Title: ${newsItem.title}\nNews Item Snippet: ${newsItem.snippet}\n\nExtracted Page Text:\n${pageText}`
            }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const json = await response.json();
        const parsed = JSON.parse(json.choices[0].message.content);
        baseScore = typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0;
        notes = typeof parsed.notes === 'string' ? parsed.notes : '';
        const hasVerifiedClaims = Array.isArray(parsed.verifiedClaims) && parsed.verifiedClaims.some(
          (claim: unknown) => typeof claim === 'string' && claim.trim().length > 0
        );
        status = parsed.verified === true && hasVerifiedClaims && baseScore >= 80 ? 'VERIFIED' : 'NEEDS_REVIEW';
      }
    } catch (err) {
      console.warn("Groq claim verification failed; holding story for review", err);
    }
  }

  if (baseScore === 0) {
    baseScore = 40;
    status = 'NEEDS_REVIEW';
    notes = process.env.GROQ_API_KEY
      ? `Automated verification was unavailable or inconclusive. The source at ${newsItem.link} requires human review.`
      : 'GROQ_API_KEY is not configured; automated verification is unavailable and this story requires human review.';
  }

  const sources: SourceReference[] = [
    {
      id: `src-v1-${Date.now()}`,
      sourceName: newsItem.source,
      sourceUrl: newsItem.link,
      claim: newsItem.title,
      verified: status === 'VERIFIED',
      publishedDate: newsItem.pubDate
    }
  ];

  const log: VerificationLog = {
    id: `vlog-${Date.now()}`,
    articleId: '', // Assigned later
    claim: claimText,
    status,
    score: baseScore,
    sourcesChecked: 1,
    matchingSources: status === 'VERIFIED' ? 1 : 0,
    hallucinationRisk: status === 'VERIFIED' ? 'LOW' : 'HIGH',
    notes: notes,
    checkedAt: new Date().toISOString()
  };

  return {
    status,
    trustScore: baseScore,
    sources,
    log
  };
}

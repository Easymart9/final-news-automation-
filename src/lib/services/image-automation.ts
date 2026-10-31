interface CommonsImageInfo {
  thumburl?: string;
  url?: string;
  width?: number;
  thumbwidth?: number;
  descriptionurl?: string;
  extmetadata?: Record<string, { value?: string }>;
}

interface CommonsPage {
  title?: string;
  imageinfo?: CommonsImageInfo[];
}

export interface FeaturedImageResult {
  imageUrl: string;
  caption: string;
  altText: string;
  credit: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  needsReview: boolean;
}

const STOP_WORDS = new Set([
  'about', 'after', 'amid', 'and', 'are', 'from', 'have', 'into', 'news', 'over', 'says', 'that', 'the', 'their',
  'this', 'with', 'will', 'world', 'india', 'assam', 'northeast', 'technology', 'finance', 'business', 'health'
]);

function normalizedUrl(value: string): string {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value;
  }
}

function plainText(value: string | undefined): string {
  return (value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#0*39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchTerms(value: string): string[] {
  return [...new Set(value.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || [])]
    .filter(term => !STOP_WORDS.has(term))
    .slice(0, 8);
}

function isAllowedLicense(license: string): boolean {
  const normalized = license.trim().toLowerCase();
  if (/\b(nc|noncommercial|nd|no derivatives)\b/.test(normalized)) return false;
  return normalized === 'cc0' || normalized.startsWith('cc0 ') || normalized.startsWith('cc by ') ||
    normalized.startsWith('cc by-sa ') || normalized.includes('public domain') || normalized.startsWith('pd-');
}

function hasRelevantTerms(articleTerms: string[], imageText: string): boolean {
  const normalizedImageText = imageText.toLowerCase();
  const matches = articleTerms.filter(term => normalizedImageText.includes(term)).length;
  return matches >= Math.min(2, Math.max(1, Math.ceil(articleTerms.length * 0.2)));
}

function needsReview(): FeaturedImageResult {
  return { imageUrl: '', caption: '', altText: '', credit: '', license: '', licenseUrl: '', sourceUrl: '', needsReview: true };
}

export async function fetchFeaturedImage(
  category: string,
  title: string,
  previouslyAssignedUrls: Iterable<string> = []
): Promise<FeaturedImageResult> {
  const articleTerms = searchTerms(title);
  const terms = articleTerms.length ? articleTerms : searchTerms(category);
  if (terms.length === 0) return needsReview();

  const query = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: terms.join(' '),
    gsrnamespace: '6',
    gsrwhat: 'text',
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1200',
    format: 'json'
  });
  const endpoint = `https://commons.wikimedia.org/w/api.php?${query}`;
  const used = new Set([...previouslyAssignedUrls].map(normalizedUrl));

  try {
    const response = await fetch(endpoint, {
      headers: { 'User-Agent': 'WorldBulletinNewsBot/1.0 (https://worldbulletin.world/contact)' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) return needsReview();

    const data = await response.json() as { query?: { pages?: Record<string, CommonsPage> } };
    const pages = Object.values(data.query?.pages || {});

    for (const page of pages) {
      const info = page.imageinfo?.[0];
      const imageUrl = info?.thumburl || info?.url || '';
      const license = plainText(info?.extmetadata?.LicenseShortName?.value);
      const licenseUrl = plainText(info?.extmetadata?.LicenseUrl?.value);
      const credit = plainText(info?.extmetadata?.Artist?.value) || 'Unknown creator';
      const description = plainText(info?.extmetadata?.ImageDescription?.value);
      const sourceUrl = info?.descriptionurl || '';
      const imageTitle = (page.title || '').replace(/^File:/i, '').replace(/\.[a-z0-9]{2,5}$/i, '');
      const altText = plainText(`${imageTitle}. ${description}`).slice(0, 240);

      if (!imageUrl || !sourceUrl || (info?.width || info?.thumbwidth || 0) < 800 || !isAllowedLicense(license)) continue;
      if (!/^https:\/\/(thumb|upload)\.wikimedia\.org\//i.test(imageUrl)) continue;
      if (!hasRelevantTerms(articleTerms, `${imageTitle} ${description}`)) continue;
      if (used.has(normalizedUrl(imageUrl))) continue;

      const imageResponse = await fetch(imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      if (!imageResponse.ok) continue;

      return {
        imageUrl,
        caption: `${credit} / ${license} / Wikimedia Commons`,
        altText: altText || `Illustrative image related to ${title}`,
        credit,
        license,
        licenseUrl,
        sourceUrl,
        needsReview: false
      };
    }
  } catch (error) {
    console.warn('Licensed featured-image search failed:', error instanceof Error ? error.message : error);
  }

  return needsReview();
}
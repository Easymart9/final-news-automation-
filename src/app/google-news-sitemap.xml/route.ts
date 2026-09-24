import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const allVerified = db.getArticles(undefined, undefined, true);
  const baseUrl = 'https://worldbulletin.world';
  const now = Date.now();
  const twoDaysAgo = now - 48 * 60 * 60 * 1000;

  // Google News Sitemap strictly requires articles published in the last 48 hours
  let newsArticles = allVerified.filter(a => new Date(a.publishedAt).getTime() >= twoDaysAgo);
  if (newsArticles.length === 0) {
    newsArticles = allVerified.slice(0, 30); // fallback to latest 30
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${newsArticles.map(a => `
  <url>
    <loc>${baseUrl}/news/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>World Bulletin</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.publishedAt).toISOString()}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>
  `).join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800'
    }
  });
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

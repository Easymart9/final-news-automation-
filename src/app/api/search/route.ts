import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
const MAX_QUERY_LENGTH = 100;
const MAX_RESULTS = 10;

function toSearchResult(article: ReturnType<typeof db.getArticles>[number]) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    category: article.category,
    publishedAt: article.publishedAt,
    featuredImage: article.featuredImage,
    featuredImageAlt: article.featuredImageAlt
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().slice(0, MAX_QUERY_LENGTH);
    const articles = db.getArticles(undefined, undefined, true);

    if (!q.trim()) {
      return NextResponse.json(articles.slice(0, 5).map(toSearchResult));
    }

    const query = q.toLowerCase();
    const results = articles.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.category.toLowerCase().includes(query) ||
      a.summary.toLowerCase().includes(query) ||
      a.keywords.some(k => k.toLowerCase().includes(query))
    ).slice(0, MAX_RESULTS);

    return NextResponse.json(results.map(toSearchResult));
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

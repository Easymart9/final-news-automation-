import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const articles = db.getArticles();

    if (!q.trim()) {
      return NextResponse.json(articles.slice(0, 5));
    }

    const query = q.toLowerCase();
    const results = articles.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.category.toLowerCase().includes(query) ||
      a.summary.toLowerCase().includes(query) ||
      a.keywords.some(k => k.toLowerCase().includes(query))
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

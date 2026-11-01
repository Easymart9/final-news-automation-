import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Article ID is required' }, { status: 400 });
    }

    db.deleteArticle(id);
    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to delete article' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: 'Article update must be a JSON object.' }, { status: 400 });
    }
    const fields = body as Record<string, unknown>;
    const id = typeof fields.id === 'string' ? fields.id : '';

    if (!id) {
      return NextResponse.json({ success: false, message: 'Article ID is required' }, { status: 400 });
    }

    const textLimits: Record<string, number> = {
      title: 300,
      summary: 3000,
      content: 200_000,
      category: 120,
      metaDescription: 320
    };
    for (const [field, limit] of Object.entries(textLimits)) {
      const value = fields[field];
      if (value !== undefined && (typeof value !== 'string' || value.length > limit)) {
        return NextResponse.json({ success: false, message: `Invalid ${field} value.` }, { status: 400 });
      }
    }
    if (fields.keywords !== undefined && (!Array.isArray(fields.keywords) ||
        fields.keywords.length > 30 ||
        fields.keywords.some((keyword: unknown) => typeof keyword !== 'string' || keyword.length > 80))) {
      return NextResponse.json({ success: false, message: 'Invalid article keywords.' }, { status: 400 });
    }
    if (Object.hasOwn(fields, 'sponsoredBy') &&
        typeof fields.sponsoredBy !== 'string' && fields.sponsoredBy !== null) {
      return NextResponse.json({ success: false, message: 'Sponsor must be a text value.' }, { status: 400 });
    }
    if (typeof fields.sponsoredBy === 'string' && fields.sponsoredBy.trim().length > 120) {
      return NextResponse.json({ success: false, message: 'Sponsor name must not exceed 120 characters.' }, { status: 400 });
    }

    const article = db.getArticleById(id);
    if (!article) {
      return NextResponse.json({ success: false, message: 'Article not found' }, { status: 404 });
    }

    const updatedArticle = {
      ...article,
      title: typeof fields.title === 'string' && fields.title.trim() ? fields.title.trim() : article.title,
      summary: typeof fields.summary === 'string' && fields.summary.trim() ? fields.summary : article.summary,
      content: typeof fields.content === 'string' && fields.content.trim() ? fields.content : article.content,
      category: typeof fields.category === 'string' && fields.category.trim() ? fields.category.trim() : article.category,
      keywords: Array.isArray(fields.keywords) ? fields.keywords : article.keywords,
      metaDescription: typeof fields.metaDescription === 'string' && fields.metaDescription.trim()
        ? fields.metaDescription.trim()
        : article.metaDescription,
      sponsoredBy: Object.hasOwn(fields, 'sponsoredBy')
        ? (typeof fields.sponsoredBy === 'string' && fields.sponsoredBy.trim() ? fields.sponsoredBy.trim() : undefined)
        : article.sponsoredBy,
      updatedAt: new Date().toISOString()
    };

    db.saveArticle(updatedArticle);
    return NextResponse.json({ success: true, message: 'Article updated successfully', article: updatedArticle });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update article' }, { status: 500 });
  }
}

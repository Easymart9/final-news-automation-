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
    const body = await request.json();
    const { id, title, summary, content, category, keywords, metaDescription } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Article ID is required' }, { status: 400 });
    }

    const article = db.getArticleById(id);
    if (!article) {
      return NextResponse.json({ success: false, message: 'Article not found' }, { status: 404 });
    }

    const updatedArticle = {
      ...article,
      title: title || article.title,
      summary: summary || article.summary,
      content: content || article.content,
      category: category || article.category,
      keywords: keywords || article.keywords,
      metaDescription: metaDescription || article.metaDescription,
      updatedAt: new Date().toISOString()
    };

    db.saveArticle(updatedArticle);
    return NextResponse.json({ success: true, message: 'Article updated successfully', article: updatedArticle });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to update article' }, { status: 500 });
  }
}

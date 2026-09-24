import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArticleCard } from '@/components/ArticleCard';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { AdsterraResponsiveBanner, AdsterraNativeBanner } from '@/components/ads';

import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface TopicPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    page?: string;
  };
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const topic = db.getTopicBySlug(params.slug);
  if (!topic) return {};
  return {
    title: `${topic.name} | World Bulletin Editorial Desk`,
    description: topic.description,
    alternates: {
      canonical: `https://worldbulletin.world/topics/${topic.slug}`
    }
  };
}

export default function TopicPage({ params, searchParams }: TopicPageProps) {
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const topic = db.getTopicBySlug(params.slug);

  if (!topic) {
    notFound();
  }

  const allArticles = db.getArticles(undefined, topic.slug, true);
  const itemsPerPage = 12;
  const totalArticlesCount = allArticles.length;
  const totalPages = Math.ceil(totalArticlesCount / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const articles = allArticles.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20 font-sans">
      {/* Top Breadcrumb */}
      <div className="border-b border-slate-100 py-3 bg-slate-50 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="hover:text-sky-700 flex items-center gap-1 font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Latest News</span>
          </Link>
          <div className="flex items-center gap-2">
            <span>Desks</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">{topic.name}</span>
          </div>
        </div>
      </div>

      {/* Top Header Leaderboard Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdsterraResponsiveBanner />
      </div>

      {/* Topic Desk Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 news-border-b">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-widest font-heading">
            <BookOpen className="w-4 h-4" />
            <span>Editorial Desk Index</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            {topic.name}
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            {topic.description}
          </p>
        </div>
      </div>

      {/* Articles Feed Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-heading font-extrabold text-lg text-slate-900">
              Published Reporting ({articles.length} Stories)
            </h2>
            <span className="text-xs text-slate-500 font-mono">Sorted by recency</span>
          </div>

          {articles.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* In-feed Native Banner */}
              <AdsterraNativeBanner label="Sponsored Research & Topic Recommendations" />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-8 border-t border-slate-100 flex items-center justify-between gap-4 font-mono text-xs">
                  <Link
                    href={`/topics/${topic.slug}?page=${currentPage - 1}`}
                    className={`px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold transition-all ${
                      currentPage <= 1 ? 'pointer-events-none opacity-40' : 'hover:border-sky-400 hover:text-sky-700'
                    }`}
                  >
                    ← Previous Page
                  </Link>
                  <span className="text-slate-500 font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Link
                    href={`/topics/${topic.slug}?page=${currentPage + 1}`}
                    className={`px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold transition-all ${
                      currentPage >= totalPages ? 'pointer-events-none opacity-40' : 'hover:border-sky-400 hover:text-sky-700'
                    }`}
                  >
                    Next Page →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm">
              No published articles found in this desk index yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

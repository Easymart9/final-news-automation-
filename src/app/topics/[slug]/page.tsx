import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArticleCard } from '@/components/ArticleCard';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { AdsterraResponsiveBanner, AdsterraNativeBanner } from '@/components/ads';
import { Metadata } from 'next';
import { serializeJsonLd } from '@/lib/services/seo-engine';

export const dynamic = 'force-dynamic';

interface TopicPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: TopicPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const topic = db.getTopicBySlug(resolvedParams.slug);
  if (!topic) return {};

  const pageValue = Number(resolvedSearchParams.page || '1');
  const currentPage = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const articles = db.getArticles(undefined, topic.slug, true);
  const totalPages = Math.ceil(articles.length / 12);
  const topicUrl = `https://worldbulletin.world/topics/${topic.slug}`;
  const canonicalUrl = currentPage > 1 ? `${topicUrl}?page=${currentPage}` : topicUrl;

  return {
    title: `${topic.name} | World Bulletin Editorial Desk`,
    description: articles.length > 0
      ? `${topic.description} Read ${articles.length} published World Bulletin reports, updates, and analysis.`
      : topic.description,
    robots: {
      index: articles.length > 0 && currentPage <= totalPages,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${topic.name} | World Bulletin`,
      description: topic.description,
      url: canonicalUrl,
      type: 'website',
    },
  };
}

export default async function TopicPage({ params, searchParams }: TopicPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  
  const pageValue = Number(resolvedSearchParams?.page || '1');
  if (!Number.isInteger(pageValue) || pageValue < 1) {
    notFound();
  }
  const currentPage = pageValue;
  const topic = db.getTopicBySlug(resolvedParams.slug);

  if (!topic) {
    notFound();
  }

  const allArticles = db.getArticles(undefined, topic.slug, true);
  const itemsPerPage = 12;
  const totalArticlesCount = allArticles.length;
  const totalPages = Math.ceil(totalArticlesCount / itemsPerPage);
  if (totalPages > 0 && currentPage > totalPages) {
    notFound();
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const articles = allArticles.slice(startIndex, startIndex + itemsPerPage);
  const topicSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: topic.name,
    description: topic.description,
    url: `https://worldbulletin.world/topics/${topic.slug}`,
    isPartOf: { '@id': 'https://worldbulletin.world/#website' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalArticlesCount,
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: startIndex + index + 1,
        url: `https://worldbulletin.world/news/${article.slug}`,
        name: article.title
      }))
    }
  };

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(topicSchema) }}
      />
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
              Published Reporting ({totalArticlesCount} Stories)
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

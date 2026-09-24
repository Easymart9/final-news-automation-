import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { db } from '@/lib/db';
import { VerificationBadge } from '@/components/VerificationBadge';
import { AuthorCard } from '@/components/AuthorCard';
import { generateNewsArticleSchema, generateBreadcrumbSchema } from '@/lib/services/seo-engine';
import { ShareButtons } from '@/components/ShareButtons';
import { Clock, Calendar, ArrowLeft, Tag, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';
import { AdsterraResponsiveBanner, AdsterraNativeBanner, AdsterraSidebarAd } from '@/components/ads';

export const dynamic = 'force-dynamic';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = db.getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: `${article.title} | World Bulletin`,
    description: article.metaDescription,
    keywords: article.keywords,
    alternates: {
      canonical: `https://worldbulletin.world/news/${article.slug}`
    },
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      images: [{ url: article.featuredImage, width: 1200, height: 630, alt: article.title }]
    }
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = db.getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  // SEO Schemas
  const newsSchema = generateNewsArticleSchema(article);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://worldbulletin.world' },
    { name: article.category, url: `https://worldbulletin.world/topics/${article.topicSlug}` },
    { name: article.title, url: `https://worldbulletin.world/news/${article.slug}` }
  ]);

  // Related articles (Only query verified ones)
  const relatedArticles = db.getArticles(undefined, article.topicSlug, true)
    .filter(a => a.id !== article.id)
    .slice(0, 3);

  return (
    <article className="min-h-screen bg-[#fafafa] pb-24 font-sans text-slate-900">
      {/* Schema.org JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Clean Editorial Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="hover:text-sky-700 flex items-center gap-1.5 font-bold transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 text-sky-600" />
            <span>Back to Latest Feed</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/topics/${article.topicSlug}`} className="hover:text-sky-700 hover:underline">
              {article.category}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-[320px]">
              {article.title}
            </span>
          </div>
        </div>
      </div>

      {/* Top Header Leaderboard Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <AdsterraResponsiveBanner />
      </div>

      {/* ARTICLE HEADER (Clean Editorial White Box) */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 news-border-b">
        <div className="max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <Link
              href={`/topics/${article.topicSlug}`}
              className="bg-sky-50 text-sky-800 px-3 py-1 rounded-md border border-sky-200 uppercase tracking-wider font-heading hover:bg-sky-100 transition-colors"
            >
              {article.category}
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {article.readTimeMinutes} min read
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-mono font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fact Checked
            </span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
            {article.title}
          </h1>

          {/* Key Executive Summary Box */}
          <div className="bg-slate-50 border-l-4 border-sky-600 p-4 sm:p-5 rounded-r-xl border border-slate-200 space-y-1.5">
            <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Key Briefing & Summary</span>
            </h4>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-sans">
              {article.summary}
            </p>
          </div>

          {/* Author Info & Share Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden relative border border-slate-200 shrink-0">
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-slate-900 font-heading text-xs">{article.author.name}</p>
                <p className="text-[11px] text-slate-500">{article.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-heading hidden sm:inline">Share:</span>
              <ShareButtons title={article.title} slug={article.slug} />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID (8 Columns Body / 4 Columns Sticky Sidebar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Content Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Primary Hero Photographic Asset */}
            <div className="relative h-[320px] sm:h-[460px] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
                priority
              />
              {article.imageCaption && (
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/90 text-white p-3 text-xs border-t border-slate-800">
                  <p>📷 {article.imageCaption}</p>
                </div>
              )}
            </div>

            {/* Clean Article Content Container */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs space-y-6">
              {(() => {
                const parts = article.content.split(/(?=<h2>)/i);
                if (parts.length >= 3) {
                  const mid = Math.ceil(parts.length / 2);
                  const firstHalf = parts.slice(0, mid).join('');
                  const secondHalf = parts.slice(mid).join('');
                  return (
                    <>
                      <div 
                        className="article-body font-serif text-lg text-slate-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: firstHalf }}
                      />
                      
                      {/* Mid-Article Responsive Advertisement */}
                      <div className="my-8 py-3 px-2 border-y border-slate-200 bg-slate-50 rounded-xl">
                        <AdsterraResponsiveBanner />
                      </div>

                      <div 
                        className="article-body font-serif text-lg text-slate-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: secondHalf }}
                      />
                    </>
                  );
                }
                return (
                  <div 
                    className="article-body font-serif text-lg text-slate-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                );
              })()}
            </div>

            {/* Native Banner Ad below article content */}
            <AdsterraNativeBanner label="Sponsored Research & Relevant Technical Stories" />

            {/* Frequently Asked Questions (FAQ) Section */}
            {article.faq && article.faq.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <h3 className="text-lg font-bold font-headline text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span>Frequently Asked Questions</span>
                </h3>
                <div className="space-y-4">
                  {article.faq.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-sm text-slate-900 font-heading">
                        {item.question}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footnote Journalistic Citation Box */}
            <VerificationBadge
              score={article.trustScore}
              status={article.verificationStatus}
              sources={article.sources}
            />

            {/* Keywords Tag Cloud */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                <Tag className="w-4 h-4 text-sky-700" />
                <span>Topics & Keywords Index</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((kw, idx) => (
                  <span key={idx} className="bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded-lg border border-slate-200 font-medium transition-colors hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 cursor-pointer">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Column (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            {/* Share Desk */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-heading">
                Share this report
              </span>
              <ShareButtons title={article.title} slug={article.slug} />
            </div>

            {/* Verification Registry Telemetry Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider font-heading border-b border-slate-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verification Registry</span>
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-bold uppercase">{article.verificationStatus}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Primary Source:</span>
                  <span className="text-sky-700 font-bold truncate max-w-[150px]">{article.sources[0]?.sourceName || 'Verified Outlets'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Audit Type:</span>
                  <span className="text-slate-700 font-bold">Multi-Source Fact Check</span>
                </div>
              </div>
            </div>

            {/* Academic EEAT Author Card */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 font-heading">
                Assigned Reporter
              </h4>
              <AuthorCard author={article.author} />
            </div>

            {/* Sidebar Ad Unit */}
            <AdsterraSidebarAd />

            {/* Editorial Standard Stamp */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 font-heading flex items-center gap-1.5 uppercase tracking-wider">
                <Scale className="w-4 h-4 text-sky-700" />
                <span>Ethics & Accuracy Stamp</span>
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                World Bulletin strictly publishes news generated directly from primary scraped source materials. Fictional statements, unverified benchmarks, and speculation are filtered out automatically.
              </p>
              <Link href="/editorial-standards" className="text-xs text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 font-heading pt-1">
                <span>Read Editorial Standards Policy</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>

            {/* Related Stories Stream */}
            {relatedArticles.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 font-heading">
                  Related Reporting
                </h4>
                <div className="space-y-4">
                  {relatedArticles.map((rel) => (
                    <div key={rel.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs group space-y-2.5 hover:border-sky-300 transition-colors">
                      <div className="flex items-center justify-between text-[10px] font-bold text-sky-700 uppercase tracking-wider font-mono">
                        <span>{rel.category}</span>
                        <span>{rel.readTimeMinutes} min read</span>
                      </div>
                      <Link href={`/news/${rel.slug}`}>
                        <h5 className="font-heading text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h5>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}

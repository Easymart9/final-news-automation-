import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { ArticleCard } from '@/components/ArticleCard';
import { NewsTicker } from '@/components/NewsTicker';
import { HeroCarousel } from '@/components/HeroCarousel';
import { Clock, ArrowUpRight, ChevronRight, TrendingUp, BookOpen, ShieldCheck, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { AdsterraResponsiveBanner, AdsterraNativeBanner, AdsterraSidebarAd } from '@/components/ads';

export const dynamic = 'force-dynamic';

export default function HomePage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const articles = db.getArticles(undefined, undefined, true);
  const topics = db.getTopics();

  // Top 3 latest news stories for interactive Hero Carousel
  const featuredArticles = articles.slice(0, 3);

  // Secondary breaking headlines (stories right after carousel)
  const topHeadlines = articles.slice(3, 7);

  // Deep Dive Special Reports (stories 7 to 10)
  const specialReports = articles.slice(7, 10);

  // Paginated articles stream: show 10 articles per page
  const itemsPerPage = 10;
  const totalArticlesCount = Math.max(0, articles.length - 3); // Exclude hero articles
  const totalPages = Math.ceil(totalArticlesCount / itemsPerPage);
  
  const startIndex = 3 + (currentPage - 1) * itemsPerPage;
  const latestNewsStream = articles.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-[#fafafa] min-h-screen pb-24 font-sans text-slate-900 selection:bg-sky-500/30">
      {/* Breaking News Ticker */}
      <NewsTicker articles={articles} />

      {/* Top Header Leaderboard Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <AdsterraResponsiveBanner />
      </div>

      {/* HERO SECTION WITH FEATURED CAROUSEL & BREAKING HEADLINES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 news-border-b">
        <div className="space-y-8">
          {/* Top Interactive Hero Carousel Slider */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 bg-white">
            <HeroCarousel articles={featuredArticles} />
          </div>

          {/* Secondary Top Breaking Headlines Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            {/* 4 Trending Breaking News Items (8 Cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500"></div>
              
              <div className="border-b border-slate-100 pb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-amber-50 rounded-lg text-amber-500">
                    <Flame className="w-5 h-5 fill-amber-500 animate-pulse" />
                  </div>
                  <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 uppercase tracking-wider">
                    Trending Intelligence Briefings
                  </h2>
                </div>
                <span className="text-[10px] font-extrabold text-sky-700 font-mono bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 uppercase tracking-widest">
                  Live Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {topHeadlines.map((story) => (
                  <div key={story.id} className="group space-y-3 pb-5 sm:pb-0 border-b sm:border-b-0 border-slate-100 last:border-0 hover:bg-slate-50/50 p-2 rounded-2xl transition-all duration-300">
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-2xs border border-slate-200/40">
                      <Image
                        src={story.featuredImage}
                        alt={story.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/90 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-heading border border-white/10 backdrop-blur-md">
                        {story.category}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{story.readTimeMinutes} min read</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Fact Checked</span>
                      </div>

                      <Link href={`/news/${story.slug}`}>
                        <h3 className="font-headline text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug line-clamp-2">
                          {story.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
                        {story.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Standard Card & Editorial Mission (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading font-extrabold text-base uppercase tracking-wider text-sky-400">
                    Verification Standard
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Every article published by World Bulletin undergoes multi-source claims validation against peer-reviewed ArXiv preprints, MIT CSAIL releases, and technical repositories.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs font-mono pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fact Confidence:</span>
                    <strong className="text-white">80% Minimum</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Primary Sources:</span>
                    <strong className="text-white">2+ Required</strong>
                  </div>
                </div>

                <Link href="/editorial-standards" className="inline-flex items-center gap-1 text-xs text-sky-400 font-extrabold hover:text-sky-300 font-heading pt-2 transition-colors">
                  <span>View Reporting Code & Policy</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COVERAGE DESKS INDEX STRIP */}
      <section className="bg-white border-y border-slate-200/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-base text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Coverage Desks Index</span>
            </h3>
            <span className="text-xs text-slate-400 font-bold font-mono">Explore All Desks</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {topics.map((t) => (
              <Link
                key={t.id}
                href={`/topics/${t.slug}`}
                className="bg-slate-50 hover:bg-sky-50/50 p-5 rounded-2xl border border-slate-200 hover:border-sky-300/60 transition-all group shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1 font-heading">
                    {t.name}
                  </span>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-sans">
                    {t.description}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between text-[9px] text-sky-700 font-extrabold font-mono uppercase tracking-wider">
                  <span>{t.articleCount} Stories</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-Page Leaderboard Advertisement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AdsterraResponsiveBanner />
      </div>

      {/* FEATURED DEEP DIVES & SPECIAL REPORTS */}
      {specialReports.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 news-border-b">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                <h3 className="font-heading font-extrabold text-xl text-slate-900">
                  Featured Deep Dives & Special Reports
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Peer-Verified Analyses</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {specialReports.map((report) => (
                <div key={report.id} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 hover:shadow-md transition-all group">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100">
                    <Image
                      src={report.featuredImage}
                      alt={report.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/90 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-heading">
                      {report.category}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{report.readTimeMinutes} min read</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified Source
                      </span>
                    </div>

                    <Link href={`/news/${report.slug}`}>
                      <h4 className="font-headline text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug line-clamp-2">
                        {report.title}
                      </h4>
                    </Link>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {report.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>By {report.author.name}</span>
                    <Link href={`/news/${report.slug}`} className="text-sky-700 font-bold hover:underline flex items-center gap-1 font-heading text-[11px]">
                      <span>Read Story</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LATEST PUBLISHED ARTICLES FEED STREAM (PAGINATED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Latest Articles Feed Stream (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-slate-900">
                  Latest Reporting & Analysis Stream
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browsing page {currentPage} of {totalPages} ({totalArticlesCount} total articles)
                </p>
              </div>
              <span className="text-xs text-sky-700 font-mono font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-200 shrink-0">
                Page {currentPage} / {totalPages}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {latestNewsStream.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* In-feed Native Banner Advertisement */}
            <AdsterraNativeBanner label="Recommended Technical Insights & Partner News" />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 border-t border-slate-100 flex items-center justify-between gap-4 font-mono text-xs">
                <Link
                  href={`/?page=${currentPage - 1}`}
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
                  href={`/?page=${currentPage + 1}`}
                  className={`px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold transition-all ${
                    currentPage >= totalPages ? 'pointer-events-none opacity-40' : 'hover:border-sky-400 hover:text-sky-700'
                  }`}
                >
                  Next Page →
                </Link>
              </div>
            )}
          </div>

          {/* Editorial Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Editor's Desk Directory */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <h4 className="font-heading text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
                Desks Directory
              </h4>
              <div className="space-y-3 text-xs">
                {topics.map((t) => (
                  <Link
                    key={t.id}
                    href={`/topics/${t.slug}`}
                    className="flex items-center justify-between text-slate-700 hover:text-sky-700 py-1.5 border-b border-slate-100 last:border-0 transition-colors"
                  >
                    <span className="font-semibold">{t.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{t.articleCount} articles</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar Adsterra Unit */}
            <AdsterraSidebarAd />

            {/* Verification Telemetry Badge */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider font-heading border-b border-slate-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verification Telemetry</span>
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600">Verification Rate:</span>
                  <span className="text-emerald-700 font-bold">Fact-Checked & Verified</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600">Scan Pipeline:</span>
                  <span className="text-sky-700 font-bold">3x Daily Automated</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600">Hallucination Guard:</span>
                  <span className="text-emerald-700 font-bold">Multi-Source Cross</span>
                </div>
              </div>
            </div>

            {/* Journalistic Code */}
            <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 font-heading">
                <BookOpen className="w-4 h-4 text-sky-700" />
                <span>Journalistic Standards</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Articles published on World Bulletin strictly adhere to multi-source verification and claim validation.
              </p>
              <Link href="/editorial-standards" className="text-sky-700 font-extrabold hover:underline block pt-1 font-heading">
                Read Ethics & Standards Policy →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

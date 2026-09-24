import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArticleCard } from '@/components/ArticleCard';
import { ArrowLeft, Award, Twitter, Linkedin } from 'lucide-react';
import { AdsterraResponsiveBanner, AdsterraNativeBanner } from '@/components/ads';

import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface AuthorPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const author = db.getAuthorBySlug(params.slug);
  if (!author) return {};
  return {
    title: `${author.name} | World Bulletin Journalist`,
    description: author.bio,
    alternates: {
      canonical: `https://worldbulletin.world/authors/${author.slug}`
    }
  };
}

export default function AuthorPage({ params }: AuthorPageProps) {
  const author = db.getAuthorBySlug(params.slug);

  if (!author) {
    notFound();
  }

  const articles = db.getArticles(undefined, undefined, true).filter(a => a.author.slug === author.slug);

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
            <span>Reporters</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">{author.name}</span>
          </div>
        </div>
      </div>

      {/* Author Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 news-border-b">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden relative border-2 border-slate-200 shrink-0 shadow-md">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest font-heading">
              Reporter Profile
            </span>

            <h1 className="font-headline text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              {author.name}
            </h1>

            <p className="text-sm font-semibold text-slate-700 font-heading">{author.role}</p>

            <p className="text-slate-600 text-sm leading-relaxed">
              {author.bio}
            </p>

            {author.credentials && author.credentials.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {author.credentials.map((cred, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-md border border-slate-200 font-medium">
                    <Award className="w-3.5 h-3.5 text-purple-600 inline mr-1" />
                    {cred}
                  </span>
                ))}
              </div>
            )}

            {(author.twitter || author.linkedin) && (
              <div className="pt-2 flex items-center gap-4 text-xs font-medium text-slate-600">
                {author.twitter && (
                  <a href={author.twitter} target="_blank" rel="noreferrer" className="hover:text-sky-700 flex items-center gap-1">
                    <Twitter className="w-3.5 h-3.5 text-sky-500" />
                    <span>Twitter</span>
                  </a>
                )}
                {author.linkedin && (
                  <a href={author.linkedin} target="_blank" rel="noreferrer" className="hover:text-sky-700 flex items-center gap-1">
                    <Linkedin className="w-3.5 h-3.5 text-sky-700" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Author Articles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Author Top Leaderboard Ad */}
        <div className="mb-8">
          <AdsterraResponsiveBanner />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-heading font-extrabold text-lg text-slate-900">
              Articles Reported by {author.name} ({articles.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* In-feed Native Banner */}
          <AdsterraNativeBanner label="Sponsored Research & Insights" />
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { Article } from '@/types';
import { ShareButtons } from '@/components/ShareButtons';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  if (featured) {
    return (
      <div className="news-card border-b border-slate-200 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group">
        <div className="lg:col-span-7 relative h-[300px] lg:h-[400px] w-full rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-300"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
        </div>

        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-sky-700 font-bold uppercase tracking-wider font-sans">
            <span>{article.category}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-slate-400" /> {article.readTimeMinutes} min read
            </span>
          </div>

          <Link href={`/news/${article.slug}`}>
            <h2 className="news-title font-headline text-2xl lg:text-3xl font-bold text-slate-900 leading-snug transition-colors group-hover:text-sky-700">
              {article.title}
            </h2>
          </Link>

          <p className="text-slate-600 text-sm leading-relaxed font-sans line-clamp-3">
            {article.summary}
          </p>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0 border border-slate-200">
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-semibold text-slate-900">{article.author.name}</span>
            </div>

            <ShareButtons title={article.title} slug={article.slug} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-card flex flex-col justify-between group bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 transition-colors shadow-xs">
      <div className="space-y-3">
        <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-sky-700 uppercase tracking-wider font-sans">
            <span className="bg-sky-50 px-2 py-0.5 rounded border border-sky-200">{article.category}</span>
            <span className="text-slate-500 font-normal font-mono">{article.readTimeMinutes} min read</span>
          </div>

          <Link href={`/news/${article.slug}`}>
            <h3 className="news-title font-headline text-lg font-bold text-slate-900 leading-snug line-clamp-2 transition-colors group-hover:text-sky-700">
              {article.title}
            </h3>
          </Link>

          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-sans">
            {article.summary}
          </p>
        </div>
      </div>

      <div className="pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-sans border-t border-slate-100">
        <span className="font-semibold text-slate-800">{article.author.name}</span>
        <ShareButtons title={article.title} slug={article.slug} />
      </div>
    </div>
  );
};

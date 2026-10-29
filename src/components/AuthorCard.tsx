import React from 'react';
import Link from 'next/link';
import { Author } from '@/types';

interface AuthorCardProps {
  author: Author;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
  if (!author) return null;
  const slug = author.slug || 'editorial-desk';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="space-y-1">
        <Link href={`/authors/${slug}`}>
          <h3 className="text-lg font-bold text-slate-900 hover:text-sky-600 transition-colors font-heading">
            World Bulletin Editorial Desk
          </h3>
        </Link>
        <p className="text-xs text-sky-700 font-semibold">AI-assisted publishing workflow</p>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed font-sans">
        This is a system byline, not a human author profile. Individual authorship and credentials have not been independently verified.
      </p>
    </div>
  );
};

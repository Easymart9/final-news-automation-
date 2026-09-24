import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, CheckCircle2, ShieldCheck, Twitter, Linkedin } from 'lucide-react';
import { Author } from '@/types';

interface AuthorCardProps {
  author: Author;
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
  if (!author) return null;

  const name = author.name || 'World Bulletin Staff';
  const avatar = author.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
  const role = author.role || 'Staff Journalist';
  const bio = author.bio || 'AI technology analyst and verified journalism contributor at World Bulletin.';
  const slug = author.slug || 'editorial-desk';
  const verifiedCount = author.verifiedCount || 10;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden relative border-2 border-sky-500/50 shrink-0 shadow-md">
          <Image
            src={avatar}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href={`/authors/${slug}`}>
              <h3 className="text-lg font-bold text-slate-900 hover:text-sky-600 transition-colors font-heading">
                {name}
              </h3>
            </Link>
            <span title="E-E-A-T Verified Author">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </span>
          </div>
          <p className="text-xs text-sky-600 font-semibold">{role}</p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-medium pt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{verifiedCount} Fact-Checked Articles Published</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed font-sans">
        {bio}
      </p>

      {author.credentials && author.credentials.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 font-heading">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span>Credentials & Expertise</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {author.credentials.map((cred, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-medium border border-slate-200">
                {cred}
              </span>
            ))}
          </div>
        </div>
      )}

      {(author.twitter || author.linkedin) && (
        <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 font-medium">
          {author.twitter && (
            <a href={author.twitter} target="_blank" rel="noreferrer" className="hover:text-sky-600 flex items-center gap-1">
              <Twitter className="w-3.5 h-3.5 text-sky-500" />
              <span>Twitter</span>
            </a>
          )}
          {author.linkedin && (
            <a href={author.linkedin} target="_blank" rel="noreferrer" className="hover:text-sky-600 flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5 text-sky-700" />
              <span>LinkedIn Profile</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

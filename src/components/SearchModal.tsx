'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ShieldCheck, TrendingUp, Loader2 } from 'lucide-react';
import { Article } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchResults('');
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchResults(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const fetchResults = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm transition-all font-sans">
      {/* Modal Card */}
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex items-center gap-3 flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xs focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
            <Search className="w-5 h-5 text-sky-600 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search news, topics, paper benchmarks, or silicon chips..."
              className="w-full text-sm text-slate-900 placeholder-slate-400 outline-none font-medium bg-transparent"
            />
            {loading ? (
              <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
            ) : query ? (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Close Search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tag Pills */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/40 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 font-heading">
            <TrendingUp className="w-3 h-3 text-sky-600" /> Quick Desks:
          </span>
          {['LLMs', 'Chips', 'Agents', 'Safety', 'Robotics'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-3 py-1 rounded-full bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 text-[11px] font-semibold transition-all shrink-0 font-heading"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results Stream */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 no-scrollbar">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-1 border-b border-slate-100">
            <span>{query ? `Search Results (${results.length})` : 'Recommended Stories'}</span>
            <span>Live Database Index</span>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-bold text-slate-700 font-heading">No matching news articles found</p>
              <p className="text-xs text-slate-400">Try searching for terms like "Quantum", "Silicon", "SWE-bench", or "Robotics".</p>
            </div>
          ) : (
            results.map((art) => (
              <Link
                key={art.id}
                href={`/news/${art.slug}`}
                onClick={onClose}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-sky-300 bg-slate-50/50 hover:bg-sky-50/60 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="font-extrabold text-sky-700 uppercase tracking-wider bg-sky-100 px-2 py-0.5 rounded font-heading">
                      {art.category}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  </div>

                  <h4 className="font-headline text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                    {art.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">{art.summary}</p>
                </div>

                <div className="relative h-14 w-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                  <Image src={art.featuredImage} alt={art.title} fill className="object-cover" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

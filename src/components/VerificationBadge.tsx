'use client';

import React, { useState } from 'react';
import { ExternalLink, ChevronDown, CheckCircle2, BookOpen } from 'lucide-react';
import { SourceReference, VerificationStatus } from '@/types';

interface VerificationBadgeProps {
  score: number;
  status: VerificationStatus;
  sources: SourceReference[];
  compact?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ score, status, sources = [], compact = false }) => {
  const [showDetails, setShowDetails] = useState(true);
  const safeSources = Array.isArray(sources) ? sources : [];

  if (compact || safeSources.length === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-8 text-xs font-sans">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>

          <div>
            <h4 className="font-bold text-slate-900 font-heading text-xs uppercase tracking-wider">
              Reporting Sources & Fact Check Reference
            </h4>
            <p className="text-slate-600 text-xs mt-0.5">
              Verified against {safeSources.length} independent technical sources (Factual Integrity Audited)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors"
        >
          <span>{showDetails ? 'Hide References' : 'View Source Links'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2.5">
          {sources.map((src) => (
            <div key={src.id} className="flex items-start justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 font-heading">{src.sourceName}</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">{src.claim}</p>
                </div>
              </div>
              <a 
                href={src.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sky-700 hover:underline flex items-center gap-1 shrink-0 font-semibold text-[11px]"
              >
                <span>Read Citation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

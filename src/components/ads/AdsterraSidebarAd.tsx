'use client';

import React from 'react';
import { AdsterraBanner320x50 } from './AdsterraBanner320x50';

interface AdsterraSidebarAdProps {
  className?: string;
}

export function AdsterraSidebarAd({ className = '' }: AdsterraSidebarAdProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-center space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-heading">
          Sponsored Partner
        </span>
        <span className="text-[9px] font-mono text-slate-300">Ad</span>
      </div>
      <div className="flex justify-center items-center py-1">
        <AdsterraBanner320x50 />
      </div>
    </div>
  );
}

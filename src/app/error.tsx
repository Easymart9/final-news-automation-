'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] bg-white flex items-center justify-center p-4 font-sans text-center">
      <div className="max-w-md space-y-5">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold text-slate-900">
            System Error
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            An unexpected error occurred while loading this page. Please try refreshing.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-700 text-white text-xs font-bold shadow-sm hover:bg-sky-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
          >
            <span>Front Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-white flex items-center justify-center p-4 font-sans text-center">
      <div className="max-w-md space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-600">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold text-slate-900">
            Page Not Found
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            The article or topic desk page you are looking for could not be found or may have been moved.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Front Page</span>
        </Link>
      </div>
    </div>
  );
}

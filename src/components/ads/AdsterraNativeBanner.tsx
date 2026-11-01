'use client';

import React from 'react';
import { useAdvertisingConsent } from '@/components/CookieConsent';

interface AdsterraNativeBannerProps {
  className?: string;
  label?: string;
}

export function AdsterraNativeBanner({ className = '', label = 'Sponsored Stories & Recommendations' }: AdsterraNativeBannerProps) {
  const advertisingAllowed = useAdvertisingConsent();
  const adHtml = `<!doctype html><html><head><meta charset="utf-8"></head><body>
    <div id="container-2b5c851ccb60002fe95637d183b9d26a"></div>
    <script async data-cfasync="false" src="https://pl31344741.profitableratecpmnetwork.com/2b5c851ccb60002fe95637d183b9d26a/invoke.js"></script>
  </body></html>`;

  return (
    <div className={`w-full my-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
          {label}
        </span>
        <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 uppercase">
          Sponsored
        </span>
      </div>
      
      {advertisingAllowed ? (
        <iframe
          title={label}
          srcDoc={adHtml}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
          className="w-full min-h-[120px] border-0"
        />
      ) : (
        <p className="min-h-[40px] flex items-center justify-center text-xs text-slate-500">
          Advertising is disabled until you allow it in cookie settings.
        </p>
      )}
    </div>
  );
}

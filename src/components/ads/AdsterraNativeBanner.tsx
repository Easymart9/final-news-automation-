'use client';

import React, { useEffect, useRef } from 'react';

interface AdsterraNativeBannerProps {
  className?: string;
  label?: string;
}

export function AdsterraNativeBanner({ className = '', label = 'Sponsored Intelligence & Recommendations' }: AdsterraNativeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const containerDiv = document.createElement('div');
    containerDiv.id = 'container-2b5c851ccb60002fe95637d183b9d26a';
    containerDiv.className = 'w-full flex justify-center min-h-[120px]';
    containerRef.current.appendChild(containerDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl31344741.profitableratecpmnetwork.com/2b5c851ccb60002fe95637d183b9d26a/invoke.js';
    
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className={`w-full my-8 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 font-heading">
            {label}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 uppercase">
          Promoted
        </span>
      </div>
      
      <div ref={containerRef} className="w-full min-h-[140px] flex items-center justify-center overflow-hidden" />
    </div>
  );
}

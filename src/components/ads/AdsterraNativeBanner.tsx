'use client';

import React, { useEffect, useRef } from 'react';

interface AdsterraNativeBannerProps {
  className?: string;
  label?: string;
}

export function AdsterraNativeBanner({ className = '', label = 'Sponsored Stories & Recommendations' }: AdsterraNativeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const containerDiv = document.createElement('div');
    containerDiv.id = 'container-2b5c851ccb60002fe95637d183b9d26a';
    containerDiv.className = 'w-full min-h-[120px] flex justify-center items-center';
    containerRef.current.appendChild(containerDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl31344741.profitableratecpmnetwork.com/2b5c851ccb60002fe95637d183b9d26a/invoke.js';
    
    containerRef.current.appendChild(script);
  }, []);

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
      
      <div ref={containerRef} className="w-full min-h-[120px] flex items-center justify-center" />
    </div>
  );
}

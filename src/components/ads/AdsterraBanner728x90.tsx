'use client';

import React, { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  className?: string;
}

export function AdsterraBanner728x90({ className = '' }: AdsterraBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    bannerRef.current.innerHTML = '';

    const atOptions = {
      key: 'b16ada32fb75da266469c32ecb32029d',
      format: 'iframe',
      height: 90,
      width: 728,
      params: {}
    };

    const conf = document.createElement('script');
    conf.type = 'text/javascript';
    conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highrevenueformat.com/b16ada32fb75da266469c32ecb32029d/invoke.js';
    script.async = true;

    bannerRef.current.appendChild(conf);
    bannerRef.current.appendChild(script);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center my-4 overflow-hidden w-full ${className}`}>
      <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono mb-1">Advertisement</span>
      <div 
        ref={bannerRef} 
        className="w-full max-w-[728px] min-h-[90px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200/60 p-1 shadow-2xs overflow-hidden" 
      />
    </div>
  );
}

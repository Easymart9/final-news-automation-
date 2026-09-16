'use client';

import React, { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  className?: string;
}

export function AdsterraBanner320x50({ className = '' }: AdsterraBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    bannerRef.current.innerHTML = '';

    const atOptions = {
      key: '237e6102b6fa1b6b90ebce3b1c7095e0',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {}
    };

    const conf = document.createElement('script');
    conf.type = 'text/javascript';
    conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highrevenueformat.com/237e6102b6fa1b6b90ebce3b1c7095e0/invoke.js';
    script.async = true;

    bannerRef.current.appendChild(conf);
    bannerRef.current.appendChild(script);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center my-3 overflow-hidden w-full ${className}`}>
      <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono mb-1">Advertisement</span>
      <div 
        ref={bannerRef} 
        className="w-full max-w-[320px] min-h-[50px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200/60 p-1 shadow-2xs overflow-hidden" 
      />
    </div>
  );
}

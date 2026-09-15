'use client';

import React, { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  className?: string;
}

export function AdsterraBanner728x90({ className = '' }: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Clear container
    containerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.width = '728';
    iframe.height = '90';
    iframe.title = 'Advertisement 728x90';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
          </style>
        </head>
        <body>
          <script type="text/javascript">
            atOptions = {
              'key' : 'b16ada32fb75da266469c32ecb32029d',
              'format' : 'iframe',
              'height' : 90,
              'width' : 728,
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://www.highrevenueformat.com/b16ada32fb75da266469c32ecb32029d/invoke.js"></script>
        </body>
      </html>
    `;

    containerRef.current.appendChild(iframe);
    
    // Inject content into iframe safely
    try {
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    } catch {
      iframe.srcdoc = html;
    }
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center my-3 overflow-hidden ${className}`}>
      <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono mb-1">Advertisement</span>
      <div ref={containerRef} className="min-w-[728px] min-h-[90px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100/60 p-1" />
    </div>
  );
}

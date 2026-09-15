'use client';

import React, { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  className?: string;
}

export function AdsterraBanner320x50({ className = '' }: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.width = '320';
    iframe.height = '50';
    iframe.title = 'Advertisement 320x50';
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
              'key' : '237e6102b6fa1b6b90ebce3b1c7095e0',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://www.highrevenueformat.com/237e6102b6fa1b6b90ebce3b1c7095e0/invoke.js"></script>
        </body>
      </html>
    `;

    containerRef.current.appendChild(iframe);

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
    <div className={`flex flex-col items-center justify-center my-2 overflow-hidden ${className}`}>
      <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono mb-1">Advertisement</span>
      <div ref={containerRef} className="min-w-[320px] min-h-[50px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100/60 p-1" />
    </div>
  );
}

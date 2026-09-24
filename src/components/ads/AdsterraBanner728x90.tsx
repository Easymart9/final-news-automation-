'use client';

import React from 'react';

interface AdsterraBannerProps {
  className?: string;
}

export function AdsterraBanner728x90({ className = '' }: AdsterraBannerProps) {
  const adHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; background: transparent; overflow: hidden; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; }
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
</html>`;

  return (
    <div className={`flex flex-col items-center justify-center my-3 w-full ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-1 select-none">
        Advertisement
      </span>
      <div className="w-[728px] h-[90px] max-w-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded overflow-hidden">
        <iframe
          title="Adsterra 728x90 Leaderboard"
          srcDoc={adHtml}
          width="728"
          height="90"
          scrolling="no"
          style={{ border: 'none', width: '728px', height: '90px', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
}

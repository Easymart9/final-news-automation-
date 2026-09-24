'use client';

import React from 'react';

interface AdsterraBannerProps {
  className?: string;
}

export function AdsterraBanner320x50({ className = '' }: AdsterraBannerProps) {
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
      'key' : '237e6102b6fa1b6b90ebce3b1c7095e0',
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/237e6102b6fa1b6b90ebce3b1c7095e0/invoke.js"></script>
</body>
</html>`;

  return (
    <div className={`flex flex-col items-center justify-center my-2 w-full ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-1 select-none">
        Advertisement
      </span>
      <div className="w-[320px] h-[50px] max-w-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded overflow-hidden">
        <iframe
          title="Adsterra 320x50 Banner"
          srcDoc={adHtml}
          width="320"
          height="50"
          scrolling="no"
          style={{ border: 'none', width: '320px', height: '50px', overflow: 'hidden' }}
        />
      </div>
    </div>
  );
}

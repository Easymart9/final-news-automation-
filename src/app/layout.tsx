import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { PublicShell } from '@/components/PublicShell';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'World Bulletin | Fact-Checked Automated AI Journalism',
  description: 'World Bulletin (worldbulletin.world) is an automated worldwide artificial intelligence news platform. Multi-source fact verification, automated claim extraction, and verified editorial standards.',
  keywords: [
    'World Bulletin',
    'worldbulletin.world',
    'World Bulletin News',
    'AI News',
    'Artificial Intelligence',
    'Machine Learning',
    'Fact Checked AI',
    'Llama 3.3',
    'Groq AI'
  ],
  icons: {
    icon: '/favicon.ico',
  },
  authors: [{ name: 'World Bulletin Team' }],
  alternates: {
    canonical: 'https://worldbulletin.world'
  },
  other: {
    'google-adsense-account': 'ca-pub-1941031216214407'
  },
  openGraph: {
    title: 'World Bulletin | Fact-Checked Automated AI Journalism',
    description: 'World Bulletin is an automated worldwide artificial intelligence news platform.',
    type: 'website',
    url: 'https://worldbulletin.world',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Google AdSense Account Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-1941031216214407" />

        {/* Google tag (gtag.js) - Official Setup */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-H9BK8MP506"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-H9BK8MP506');
              gtag('config', 'G-NMM93CJ1ZQ');
            `
          }}
        />

        {/* Google AdSense Universal Verification Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1941031216214407"
          crossOrigin="anonymous"
        />

        {/* Auto ads for AMP */}
        <script
          async
          custom-element="amp-auto-ads"
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.indexOf('Loading chunk') !== -1 || e.message.indexOf('ChunkLoadError') !== -1)) {
                  var sessionKey = 'chunk_reload_retry';
                  if (!sessionStorage.getItem(sessionKey)) {
                    sessionStorage.setItem(sessionKey, '1');
                    window.location.reload(true);
                  }
                }
              });
              window.addEventListener('load', function() {
                sessionStorage.removeItem('chunk_reload_retry');
              });
            `
          }}
        />
      </head>
      <body className="h-full bg-[#fafafa] antialiased" suppressHydrationWarning>
        {/* Google AdSense AMP Auto Ads */}
        {React.createElement('amp-auto-ads', {
          type: 'adsense',
          'data-ad-client': 'ca-pub-1941031216214407'
        })}
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { PublicShell } from '@/components/PublicShell';
import { serializeJsonLd } from '@/lib/services/seo-engine';

const siteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://worldbulletin.world/#organization',
      name: 'World Bulletin',
      url: 'https://worldbulletin.world',
      logo: {
        '@type': 'ImageObject',
        url: 'https://worldbulletin.world/logo.svg'
      },
      description: 'An AI-assisted global technology news publication with linked source references.'
    },
    {
      '@type': 'WebSite',
      '@id': 'https://worldbulletin.world/#website',
      name: 'World Bulletin',
      url: 'https://worldbulletin.world',
      publisher: { '@id': 'https://worldbulletin.world/#organization' },
      inLanguage: 'en'
    }
  ]
};

export const metadata: Metadata = {
  title: 'World Bulletin | AI-Assisted Technology News',
  description: 'World Bulletin publishes AI-assisted technology news with linked source references and automated checks that may be fallible.',
  keywords: [
    'World Bulletin',
    'worldbulletin.world',
    'World Bulletin News',
    'AI News',
    'Artificial Intelligence',
    'Machine Learning',
    'AI-assisted technology news',
    'Llama 3.3',
    'Groq AI'
  ],
  icons: {
    icon: ['/logo.svg', '/favicon.ico'],
  },
  authors: [{ name: 'World Bulletin Team' }],
  alternates: {
    canonical: 'https://worldbulletin.world'
  },
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.trim() }
      : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim()
      ? { other: { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION.trim() } }
      : {})
  },
  other: {
    'google-adsense-account': 'ca-pub-1941031216214407'
  },
  openGraph: {
    title: 'World Bulletin | AI-Assisted Technology News',
    description: 'AI-assisted technology news with linked source references.',
    type: 'website',
    url: 'https://worldbulletin.world',
    images: [{ url: 'https://worldbulletin.world/logo.svg', width: 512, height: 512, alt: 'World Bulletin' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Bulletin | AI-Assisted Technology News',
    description: 'AI-assisted news with linked source references and automated checks.',
    images: ['https://worldbulletin.world/logo.svg']
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteSchema) }}
        />
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}

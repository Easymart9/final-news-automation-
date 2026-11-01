'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdsterraResponsiveBanner } from '@/components/ads';
import { CookieConsentProvider } from '@/components/CookieConsent';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased">
        {children}
      </div>
    );
  }

  return (
    <CookieConsentProvider>
      <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1 bg-[#fafafa]">{children}</main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
          <AdsterraResponsiveBanner />
        </div>
        <Footer />
      </div>
    </CookieConsentProvider>
  );
}

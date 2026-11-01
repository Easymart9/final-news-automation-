'use client';

import React from 'react';
import { AdsterraBanner728x90 } from './AdsterraBanner728x90';
import { AdsterraBanner320x50 } from './AdsterraBanner320x50';
import { useAdvertisingConsent } from '@/components/CookieConsent';

interface ResponsiveBannerProps {
  className?: string;
}

export function AdsterraResponsiveBanner({ className = '' }: ResponsiveBannerProps) {
  const advertisingAllowed = useAdvertisingConsent();
  if (!advertisingAllowed) {
    return (
      <div className={`w-full py-2 text-center text-[10px] uppercase tracking-widest text-slate-400 ${className}`}>
        Advertising is disabled until you allow it in cookie settings.
      </div>
    );
  }
  return (
    <div className={`w-full flex justify-center items-center py-2 ${className}`}>
      {/* Desktop & Tablet Display (728x90) */}
      <div className="hidden md:flex justify-center w-full">
        <AdsterraBanner728x90 />
      </div>

      {/* Mobile Display (320x50) */}
      <div className="flex md:hidden justify-center w-full">
        <AdsterraBanner320x50 />
      </div>
    </div>
  );
}

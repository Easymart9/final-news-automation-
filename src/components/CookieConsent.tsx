'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface ConsentState {
  analytics: boolean;
  advertising: boolean;
}

interface ConsentContextValue {
  advertisingAllowed: boolean;
  consentReady: boolean;
}

const STORAGE_KEY = 'worldbulletin-cookie-consent-v1';
const ConsentContext = createContext<ConsentContextValue>({
  advertisingAllowed: false,
  consentReady: false
});

function enableAnalytics() {
  if (document.getElementById('worldbulletin-gtag')) return;
  const measurementIds = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_IDS || 'G-H9BK8MP506,G-NMM93CJ1ZQ')
    .split(',')
    .map(id => id.trim())
    .filter(id => /^G-[A-Z0-9]+$/i.test(id));
  if (measurementIds.length === 0) return;
  const script = document.createElement('script');
  script.id = 'worldbulletin-gtag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementIds[0])}`;
  document.head.appendChild(script);

  const configuration = document.createElement('script');
  configuration.id = 'worldbulletin-analytics-config';
  configuration.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    gtag('js', new Date());
    ${measurementIds.map(id => `gtag('config', '${id}');`).join('\n')}
  `;
  document.head.appendChild(configuration);
}

function enableAdvertising() {
  if (document.getElementById('worldbulletin-adsense')) return;
  const script = document.createElement('script');
  script.id = 'worldbulletin-adsense';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1941031216214407';
  document.head.appendChild(script);
}

function updateGoogleConsent(value: ConsentState) {
  const consentWindow = window as Window & {
    gtag?: (...args: unknown[]) => void;
  };
  consentWindow.gtag?.('consent', 'update', {
    analytics_storage: value.analytics ? 'granted' : 'denied',
    ad_storage: value.advertising ? 'granted' : 'denied',
    ad_user_data: value.advertising ? 'granted' : 'denied',
    ad_personalization: value.advertising ? 'granted' : 'denied'
  });
}

export function useAdvertisingConsent() {
  return useContext(ConsentContext).advertisingAllowed;
}

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="hover:text-slate-300"
      onClick={() => window.dispatchEvent(new Event('worldbulletin:open-cookie-settings'))}
    >
      Cookie settings
    </button>
  );
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ConsentState>;
        const value = { analytics: parsed.analytics === true, advertising: parsed.advertising === true };
        setConsent(value);
        setAnalytics(value.analytics);
        setAdvertising(value.advertising);
      } else {
        setSettingsOpen(true);
      }
    } catch {
      setSettingsOpen(true);
    }

    const openSettings = () => setSettingsOpen(true);
    window.addEventListener('worldbulletin:open-cookie-settings', openSettings);
    return () => window.removeEventListener('worldbulletin:open-cookie-settings', openSettings);
  }, []);

  useEffect(() => {
    if (consent?.analytics) enableAnalytics();
    if (consent?.advertising) enableAdvertising();
    if (consent) updateGoogleConsent(consent);
  }, [consent]);

  const saveConsent = useCallback((value: ConsentState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      updateGoogleConsent({ analytics: false, advertising: false });
      setConsent({ analytics: false, advertising: false });
      setSettingsOpen(false);
      return;
    }
    updateGoogleConsent(value);
    setConsent(value);
    setSettingsOpen(false);
  }, []);

  const contextValue = useMemo(() => ({
    advertisingAllowed: consent?.advertising === true,
    consentReady: consent !== null
  }), [consent]);

  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
      {settingsOpen && (
        <section
          aria-label="Cookie and privacy preferences"
          className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-slate-300 bg-white p-5 text-slate-900 shadow-2xl sm:inset-x-6"
        >
          <h2 className="text-base font-bold">Privacy preferences</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Necessary storage keeps the site working. Analytics and advertising are optional and remain disabled unless you choose them.
          </p>
          <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
              <input type="checkbox" checked disabled />
              <span>Necessary</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
              <input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} />
              <span>Analytics</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
              <input type="checkbox" checked={advertising} onChange={event => setAdvertising(event.target.checked)} />
              <span>Advertising</span>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => saveConsent({ analytics: false, advertising: false })}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold hover:bg-slate-50"
            >
              Reject optional
            </button>
            <button
              type="button"
              onClick={() => saveConsent({ analytics, advertising })}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
            >
              Save preferences
            </button>
            <button
              type="button"
              onClick={() => { setAnalytics(true); setAdvertising(true); saveConsent({ analytics: true, advertising: true }); }}
              className="rounded-lg bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800"
            >
              Accept all
            </button>
          </div>
        </section>
      )}
    </ConsentContext.Provider>
  );
}

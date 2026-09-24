import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, Scale, AlertCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | World Bulletin',
  description: 'World Bulletin terms of service, intellectual property guidelines, content syndication terms, and user disclaimers.',
  alternates: {
    canonical: 'https://worldbulletin.world/terms-of-service'
  }
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#fafafa] min-h-screen pb-20 font-sans text-slate-900">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-14 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-mono font-bold uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" />
            <span>User Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-headline">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Last Updated: August 30, 2026 | Governing access to worldbulletin.world
          </p>
        </div>
      </section>

      {/* Main Legal Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-headline text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using <strong>World Bulletin</strong> (<a href="https://worldbulletin.world" className="text-sky-700 font-semibold hover:underline">worldbulletin.world</a>), you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, you must discontinue use of the website immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-headline text-slate-900">2. Intellectual Property & Fair Use</h2>
            <p>
              All original journalistic synthesis, editorial structure, analytical commentary, and design assets published on World Bulletin are the property of World Bulletin Network. Primary research citations, paper titles, and corporate announcements are referenced under journalistic Fair Use with full attribution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-headline text-slate-900">3. Fact-Checking & Content Disclaimer</h2>
            <p>
              While World Bulletin applies automated and human-reviewed multi-source cross-verification protocols, technical articles are provided for informational and educational purposes only. Technical benchmark numbers and research outcomes should be independently verified before making enterprise or legal decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-headline text-slate-900">4. Third-Party Advertisements & External Links</h2>
            <p>
              Our website displays third-party advertisements via Google AdSense and contains links to external primary resources (such as arXiv, corporate press releases, and technical repositories). We do not control or endorse the content of third-party websites and are not responsible for their privacy practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold font-headline text-slate-900">5. Modifications to Terms</h2>
            <p>
              World Bulletin reserves the right to revise these Terms of Service at any time without prior notice. By continuing to browse our website after revisions are published, you agree to be bound by the updated terms.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900">Contact Regarding Terms</h3>
            <p className="text-xs text-slate-500">
              For questions regarding our terms, reach us at <a href="mailto:legal@worldbulletin.world" className="text-sky-700 font-semibold hover:underline">legal@worldbulletin.world</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

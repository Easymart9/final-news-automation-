import React from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, MapPin, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import { AdsterraResponsiveBanner } from '@/components/ads';

export const metadata: Metadata = {
  title: 'Contact Us | World Bulletin Editorial Desk',
  description: 'Get in touch with the World Bulletin editorial team for press releases, technical corrections, research preprints, and partnership inquiries.',
  alternates: {
    canonical: 'https://worldbulletin.world/contact'
  }
};

export default function ContactPage() {
  return (
    <div className="bg-[#fafafa] min-h-screen pb-20 font-sans text-slate-900">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-14 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-mono font-bold uppercase tracking-widest">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Communications & Corrections</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-headline">
            Contact Editorial Desk
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Direct channels for research submissions, factual corrections, technical inquiries, and journalistic inquiries.
          </p>
        </div>
      </section>

      {/* Top Header Leaderboard Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdsterraResponsiveBanner />
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Direct Contacts */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <h2 className="text-lg font-bold font-headline text-slate-900 border-b border-slate-100 pb-3">
                Editorial Channels
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-heading">Editorial Inquiries & News Tips:</strong>
                    <a href="mailto:editorial@worldbulletin.world" className="text-sky-700 hover:underline font-mono">
                      editorial@worldbulletin.world
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-heading">Corrections & Fact Check Audits:</strong>
                    <a href="mailto:corrections@worldbulletin.world" className="text-purple-700 hover:underline font-mono">
                      corrections@worldbulletin.world
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-heading">Response Window:</strong>
                    <span className="text-slate-600">Standard inquiries acknowledged within 24–48 business hours.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Standard Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-md">
              <h3 className="text-base font-bold font-headline flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Editorial Commitment</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If you believe an article contains factual inaccuracies, submit the primary source URL along with the claim in question to our corrections desk.
              </p>
              <Link href="/editorial-standards" className="inline-block text-xs font-bold text-sky-400 hover:text-sky-300 underline">
                Read our full Editorial Code →
              </Link>
            </div>
          </div>

          {/* Right Column: Submission Form */}
          <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-bold font-headline text-slate-900 border-b border-slate-100 pb-3">
              Send a Direct Message / Research Preprint
            </h2>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertTriangle, Cpu, FileText, ArrowLeft, BookOpen, Award, ExternalLink, Lock } from 'lucide-react';

export const metadata = {
  title: 'Editorial Standards & Fact Verification Policy | World Bulletin',
  description: 'Our journalistic code of ethics, multi-source claim verification standards, and automated fact-checking protocols.',
};

export default function EditorialStandardsPage() {
  return (
    <div className="bg-[#fafafa] min-h-screen pb-24 font-sans text-slate-900">
      {/* Top Header Banner */}
      <section className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-sky-700 font-extrabold hover:underline font-heading">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Edition</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Journalistic Verification Code & Policy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-headline leading-tight">
            Editorial Standards & Fact-Checking Protocols
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-sans">
            World Bulletin operates under a strict, multi-source verification protocol. Every story published across our desks is verified against peer-reviewed preprints, official lab announcements, and technical repositories before release.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-10">
        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-xs glow-card-subtle">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              1. Multi-Source Peer Verification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Every factual assertion must be confirmed by at least two independent primary sources (e.g., ArXiv preprints, MIT CSAIL, IEEE proceedings, or official corporate disclosures) prior to automated publication.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-xs glow-card-subtle">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              2. 80% Minimum Confidence Threshold
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Articles scoring below an 80% confidence index during multi-agent claim evaluation are automatically diverted to our <strong className="text-slate-800">Admin Review Queue</strong> for manual editor inspection.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-xs glow-card-subtle">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              3. Zero Synthetic Hallucination Guarantee
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              We employ real-time claim cross-referencing to eliminate hallucinated benchmark scores, fictitious model names, or unverified claims in published articles.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-3 shadow-xs glow-card-subtle">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              4. Google News & Schema Compliance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              All stories are formatted with structured JSON-LD <code className="text-purple-700 bg-purple-50 px-1 py-0.5 rounded font-mono">NewsArticle</code> metadata, HD featured images (1200px+), and real author attributions.
            </p>
          </div>
        </div>

        {/* Detailed Ethics Guidelines */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Award className="w-6 h-6 text-sky-700" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                Editorial Independence & Correction Policy
              </h2>
              <p className="text-xs text-slate-500">Guidelines governing corrections, retractions, and update tracking</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
            <div>
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] font-heading mb-1">
                A. Transparency & Attribution
              </h4>
              <p className="text-slate-600">
                All articles clearly attribute claims to original research papers, code repositories, or press releases. Hyperlinks directly point to primary sources to allow readers to verify raw benchmarks independently.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] font-heading mb-1">
                B. Corrections & Timestamp Auditing
              </h4>
              <p className="text-slate-600">
                If a paper is revised or a lab updates benchmark metrics, our automated pipeline updates the article database record, updates the <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">updatedAt</code> timestamp, and logs the change in system audit files.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] font-heading mb-1">
                C. Copyright & Asset Integrity
              </h4>
              <p className="text-slate-600">
                Featured article images are sourced exclusively from licensed royalty-free photography providers (Unsplash/Pexels) or official open-access laboratory press kits.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Box */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md font-sans">
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold font-heading text-white">Have a paper or dataset to submit for verification?</h4>
            <p className="text-xs text-slate-400">Our automated research engine continuously monitors ArXiv, MIT CSAIL, and GitHub releases.</p>
          </div>

          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs font-heading shrink-0 shadow-sm transition-colors"
          >
            Access Admin Console
          </Link>
        </div>
      </section>
    </div>
  );
}

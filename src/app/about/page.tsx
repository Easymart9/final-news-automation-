import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Target, Award, Users, BookOpen, CheckCircle, Scale } from 'lucide-react';
import { AdsterraResponsiveBanner, AdsterraNativeBanner } from '@/components/ads';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | World Bulletin Technical Journalism',
  description: 'Learn about World Bulletin (worldbulletin.world), our editorial mission, fact-checking methodology, and standards for artificial intelligence reporting.',
  alternates: {
    canonical: 'https://worldbulletin.world/about'
  }
};

export default function AboutPage() {
  return (
    <div className="bg-[#fafafa] min-h-screen pb-20 font-sans text-slate-900">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-16 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-mono font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Independent Editorial Mission</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-headline tracking-tight">
            About World Bulletin
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Delivering objective, fact-verified technical journalism covering foundation models, autonomous agents, neural architectures, and AI governance.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Mission Statement */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <h2 className="text-2xl font-bold font-headline text-slate-900 flex items-center gap-3">
            <Target className="w-6 h-6 text-sky-600" />
            <span>Our Core Purpose & Philosophy</span>
          </h2>
          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4">
            <p>
              Founded in 2026, <strong>World Bulletin</strong> (<a href="https://worldbulletin.world" className="text-sky-700 font-semibold hover:underline">worldbulletin.world</a>) was established to address the rapid rise of unverified speculation and AI-generated hype in mainstream technology media.
            </p>
            <p>
              Our editorial desk synthesizes peer-reviewed research papers (arXiv, Nature Machine Intelligence), open-source repository releases, lab announcements, and international regulatory frameworks into authoritative, fact-checked briefings.
            </p>
          </div>
        </div>

        {/* 3 Pillars of Editorial Integrity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">Multi-Source Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every factual claim is cross-referenced against primary research documentation, code repositories, or official corporate dispatches prior to publication.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">Zero Speculation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We do not invent statistics, benchmarks, or synthetic quotes. If technical metrics are unverified, our desk explicitly flags them in the report registry.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-heading text-slate-900">Author Accountability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our reporting staff and domain analysts maintain complete transparency regarding research backgrounds, methodologies, and editorial corrections.
            </p>
          </div>
        </div>

        {/* Technical Desks Coverage */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <h2 className="text-2xl font-bold font-headline text-slate-900 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-sky-600" />
            <span>Dedicated Technical Desks</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            World Bulletin operates five primary news desks, each dedicated to monitoring specific dimensions of the machine intelligence landscape:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <Link href="/topics/llm-foundation-models" className="font-bold text-sm text-slate-900 hover:text-sky-700">
                Foundation Models & LLMs →
              </Link>
              <p className="text-xs text-slate-500">Transformer architectures, reasoning models, quantization, and multimodal token streams.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <Link href="/topics/autonomous-ai-agents" className="font-bold text-sm text-slate-900 hover:text-sky-700">
                Autonomous AI Agents →
              </Link>
              <p className="text-xs text-slate-500">Multi-agent frameworks, tool orchestration, reinforcement learning, and autonomous task completion.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <Link href="/topics/ai-chips-infrastructure" className="font-bold text-sm text-slate-900 hover:text-sky-700">
                AI Chips & Infrastructure →
              </Link>
              <p className="text-xs text-slate-500">GPU accelerators, TPU clusters, custom ASICs, optical interconnects, and datacenter thermal engineering.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <Link href="/topics/ai-safety-governance" className="font-bold text-sm text-slate-900 hover:text-sky-700">
                AI Safety & Governance →
              </Link>
              <p className="text-xs text-slate-500">Global regulatory treaties, provenance watermarking, alignment guarantees, and catastrophic risk mitigation.</p>
            </div>
          </div>
        </div>

        {/* Mid-Page Responsive Ad Banner */}
        <AdsterraResponsiveBanner />

        {/* Native Banner Advertisement */}
        <AdsterraNativeBanner label="Sponsored Research & Insights" />

        {/* Contact & Editorial Inquiries */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold font-headline">Have a Research Tip or Correction?</h3>
            <p className="text-xs text-slate-400 max-w-md">
              We welcome submissions of preprints, technical benchmarks, and editorial feedback from researchers worldwide.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all font-heading"
            >
              Contact Editorial Desk
            </Link>
            <Link
              href="/editorial-standards"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all font-heading"
            >
              Editorial Code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

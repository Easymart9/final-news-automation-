import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs font-sans mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Masthead Col */}
          <div className="space-y-3 md:col-span-2">
            <h3 className="font-headline text-xl font-black text-white uppercase tracking-tight">
              World Bulletin
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              An independent technical news platform providing peer-verified reporting on artificial intelligence research, foundation models, silicon hardware, and global safety standards.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-mono font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Source Fact Verification Active</span>
            </div>
          </div>

          {/* Navigation Desks */}
          <div className="space-y-2.5">
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">Coverage Desks</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/topics/llm-foundation-models" className="hover:text-white transition-colors">Foundation Models & LLMs</Link></li>
              <li><Link href="/topics/autonomous-ai-agents" className="hover:text-white transition-colors">Autonomous AI Tools</Link></li>
              <li><Link href="/topics/ai-chips-infrastructure" className="hover:text-white transition-colors">Silicon & Hardware</Link></li>
              <li><Link href="/topics/ai-safety-governance" className="hover:text-white transition-colors">Safety & Policy</Link></li>
              <li><Link href="/topics/computer-vision-robotics" className="hover:text-white transition-colors">Vision & Robotics</Link></li>
            </ul>
          </div>

          {/* Editorial & Verification */}
          <div className="space-y-2.5">
            <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">Transparency & Trust</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About World Bulletin</Link></li>
              <li><Link href="/editorial-standards" className="hover:text-white transition-colors">Editorial Standards & Policy</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy & Cookies</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact & Corrections</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} World Bulletin Network. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <Link href="/about" className="hover:text-slate-300">About Us</Link>
            <span className="text-slate-700">•</span>
            <Link href="/privacy-policy" className="hover:text-slate-300">Privacy Policy</Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms-of-service" className="hover:text-slate-300">Terms</Link>
            <span className="text-slate-700">•</span>
            <Link href="/contact" className="hover:text-slate-300">Contact</Link>
            <span className="text-slate-700">•</span>
            <a
              href="https://easypropdf.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 transition-colors font-medium"
            >
              EasyProPDF
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Zap, FileText, ShieldCheck, ListOrdered, ArrowLeft, Activity, LogOut, CheckCircle2, Lock, KeyRound } from 'lucide-react';

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Automation Pipeline', href: '/admin/automation', icon: Zap, highlight: true },
    { name: 'Article Review Queue', href: '/admin/articles', icon: FileText },
    { name: 'Fact-Check Logs', href: '/admin/verification-logs', icon: ShieldCheck },
    { name: 'System Logs & Retries', href: '/admin/logs', icon: ListOrdered },
    { name: 'Security & Password', href: '/admin/security', icon: KeyRound },
  ];

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 p-5 min-h-screen flex flex-col justify-between shrink-0 font-sans shadow-xl border-r border-slate-800">
      <div className="space-y-6">
        {/* Brand & Auth Badge */}
        <div className="flex items-center gap-3 px-2 border-b border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-600/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white block leading-tight font-heading">ADMIN PANEL</span>
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3 text-sky-400" /> Password Protected
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : link.highlight
                    ? 'bg-sky-950/60 text-sky-300 border border-sky-800/50 hover:bg-sky-900/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : link.highlight ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Telemetry & Logout */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1 font-mono">
          <div className="flex items-center justify-between font-semibold">
            <span>Groq LLM Engine:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
            </span>
          </div>
          <p className="text-[10px] text-slate-400">3x Daily Scheduled Cron</p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors bg-rose-950/60 hover:bg-rose-900 px-2.5 py-1 rounded-lg border border-rose-800/60 font-bold"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

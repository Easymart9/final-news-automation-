import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, FileSearch } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function VerificationLogsPage() {
  if (!isAuthenticated()) {
    redirect('/admin/login');
  }

  const logs = db.getVerificationLogs();

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1 font-heading">
          <FileSearch className="w-4 h-4 text-sky-600" />
          <span>Multi-Source Claim Audit Trail</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Fact-Verification Audit & Hallucination Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed log of every factual claim evaluated across academic databases, lab announcements, and multi-source RSS feeds.
        </p>
      </div>

      {/* Log Entries List */}
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs hover:border-sky-200 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  log.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-slate-900 font-heading">Trust Index Score: {log.score}%</span>
                  <span className="text-[11px] text-slate-500 font-mono block">Logged at: {new Date(log.checkedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200 font-bold">
                  Sources Checked: {log.matchingSources}/{log.sourcesChecked}
                </span>
                <span className={`px-3 py-1 rounded-xl border font-bold ${
                  log.hallucinationRisk === 'LOW' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  Hallucination Risk: {log.hallucinationRisk}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-1">
              <span className="text-slate-500 font-extrabold uppercase tracking-wider block font-heading text-[10px]">Evaluated Claim:</span>
              <p className="text-slate-800 font-sans leading-relaxed text-xs">{log.claim}</p>
            </div>

            <p className="text-xs text-slate-500 italic font-sans flex items-center gap-1.5">
              <span>Audit Note:</span>
              <span className="text-slate-700 font-normal">{log.notes}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


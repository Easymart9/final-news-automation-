import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { Activity, CheckCircle2, Clock, ListOrdered } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AutomationLogsPage() {
  if (!isAuthenticated()) {
    redirect('/admin/login');
  }

  const logs = db.getAutomationLogs();

  return (
    <div className="space-y-6 text-slate-900 font-sans max-w-5xl">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1 font-heading">
          <ListOrdered className="w-4 h-4 text-sky-600" />
          <span>System Pipeline History</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Automation Execution & Retry Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete audit trail for RSS research scans, Groq model completions, and sitemap generation cycles.
        </p>
      </div>

      {/* Execution Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center text-xs text-slate-500 font-mono">
          <span className="font-extrabold text-slate-900 uppercase tracking-wider font-heading">Execution Records ({logs.length})</span>
          <span className="text-emerald-700 font-bold">Zero Paid API Costs</span>
        </div>

        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-heading">
                  <span className="font-extrabold text-slate-900">{log.taskName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-mono flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-sans">{log.details}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
                  {log.durationMs}ms
                </span>
                <span className={`px-3 py-1 rounded-xl font-bold ${
                  log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


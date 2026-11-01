import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { ShieldCheck, Zap, FileText, Activity, CheckCircle2, AlertTriangle, Eye, ArrowRight, Server, RefreshCw, Cpu, ExternalLink } from 'lucide-react';
import { getAIProviderStatus } from '@/lib/services/ai-providers';
import { NEWS_FEEDS } from '@/lib/services/news-researcher';
import { getSearchPerformanceReport } from '@/lib/services/search-console';

export const dynamic = 'force-dynamic';

function getNextMorningEdition(now: Date): string {
  const indiaOffsetMs = 330 * 60 * 1000;
  const indiaNow = new Date(now.getTime() + indiaOffsetMs);
  let nextEditionUtc = Date.UTC(
    indiaNow.getUTCFullYear(),
    indiaNow.getUTCMonth(),
    indiaNow.getUTCDate(),
    9
  ) - indiaOffsetMs;
  if (nextEditionUtc <= now.getTime()) nextEditionUtc += 24 * 60 * 60 * 1000;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(nextEditionUtc));
}

export default async function AdminDashboardPage() {
  if (!await isAuthenticated()) {
    redirect('/admin/login');
  }

  const articles = db.getArticles();
  const verificationLogs = db.getVerificationLogs();
  const automationLogs = db.getAutomationLogs();
  const providerStatuses = getAIProviderStatus();
  const searchPerformance = await getSearchPerformanceReport();
  const topicStats = db.getTopics().filter(topic => [
    'llm-foundation-models',
    'autonomous-ai-agents',
    'ai-chips-infrastructure',
    'ai-safety-governance',
    'computer-vision-robotics',
    'ai-research-science',
    'ai-applications-industry',
    'ai-business-enterprise',
    'ai-healthcare',
    'ai-education'
  ].includes(topic.slug));
  const feedFailures = automationLogs.filter(log => log.taskName === 'RSS Feed Request').slice(0, 5);
  const failedJobs = automationLogs.filter(log => log.status === 'FAILED').slice(0, 5);
  const now = new Date();
  const nowTime = now.getTime();
  const todayInIndia = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
  const articlesToday = articles.filter(article =>
    article.verificationStatus === 'VERIFIED' &&
    Date.parse(article.publishedAt) <= nowTime &&
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(article.publishedAt)) === todayInIndia
  ).length;
  
  // Real dynamic calculation from DB
  const totalArticles = articles.length;
  const verifiedArticles = articles.filter(a => a.verificationStatus === 'VERIFIED').length;
  const needsReviewArticles = articles.filter(a => a.verificationStatus === 'NEEDS_REVIEW').length;
  const avgTrustScore = totalArticles > 0
    ? Math.round(articles.reduce((sum, a) => sum + (a.trustScore || 0), 0) / totalArticles)
    : 0;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  return (
    <div className="space-y-8 text-slate-900 font-sans">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1 font-heading">
            <Server className="w-4 h-4 text-sky-600" />
            <span>Automated Journalism Operations Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            System Control & Automation Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pipeline telemetry, fact-checking confidence logs, and database metrics stored in <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono border border-slate-200">data/db.json</code>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/automation"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md shadow-sky-700/20 transition-all font-heading"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Run Pipeline</span>
          </Link>
        </div>
      </div>

      {/* 4 Premium Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Published Stories */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-heading">Total Published</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 font-heading">{totalArticles}</p>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {verifiedArticles} Verified Stories
            </p>
          </div>
        </div>

        {/* Avg Trust Score */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-heading">Avg Trust Score</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-emerald-600 font-heading">{avgTrustScore}%</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${avgTrustScore}%` }}></div>
            </div>
          </div>
        </div>

        {/* Held in Review */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-heading">Held in Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-amber-600 font-heading">{needsReviewArticles}</p>
            <p className="text-xs text-slate-500 mt-1">Below 80% confidence threshold</p>
          </div>
        </div>

        {/* Total Reads */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-heading">Organic Reads</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-purple-700 font-heading">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Google Discover & News ready</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Articles Table & Automation Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Real Stored Articles Manager (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Stored Database Articles ({articles.length})
              </h3>
              <p className="text-xs text-slate-500">Live records from JSON database</p>
            </div>
            <Link 
              href="/admin/articles" 
              className="text-xs text-sky-700 hover:text-sky-800 font-extrabold flex items-center gap-1 font-heading"
            >
              <span>Manage Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {articles.slice(0, 5).map((art) => (
              <div 
                key={art.id} 
                className="p-4 rounded-xl border border-slate-200 hover:border-sky-200 bg-slate-50 hover:bg-sky-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-sky-700 uppercase tracking-widest font-heading bg-sky-100 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">• {new Date(art.publishedAt).toLocaleDateString()}</span>
                  </div>

                  <Link 
                    href={`/news/${art.slug}`} 
                    target="_blank" 
                    className="font-bold text-sm text-slate-900 hover:text-sky-700 line-clamp-1 font-heading flex items-center gap-1.5"
                  >
                    <span>{art.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  </Link>

                  <p className="text-xs text-slate-500 font-medium">By {art.author.name}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    art.verificationStatus === 'VERIFIED' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {art.trustScore}% Score
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Automation Logs & System Health (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Engine Status Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-heading border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-700" />
              <span>AI Engine Telemetry</span>
            </h4>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600 font-medium">Groq API key:</span>
                <span className="font-bold text-slate-700">{process.env.GROQ_API_KEY ? 'Configured; health not checked' : 'Not configured'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600 font-medium">Fact Verifier:</span>
                <span className="font-bold text-sky-700">Automated source-page check</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-600 font-medium">Database Atomic Sync:</span>
                <span className="font-bold text-emerald-600">Enabled</span>
              </div>
            </div>

            <Link
              href="/admin/automation"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors font-heading"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Trigger New Research Run</span>
            </Link>
          </div>

          {/* System Execution Logs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Execution Logs</span>
              </h4>
              <Link href="/admin/logs" className="text-xs text-sky-700 hover:underline font-bold">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {automationLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-heading">
                    <span className="font-bold text-slate-900">{log.taskName}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                      {log.durationMs}ms
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] line-clamp-1">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6" aria-label="Automation health and category statistics">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 font-heading">AI Provider Health</h2>
                <span className="text-xs text-slate-500">{providerStatuses.filter(provider => provider.configured).length}/{providerStatuses.length} enabled</span>
              </div>
              <div className="space-y-2">
                {providerStatuses.map(provider => (
                  <div key={provider.name} className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold capitalize text-slate-700">{provider.name}</span>
                    <span className={provider.configured ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                      {provider.configured ? 'Configured; connection not tested' : provider.status.replaceAll('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 font-heading">Publishing & RSS</h2>
                <span className="text-xs text-slate-500">{NEWS_FEEDS.length} configured feeds</span>
              </div>
              <p className="text-xs text-slate-600">
                Verified articles published today: <strong>{articlesToday}</strong> / 35 target
              </p>
              <p className="text-xs text-slate-600">
                Next scheduled edition:                 <strong>{getNextMorningEdition(now)} IST</strong>
              </p>
              <p className="text-xs text-slate-600">
                RSS health reflects run logs, not live feed probes: <strong>{feedFailures.length} recent failure records</strong>
              </p>
              {failedJobs.length > 0 && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <h3 className="text-xs font-bold text-rose-700">Recent failed jobs</h3>
                  {failedJobs.map(log => (
                    <p key={log.id} className="text-xs text-slate-600">{log.taskName}: {log.details}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 font-heading">AI Category Statistics</h2>
                <span className="text-xs text-slate-500">{topicStats.length} categories</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {topicStats.map(topic => (
                  <div key={topic.slug} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-700">{topic.name}</span>
                    <span className="font-bold text-slate-900">{topic.articleCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs" aria-label="Google Search Console performance">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 font-heading">Google Search Performance</h2>
                {searchPerformance.status === 'ready' && (
                  <p className="mt-1 text-xs text-slate-500">{searchPerformance.message}</p>
                )}
              </div>
              {searchPerformance.status === 'ready' && (
                <span className="text-xs text-slate-500">
                  {searchPerformance.startDate} – {searchPerformance.endDate} · Search Console final data
                </span>
              )}
            </div>

            {searchPerformance.status === 'ready' ? (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ['Clicks', (searchPerformance.clicks || 0).toLocaleString()],
                    ['Impressions', (searchPerformance.impressions || 0).toLocaleString()],
                    ['Average CTR', `${((searchPerformance.ctr || 0) * 100).toFixed(2)}%`],
                    ['Average position', (searchPerformance.averagePosition || 0).toFixed(1)]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
                      <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-700">Top search queries</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-slate-500">
                          <tr><th className="pb-2 pr-3">Query</th><th className="pb-2 pr-3">Impressions</th><th className="pb-2 pr-3">Clicks</th><th className="pb-2">Position</th></tr>
                        </thead>
                        <tbody>
                          {(searchPerformance.topQueries || []).map((row, index) => (
                            <tr key={`${row.query}-${index}`} className="border-t border-slate-100">
                              <td className="max-w-72 truncate py-2 pr-3 text-slate-800">{row.query}</td>
                              <td className="py-2 pr-3 text-slate-600">{row.impressions.toLocaleString()}</td>
                              <td className="py-2 pr-3 text-slate-600">{row.clicks.toLocaleString()}</td>
                              <td className="py-2 text-slate-600">{row.position.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-700">Search optimization opportunities</h3>
                    {(searchPerformance.opportunities || []).length > 0 ? (
                      <div className="space-y-3">
                        {searchPerformance.opportunities?.map((row, index) => (
                          <div key={`${row.query}-${row.page}-${index}`} className="rounded-lg border border-slate-100 p-3 text-xs">
                            <p className="font-bold text-slate-900">{row.query}</p>
                            <p className="mt-1 truncate text-slate-500">{row.page}</p>
                            <p className="mt-1 text-slate-600">
                              {row.impressions.toLocaleString()} impressions · {(row.ctr * 100).toFixed(2)}% CTR · position {row.position.toFixed(1)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No query/page rows with at least 20 impressions and positions 3–20 in this period.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">
                {searchPerformance.message}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

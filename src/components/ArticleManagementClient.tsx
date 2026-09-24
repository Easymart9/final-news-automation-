'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, ExternalLink, Edit3, Trash2, Globe, Check, X, Search, Info } from 'lucide-react';
import { Article } from '@/types';

interface ArticleManagementClientProps {
  initialArticles: Article[];
}

export default function ArticleManagementClient({ initialArticles }: ArticleManagementClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [viewSourcesArticle, setViewSourcesArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const verifiedCount = articles.filter(a => a.verificationStatus === 'VERIFIED').length;
  const reviewCount = articles.filter(a => a.verificationStatus === 'NEEDS_REVIEW').length;

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete this article?\n"${title}"`)) return;

    try {
      const res = await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setArticles(prev => prev.filter(a => a.id !== id));
        setStatusMessage({ type: 'success', text: 'Article deleted successfully.' });
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to delete.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'An error occurred during deletion.' });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingArticle)
      });
      const data = await res.json();
      if (data.success) {
        setArticles(prev => prev.map(a => a.id === editingArticle.id ? data.article : a));
        setEditingArticle(null);
        setStatusMessage({ type: 'success', text: 'Article updated successfully.' });
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to update.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to update article.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1 font-heading">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Content Publishing & Verification Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Article Management & Queue Controls
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View live articles, edit content and SEO metadata, inspect real sources, or delete stories.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 font-mono">
            {verifiedCount} Verified
          </div>
          {reviewCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 font-mono">
              {reviewCount} In Review
            </div>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
      )}

      {/* Search and Filter bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title, category, author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Showing <strong className="text-slate-800">{filteredArticles.length}</strong> of {articles.length} stories
        </div>
      </div>

      {/* Main Articles Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {filteredArticles.map((art) => (
            <div key={art.id} className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-sky-50 text-sky-700 font-extrabold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded border border-sky-200 font-heading">
                    {art.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium text-[11px]">Authored by <strong className="text-slate-700">{art.author.name}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 font-mono text-[11px]">{new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 font-heading hover:text-sky-700 transition-colors">
                  <Link href={`/news/${art.slug}`} target="_blank">
                    {art.title}
                  </Link>
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">{art.summary}</p>
              </div>

              {/* Action Controls: View | Edit | SEO | Sources | Delete */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono ${
                  art.verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{art.trustScore}%</span>
                </span>

                <Link
                  href={`/news/${art.slug}`}
                  target="_blank"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 transition-all text-xs font-bold flex items-center gap-1"
                  title="View Live"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>

                <button
                  onClick={() => setEditingArticle(art)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 transition-all text-xs font-bold flex items-center gap-1"
                  title="Edit Content & SEO"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit / SEO</span>
                </button>

                <button
                  onClick={() => setViewSourcesArticle(art)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-all text-xs font-bold flex items-center gap-1"
                  title="Inspect Primary Sources"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Sources</span>
                </button>

                <button
                  onClick={() => handleDelete(art.id, art.title)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all text-xs font-bold flex items-center gap-1"
                  title="Delete Story"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / SEO Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-700" />
                <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                  Edit Article & SEO Settings
                </h3>
              </div>
              <button onClick={() => setEditingArticle(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Headline Title</label>
                <input
                  type="text"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category / Desk</label>
                  <input
                    type="text"
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SEO Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={editingArticle.keywords?.join(', ')}
                    onChange={(e) => setEditingArticle({ ...editingArticle, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SEO Meta Description</label>
                <textarea
                  rows={2}
                  value={editingArticle.metaDescription}
                  onChange={(e) => setEditingArticle({ ...editingArticle, metaDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Executive Summary</label>
                <textarea
                  rows={2}
                  value={editingArticle.summary}
                  onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Article HTML Content Body</label>
                <textarea
                  rows={6}
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-900 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold transition-all shadow-md shadow-sky-700/20 flex items-center gap-1.5"
                >
                  {isSaving ? 'Saving...' : 'Save & Publish Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Sources Modal */}
      {viewSourcesArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Verified Primary Sources
                </h3>
              </div>
              <button onClick={() => setViewSourcesArticle(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-bold">
                Story: <span className="font-normal text-slate-900">{viewSourcesArticle.title}</span>
              </p>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {viewSourcesArticle.sources?.map((src, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800">{src.sourceName}</strong>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                        {src.verified ? 'Verified URL' : 'Pending'}
                      </span>
                    </div>
                    <a
                      href={src.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 hover:underline break-all block text-[11px] font-mono"
                    >
                      {src.sourceUrl}
                    </a>
                    {src.claim && <p className="text-slate-500 italic text-[11px]">Claim: "{src.claim}"</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewSourcesArticle(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

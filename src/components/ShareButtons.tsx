'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Twitter, Linkedin, Facebook } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
  slug?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url, slug }) => {
  const [copied, setCopied] = useState(false);

  const getArticleUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') {
      if (slug) return `${window.location.origin}/news/${slug}`;
      return window.location.href;
    }
    return '';
  };

  const handleCopyLink = async () => {
    const articleUrl = getArticleUrl();
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    const articleUrl = getArticleUrl();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this verified AI report: ${title}`,
          url: articleUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareTwitter = () => {
    const articleUrl = getArticleUrl();
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(articleUrl)}&via=WorldwideAINews`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const articleUrl = getArticleUrl();
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Primary Native / Trigger Share Button */}
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 text-xs font-bold font-heading transition-all shadow-2xs"
        title="Share Story"
      >
        <Share2 className="w-3.5 h-3.5 text-sky-700" />
        <span>Share</span>
      </button>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
          copied 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
        }`}
        title="Copy Link to Clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* Social Icons */}
      <button
        onClick={handleShareTwitter}
        className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-sky-600 transition-colors"
        title="Share on X / Twitter"
      >
        <Twitter className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={handleShareLinkedIn}
        className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-sky-700 transition-colors"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

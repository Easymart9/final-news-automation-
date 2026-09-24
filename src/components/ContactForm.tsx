'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="text-base font-bold font-headline text-slate-900">Inquiry Received</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Thank you for reaching out. Your communication has been securely dispatched to the World Bulletin editorial desk. We will review and follow up within 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4 text-xs font-sans" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">Full Name</label>
          <input
            type="text"
            required
            placeholder="Dr. Jane Doe"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700 block">Email Address</label>
          <input
            type="email"
            required
            placeholder="jane@institution.org"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="font-bold text-slate-700 block">Subject / Department</label>
        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium">
          <option>General Editorial Feedback</option>
          <option>Factual Correction Submission</option>
          <option>Research Preprint / Lab Announcement</option>
          <option>Syndication & Licensing Inquiry</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="font-bold text-slate-700 block">Message Details</label>
        <textarea
          rows={5}
          required
          placeholder="Include context, preprint links, or specific article URLs..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-medium"
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md shadow-sky-700/20 transition-all font-heading"
      >
        Submit Inquiry to Editors
      </button>
    </form>
  );
}

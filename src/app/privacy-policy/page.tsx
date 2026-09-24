import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, Cookie, Bell } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | World Bulletin',
  description: 'World Bulletin privacy policy, data practices, Google AdSense cookies disclosure, and CCPA/GDPR compliance.',
  alternates: {
    canonical: 'https://worldbulletin.world/privacy-policy'
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#fafafa] min-h-screen pb-20 font-sans text-slate-900">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-14 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-mono font-bold uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" />
            <span>Legal & Privacy Disclosures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-headline">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Last Updated: August 30, 2026 | Effective for all visitors of worldbulletin.world
          </p>
        </div>
      </section>

      {/* Main Legal Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
          {/* Overview */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-headline text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              <span>1. Introduction & Scope</span>
            </h2>
            <p>
              World Bulletin (accessible from <strong>https://worldbulletin.world</strong>) is committed to safeguarding the privacy of our readers. This Privacy Policy outlines the types of information we collect, how it is processed, and your rights regarding personal data.
            </p>
          </section>

          {/* Google AdSense & Third-Party Advertising Policy */}
          <section className="space-y-3 p-6 rounded-2xl bg-sky-50/50 border border-sky-100">
            <h2 className="text-xl font-bold font-headline text-slate-900 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-sky-700" />
              <span>2. Google AdSense & DoubleClick DART Cookies</span>
            </h2>
            <p>
              Google is a third-party vendor on our website. It uses cookies, specifically DART cookies, to serve ads to our site visitors based on their visit to worldbulletin.world and other websites on the internet.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.
              </li>
              <li>
                Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-sky-700 font-semibold underline">Google Ads Settings</a>.
              </li>
            </ul>
          </section>

          {/* Log Files */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-headline text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-700" />
              <span>3. Log Files & Analytics</span>
            </h2>
            <p>
              Like many other websites, World Bulletin makes use of standard log files and Google Analytics 4 (GA4). The information inside the log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks. This data is used solely to analyze trends, administer the site, track user movement, and gather demographic information to improve content quality.
            </p>
          </section>

          {/* GDPR & CCPA Compliance */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-headline text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-slate-700" />
              <span>4. CCPA & GDPR Data Protection Rights</span>
            </h2>
            <p>
              Under the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), every user is entitled to the following:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification:</strong> You have the right to request that we correct inaccurate information.</li>
              <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data under certain conditions.</li>
              <li><strong>The right to restrict processing:</strong> You have the right to object to our processing of your personal data.</li>
            </ul>
          </section>

          {/* Children's Information */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold font-headline text-slate-900">
              5. Children's Online Privacy Protection
            </h2>
            <p>
              World Bulletin does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe that your child has provided this kind of information on our website, we strongly encourage you to contact us immediately, and we will promptly remove such records from our databases.
            </p>
          </section>

          {/* Contact Details */}
          <section className="pt-6 border-t border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900">Questions & Inquiries</h3>
            <p className="text-xs text-slate-500">
              If you have any questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:editorial@worldbulletin.world" className="text-sky-700 font-semibold hover:underline">editorial@worldbulletin.world</a> or via our <Link href="/contact" className="text-sky-700 font-semibold hover:underline">Contact Page</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

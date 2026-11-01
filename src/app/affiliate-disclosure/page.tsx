import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | World Bulletin',
  description: 'World Bulletin policy for affiliate links, sponsorships, and editorial independence.',
  alternates: {
    canonical: 'https://worldbulletin.world/affiliate-disclosure'
  }
};

export default function AffiliateDisclosurePage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-12 text-slate-800 sm:px-6 lg:px-8">
      <h1 className="font-headline text-3xl font-black text-slate-900">Affiliate & Sponsorship Disclosure</h1>
      <p className="text-sm leading-7">
        World Bulletin does not currently identify any affiliate links or paid affiliate partnerships on this site.
        If affiliate links are introduced, they will be clearly labeled near the link, and the publication may earn
        a commission when readers make a qualifying purchase.
      </p>
      <p className="text-sm leading-7">
        Paid or sponsored editorial content must be labeled as sponsored and identify the sponsoring organization.
        Sponsorship does not imply independent endorsement. Editorial coverage, source checks, and corrections remain
        separate from commercial arrangements.
      </p>
      <p className="text-sm leading-7">
        Contact the editorial desk through the <a className="font-semibold text-sky-800 underline" href="/contact">contact page</a>
        {' '}with questions about a commercial disclosure.
      </p>
    </main>
  );
}

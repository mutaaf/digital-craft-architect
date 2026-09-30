import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ShieldCheck, ArrowRight, Mail } from 'lucide-react';
import {
  HALLUCINATION_POSTURE,
  PER_DEMO_SAFEGUARDS,
  RECENT_HALLUCINATION_FIXES,
} from '@/data/hallucinationSafeguards';
import { TRUST_PAGE_LABELS } from '@/data/trustPageLabels';
import { useRecordTrustPageVisit } from '@/hooks/useRecordTrustPageVisit';

// Ticket 0102 - /hallucination-safeguards dated per-demo grounding and
// mitigation-log page. Mirrors `src/pages/AccessibilityStatement.tsx`
// (ticket 0097).
//
// Per the 2026-05-30 second-@type lesson the pre-write grep of every
// tests/e2e/*-jsonld.spec.ts confirmed CollectionPage + BreadcrumbList
// predicates are URL-scoped across the trust family; sibling scoped to
// /hallucination-safeguards cannot collide.
//
// Per the 2026-05-25 mirror-source rule META_DESCRIPTION reads
// HALLUCINATION_POSTURE.summary; the Helmet meta tag AND the CollectionPage
// description AND the visible intro paragraph all render from that one
// string. Per the 2026-05-07 em-dash Hard NO every rendered string uses
// hyphens. Per the 2026-05-25 SEO Pilot lesson /hallucination-safeguards is
// NOT in index.html's SEO Pilot table; the spec asserts Helmet-managed meta
// description directly, never toHaveTitle().

const META_DESCRIPTION = HALLUCINATION_POSTURE.summary;
const PAGE_H1 = 'Hallucination Safeguards';
const PAGE_URL = 'https://digitalcraftai.com/hallucination-safeguards';
const ORIGIN = 'https://digitalcraftai.com';
const COLLECTION_PAGE_NAME = 'Digital Craft AI Hallucination Safeguards';
const CONTACT_EMAIL = 'mutaaf@digitalcraftai.com';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
    { '@type': 'ListItem', position: 2, name: PAGE_H1, item: PAGE_URL },
  ],
};

const COLLECTION_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: COLLECTION_PAGE_NAME,
  description: META_DESCRIPTION,
  url: PAGE_URL,
  inLanguage: 'en-US',
  dateModified: HALLUCINATION_POSTURE.lastReviewed,
  isPartOf: { '@type': 'WebSite', name: 'DigitalCraft AI', url: ORIGIN },
};

const CHIP_CLASS =
  'inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors';

const HallucinationSafeguards: React.FC = () => {
  const { content } = useContent();
  useRecordTrustPageVisit({ path: '/hallucination-safeguards', label: TRUST_PAGE_LABELS['/hallucination-safeguards'] });
  const viewFiredRef = React.useRef<boolean>(false);
  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('hallucination_safeguards_view', 'page_mount');
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{`${PAGE_H1} | DigitalCraft AI`}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(COLLECTION_PAGE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <ShieldCheck size={16} aria-hidden="true" />
            AI mitigation posture
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">{PAGE_H1}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{META_DESCRIPTION}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span
              data-testid="hallucination-last-reviewed"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-200"
            >
              <ShieldCheck size={12} aria-hidden="true" className="text-primary" />
              {`Last reviewed: ${HALLUCINATION_POSTURE.lastReviewed}`}
            </span>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <article className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">What we mean by hallucination</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              A hallucination is any confidently-stated AI output that is not backed by the data the model was
              given. On this site that shows up as a made-up property comp, a paraphrased dollar amount, a chat
              claim about your business the profile scrape did not support, or a voice line the coaching prompt
              did not authorize. This page names, per demo, what constrains the output today, which failure
              modes remain open, and the dated safeguards the ship loop has landed.
            </p>
          </article>
        </div>
      </section>

      <section className="py-10 bg-white dark:bg-gray-950" data-testid="hallucination-demo-table">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Per-demo grounding, failure modes, and safeguards</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-700 dark:text-gray-200">
                  <th scope="col" className="px-4 py-3 font-semibold">Demo</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Grounding practice</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Known failure modes</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Dated safeguards</th>
                </tr>
              </thead>
              <tbody>
                {PER_DEMO_SAFEGUARDS.map((row) => (
                  <tr key={row.demoId} data-testid="hallucination-demo-row" className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 align-top">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                      <div className="font-semibold text-gray-900 dark:text-white">{row.demoName}</div>
                      <div data-testid="hallucination-demo-source" className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {row.sourcePaths.join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 leading-relaxed">{row.groundingPractice}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 leading-relaxed">{row.knownFailureModes}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 leading-relaxed">{row.safeguards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white dark:bg-gray-950" data-testid="hallucination-fixes-table">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Recent hallucination fixes</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Dated mitigations shipped in the last 90 days. Each row names the date the change landed on main,
            the demo it strengthens, and the shipped summary.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-700 dark:text-gray-200">
                  <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Demo</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Change summary</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_HALLUCINATION_FIXES.map((row, i) => (
                  <tr key={`${row.date}-${row.demoId}-${i}`} data-testid="hallucination-fix-row" className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                    <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.demoId}</td>
                    <td className="px-4 py-3 align-top text-gray-600 dark:text-gray-300 leading-relaxed">{row.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">How to report a wrong output</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Saw a demo confidently produce a wrong number, a fabricated address, or a chat claim the profile
            scrape did not support? Email the URL, the demo, and the exact string; we triage every report and
            the dated fix lands in the table above.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Hallucination%20report`}
            data-testid="hallucination-report-mailto"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary text-white rounded-lg font-medium transition-colors"
            onClick={() => trackCTAClick('hallucination_report_mailto', 'hallucination_safeguards')}
          >
            <Mail size={18} aria-hidden="true" />
            {`Email ${CONTACT_EMAIL}`}
          </a>
        </div>
      </section>

      <section className="py-8 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/trust" data-testid="hallucination-trust-link" className={CHIP_CLASS} onClick={() => trackCTAClick('trust_from_hallucination', 'hallucination_safeguards')}>
              How our demos handle your data
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link to="/model-card" data-testid="hallucination-model-card-link" className={CHIP_CLASS} onClick={() => trackCTAClick('model_card_from_hallucination', 'hallucination_safeguards')}>
              Model card
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link to="/ai-risks-we-watch" data-testid="hallucination-ai-risks-link" className={CHIP_CLASS} onClick={() => trackCTAClick('ai_risks_from_hallucination', 'hallucination_safeguards')}>
              AI risks we watch
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default HallucinationSafeguards;

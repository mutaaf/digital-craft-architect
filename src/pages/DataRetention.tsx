import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ShieldCheck, ArrowRight, Mail, Trash2 } from 'lucide-react';
import { RETENTION_POSTURE, RETENTION_POLICIES } from '@/data/dataRetention';
import { TRUST_PAGE_LABELS } from '@/data/trustPageLabels';
import { useRecordTrustPageVisit } from '@/hooks/useRecordTrustPageVisit';

// Ticket 0105 - /data-retention dated per-storage-key retention policy page.
// Mirrors `src/pages/HallucinationSafeguards.tsx` (ticket 0102) verbatim in
// structure.
//
// Per the 2026-05-30 second-@type lesson the pre-write grep of every
// `tests/e2e/*.spec.ts` confirmed CollectionPage + BreadcrumbList predicates
// are URL-scoped across the trust family; sibling scoped to /data-retention
// cannot collide.
//
// Per the 2026-05-25 mirror-source rule META_DESCRIPTION reads
// RETENTION_POSTURE.summary; the Helmet meta tag AND the CollectionPage
// description AND the visible intro paragraph all render from that one
// string. Per the 2026-05-07 em-dash Hard NO every rendered string uses
// hyphens. Per the 2026-05-25 SEO Pilot lesson /data-retention is NOT in
// index.html's SEO Pilot table; the spec asserts Helmet-managed meta
// description directly, never toHaveTitle().

const META_DESCRIPTION = RETENTION_POSTURE.summary;
const PAGE_H1 = 'Data Retention Policy';
const PAGE_URL = 'https://digitalcraftai.com/data-retention';
const ORIGIN = 'https://digitalcraftai.com';
const COLLECTION_PAGE_NAME = 'Digital Craft AI Data Retention Policy';
// Ticket 0105 mirror-source per 2026-05-25: the contact recipient
// byte-matches the recipient shipped in src/pages/Trust.tsx and
// src/pages/HallucinationSafeguards.tsx.
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
  dateModified: RETENTION_POSTURE.lastReviewed,
  isPartOf: { '@type': 'WebSite', name: 'DigitalCraft AI', url: ORIGIN },
};

const CHIP_CLASS =
  'inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors';

const CLEAR_CONFIRM_MESSAGE =
  "This will remove every 'dca_' key from your browser's localStorage. Continue?";

const DataRetention: React.FC = () => {
  const { content } = useContent();
  useRecordTrustPageVisit({
    path: '/data-retention',
    label: TRUST_PAGE_LABELS['/data-retention'],
  });
  const viewFiredRef = React.useRef<boolean>(false);
  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('data_retention_view', 'page_mount');
  }, []);

  const [clearedCount, setClearedCount] = React.useState<number | null>(null);

  const handleClearKeys = React.useCallback(() => {
    trackCTAClick('data_retention_clear_click', 'data_retention');
    let accepted = false;
    try {
      accepted = window.confirm(CLEAR_CONFIRM_MESSAGE);
    } catch {
      accepted = false;
    }
    if (!accepted) return;
    let n = 0;
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('dca_'));
      for (const k of keys) {
        localStorage.removeItem(k);
        n += 1;
      }
    } catch {
      /* storage unavailable - non-fatal */
    }
    setClearedCount(n);
    trackCTAClick('data_retention_clear_confirmed', String(n));
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
            Data retention posture
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {META_DESCRIPTION}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span
              data-testid="data-retention-last-reviewed"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-200"
            >
              <ShieldCheck size={12} aria-hidden="true" className="text-primary" />
              {`Last reviewed: ${RETENTION_POSTURE.lastReviewed}`}
            </span>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <article className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              What "client-side retention" means here
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Digital Craft AI is a static React site plus a thin serverless API. It has no
              customer database, no authentication system, and no CRM. The keys named in the
              table below are written by your own browser to your own localStorage so the
              /my dashboard can reopen the exact page or scenario you were reading. None of
              them travels to a Digital Craft server. Each row names the retention window
              the shipped store code actually enforces, the allow-list validation applied at
              both write and read, and the next scheduled review. If you clear localStorage
              (or use the button below), every one of these keys goes away in the browser
              you cleared.
            </p>
          </article>
        </div>
      </section>

      <section
        className="py-10 bg-white dark:bg-gray-950"
        data-testid="data-retention-table"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Per-key retention windows
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-700 dark:text-gray-200">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Storage key
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Purpose
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Retention window
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Allow-list validation
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                    Next review
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {RETENTION_POLICIES.map((row) => (
                  <tr
                    key={row.storageKey}
                    data-testid="retention-policy-row"
                    className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 align-top"
                  >
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 align-top">
                      <code
                        data-testid="retention-policy-key"
                        className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs text-gray-800 dark:text-gray-100"
                      >
                        {row.storageKey}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                      {row.purpose}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                      {row.retentionWindow}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                      {row.allowListValidation}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {row.nextReview}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                        {row.sourcePath}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <article className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              How to clear these keys yourself
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              You can inspect and clear every key above yourself. In Chrome or Edge, open
              DevTools with Ctrl+Shift+I (or Cmd+Option+I on macOS), pick the Application
              tab, expand Storage, then Local Storage, then this origin. In Firefox, use
              the Storage tab. Each key starting with the prefix
              {' '}
              <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs">
                dca_
              </code>
              {' '}
              is one of the entries above. Right-click any row to delete it, or use the
              button below to clear every dca_ key at once.
            </p>
            <button
              type="button"
              data-testid="clear-dca-keys-button"
              onClick={handleClearKeys}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary text-white text-sm font-medium transition-colors"
            >
              <Trash2 size={16} aria-hidden="true" />
              Clear all Digital Craft keys
            </button>
            {clearedCount !== null && (
              <p
                data-testid="clear-dca-keys-ack"
                className="mt-4 text-sm text-gray-700 dark:text-gray-300"
              >
                {`Cleared ${clearedCount} key${clearedCount === 1 ? '' : 's'}.`}
              </p>
            )}
          </article>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            How to report a retention concern
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Spot a key on your browser that is not listed here? Have a compliance question
            your DPO wants confirmed in writing before a paid pilot? Email us. Every
            retention question is triaged and the dated policy above is updated in the
            same ship loop that lands the rest of the site.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Data%20retention%20question`}
            data-testid="data-retention-report-mailto"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary text-white rounded-lg font-medium transition-colors"
            onClick={() =>
              trackCTAClick('data_retention_report_mailto', 'data_retention')
            }
          >
            <Mail size={18} aria-hidden="true" />
            {`Email ${CONTACT_EMAIL}`}
          </a>
        </div>
      </section>

      <section className="py-8 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/trust"
              data-testid="data-retention-trust-link"
              className={CHIP_CLASS}
              onClick={() => trackCTAClick('trust_from_data_retention', 'data_retention')}
            >
              How our demos handle your data
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link
              to="/hallucination-safeguards"
              data-testid="data-retention-hallucination-link"
              className={CHIP_CLASS}
              onClick={() =>
                trackCTAClick('hallucination_from_data_retention', 'data_retention')
              }
            >
              Hallucination Safeguards
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link
              to="/accessibility-statement"
              data-testid="data-retention-accessibility-link"
              className={CHIP_CLASS}
              onClick={() =>
                trackCTAClick('accessibility_from_data_retention', 'data_retention')
              }
            >
              Accessibility Statement
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default DataRetention;

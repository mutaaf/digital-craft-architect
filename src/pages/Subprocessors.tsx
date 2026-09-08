import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ShieldCheck, ArrowRight, Phone, Printer, ExternalLink } from 'lucide-react';
import { SUBPROCESSORS } from '@/data/subprocessors';

// Ticket 0069 - /subprocessors data recipients page. A printable structured
// table of every third-party service Digital Craft routes customer or
// visitor data through, backed by the shared `SUBPROCESSORS` constant in
// `src/data/subprocessors.ts` (extracted from the module-local PROVIDERS
// list in `src/pages/Trust.tsx` per ticket 0018). Sibling to
// `src/pages/VendorScorecard.tsx` (ticket 0067, the closest structural peer
// because both are buyer-artifact tables that render a printable grid from
// a `src/data/` constant, emit BreadcrumbList JSON-LD, and inline a
// `@media print` stylesheet inside Helmet).
//
// Per the 2026-05-07 em-dash Hard NO every rendered string uses hyphens
// (Self-Review greps the diff for U+2014).
// Per the 2026-05-25 mirror-source rule the `META_DESCRIPTION` and
// `PAGE_H1` are single module-level constants read by the render, the
// Helmet meta tag, AND the JSON-LD blocks so they cannot drift.
// Per the 2026-05-25 SEO Pilot lesson `/subprocessors` is NOT in the
// index.html SEO Pilot `pages` table, so the spec asserts the LAST
// `meta[name="description"]` content directly, never `toHaveTitle()`.

const META_DESCRIPTION =
  'The full list of every third-party service Digital Craft AI routes customer or visitor data through. One row per sub-processor, with the vendor name, category, what we use them for, and a link to their public trust or privacy page. Print or forward to your compliance reviewer.';

const PAGE_H1 = 'Sub-Processors and Data Recipients';

const COLLECTION_PAGE_NAME = 'Digital Craft AI Sub-Processors and Data Recipients';
const PAGE_URL = 'https://digitalcraftai.com/subprocessors';
const ORIGIN = 'https://digitalcraftai.com';

// BreadcrumbList (Home -> Sub-Processors). URL-scoped and cannot collide
// with any predecessor BreadcrumbList block per the 2026-05-30 second-@type
// lesson (grep result documented in the ticket Implementation log).
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
    {
      '@type': 'ListItem',
      position: 2,
      name: PAGE_H1,
      item: PAGE_URL,
    },
  ],
};

// CollectionPage with an embedded ItemList (`hasPart`). Per the 2026-05-25
// mirror-source rule the `description` field is the same META_DESCRIPTION
// constant used for the Helmet meta tag. `numberOfItems` equals
// `SUBPROCESSORS.length` so a new row automatically updates the schema.
const COLLECTION_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: COLLECTION_PAGE_NAME,
  description: META_DESCRIPTION,
  url: PAGE_URL,
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    name: 'DigitalCraft AI',
    url: ORIGIN,
  },
  hasPart: {
    '@type': 'ItemList',
    name: COLLECTION_PAGE_NAME,
    numberOfItems: SUBPROCESSORS.length,
    itemListElement: SUBPROCESSORS.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name,
      description: s.purpose,
      url: s.publicTrustUrl,
    })),
  },
};

// Inline @media print stylesheet, mirroring the ticket 0067 precedent.
// Hides Navbar, Footer, ScrollProgress, and the strategy-call CTA at print
// time via `display: none !important;` (required to beat Tailwind's
// utility-class specificity). Forces the sub-processor table to render
// black-on-white full-width regardless of on-screen theme so ink usage is
// predictable, and adds thin 1px cell borders so the sheet reads as a grid
// on paper.
const PRINT_CSS = `
  @media print {
    nav, footer, .subprocessors-no-print { display: none !important; }
    body { background: #fff !important; color: #000 !important; }
    .subprocessors-print-area { padding: 0 !important; margin: 0 !important; }
    table[data-testid="subprocessors-table"] {
      width: 100% !important;
      color: #000 !important;
      background: #fff !important;
      border-collapse: collapse !important;
    }
    table[data-testid="subprocessors-table"] th,
    table[data-testid="subprocessors-table"] td {
      border: 1px solid #000 !important;
      color: #000 !important;
      background: #fff !important;
      padding: 8px !important;
      vertical-align: top !important;
    }
    table[data-testid="subprocessors-table"] a {
      color: #000 !important;
      text-decoration: underline !important;
    }
  }
`;

// Short humanized label for the "Trust page" cell so the printed page is
// scannable (the full URL still lives on the anchor's href).
const humanizeTrustUrl = (url: string): string => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const seg = u.pathname.split('/').filter(Boolean).pop() ?? '';
    const label = seg ? seg.replace(/-/g, ' ') : '';
    return label ? `${host} ${label}` : host;
  } catch {
    return url;
  }
};

const Subprocessors: React.FC = () => {
  const { content } = useContent();
  const viewFiredRef = React.useRef<boolean>(false);

  // Ticket 0060 / 0062 / 0067 pattern: one telemetry beacon per mount,
  // debounced via a useRef bool guard so a StrictMode double-mount does not
  // double-count.
  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('subprocessors_view', 'subprocessors');
  }, []);

  // Analytics fire order matters: the print dialog blocks the event loop so
  // any beacon fired AFTER window.print() may not flush. Fire the beacon
  // FIRST (synchronously), then call print. Spec case 8 asserts this order.
  const handlePrintClick = React.useCallback(() => {
    trackCTAClick('subprocessors_print', 'subprocessors');
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 subprocessors-print-area">
      <Helmet>
        <title>{`${PAGE_H1} | DigitalCraft AI`}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(COLLECTION_PAGE_SCHEMA)}</script>
        <style type="text/css" media="print">{PRINT_CSS}</style>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 subprocessors-no-print">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <ShieldCheck size={16} />
            Sub-Processor Registry
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Every third-party service we route customer or visitor data through, in one
            printable table. For the full data-flow narrative (where scraped website data
            goes, where voice call audio goes, what never lands on a Digital Craft server)
            see{' '}
            <Link
              to="/trust"
              className="text-primary hover:underline font-medium"
              onClick={() => trackCTAClick('subprocessors_to_trust', 'subprocessors')}
            >
              /trust
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handlePrintClick}
              data-testid="subprocessors-print"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              <Printer size={18} />
              Print sub-processor list
            </button>
            <Link
              to="/trust"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
            >
              Read the trust narrative
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="py-8 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
            <table
              data-testid="subprocessors-table"
              className="w-full text-sm text-left text-gray-700 dark:text-gray-300"
            >
              <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3 w-1/6">Vendor</th>
                  <th scope="col" className="px-4 py-3 w-1/6">Category</th>
                  <th scope="col" className="px-4 py-3 w-3/6">What we use them for</th>
                  <th scope="col" className="px-4 py-3 w-1/6">Trust page</th>
                </tr>
              </thead>
              <tbody>
                {SUBPROCESSORS.map((s, idx) => (
                  <tr
                    key={s.name}
                    data-testid="subprocessor-row"
                    className={idx % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/60 dark:bg-gray-900/40'}
                  >
                    <th scope="row" className="px-4 py-4 align-top font-medium text-gray-900 dark:text-white">
                      {s.name}
                    </th>
                    <td className="px-4 py-4 align-top text-gray-700 dark:text-gray-300">
                      {s.category}
                    </td>
                    <td className="px-4 py-4 align-top text-gray-600 dark:text-gray-300 leading-relaxed">
                      {s.purpose}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <a
                        href={s.publicTrustUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="subprocessor-trust-link"
                        className="inline-flex items-center gap-1 text-primary hover:underline break-words"
                        onClick={() =>
                          trackCTAClick(
                            `subprocessors_trust_link_${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
                            'subprocessors',
                          )
                        }
                      >
                        <span>{humanizeTrustUrl(s.publicTrustUrl)}</span>
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Every domain in the Trust page column is publicly reachable from any browser.
            No login is required to open any of them; this list adds no new hostname to
            what a security reviewer could already reach on their own.
          </p>
        </div>
      </section>

      {/* Strategy call CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 subprocessors-no-print">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ask about a specific vendor
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Bring the printed sheet to a 30-minute discovery call. We will walk through
            each row, what data actually leaves your browser at each hop, and where a
            BAA or DPA is required for a regulated deployment.
          </p>
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            onClick={() => trackCTAClick('subprocessors_strategy_call', 'subprocessors')}
          >
            <Phone size={18} />
            Book the Discovery Call
          </a>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Subprocessors;

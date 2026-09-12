import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { ETHICS_COMMITMENTS } from '@/data/ethicsCommitments';

// Ticket 0077 - /ethics "What we won't do" public commitments page. Mirrors
// the visual shell of `src/pages/Trust.tsx` (ticket 0018) and
// `src/pages/Subprocessors.tsx` (ticket 0069), the two direct peers for a
// trust-family public artifact backed by a `src/data/` typed constant.
//
// The page is intentionally passive: zero strategy-call CTA, zero email
// capture form, zero pricing chip. The CTA is the URL itself, which a
// compliance reviewer or insurance carrier forwards or attaches to a
// procurement file.
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this page the
// implementer grepped every `tests/e2e/*-jsonld.spec.ts` for
// `=== 'BreadcrumbList'` predicates and confirmed every existing
// BreadcrumbList assertion is URL-scoped (the spec navigates to its own page
// first and asserts blocks on THAT page only). A new /ethics-scoped
// BreadcrumbList block cannot collide.
//
// Per the 2026-05-25 mirror-source rule `META_DESCRIPTION` and
// `BREADCRUMB_SCHEMA` are module-level constants read by the Helmet meta
// tag, the JSON-LD block, and (for the description) the intro paragraph
// context so they cannot drift.
//
// Per the 2026-05-25 SEO Pilot lesson /ethics is NOT in the index.html SEO
// Pilot pages table (mirroring the convention of the sibling /trust,
// /subprocessors, and /uptime pages), so the spec asserts the Helmet-managed
// meta description directly and never toHaveTitle().
//
// Per the 2026-05-07 em-dash Hard NO every rendered string uses hyphens
// (Self-Review greps the diff for U+2014 before pushing).

const META_DESCRIPTION =
  'What Digital Craft AI will not do with your data or your customers. A dated public list of hard-NO commitments (no fabricated testimonials, no dark-pattern email capture, no persona misrepresentation on voice calls, no scraped-data resale) that a compliance reviewer or insurance carrier can attach to a procurement file.';

const PAGE_H1 = "What we won't do";
const PAGE_URL = 'https://digitalcraftai.com/ethics';
const ORIGIN = 'https://digitalcraftai.com';
const TRUST_URL = `${ORIGIN}/trust`;

// BreadcrumbList (Home -> Trust -> "What we won't do"). URL-scoped and cannot
// collide with any predecessor BreadcrumbList block per the 2026-05-30
// second-@type lesson (grep result documented in the ticket Implementation
// log). No @graph wrapper - Google parses sibling script tags independently.
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: 'Trust', item: TRUST_URL },
    { '@type': 'ListItem', position: 3, name: PAGE_H1, item: PAGE_URL },
  ],
};

const Ethics: React.FC = () => {
  const { content } = useContent();
  const ethicsViewTracked = React.useRef<boolean>(false);

  // Ticket 0060 / 0062 / 0069 pattern: one telemetry beacon per mount,
  // debounced via a useRef bool guard so a StrictMode double-mount does not
  // double-count. Spec case 10 asserts exactly-one per mount.
  React.useEffect(() => {
    if (ethicsViewTracked.current) return;
    ethicsViewTracked.current = true;
    trackCTAClick('ethics_view', 'page_mount');
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{`${PAGE_H1} | Ethics Commitments | DigitalCraft AI`}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <ShieldCheck size={16} />
            Ethics Commitments
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The dated list of things Digital Craft AI will not do with your data or your
            customers. Each commitment carries an "in effect since" date and a plain-language
            rationale so a compliance reviewer, insurance carrier, or partner can attach the
            URL to a procurement file without asking us for a follow-up statement.
          </p>
        </div>
      </section>

      {/* Commitments list */}
      <section
        className="py-12 bg-white dark:bg-gray-950"
        data-testid="ethics-commitments-list"
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-6">
            {ETHICS_COMMITMENTS.map((c) => (
              <article
                key={c.id}
                data-testid="ethics-commitment-card"
                id={c.id}
                className="scroll-mt-28 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6 md:p-7"
              >
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  {c.title}
                </h2>
                <p className="font-semibold text-gray-900 dark:text-white mb-3 leading-relaxed">
                  {c.stance}
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {c.rationale}
                </p>
                <div
                  data-testid="ethics-commitment-since"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  <ShieldCheck size={12} aria-hidden="true" className="text-primary" />
                  <span>{`In effect since ${c.sinceDate}`}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-link chips (footer). Passive artifact - no CTA button, no email
          capture form. Chips point to the three sibling public trust surfaces. */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            More public trust artifacts
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/trust"
              data-testid="ethics-trust-link"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              onClick={() => trackCTAClick('ethics_to_trust', 'ethics_footer')}
            >
              How our demos handle your data
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/subprocessors"
              data-testid="ethics-subprocessors-link"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              onClick={() => trackCTAClick('ethics_to_subprocessors', 'ethics_footer')}
            >
              Sub-processor list
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/uptime"
              data-testid="ethics-uptime-link"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              onClick={() => trackCTAClick('ethics_to_uptime', 'ethics_footer')}
            >
              Live uptime status
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Ethics;

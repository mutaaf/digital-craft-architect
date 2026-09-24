import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ShieldCheck, ArrowRight, Phone } from 'lucide-react';
import { AI_RISKS_WATCHLIST } from '@/data/aiRisksWatchlist';

// Ticket 0094 - /ai-risks-we-watch dated risk-watchlist page. Mirrors the
// visual shell of `src/pages/Security.tsx` (ticket 0081, the closest
// structural peer for a trust-family page emitting CollectionPage +
// BreadcrumbList JSON-LD backed by a `src/data/` typed constant of dated
// rows) and `src/pages/Ethics.tsx` (ticket 0077, the closest peer for a
// dated-row layout with a last-reviewed chip and a related-link chip).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this page the
// implementer grepped every `tests/e2e/*jsonld*.spec.ts` for
// `=== 'CollectionPage'`, `=== 'BreadcrumbList'`, `=== 'ItemList'`, and
// `toHaveLength(1)` predicates. Every predecessor is URL-scoped, so the
// sibling /ai-risks-we-watch-scoped blocks cannot collide. Grep result
// documented in the ticket Implementation log.
//
// Per the 2026-05-25 mirror-source rule `META_DESCRIPTION` is a single
// module-level constant read by the Helmet <meta> tag AND the CollectionPage
// schema's `description` field so the two cannot drift.
//
// Per the 2026-05-07 em-dash Hard NO every rendered string uses hyphens
// (Self-Review greps the diff for U+2014 before pushing).
//
// Per the 2026-05-25 SEO Pilot lesson /ai-risks-we-watch is NOT in the
// index.html SEO Pilot pages table; the spec asserts the Helmet-managed
// meta description directly, never toHaveTitle().

const META_DESCRIPTION =
  'The dated list of AI failure modes Digital Craft AI is actively watching, the current mitigation posture for each, and the last-reviewed date. Distinct from the /ethics page (immutable hard-NO stances) and the /security page (infrastructure controls) - this page names the specific risks and how each is currently mitigated. Forward the URL to your compliance reviewer or insurance carrier.';

const PAGE_H1 = 'AI risks we watch';
const PAGE_URL = 'https://digitalcraftai.com/ai-risks-we-watch';
const ORIGIN = 'https://digitalcraftai.com';
const COLLECTION_PAGE_NAME = 'AI risks we watch';

// BreadcrumbList (Home -> AI risks we watch). URL-scoped and cannot collide
// with any predecessor BreadcrumbList block per the 2026-05-30 second-@type
// lesson (grep result documented in the ticket Implementation log).
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
    { '@type': 'ListItem', position: 2, name: PAGE_H1, item: PAGE_URL },
  ],
};

// CollectionPage with an embedded ItemList (`mainEntity`). Per the 2026-05-25
// mirror-source rule the `description` field is the same META_DESCRIPTION
// constant used for the Helmet meta tag. `numberOfItems` equals
// AI_RISKS_WATCHLIST.length so a new row automatically updates the schema.
// Each ListItem carries a same-page fragment anchor `#risk-<id>` so a
// crawler can deep-link into an individual risk row.
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
  mainEntity: {
    '@type': 'ItemList',
    name: COLLECTION_PAGE_NAME,
    numberOfItems: AI_RISKS_WATCHLIST.length,
    itemListElement: AI_RISKS_WATCHLIST.map((row, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: row.name,
      url: `${PAGE_URL}#risk-${row.id}`,
    })),
  },
};

const AiRisksWeWatch: React.FC = () => {
  const { content } = useContent();
  const viewFiredRef = React.useRef<boolean>(false);

  // Ticket 0060 / 0062 / 0077 pattern: one telemetry beacon per mount,
  // debounced via a useRef bool guard so a StrictMode double-mount does not
  // double-count.
  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('ai_risks_watchlist_view', 'page_mount');
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

      {/* Hero */}
      <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <ShieldCheck size={16} />
            AI Risk Watchlist
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The dated list of AI failure modes Digital Craft AI is actively watching, the current
            mitigation posture for each, and the last-reviewed date. Distinct from the /ethics page
            (immutable hard-NO stances) and the /security page (infrastructure controls) - this
            page names the specific risks and how each is currently mitigated. Forward the URL to
            your compliance reviewer or insurance carrier.
          </p>
        </div>
      </section>

      {/* Watchlist rows */}
      <section
        className="py-12 bg-white dark:bg-gray-950"
        data-testid="ai-risks-watchlist"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AI_RISKS_WATCHLIST.map((row) => (
              <article
                key={row.id}
                data-testid="ai-risk-row"
                id={`risk-${row.id}`}
                className="scroll-mt-28 flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6"
              >
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {row.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 flex-1">
                  {row.mitigation}
                </p>
                <div
                  data-testid="ai-risk-last-reviewed"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-xs font-medium text-gray-600 dark:text-gray-300 self-start mb-3"
                >
                  <ShieldCheck size={12} aria-hidden="true" className="text-primary" />
                  <span>{`Last reviewed: ${row.lastReviewed}`}</span>
                </div>
                {row.relatedLink ? (
                  <Link
                    to={row.relatedLink.href}
                    data-testid="ai-risk-related-link"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline self-start"
                    onClick={() =>
                      trackCTAClick(`ai_risks_related_${row.id}`, 'ai_risks_we_watch')
                    }
                  >
                    {`See also: ${row.relatedLink.label}`}
                    <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
            How this page is maintained: every ship that touches a demo pipeline or the AI provider
            list triggers a review of the affected rows. The full page is reviewed at least
            quarterly regardless of shipped work, and each row's last-reviewed date advances with
            its own review.
          </p>
        </div>
      </section>

      {/* Strategy call CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ask about a specific risk row
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Book a 15-minute strategy call. We will walk through any row, the mitigation posture,
            and where a formal attestation is a pilot precondition for your risk team.
          </p>
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            onClick={() => trackCTAClick('ai_risks_strategy_call', 'ai_risks_we_watch')}
          >
            <Phone size={18} />
            Book a 15-minute strategy call
          </a>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default AiRisksWeWatch;

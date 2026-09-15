import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ShieldCheck, ArrowRight, Phone } from 'lucide-react';
import { securityControls, type SecurityControlStatus } from '@/data/securityControls';

// Ticket 0081 - /security posture page. Mirrors the visual shell of
// `src/pages/Subprocessors.tsx` (ticket 0069, the closest structural peer
// for a trust-family public page backed by a `src/data/` constant emitting
// CollectionPage + BreadcrumbList JSON-LD) and `src/pages/Ethics.tsx`
// (ticket 0077, the closest peer for a dated-row card grid with a
// per-card status/since chip).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this page the
// implementer grepped every `tests/e2e/*-jsonld.spec.ts` for
// `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates and confirmed
// every predecessor is URL-scoped so a sibling /security-scoped block cannot
// collide. Grep result documented in the ticket Implementation log.
//
// Per the 2026-05-25 mirror-source rule `META_DESCRIPTION` is a single
// module-level constant read by the Helmet <meta> tag AND the CollectionPage
// schema's `description` field so the two cannot drift.
//
// Per the 2026-05-07 em-dash Hard NO every rendered string uses hyphens
// (Self-Review greps the diff for U+2014 before pushing).

const META_DESCRIPTION =
  'Dated list of the infrastructure and application security controls Digital Craft AI has in place today, in progress, and aspirational. One row per control category with a status tag, a last-reviewed date, and cross-links to the sibling trust surfaces. Forward the URL to your compliance reviewer.';

const PAGE_H1 = 'Security Posture';
const PAGE_URL = 'https://digitalcraftai.com/security';
const ORIGIN = 'https://digitalcraftai.com';
const COLLECTION_PAGE_NAME = 'Digital Craft AI Security Posture';

// BreadcrumbList (Home -> Security). URL-scoped and cannot collide with any
// predecessor BreadcrumbList block per the 2026-05-30 second-@type lesson.
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
    { '@type': 'ListItem', position: 2, name: 'Security', item: PAGE_URL },
  ],
};

// CollectionPage with an embedded `hasPart` array of CreativeWork entries,
// one per SecurityControl. Per the 2026-05-25 mirror-source rule the
// `description` field is the same META_DESCRIPTION constant used for the
// Helmet meta tag; each hasPart entry mirrors the row's own strings so a
// schema graph walker sees the same rows the visible cards render.
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
  hasPart: securityControls.map((c) => ({
    '@type': 'CreativeWork',
    name: c.name,
    description: c.description,
    dateModified: c.lastReviewed,
  })),
};

// Tailwind classes per status enum. Green for in-place, amber for
// in-progress, gray for aspirational. Every color carries a dark: variant
// per the AGENTS.md dark-mode Hard NO.
const STATUS_STYLES: Record<SecurityControlStatus, { label: string; classes: string }> = {
  'in-place': {
    label: 'In place',
    classes:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  },
  'in-progress': {
    label: 'In progress',
    classes:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  },
  aspirational: {
    label: 'Aspirational',
    classes:
      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  },
};

const Security: React.FC = () => {
  const { content } = useContent();
  const viewFiredRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('security_view', 'page_mount');
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
            Security Controls
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The dated list of infrastructure and application security controls Digital Craft has
            in place today, in progress this quarter, and aspirational for later. Each row carries
            a status tag, a last-reviewed date, and a cross-link to the sibling trust surface where
            relevant. Forward the URL to your compliance reviewer.
          </p>
        </div>
      </section>

      {/* Controls grid */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityControls.map((c) => {
              const style = STATUS_STYLES[c.status];
              return (
                <article
                  key={c.id}
                  data-testid="security-control-card"
                  id={c.id}
                  className="scroll-mt-28 flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {c.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 flex-1">
                    {c.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      data-testid="security-control-status"
                      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${style.classes}`}
                    >
                      {style.label}
                    </span>
                  </div>
                  <div
                    data-testid="security-control-last-reviewed"
                    className="text-xs text-gray-500 dark:text-gray-400 mb-3"
                  >
                    {`Last reviewed: ${c.lastReviewed}`}
                  </div>
                  {c.seeAlso ? (
                    <Link
                      to={c.seeAlso.href}
                      data-testid="security-control-seealso"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      onClick={() =>
                        trackCTAClick(`security_seealso_${c.id}`, 'security')
                      }
                    >
                      {`See also: ${c.seeAlso.label}`}
                      <ArrowRight size={12} aria-hidden="true" />
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
          <p className="mt-8 text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
            {"How this page is maintained: every ship that touches the /api/ serverless layer or the sub-processor list triggers a review of the affected rows on this page. The full page is reviewed at least quarterly regardless of shipped work, and each row's last-reviewed date advances with its own review."}
          </p>
        </div>
      </section>

      {/* Strategy call CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ask about a specific control
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Bring the URL to a 30-minute discovery call. We will walk through each row, the
            evidence behind the status tag, and where a formal attestation is a pilot precondition.
          </p>
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            onClick={() => trackCTAClick('security_strategy_call', 'security')}
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

export default Security;

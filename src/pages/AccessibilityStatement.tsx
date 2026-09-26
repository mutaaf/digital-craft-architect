import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ShieldCheck, ArrowRight, Phone, Mail } from 'lucide-react';
import {
  CONFORMANCE_TARGET,
  RECENT_REMEDIATIONS,
} from '@/data/accessibilityStatement';

// Ticket 0097 - /accessibility-statement dated WCAG conformance + remediation
// log page. Mirrors the file structure of `src/pages/AiRisksWeWatch.tsx`
// (ticket 0094, the freshest dated-trust-artifact predecessor rendering a
// dated typed constant into a table + CollectionPage JSON-LD).
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this page the
// implementer grepped every `tests/e2e/*-jsonld.spec.ts` for
// `=== 'CollectionPage'`, `=== 'BreadcrumbList'`, `toHaveLength(1)` predicates.
// Every predecessor is URL-scoped, so the sibling /accessibility-statement-
// scoped blocks cannot collide.
//
// Per the 2026-05-25 mirror-source rule, META_DESCRIPTION reads
// CONFORMANCE_TARGET.summary from the single source in
// `src/data/accessibilityStatement.ts`; the Helmet meta tag AND the
// CollectionPage schema's `description` field AND the visible page body all
// read from that one string.
//
// Per the 2026-05-07 em-dash Hard NO every rendered string uses hyphens.
//
// Per the 2026-05-25 SEO Pilot lesson /accessibility-statement is NOT in
// index.html's SEO Pilot pages table; the spec asserts the Helmet-managed
// meta description directly, never toHaveTitle().

const META_DESCRIPTION = CONFORMANCE_TARGET.summary;

const PAGE_H1 = 'Accessibility Statement';
const PAGE_URL = 'https://digitalcraftai.com/accessibility-statement';
const ORIGIN = 'https://digitalcraftai.com';
const COLLECTION_PAGE_NAME = 'Digital Craft AI Accessibility Statement';
const CONTACT_EMAIL = 'mutaaf@digitalcraftai.com';

// BreadcrumbList (Home -> Accessibility Statement). URL-scoped and cannot
// collide with any predecessor BreadcrumbList block per the 2026-05-30
// second-@type lesson.
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
    { '@type': 'ListItem', position: 2, name: PAGE_H1, item: PAGE_URL },
  ],
};

// CollectionPage. Per the 2026-05-25 mirror-source rule, `description` is
// the same META_DESCRIPTION constant used for the Helmet meta tag, and
// `dateModified` is CONFORMANCE_TARGET.lastReviewed from the data file.
const COLLECTION_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: COLLECTION_PAGE_NAME,
  description: META_DESCRIPTION,
  url: PAGE_URL,
  inLanguage: 'en-US',
  dateModified: CONFORMANCE_TARGET.lastReviewed,
  isPartOf: {
    '@type': 'WebSite',
    name: 'DigitalCraft AI',
    url: ORIGIN,
  },
};

const AccessibilityStatement: React.FC = () => {
  const { content } = useContent();
  const viewFiredRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('accessibility_statement_view', 'page_mount');
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
            <ShieldCheck size={16} aria-hidden="true" />
            Accessibility posture
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {META_DESCRIPTION}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span
              data-testid="accessibility-conformance-target"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-200"
            >
              <ShieldCheck size={12} aria-hidden="true" className="text-primary" />
              {`Target: WCAG ${CONFORMANCE_TARGET.version} ${CONFORMANCE_TARGET.level}`}
            </span>
            <span
              data-testid="accessibility-last-reviewed"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-200"
            >
              <ShieldCheck size={12} aria-hidden="true" className="text-primary" />
              {`Last reviewed: ${CONFORMANCE_TARGET.lastReviewed}`}
            </span>
          </div>
        </div>
      </section>

      {/* Conformance target explanation */}
      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <article className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              What the WCAG {CONFORMANCE_TARGET.version} {CONFORMANCE_TARGET.level} target means
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              WCAG {CONFORMANCE_TARGET.version} {CONFORMANCE_TARGET.level} is the
              conformance level most public-sector Section 508 and enterprise
              procurement checklists cite as the working standard for a public
              marketing site. In practice that means every route ships with
              keyboard-navigable interactive elements, visible focus states,
              text alternatives for meaningful icons, color contrast that
              clears the AA ratio, and dark-mode variants that keep those
              contrast ratios legible in both themes. This page names the
              audit cadence, the currently open limitations, and the dated
              log of accessibility fixes the ship loop has actually landed
              in the last 90 days.
            </p>
          </article>
        </div>
      </section>

      {/* How we audit */}
      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            How we audit
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <li>
              <strong className="text-gray-900 dark:text-white">Automated gates on every push.</strong>{' '}
              The CI build gate runs the check-links, check-images,
              check-meta, and check-blog-dates scripts so a shipped route
              cannot land with a dead link, a missing image alt attribute,
              or a malformed head element. The Playwright smoke suite
              exercises every route end to end.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Manual keyboard walk on every new route.</strong>{' '}
              Before a feat PR merges, the implementer tab-walks every new
              interactive element on the route and confirms each receives a
              visible focus state. Screen-reader spot checks run on any
              route that adds a new landmark, a new heading, or a new
              form.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Browser developer-tools inspection.</strong>{' '}
              Chrome DevTools Lighthouse accessibility category and the
              built-in contrast checker are used on any route that changes
              color tokens or introduces a new component. Findings that
              warrant a shipped fix land as a dated remediation row below.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Quarterly page-wide review.</strong>{' '}
              The full page is reviewed end to end at least once per
              quarter regardless of shipped work; the last-reviewed chip
              at the top of this page advances with each review.
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            We do not currently publish a third-party WCAG audit. When a
            paid third-party audit finishes, its findings and remediation
            plan will be added to this page and the last-reviewed chip
            will advance to the audit-completion date.
          </p>
        </div>
      </section>

      {/* Known limitations */}
      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Known limitations
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed list-disc pl-6">
            <li>
              <strong className="text-gray-900 dark:text-white">
                No completed third-party WCAG audit.
              </strong>{' '}
              The audit cadence above is the current in-house posture. A
              paid third-party audit is a future budget item; when it lands
              this row will be replaced with the audit findings.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">
                No per-route pass/fail conformance matrix.
              </strong>{' '}
              This statement names the site-wide target. Publishing a
              per-route rating requires per-route audit data the current
              cadence does not produce; that is a future ticket.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">
                Live voice negotiator surface.
              </strong>{' '}
              The voice negotiator demo relies on WebRTC and third-party
              voice infrastructure whose accessibility posture is set by
              the vendor. The visible transcript panel is keyboard-
              reachable; a hearing-impaired visitor sees the live model
              transcript in the same UI.
            </li>
          </ul>
        </div>
      </section>

      {/* Recent remediations table */}
      <section
        className="py-10 bg-white dark:bg-gray-950"
        data-testid="accessibility-remediations"
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent remediations
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Dated accessibility fixes shipped in the last 90 days. Each row
            names the date the fix landed on the main branch, the affected
            route, and the shipped change. Every route in this table is a
            route present in the site&#39;s canonical route list; every
            summary is a real change grepable from the git log at branch
            head.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-700 dark:text-gray-200">
                  <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                  <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Route</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Change summary</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_REMEDIATIONS.map((row, i) => (
                  <tr
                    key={`${row.date}-${row.route}-${i}`}
                    data-testid="accessibility-remediation-row"
                    className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {row.date}
                    </td>
                    <td
                      data-testid="accessibility-remediation-route"
                      className="px-4 py-3 align-top text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {row.route}
                    </td>
                    <td className="px-4 py-3 align-top text-gray-600 dark:text-gray-300 leading-relaxed">
                      {row.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Report a barrier */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            Report a barrier
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Found a route that fails a keyboard-only walk, a color combination
            that misses the AA contrast ratio, or a component that a screen
            reader cannot enumerate? Email the URL and a short description;
            we triage every report and dated fixes land in the table above.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Accessibility%20barrier%20report`}
            data-testid="accessibility-report-mailto"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary text-white rounded-lg font-medium transition-colors"
            onClick={() => trackCTAClick('accessibility_report_mailto', 'accessibility_statement')}
          >
            <Mail size={18} aria-hidden="true" />
            {`Email ${CONTACT_EMAIL}`}
          </a>
        </div>
      </section>

      {/* Sibling trust-artifact chip cluster */}
      <section className="py-8 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/trust"
              data-testid="accessibility-trust-link"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              onClick={() => trackCTAClick('trust_from_accessibility', 'accessibility_statement')}
            >
              How our demos handle your data
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link
              to="/security"
              data-testid="accessibility-security-link"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              onClick={() => trackCTAClick('security_from_accessibility', 'accessibility_statement')}
            >
              Security posture
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Strategy call CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Cite this URL in your vendor onboarding packet
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Forward the URL to your compliance reviewer, procurement lead, or
            ADA counsel. Book a 15-minute strategy call to walk through the
            audit cadence, the remediation log, or any specific WCAG success
            criterion that matters for your procurement checklist.
          </p>
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary text-white rounded-lg font-medium transition-colors"
            onClick={() => trackCTAClick('accessibility_strategy_call', 'accessibility_statement')}
          >
            <Phone size={18} aria-hidden="true" />
            Book a 15-minute strategy call
          </a>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default AccessibilityStatement;

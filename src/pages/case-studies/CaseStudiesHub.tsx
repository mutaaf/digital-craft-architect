import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { caseStudies } from '@/data/caseStudies';
import { BookOpen, ArrowRight } from 'lucide-react';

// Ticket 0057 - Public /case-studies index hub listing every detailed
// case study with CollectionPage + ItemList + BreadcrumbList JSON-LD.
// Page shell mirrored from `src/pages/CompareHub.tsx` (ticket 0048, the
// closest peer because both are leaf-page-family hubs emitting
// `CollectionPage` + `ItemList`). The card grid uses the same Tailwind
// responsive class pattern Demos and CompareHub use
// (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`) so the hub
// reads cleanly as one column on a 375px viewport, two columns on
// tablet, and three columns on desktop.
//
// 2026-05-25 mirror-source rule: META_DESCRIPTION is the single constant
// the Helmet meta tag AND the CollectionPage JSON-LD description read
// from, so a future copy edit propagates to both in one render. The
// e2e spec asserts the two match byte-for-byte.
//
// 2026-05-07 em-dash Hard NO: every string in this module - the H1,
// supporting paragraph, footer note, JSON-LD strings, CTA label, and
// card body copy - uses hyphens, not the U+2014 em-dash character.
//
// 2026-05-30 second-@type lesson: the pre-code grep across every
// `tests/e2e/*-jsonld.spec.ts` and the sibling `compare-hub.spec.ts`
// confirmed every predecessor "exactly one" assertion for
// CollectionPage / ItemList / BreadcrumbList is URL-scoped to a route
// other than /case-studies, so the three blocks emitted here do not
// collide with any prior assertion.

const SITE_URL = 'https://digitalcraftai.com';

const META_DESCRIPTION =
  'Read Digital Craft AI case studies across construction, real estate, and events. Each case study covers the challenge, the AI solution we deployed, the measured results, and a representative quote - one canonical index URL so you can compare vertical depth in one screen and forward a single link to your team.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Case Studies', item: `${SITE_URL}/case-studies` },
  ],
};

// Second CollectionPage emission site-wide (the first is /compare from
// ticket 0048). The pre-code grep recorded in the ticket Implementation
// log confirmed the /compare predecessor assertion in
// `tests/e2e/compare-hub.spec.ts` is URL-scoped via its `gotoCompareHub`
// helper, so the sibling block on `/case-studies` does NOT collide.
// isPartOf references the homepage WebSite block by url (no duplicate
// identity).
const COLLECTION_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Digital Craft AI Case Studies',
  description: META_DESCRIPTION,
  url: `${SITE_URL}/case-studies`,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', url: SITE_URL },
};

// ItemList built by mapping over the SHARED `caseStudies` constant so a
// future fourth case study appended there surfaces automatically in
// both the grid and the schema. Each item.url is an absolute
// https://digitalcraftai.com URL (the e2e spec asserts this).
const ITEM_LIST_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Digital Craft AI Case Studies',
  description: META_DESCRIPTION,
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  numberOfItems: caseStudies.length,
  itemListElement: caseStudies.map((study, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: study.title,
    url: `${SITE_URL}/case-studies/${study.slug}`,
  })),
};

const CaseStudiesHub: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Case Studies | DigitalCraft AI</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/case-studies`} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(COLLECTION_PAGE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(ITEM_LIST_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero - one short heading, one supporting paragraph, no CTA above the grid. */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <BookOpen size={16} />
            Case Studies
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Case Studies
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Every Digital Craft AI case study in one place. Each card covers a real engagement
            pattern across construction, real estate, and events - the challenge, the AI solution
            we deployed, and the measured results.
          </p>
        </div>
      </section>

      {/* Case-study card grid */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseStudies.map((study) => (
              <Link
                key={study.slug}
                to={`/case-studies/${study.slug}`}
                data-testid="case-study-hub-card"
                onClick={() => trackCTAClick('case_studies_hub_card', 'case-studies')}
                className="group flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all"
              >
                <span className="inline-flex items-center self-start px-2 py-1 rounded-full text-xs font-medium bg-primary/10 dark:bg-primary/20 text-primary mb-3">
                  {study.vertical}
                </span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-snug">
                  {study.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                  {study.summary}
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    {study.heroStat.label}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {study.heroStat.value}
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read the full case study
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy-call CTA below the grid. */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            See what an AI deployment would look like for your business
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
            Book a 30-minute strategy call and we will walk through which of these patterns
            maps to your team, what we would build first, and what the rollout would cost.
          </p>
          <Link
            to="/#contact"
            onClick={() => trackCTAClick('case_studies_hub_strategy_call', 'case-studies')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            Book a strategy call
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default CaseStudiesHub;

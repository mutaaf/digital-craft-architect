import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { COMPARE_ENTRIES } from '@/data/compareEntries';
import { Scale, ArrowRight } from 'lucide-react';

// Ticket 0048 - Public /compare hub indexing every comparison page with
// CollectionPage and ItemList JSON-LD. Page shell mirrored from
// src/pages/Demos.tsx (the closest hub peer). The grid uses the same
// Tailwind responsive class pattern Demos uses
// (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`) so the hub
// reads cleanly as one column on a 375px viewport, two columns on tablet,
// and three columns on desktop.
//
// 2026-05-25 mirror-source rule: META_DESCRIPTION is the single constant
// the Helmet meta tag AND the CollectionPage JSON-LD description read
// from, so a future copy edit propagates to both in one render. The
// e2e spec asserts the two match byte-for-byte.
//
// 2026-05-07 em-dash Hard NO: every string in this module - the H1,
// supporting paragraph, footer note, and every JSON-LD string - uses
// hyphens, not the U+2014 em-dash character.

const SITE_URL = 'https://digitalcraftai.com';

const META_DESCRIPTION =
  'Compare Digital Craft AI to the tools you already pay for. One hub indexing every Digital Craft comparison page - HubSpot, GoHighLevel, Zapier, Make, Intercom, Jobber, ServiceTitan, Podium, Housecall Pro, and Buildertrend - so you can pick the comparison that matches your current stack.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE_URL}/compare` },
  ],
};

// First CollectionPage emission site-wide; the pre-code grep recorded in
// the ticket Implementation log returned zero matches for
// `=== 'CollectionPage'` in any tests/e2e/*-jsonld.spec.ts. isPartOf
// references the homepage WebSite block by url (no duplicate identity).
const COLLECTION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Digital Craft Comparisons',
  description: META_DESCRIPTION,
  url: `${SITE_URL}/compare`,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', url: SITE_URL },
};

// ItemList built by mapping over the SHARED COMPARE_ENTRIES constant so a
// future eleventh comparison appended there surfaces automatically in
// both the grid and the schema. Each item.url is an absolute
// https://digitalcraftai.com URL (the e2e spec asserts this).
const ITEM_LIST_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Digital Craft AI Comparisons',
  description: META_DESCRIPTION,
  numberOfItems: COMPARE_ENTRIES.length,
  itemListElement: COMPARE_ENTRIES.map((entry, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `Digital Craft vs ${entry.tool}`,
    url: `${SITE_URL}${entry.path}`,
  })),
};

const CompareHub: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Compare Digital Craft AI to Your Current Stack | DigitalCraft AI</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/compare`} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(COLLECTION_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(ITEM_LIST_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero - one short heading, one supporting paragraph, no CTA above the grid. */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Scale size={16} />
            Comparison Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Compare Digital Craft to your current stack
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Every Digital Craft AI comparison page in one place. Pick the tool you already pay for
            to see how Digital Craft fits next to it - what each side wins on, where they overlap,
            and what most owners run together.
          </p>
        </div>
      </section>

      {/* Comparison grid */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPARE_ENTRIES.map((entry) => (
              <Link
                key={entry.id}
                to={entry.path}
                data-testid="compare-hub-card"
                onClick={() => trackCTAClick('open_comparison', `comparehub_${entry.id}`)}
                className="group flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Digital Craft vs {entry.tool}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                  {entry.tagline}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  See comparison
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

      {/* Footer note */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Each comparison is honest about what the other tool wins on. Most owners we work
            with run a CRM or field-service platform alongside Digital Craft AI, not instead
            of it.
          </p>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default CompareHub;

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import {
  ROADMAP_ENTRIES,
  ROADMAP_GENERATED_AT,
  ROADMAP_CADENCE_NOTE,
  type RoadmapArea,
  type RoadmapPriority,
  type RoadmapStatus,
} from '@/data/roadmapEntries';
import { CalendarClock, ArrowRight } from 'lucide-react';

// Ticket 0108 - Public /roadmap dated intended-ship-week page.
//
// Forward-looking sibling of the ticket 0032 /changelog page. Reads
// src/data/roadmapEntries.ts (auto-emitted at build time by
// scripts/generate-roadmap.ts from the groomed + in-progress backlog
// frontmatter) and renders a per-ticket table so a procurement reviewer
// can cite dated near-term work alongside the backward-looking changelog.
//
// Per the 2026-05-25 mirror-source rule, ROADMAP_CADENCE_NOTE is rendered
// as (a) the visible intro paragraph, (b) the Helmet meta description,
// and (c) the CollectionPage JSON-LD description - one string, three
// surfaces, no drift.
//
// Per the 2026-05-30 second-@type lesson, every predecessor
// CollectionPage / ItemList / BreadcrumbList predicate in tests/e2e is
// URL-scoped to its own hub path (grepped at branch head; result
// documented in the ticket Implementation log), so the sibling blocks
// scoped to /roadmap cannot collide with any shipped predicate.
//
// Per the 2026-05-25 SEO Pilot lesson, /roadmap is NOT in index.html's
// SEO Pilot table; the spec asserts the Helmet meta description directly
// and does NOT use toHaveTitle. Per the 2026-05-07 em-dash Hard NO,
// every string on this page uses hyphens (the generator also throws on
// an em-dash in any ticket title).

const PAGE_H1 = 'What We Are Shipping Next';
const PAGE_URL = 'https://digitalcraftai.com/roadmap';
const ORIGIN = 'https://digitalcraftai.com';
const COLLECTION_PAGE_NAME = 'Digital Craft AI Roadmap';
const META_DESCRIPTION = ROADMAP_CADENCE_NOTE;

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
    { '@type': 'ListItem', position: 2, name: 'Roadmap', item: PAGE_URL },
  ],
};

const COLLECTION_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: COLLECTION_PAGE_NAME,
  description: META_DESCRIPTION,
  url: PAGE_URL,
  inLanguage: 'en-US',
  dateModified: ROADMAP_GENERATED_AT,
  isPartOf: { '@type': 'WebSite', name: 'DigitalCraft AI', url: ORIGIN },
};

const ITEM_LIST_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: COLLECTION_PAGE_NAME,
  numberOfItems: ROADMAP_ENTRIES.length,
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  itemListElement: ROADMAP_ENTRIES.map((entry, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: entry.title,
  })),
};

// Tailwind chip colors per area. Every variant carries a `dark:` pair
// (AGENTS.md Hard NO). Mirrors the ticket 0032 /changelog page's palette
// scoped to the five roadmap-eligible areas.
const AREA_CHIP: Record<RoadmapArea, string> = {
  conversion: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  seo: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  content: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  trust: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  demos: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
};

const PRIORITY_CHIP: Record<RoadmapPriority, string> = {
  P0: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  P1: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  P2: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  P3: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_CHIP: Record<RoadmapStatus, string> = {
  'in-progress': 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  groomed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const Roadmap: React.FC = () => {
  const { content } = useContent();
  const entries = ROADMAP_ENTRIES;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Roadmap | What We Are Shipping Next | DigitalCraft AI</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Roadmap | DigitalCraft AI" />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(COLLECTION_PAGE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(ITEM_LIST_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      <main>
        <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <CalendarClock size={16} aria-hidden="true" />
              Forward-looking ship plan
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 text-gray-900 dark:text-white">
              {PAGE_H1}
            </h1>
            <p
              data-testid="roadmap-generated-at"
              className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-mono"
            >
              {`Generated: ${ROADMAP_GENERATED_AT}`}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {ROADMAP_CADENCE_NOTE}
            </p>
          </div>
        </section>

        <section className="py-12 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4 max-w-5xl">
            {entries.length === 0 ? (
              <div
                data-testid="roadmap-empty-state"
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-8 text-center text-gray-600 dark:text-gray-300"
              >
                No groomed tickets in the queue right now. Check the
                {' '}
                <Link to="/changelog" className="text-primary hover:underline">
                  changelog
                </Link>
                {' '}
                for what we shipped most recently; new groomed tickets land here as the groomer runs.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-700 dark:text-gray-200">
                      <th scope="col" className="px-4 py-3 font-semibold">Ticket id</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Title</th>
                      <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Priority</th>
                      <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Area</th>
                      <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Intended ship week</th>
                      <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr
                        key={entry.id}
                        data-testid="roadmap-entry-row"
                        className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 align-top"
                      >
                        <td className="px-4 py-3">
                          <code className="text-xs font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {entry.id}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100 leading-snug">
                          {entry.title}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_CHIP[entry.priority]}`}
                          >
                            {entry.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${AREA_CHIP[entry.area]}`}
                          >
                            {entry.area}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-600 dark:text-gray-400">
                          {entry.intendedShipWeek}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            data-testid="roadmap-row-status"
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CHIP[entry.status]}`}
                          >
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Want the receipt instead of the plan?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Shipped tickets live at /changelog, dated and grouped by month. Combined with this roadmap, both the forward and backward surfaces share one source of truth: the public backlog.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/changelog"
                data-testid="roadmap-changelog-link"
                onClick={() => trackCTAClick('view_changelog', 'roadmap_cta')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Shipped tickets live at /changelog
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/how-we-ship"
                data-testid="roadmap-how-we-ship-link"
                onClick={() => trackCTAClick('view_how_we_ship', 'roadmap_cta')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              >
                How we decide what to ship next
              </Link>
            </div>
          </div>
        </section>
      </main>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Roadmap;

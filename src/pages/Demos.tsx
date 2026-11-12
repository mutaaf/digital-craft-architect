import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { getRecentDemos, recordDemoVisit } from '@/utils/recentDemosStore';
import { ORG_NAME, ORG_URL } from '@/data/organizationSchema';
import WhatsNewSinceVisit from '@/components/WhatsNewSinceVisit';
import { Sparkles, ArrowRight, Phone } from 'lucide-react';

const SITE_URL = 'https://digitalcraftai.com';

// Ticket 0030 - single source of truth for the Demos hub meta description.
// Read by both the Helmet meta[name="description"] tag and the
// SoftwareApplication JSON-LD description field below, so a future copy edit
// cannot leave the schema stale (mirror-source rule per the 2026-05-25 lesson).
const DEMOS_META_DESCRIPTION =
  'Browse every live AI demo from DigitalCraft AI in one place: lead responders, smart estimates, deal analyzers, and voice agents across construction, real estate, healthcare, and more.';

import { DEMO_GROUPS } from '@/data/demoCatalog';

const TOTAL_DEMOS = DEMO_GROUPS.reduce((sum, g) => sum + g.demos.length, 0);

// ItemList structured data mirroring every rendered demo link, following the
// inline JSON-LD pattern used on the vertical pages (src/pages/Construction.tsx).
const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'DigitalCraft AI Live Demos',
  description: 'Every live, interactive AI demo available across DigitalCraft AI verticals.',
  numberOfItems: TOTAL_DEMOS,
  itemListElement: DEMO_GROUPS.flatMap((group) => group.demos).map((demo, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: `${demo.title} (${
      DEMO_GROUPS.find((g) => g.demos.some((d) => d.path === demo.path))?.vertical ?? ''
    })`,
    url: `${SITE_URL}${demo.path}`,
  })),
};

// Ticket 0030 - SoftwareApplication structured data for the /demos hub. The
// catalog already emits an ItemList; this restates it as a single software
// application a buyer can evaluate free, which is the Google-preferred shape
// for "free AI demo" rich-result eligibility. provider is an inline
// Organization reference sourced from src/data/organizationSchema.ts so the
// homepage Organization entity and this provider share one identity (no
// duplicate literals, mirror-source rule per the 2026-05-25 lesson).
// Built at module top so React does not re-stringify on every render; the
// runtime-only description is spread in at render time below.
const SOFTWARE_APPLICATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Digital Craft AI Demos',
  url: `${SITE_URL}/demos`,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  provider: {
    '@type': 'Organization',
    name: ORG_NAME,
    url: ORG_URL,
  },
  offers: {
    '@type': 'Offer',
    // price is the string "0", not the number 0, so JSON-LD validators that
    // require schema.org Number-as-string semantics accept it. The test
    // explicitly asserts typeof === 'string'.
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
} as const;

const Demos: React.FC = () => {
  const { content } = useContent();
  // Snapshot read on mount; the recap is stable for the page lifetime since
  // recordDemoVisit fires AFTER navigation away from /demos.
  const recent = getRecentDemos();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>All Live AI Demos | Try Every Tool by Industry | DigitalCraft AI</title>
        <meta name="description" content={DEMOS_META_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/demos`} />
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
        {/* Ticket 0030 - SoftwareApplication JSON-LD. description is spread in
            at render time from DEMOS_META_DESCRIPTION so it mirrors the meta
            description above; a copy edit propagates to both in one render. */}
        <script type="application/ld+json">
          {JSON.stringify({ ...SOFTWARE_APPLICATION_SCHEMA, description: DEMOS_META_DESCRIPTION })}
        </script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Live Demo Catalog
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Every Demo, <span className="text-primary">In One Place</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Try {TOTAL_DEMOS} live AI tools across {DEMO_GROUPS.length} industries. Each one runs in
            your browser with no signup, and most can be personalized to your own company in seconds.
          </p>
        </div>
      </section>

      {/* Vertical jump nav */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {DEMO_GROUPS.map((group) => (
              <a
                key={group.vertical}
                href={`#${group.vertical.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              >
                {group.vertical}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Ticket 0040 - "What's new since you visited" delta strip */}
      <WhatsNewSinceVisit />

      {/* Recently viewed recap (returning visitors only) */}
      {recent.length > 0 && (
        <section
          data-testid="recent-demos-recap"
          className="py-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
        >
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
              Recently viewed
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((entry) => (
                <Link
                  key={entry.path}
                  to={entry.path}
                  data-testid="recent-demo-card"
                  onClick={() => trackCTAClick('recent_demo', 'demos_hub_recap')}
                  className="group flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all"
                >
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {entry.title}
                  </h3>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                    {entry.vertical}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Try it again
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
      )}

      {/* Demo groups */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-5xl space-y-14">
          {DEMO_GROUPS.map((group) => {
            const anchor = group.vertical.toLowerCase().replace(/\s+/g, '-');
            return (
              <div key={group.vertical} id={anchor} className="scroll-mt-28">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {group.vertical}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.demos.map((demo) => (
                    <Link
                      key={demo.path}
                      to={demo.path}
                      onClick={() => {
                        trackCTAClick('open_demo', `demos_hub_${anchor}`);
                        recordDemoVisit(demo.path, demo.title, group.vertical);
                      }}
                      className="group flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {demo.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                        {demo.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Try it
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Want These Built for Your Business?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            These demos show what is possible. Book a free call and we will tailor the right ones to
            your company, or browse the industry pages to see how they fit together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_a_call', 'demos_cta')}
            >
              <Phone size={18} />
              Book a Free Discovery Call
            </a>
            <Link
              to="/industries"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('view_industries', 'demos_cta')}
            >
              Browse Industries
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Demos;

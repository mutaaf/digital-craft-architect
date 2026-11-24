import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { getRecentDemos, recordDemoVisit } from '@/utils/recentDemosStore';
import { ORG_NAME, ORG_URL } from '@/data/organizationSchema';
import WhatsNewSinceVisit from '@/components/WhatsNewSinceVisit';
import { ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen overflow-x-clip bg-white text-[#1d1d1f]">
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

      {/* keynote pass (2026-11-12): one promise, a sticky industry strip, every demo as a tile */}
      <section className="px-5 pb-14 pt-28 text-center md:pb-20 md:pt-40">
        <div className="v3-rise mb-4 text-[17px] font-semibold text-aurora md:text-[21px]" style={{ '--i': 0 } as React.CSSProperties}>{TOTAL_DEMOS} live demos</div>
        <h1 className="v3-rise k-hero mx-auto mb-6 max-w-[12ch]" style={{ '--i': 1 } as React.CSSProperties}>Try every one.</h1>
        <p className="v3-rise k-lead mx-auto max-w-[32ch]" style={{ '--i': 2 } as React.CSSProperties}>{DEMO_GROUPS.length} industries. Runs in your browser. No signup.</p>
      </section>

      {/* Vertical jump nav */}
      <nav aria-label="Jump to an industry" className="sticky top-16 z-30 border-y border-[#e8e8ed] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] gap-1 overflow-x-auto px-5 py-2.5 [scrollbar-width:none] md:justify-center [&::-webkit-scrollbar]:hidden">
          {DEMO_GROUPS.map((group) => (
            <a
              key={group.vertical}
              href={`#${group.vertical.toLowerCase().replace(/\s+/g, '-')}`}
              className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[14px] text-[#424245] transition-colors hover:bg-black/5"
            >
              {group.vertical}
            </a>
          ))}
        </div>
      </nav>

      {/* Ticket 0040 - "What's new since you visited" delta strip */}
      <WhatsNewSinceVisit />

      {/* Recently viewed recap (returning visitors only) */}
      {recent.length > 0 && (
        <section data-testid="recent-demos-recap" className="mx-auto max-w-[1180px] px-5 pt-16">
          <h2 className="mb-6 text-[28px] font-semibold tracking-[-0.03em]">Pick up where you left off.</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((entry) => (
              <Link
                key={entry.path}
                to={entry.path}
                data-testid="recent-demo-card"
                onClick={() => trackCTAClick('recent_demo', 'demos_hub_recap')}
                className="group flex h-full flex-col rounded-[24px] border border-[#e8e8ed] bg-white p-7 transition-colors hover:border-aurora"
              >
                <span className="mb-1 text-[13px] font-semibold text-aurora">{entry.vertical}</span>
                <h3 className="mb-6 text-[20px] font-semibold tracking-[-0.02em]">{entry.title}</h3>
                <span className="k-link mt-auto">Try it again <ChevronRight size={18} strokeWidth={2.2} className="mt-px" /></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Demo groups */}
      <div className="mx-auto max-w-[1180px] space-y-24 px-5 py-20 md:space-y-32 md:py-28">
        {DEMO_GROUPS.map((group) => {
          const anchor = group.vertical.toLowerCase().replace(/\s+/g, '-');
          return (
            <section key={group.vertical} id={anchor} className="scroll-mt-32">
              <h2 className="mb-8 text-[36px] font-semibold tracking-[-0.035em] md:mb-10 md:text-[48px]">{group.vertical}.</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
                {group.demos.map((demo) => (
                  <Link
                    key={demo.path}
                    to={demo.path}
                    onClick={() => {
                      trackCTAClick('open_demo', `demos_hub_${anchor}`);
                      recordDemoVisit(demo.path, demo.title, group.vertical);
                    }}
                    className="k-tile group flex h-full min-h-[230px] flex-col p-8 transition-colors hover:bg-[#ececf0]"
                  >
                    <h3 className="mb-2 text-[22px] font-semibold leading-[1.15] tracking-[-0.025em]">{demo.title}</h3>
                    <p className="flex-1 text-[16px] leading-relaxed text-[#6e6e73]">{demo.description}</p>
                    <span className="k-link mt-6">Try it <ChevronRight size={18} strokeWidth={2.2} className="mt-px transition-transform group-hover:translate-x-0.5" /></span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA */}
      <section className="bg-[#f5f5f7] px-5 py-28 text-center md:py-40">
        <h2 className="k-h2 mx-auto mb-5 max-w-[14ch]">Want these built for you?</h2>
        <p className="k-lead mx-auto mb-10 max-w-[30ch]">Thirty minutes. We pick the ones that pay you back first.</p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" className="k-pill k-pill-dark" onClick={() => trackCTAClick('book_a_call', 'demos_cta')}>Book a call</a>
          <Link to="/industries" className="k-link" onClick={() => trackCTAClick('view_industries', 'demos_cta')}>Browse industries <ChevronRight size={18} strokeWidth={2.2} className="mt-px" /></Link>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Demos;

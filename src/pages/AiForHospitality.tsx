import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ROUTES } from '@/data/routes';
import { Hotel, ArrowRight, ShieldCheck, BookOpen, ClipboardList } from 'lucide-react';

// Ticket 0071 - Public /ai-for-hospitality multi-vertical hub indexing the
// five hospitality-adjacent verticals that already ship demos: events,
// restaurant, kidsplay, salon, fitness. Page shell mirrored from
// src/pages/CompareHub.tsx (ticket 0048, the closest peer because both are
// cross-family hubs emitting CollectionPage + ItemList JSON-LD over a
// fixed grid) and NOT from any single-trade AiForX (those are
// single-vertical landing pages).
//
// 2026-05-25 mirror-source rule: META_DESCRIPTION and PAGE_H1 are the
// single constants the Helmet meta AND the JSON-LD read from.
// 2026-05-07 em-dash Hard NO: every string uses hyphens.

const SITE_URL = 'https://digitalcraftai.com';

export const PAGE_H1 = 'AI for Hospitality Businesses';

export const META_DESCRIPTION =
  'One hub for AI in hospitality. Compare Digital Craft AI demos across events, restaurant, kids-play, salon, and fitness verticals - front-of-house inquiry response, booking flow, follow-up, and review capture, live and personalized to your brand.';

export interface HospitalityVertical {
  id: string;
  label: string;
  path: string;
  demoPath: string;
  summary: string;
  demoCount: number;
}

const V = (
  id: string,
  label: string,
  path: string,
  demoPath: string,
  summary: string,
): HospitalityVertical => ({
  id,
  label,
  path,
  demoPath,
  summary,
  demoCount: ROUTES.filter((r) => r.startsWith(demoPath + '/')).length,
});

// The five hospitality-adjacent verticals. Each path + demoPath MUST match
// a string in the imported ROUTES array (asserted at module load below).
// demoCount is computed from ROUTES at module load, so a new demo landing
// under any of the five demoPath prefixes automatically increments both
// the card chip and the schema numberOfItems.
export const HOSPITALITY_VERTICALS: readonly HospitalityVertical[] = [
  V('events', 'Events', '/events', '/events/demo',
    'Answer every event-venue inquiry in seconds, qualify budget and date, and book walkthroughs on autopilot.'),
  V('restaurant', 'Restaurant', '/restaurant', '/restaurant/demo',
    'Handle reservations, catering leads, and review capture so the front-of-house team can stay on the floor.'),
  V('kidsplay', 'Kids-Play', '/kidsplay', '/kidsplay/demo',
    'Turn birthday-party inquiries into confirmed bookings with instant package matching and voice follow-up.'),
  V('salon', 'Salon', '/salon', '/salon/demo',
    'Book new clients around the stylist calendar and voice-rebook the lapsed ones without lifting the phone.'),
  V('fitness', 'Fitness', '/fitness', '/fitness/demo',
    'Qualify new-member leads, price membership options, and rescue at-risk retention with a voice win-back.'),
];

// Module-load ROUTES allow-list validation per the 2026-06-07 lesson.
const _validVerticals = HOSPITALITY_VERTICALS.every(
  (v) => ROUTES.includes(v.path) && ROUTES.includes(v.demoPath),
);
if (!_validVerticals) {
  throw new Error(
    'AiForHospitality: HOSPITALITY_VERTICALS references a path missing from ROUTES; update src/data/routes.ts',
  );
}

const TRUST_ARTIFACTS = [
  { href: '/trust', label: 'Trust page',
    reason: 'How the AI is built, what data it touches, and what stays on-prem.',
    Icon: ShieldCheck },
  { href: '/playbook', label: 'Playbook',
    reason: 'The exact automation playbook we run, so your ops partner can audit it before you buy.',
    Icon: BookOpen },
  { href: '/questions-to-ask-an-ai-vendor', label: 'Vendor questions',
    reason: 'The 25 questions to ask any AI vendor. Bring them to the strategy call and score us.',
    Icon: ClipboardList },
] as const;

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: PAGE_H1, item: `${SITE_URL}/ai-for-hospitality` },
  ],
};

const COLLECTION_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: PAGE_H1,
  description: META_DESCRIPTION,
  url: `${SITE_URL}/ai-for-hospitality`,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', url: SITE_URL },
};

const ITEM_LIST_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: PAGE_H1,
  description: META_DESCRIPTION,
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  numberOfItems: HOSPITALITY_VERTICALS.length,
  itemListElement: HOSPITALITY_VERTICALS.map((v, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: v.label,
    url: `${SITE_URL}${v.demoPath}`,
  })),
};

const AiForHospitality: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Hospitality Businesses | DigitalCraft AI</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/ai-for-hospitality`} />
        <meta property="og:title" content={PAGE_H1} />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}/ai-for-hospitality`} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(COLLECTION_PAGE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(ITEM_LIST_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Hotel size={16} />
            Hospitality Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Every hospitality-adjacent vertical Digital Craft AI ships demos for, in one place.
            Events, restaurant, kids-play, salon, and fitness all share the same front-of-house
            pattern: fast inquiry response, a booking flow, a follow-up, and review capture.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOSPITALITY_VERTICALS.map((v) => (
              <article
                key={v.id}
                data-testid="hospitality-vertical-card"
                className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{v.label}</h3>
                  <span className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs font-medium px-2.5 py-1">
                    {v.demoCount} live demo{v.demoCount === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                  {v.summary}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    to={v.demoPath}
                    data-testid="hospitality-vertical-demo-link"
                    onClick={() => trackCTAClick(`hospitality_hub_card_${v.id}`, 'ai-for-hospitality')}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    See the demos <ArrowRight size={16} />
                  </Link>
                  <Link
                    to={v.path}
                    data-testid="hospitality-vertical-page-link"
                    onClick={() => trackCTAClick(`hospitality_hub_page_${v.id}`, 'ai-for-hospitality')}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                  >
                    Read the vertical page
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Why hospitality buyers pick Digital Craft
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRUST_ARTIFACTS.map(({ href, label, reason, Icon }) => (
              <Link
                key={href}
                to={href}
                onClick={() => trackCTAClick(`hospitality_hub_trust_${label.toLowerCase().replace(/\s+/g, '_')}`, 'ai-for-hospitality')}
                className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 hover:border-primary dark:hover:border-primary transition-colors"
              >
                <Icon className="text-primary mb-3" size={22} />
                <span className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{reason}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Bring the shortlist to a 20-minute strategy call
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Forward this hub to your operations partner, pick the two verticals that matter
            most, and we will map the front-of-house automation for your specific portfolio.
          </p>
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick('hospitality_hub_strategy_call', 'ai-for-hospitality')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-6 py-3 text-base font-semibold hover:bg-primary/90 transition-colors"
          >
            Book a strategy call <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default AiForHospitality;

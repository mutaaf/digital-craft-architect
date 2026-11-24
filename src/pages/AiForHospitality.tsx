import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { trackCTAClick } from '@/utils/analytics';
import { ROUTES } from '@/data/routes';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Hotel, ShieldCheck, BookOpen, ClipboardList } from 'lucide-react';
import { SeoShell, SeoHero, SeoClose, Chev } from '@/v3/SeoLanding';
import { CALENDLY } from '@/v3/verticals';
import type { PhoneScript } from '@/v3/PhoneDemo';

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

// The product shot: an illustration of a party inquiry answered and booked (no prices, no client).
const PHONE: PhoneScript = {
  contact: 'Erin S.',
  initials: 'ES',
  inbound: 'Do you have a Saturday open for a birthday party? About 12 kids.',
  reply: 'We do. Saturday at 11 or 2. Which works better for you?',
  followIn: '2 please',
  confirm: 'You’re booked Saturday at 2. I’ll send the party details and a reminder Friday.',
  booked: 'Booked · Sat 2:00 PM',
  bookedDetail: 'Birthday party for 12 · on your calendar',
};

// Keynote layout (src/v3/SeoLanding.tsx blocks): the promise, the five businesses, the receipts, one close.
const AiForHospitality: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-hospitality', label: VERTICAL_LABELS['/ai-for-hospitality'] });

  return (
    <>
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
      <SeoShell>
        <SeoHero
          icon={Hotel}
          name={PAGE_H1}
          headline="Every guest inquiry. Answered."
          lead="Events, restaurants, kids play, salons and fitness. Answer fast, book it, follow up, ask for the review."
          phone={PHONE}
          actions={<>
            <a href="#businesses" className="k-pill k-pill-brand">Pick your business</a>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_call', 'hospitality_hero')} className="k-link">Book a call <Chev /></a>
          </>}
        />

        {/* the five businesses, each with its live demos */}
        <section id="businesses" className="mt-28 scroll-mt-16 bg-[#f5f5f7] px-5 py-28 md:mt-40 md:py-40">
          <div className="mx-auto max-w-[1180px]">
            <h2 className="k-in k-h2 mb-4 text-center">Pick your business.</h2>
            <p className="k-in k-lead mx-auto mb-14 max-w-[30ch] text-center md:mb-20">Live demos for each. No signup.</p>
            <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {HOSPITALITY_VERTICALS.map((v) => (
                <article key={v.id} data-testid="hospitality-vertical-card" className="k-in flex min-h-[300px] flex-col rounded-[28px] bg-white p-9 md:p-10">
                  <span className="mb-8 self-start rounded-full bg-[var(--v3-aurora-wash)] px-3 py-1 text-[14px] font-semibold text-aurora">
                    {v.demoCount} live demo{v.demoCount === 1 ? '' : 's'}
                  </span>
                  <h3 className="mb-3 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[32px]">{v.label}</h3>
                  <p className="mb-8 text-[17px] leading-snug text-[#6e6e73]">{v.summary}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2">
                    <Link
                      to={v.demoPath}
                      data-testid="hospitality-vertical-demo-link"
                      onClick={() => trackCTAClick(`hospitality_hub_card_${v.id}`, 'ai-for-hospitality')}
                      className="k-link"
                    >
                      See the demos <Chev />
                    </Link>
                    <Link
                      to={v.path}
                      data-testid="hospitality-vertical-page-link"
                      onClick={() => trackCTAClick(`hospitality_hub_page_${v.id}`, 'ai-for-hospitality')}
                      className="text-[15px] text-[#6e6e73] hover:text-[#1d1d1f]"
                    >
                      Read the industry page
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* check our work before you call */}
        <section className="mx-auto max-w-[1180px] px-5 py-28 md:py-40">
          <h2 className="k-in k-h2 mx-auto mb-14 max-w-[14ch] text-center md:mb-20">Check our work first.</h2>
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {TRUST_ARTIFACTS.map(({ href, label, reason, Icon }) => (
              <Link
                key={href}
                to={href}
                onClick={() => trackCTAClick(`hospitality_hub_trust_${label.toLowerCase().replace(/\s+/g, '_')}`, 'ai-for-hospitality')}
                className="k-in k-tile group flex min-h-[260px] flex-col p-9 transition-colors hover:bg-[#ececf0] md:p-10"
              >
                <span className="mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-white text-aurora" aria-hidden><Icon size={24} /></span>
                <h3 className="mb-2 text-[24px] font-semibold tracking-[-0.025em]">{label}</h3>
                <p className="mb-6 text-[17px] leading-snug text-[#6e6e73]">{reason}</p>
                <span className="k-link mt-auto">Read it <Chev /></span>
              </Link>
            ))}
          </div>
        </section>

        <SeoClose title="Bring the shortlist." line="Twenty minutes. Pick the two businesses that matter most and we map the rest.">
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick('hospitality_hub_strategy_call', 'ai-for-hospitality')}
            className="k-pill bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
          >
            Book a strategy call
          </a>
        </SeoClose>
      </SeoShell>
    </>
  );
};

export default AiForHospitality;

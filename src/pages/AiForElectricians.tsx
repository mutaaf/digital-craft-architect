import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Zap } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Long-tail landing page for the "AI for electricians" query class. Reuses
// the two existing home-services demos verbatim and links to the existing
// /homeservices pricing tiers - no new demo, no new backend, no new pricing.
// Modeled on src/pages/AiForRoofers.tsx per ticket 0034 engineering notes
// (the most recent peer in the trade-quartet pattern).

// 2026-05-25 mirror-source rule: every string used in the hero H1, the
// Helmet description, and the Service schema description lives as a single
// shared constant inside this module so a later copy edit cannot drift the
// visible text and the structured data apart.
const META_DESCRIPTION =
  'AI for electrical contractors: after-hours service-call capture, instant on-site quotes for panel upgrades and EV-charger installs, and automated review collection. Live demos built for electricians - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, on-site quoting assistance, and review automation built for electrical contractors. After-hours service-call response, instant quote follow-up on panel upgrades and EV-charger installs, and review collection that never forgets.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Electricians',
      item: 'https://digitalcraftai.com/ai-for-electricians',
    },
  ],
};

// Sibling Service schema mirroring the AiForRoofers pattern, with
// serviceType naming electrical contractors per ticket acceptance criteria.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Electricians',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Electrical Contractors',
  url: 'https://digitalcraftai.com/ai-for-electricians',
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'electricians',
  vertical: 'homeservices',
  icon: Zap,
  name: 'AI for Electrical Contractors',
  headline: 'The Saturday service call. Booked.',
  lead: 'After-hours service calls answered, panel and EV-charger quotes sent, reviews asked for.',
  phone: {
    contact: 'Lena R.',
    initials: 'LR',
    inbound: 'Breaker keeps tripping and half the house has no power. Can someone come out?',
    reply: 'Sorry, that’s no fun. I can get an electrician there today at 4 or tomorrow at 9. Which works?',
    followIn: 'Today at 4',
    confirm: 'Booked for 4:00 PM today. Leave that breaker off until we get there.',
    booked: 'Booked · Today 4:00 PM',
    bookedDetail: 'Breaker service call · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the electrical demo', track: ['try_demo', 'electricians_hero_lead_responder'] },
  book: ['book_call', 'electricians_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'After-hours calls hit voicemail.', line: 'A tripped breaker at 9pm goes to whoever answers first.' },
    { title: 'Panel and EV-charger quotes lag.', line: 'A quote three days after the walkthrough loses to a same-day range.' },
    { title: 'Reviews slip off the list.', line: 'Ask the afternoon the truck rolls out, not next week.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the problem, the urgency and the address, then books the truck.', kind: 'chat', location: 'electricians_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Estimates in minutes.', line: 'Service calls, panel upgrades, EV chargers and rewires.', kind: 'quote', location: 'electricians_estimate' },
  ],
  job: { label: 'Your average job', value: 600 },
  close: {
    book: ['book_call', 'electricians_bottom'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the estimate demo', track: ['try_demo', 'electricians_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForElectricians: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-electricians', label: VERTICAL_LABELS['/ai-for-electricians'] });

  return (
    <>
      <Helmet>
        <title>AI for Electrical Contractors | After-Hours Call Capture & Instant Estimates</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Electrical Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for electrical contractors: never miss an after-hours service call, follow up on panel and EV-charger quotes the same day, and chase every 5-star review. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-electricians" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForElectricians;

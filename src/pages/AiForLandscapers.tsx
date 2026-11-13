import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { TreePine } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Long-tail landing page for the "AI for landscapers" query class. Reuses
// the two existing home-services demos verbatim and links to the existing
// /homeservices pricing tiers - no new demo, no new backend, no new pricing.
// Modeled on src/pages/AiForElectricians.tsx per ticket 0041 engineering notes
// (the closest peer in the trade-quintet pattern).

// 2026-05-25 mirror-source rule: every string used in the hero H1, the
// Helmet description, and the Service schema description lives as a single
// shared constant inside this module so a later copy edit cannot drift the
// visible text and the structured data apart.
const META_DESCRIPTION =
  'AI for landscape contractors: after-hours and weekend spring-cleanup quote capture, instant maintenance-contract bid follow-up, and automated review collection after a finished install. Live demos built for landscapers - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI lead capture, on-site quoting assistance, and review automation built for landscape contractors. Spring-cleanup and lawn-renovation request response, same-day maintenance-contract bid follow-up, and review collection that never forgets the install that just wrapped.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Landscapers',
      item: 'https://digitalcraftai.com/ai-for-landscapers',
    },
  ],
};

// Sibling Service schema mirroring the AiForElectricians pattern, with
// serviceType naming landscape contractors per ticket acceptance criteria.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Landscapers',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Landscape Contractors',
  url: 'https://digitalcraftai.com/ai-for-landscapers',
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'landscapers',
  vertical: 'homeservices',
  icon: TreePine,
  name: 'AI for Landscape Contractors',
  headline: 'Spring cleanup season. Every quote answered.',
  lead: 'Cleanup requests answered, maintenance-contract bids sent fast, reviews asked for.',
  phone: {
    contact: 'Mark H.',
    initials: 'MH',
    inbound: 'Looking for a spring cleanup and weekly mowing. Do you have openings?',
    reply: 'We do. Someone can walk the yard Tuesday at 4 or Saturday at 9. Which works?',
    followIn: 'Saturday at 9',
    confirm: 'Booked for Saturday at 9. We’ll price the cleanup and a weekly plan on site.',
    booked: 'Booked · Sat 9:00 AM',
    bookedDetail: 'Cleanup and mowing walkthrough · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the landscaping demo', track: ['try_demo', 'landscapers_hero_lead_responder'] },
  book: ['book_call', 'landscapers_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'Spring-cleanup calls go unanswered.', line: 'The first warm Saturday, the crew is out and the phone rings.' },
    { title: 'Maintenance bids take days.', line: 'A slow bid hands a season of mowing to another crew.' },
    { title: 'Reviews never get asked for.', line: 'Ask the afternoon the install is finished.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every lead.', line: 'Qualifies the property and the service, then books the walkthrough.', kind: 'chat', location: 'landscapers_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Bids in minutes.', line: 'Cleanups, maintenance contracts, hardscape and irrigation.', kind: 'quote', location: 'landscapers_estimate' },
  ],
  job: { label: 'Your average job', value: 3000 },
  close: {
    book: ['book_call', 'landscapers_bottom'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the estimate demo', track: ['try_demo', 'landscapers_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForLandscapers: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-landscapers', label: VERTICAL_LABELS['/ai-for-landscapers'] });

  return (
    <>
      <Helmet>
        <title>AI for Landscape Contractors | Spring-Cleanup Capture & Instant Bids</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Landscape Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for landscape contractors: never miss a spring-cleanup quote, follow up on maintenance-contract bids the same day, and chase every 5-star review after a finished install. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-landscapers" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForLandscapers;

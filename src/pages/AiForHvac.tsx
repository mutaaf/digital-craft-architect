import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Wind } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Long-tail landing page for the "AI for HVAC" query class. Reuses the two
// existing home-services demos verbatim and links to the existing
// /homeservices pricing tiers - no new demo, no new backend, no new pricing.
// Modeled on src/pages/AiForPlumbers.tsx per ticket 0020 engineering notes.

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for HVAC',
      item: 'https://digitalcraftai.com/ai-for-hvac',
    },
  ],
};

// Sibling Service schema mirroring the AiForPlumbers pattern, with
// serviceType naming HVAC per ticket acceptance criteria.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for HVAC Contractors',
  description:
    'AI call capture, on-site quoting assistance, and review automation built for HVAC contractors. After-hours no-heat and no-AC response, instant maintenance-plan and equipment-swap estimates, and follow-up that never forgets.',
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for HVAC Contractors',
  url: 'https://digitalcraftai.com/ai-for-hvac',
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'hvac',
  vertical: 'homeservices',
  icon: Wind,
  name: 'AI for HVAC Contractors',
  headline: 'No heat at 11pm. Booked.',
  lead: 'After-hours calls answered, maintenance and equipment quotes sent, reviews asked for.',
  phone: {
    contact: 'Sarah M.',
    initials: 'SM',
    inbound: 'Our furnace quit and it’s 40 degrees out. Can someone come tomorrow?',
    reply: 'Sorry, that’s a cold night. I can get a tech to you tomorrow at 8 or 11. Which works?',
    followIn: '8 please',
    confirm: 'You’re booked for 8:00 AM. The tech will text when they’re on the way.',
    booked: 'Booked · Tomorrow 8:00 AM',
    bookedDetail: 'No-heat service call · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the HVAC demo', track: ['try_demo', 'hvac_hero_lead_responder'] },
  book: ['book_call', 'hvac_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'No-heat calls hit voicemail.', line: 'A dead furnace at 11pm books with whoever answers first.' },
    { title: 'Quotes take too long.', line: 'Maintenance plans and equipment swaps priced by hand lose to a fast text.' },
    { title: 'The review window closes.', line: 'Ask before the van leaves the driveway, or the moment is gone.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the system, the symptom and the urgency, then books it.', kind: 'chat', location: 'hvac_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Tune-ups, repairs, maintenance plans and equipment swaps.', kind: 'quote', location: 'hvac_estimate' },
  ],
  job: { label: 'Your average job', value: 800 },
  close: {
    book: ['book_call', 'hvac_bottom'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the estimate demo', track: ['try_demo', 'hvac_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForHvac: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-hvac', label: VERTICAL_LABELS['/ai-for-hvac'] });

  return (
    <>
      <Helmet>
        <title>AI for HVAC Contractors | After-Hours Call Capture & Instant Estimates</title>
        <meta
          name="description"
          content="AI for HVAC contractors: after-hours no-heat and no-AC call capture, instant maintenance-plan and equipment-swap estimates, and automated review collection. Live demos built for HVAC companies - try in under 60 seconds."
        />
        <meta property="og:title" content="AI for HVAC Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for HVAC contractors: never miss a no-heat or no-AC after-hours call, quote maintenance plans and equipment swaps on the spot, and chase every 5-star review. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-hvac" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForHvac;

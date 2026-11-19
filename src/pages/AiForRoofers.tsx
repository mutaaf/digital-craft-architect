import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Home } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Long-tail landing page for the "AI for roofers" query class. Reuses the two
// existing home-services demos verbatim and links to the existing
// /homeservices pricing tiers - no new demo, no new backend, no new pricing.
// Modeled on src/pages/AiForHvac.tsx per ticket 0024 engineering notes.

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Roofers',
      item: 'https://digitalcraftai.com/ai-for-roofers',
    },
  ],
};

// Sibling Service schema mirroring the AiForHvac pattern, with serviceType
// naming roofing per ticket acceptance criteria.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Roofing Contractors',
  description:
    'AI call capture, on-site quoting assistance, and review automation built for roofing contractors. Storm-week and after-hours call response, instant inspection and claim-supplement quote follow-up, and review collection that never forgets.',
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Roofing Contractors',
  url: 'https://digitalcraftai.com/ai-for-roofers',
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'roofers',
  vertical: 'homeservices',
  icon: Home,
  name: 'AI for Roofing Contractors',
  headline: 'Storm week. Every call answered.',
  lead: 'Storm-surge calls answered, inspection and claim quotes sent fast, reviews asked for.',
  phone: {
    contact: 'Tom B.',
    initials: 'TB',
    inbound: 'Hail last night and I think we lost shingles. Can someone look at the roof?',
    reply: 'Sorry about the storm. We can inspect tomorrow at 10 or Thursday at 2. Which works?',
    followIn: 'Tomorrow at 10',
    confirm: 'You’re set for tomorrow at 10. We’ll photograph everything for your insurance claim.',
    booked: 'Booked · Tomorrow 10:00 AM',
    bookedDetail: 'Storm-damage inspection · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the roofing demo', track: ['try_demo', 'roofers_hero_lead_responder'] },
  book: ['book_call', 'roofers_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'Storm week swamps the phone.', line: 'Homeowners who don’t get through call the next roofer.' },
    { title: 'Estimates sit for days.', line: 'Inspection done, quote not sent. The job goes to whoever texts first.' },
    { title: 'No one asks for the review.', line: 'The best moment is the afternoon the crew rolls out.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the damage and the claim, then books the inspection.', kind: 'chat', location: 'roofers_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Estimates the same day.', line: 'Repairs, replacements and claim supplements, priced as a range.', kind: 'quote', location: 'roofers_estimate' },
  ],
  job: { label: 'Your average job', value: 12000 },
  close: {
    book: ['book_call', 'roofers_bottom'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the estimate demo', track: ['try_demo', 'roofers_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForRoofers: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-roofers', label: VERTICAL_LABELS['/ai-for-roofers'] });

  return (
    <>
      <Helmet>
        <title>AI for Roofing Contractors | Storm-Week Call Capture & Instant Estimates</title>
        <meta
          name="description"
          content="AI for roofing contractors: storm-week call capture, instant inspection and claim-supplement quote follow-up, and automated review collection. Live demos built for roofing companies - try in under 60 seconds."
        />
        <meta property="og:title" content="AI for Roofing Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for roofing contractors: never miss a storm-week call, follow up on inspection and claim-supplement quotes the same day, and chase every 5-star review. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-roofers" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForRoofers;

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Droplets } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Long-tail landing page for the "AI for plumbers" query class. Reuses the two
// existing home-services demos verbatim and links to the existing
// /homeservices pricing tiers - no new demo, no new backend, no new pricing.
// Modeled on src/pages/locations/Texas.tsx per ticket 0017 engineering notes.

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Plumbers',
      item: 'https://digitalcraftai.com/ai-for-plumbers',
    },
  ],
};

// Sibling Service schema mirroring src/pages/HomeServices.tsx around line 251,
// with serviceType naming plumbing per ticket acceptance criteria.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Plumbers',
  description:
    'AI call capture, on-site quoting assistance, and review automation built for plumbing companies. After-hours lead response, instant estimates, and follow-up that never forgets.',
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Plumbing Companies',
  url: 'https://digitalcraftai.com/ai-for-plumbers',
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'plumbers',
  vertical: 'homeservices',
  icon: Droplets,
  name: 'AI for Plumbers',
  headline: 'The 9pm call. Booked.',
  lead: 'After-hours calls answered, estimates sent, reviews asked for. While your techs work.',
  phone: {
    contact: 'Dan K.',
    initials: 'DK',
    inbound: 'Pipe under the kitchen sink just burst. Can anyone come tonight?',
    reply: 'So sorry. Shut the valve under the sink for now. I can get a plumber there by 8 tonight or 7 tomorrow. Which works?',
    followIn: 'Tonight please',
    confirm: 'Done. A plumber will be there by 8 tonight. You’ll get a text when they’re on the way.',
    booked: 'Booked · Tonight 8:00 PM',
    bookedDetail: 'Burst pipe repair · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the plumbing demo', track: ['try_demo', 'plumbers_hero_lead_responder'] },
  book: ['book_call', 'plumbers_hero'],
  painTitle: 'Three leaks. Closed.',
  pains: [
    { title: 'After hours, nobody answers.', line: 'Burst pipes don’t wait for Monday. A missed 9pm call goes to the next shop.' },
    { title: 'Quotes take a tech off the road.', line: 'Pricing a re-pipe by hand at the kitchen table is a second call not run.' },
    { title: 'Reviews nobody asks for.', line: 'The moment to ask closes when the truck leaves the driveway.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the leak, the address and the urgency, then books it.', kind: 'chat', location: 'plumbers_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Estimates on the spot.', line: 'Fixtures, water heaters, re-pipes and drains, priced as a range.', kind: 'quote', location: 'plumbers_estimate' },
  ],
  job: { label: 'Your average job', value: 600 },
  close: {
    book: ['book_call', 'plumbers_bottom'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the estimate demo', track: ['try_demo', 'plumbers_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForPlumbers: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-plumbers', label: VERTICAL_LABELS['/ai-for-plumbers'] });

  return (
    <>
      <Helmet>
        <title>AI for Plumbers | After-Hours Call Capture & Instant Plumbing Estimates</title>
        <meta
          name="description"
          content="AI for plumbers: after-hours call capture, instant on-site estimates, and automated review collection. Live demos built for plumbing companies - try in under 60 seconds."
        />
        <meta property="og:title" content="AI for Plumbers | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for plumbing companies: never miss an after-hours call, quote on the spot, and chase every 5-star review. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-plumbers" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForPlumbers;

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Waves } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Ticket 0058 - long-tail landing page for the "AI for pool service" query
// class. Reuses the three existing home-services demos verbatim. Modeled on
// src/pages/AiForPestControl.tsx (ticket 0056) per the ticket engineering
// notes; NOT on AiForPropertyManagers.tsx (routes to /realestate/demo/*).
// Industry-standard market context only (PHTA / Pool & Hot Tub Alliance
// market write-ups; not DCA client results), no invented testimonials.
// Emits BreadcrumbList JSON-LD only - no sibling Service block per the ticket
// Out of Scope and the ticket 0056 precedent. The Helmet meta description and
// the JSON-LD read from shared module-level constants per the 2026-05-25
// mirror-source rule.
const META_DESCRIPTION =
  'AI for residential pool service companies: peak-season green-pool and equipment-failure emergency-call capture, weekly recurring-service skip-notice automation when the route is rained out, and end-of-season closing appointment reminders before the first freeze. Live demos built for pool service - try in under 60 seconds.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Pool Service',
      item: 'https://digitalcraftai.com/ai-for-pool-service',
    },
  ],
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'poolservice',
  vertical: 'homeservices',
  icon: Waves,
  name: 'AI for Pool Service Companies',
  headline: 'A green pool on Saturday. Booked.',
  lead: 'Peak-season emergencies answered, weekly skip notices sent, closings booked before the first freeze.',
  phone: {
    contact: 'Gina T.',
    initials: 'GT',
    inbound: 'Came home to a green pool and the pump isn’t running. Can someone come out?',
    reply: 'Sorry, that’s frustrating. A tech can be there tomorrow at 8 or 12. Which works?',
    followIn: '8',
    confirm: 'Booked for 8:00 AM. They’ll check the pump and treat the water.',
    booked: 'Booked · Tomorrow 8:00 AM',
    bookedDetail: 'Green pool and pump visit · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the pool service demo', track: ['try_demo', 'poolservice_hero_lead_responder'] },
  book: ['book_call', 'poolservice_hero'],
  painTitle: 'Where the customers slip away.',
  pains: [
    { title: 'Peak-season emergencies hit voicemail.', line: 'A green pool or a dead pump goes to whoever answers.' },
    { title: 'Weekly skip notices slip.', line: 'A rained-out route needs a heads-up, or the customer wonders.' },
    { title: 'Closings get forgotten.', line: 'Book end-of-season closings before the first freeze, not after.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the problem and the pool, then books the visit.', kind: 'chat', location: 'poolservice_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Service visits, repairs and equipment.', kind: 'quote', location: 'poolservice_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Calls with skip notices.', line: 'Tells customers when a route moves and books their closing.', kind: 'voice', location: 'poolservice_voice_followup' },
  ],
  job: { label: 'Your average job', value: 250 },
  close: {
    book: ['book_call', 'poolservice_bottom'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'poolservice_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForPoolService: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-pool-service', label: VERTICAL_LABELS['/ai-for-pool-service'] });

  return (
    <>
      <Helmet>
        <title>AI for Pool Service Companies | Green-Pool Emergency Capture & Closing Reminders</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Pool Service Companies | DigitalCraft AI" />
        <meta property="og:description" content="AI agents built for residential pool service companies: never miss a peak-season green-pool or equipment-failure emergency, send weekly recurring-service skip notices on autopilot, and book every end-of-season closing before the first freeze. Live demos free." />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-pool-service" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForPoolService;

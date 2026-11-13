import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Bug } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Ticket 0056 - long-tail landing page for the "AI for pest control" query
// class. Reuses the three existing home-services demos verbatim. Modeled on
// src/pages/AiForCleaningServices.tsx (ticket 0050) per the ticket engineering
// notes; NOT on AiForPropertyManagers.tsx (routes to /realestate/demo/*).
// Industry-standard market context only (NPMA, PMP, PestPac / FieldRoutes /
// GorillaDesk marketing); no DCA client results, no invented testimonials.
// Emits BreadcrumbList JSON-LD only - no sibling Service block per the ticket
// Out of Scope and the ticket 0050 precedent. The Helmet meta description and
// the JSON-LD read from shared module-level constants per the 2026-05-25
// mirror-source rule.
const META_DESCRIPTION =
  'AI for residential pest control companies: after-hours rodent and wasp emergency-call capture, automated quarterly recurring-service renewal reminders, and same-day review collection after a finished treatment. Live demos built for pest control - try in under 60 seconds.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Pest Control',
      item: 'https://digitalcraftai.com/ai-for-pest-control',
    },
  ],
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'pestcontrol',
  vertical: 'homeservices',
  icon: Bug,
  name: 'AI for Pest Control Companies',
  headline: 'The Friday-night rodent call. Booked.',
  lead: 'After-hours emergencies answered, quarterly renewals reminded, reviews asked for.',
  phone: {
    contact: 'Kevin W.',
    initials: 'KW',
    inbound: 'We just found mice in the attic. Can someone come out this weekend?',
    reply: 'Sorry to hear it. A tech can be there Saturday at 9 or 2. Which works?',
    followIn: '9 please',
    confirm: 'You’re booked Saturday at 9. The tech will text when they’re on the way.',
    booked: 'Booked · Sat 9:00 AM',
    bookedDetail: 'Rodent inspection · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the pest control demo', track: ['try_demo', 'pestcontrol_hero_lead_responder'] },
  book: ['book_call', 'pestcontrol_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'Rodent and wasp calls hit voicemail.', line: 'Friday night, the shop that answers gets the job.' },
    { title: 'Quarterly renewals slip.', line: 'Recurring service only renews if someone reminds the homeowner.' },
    { title: 'Reviews never get asked for.', line: 'Ask the afternoon the treatment is done.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the pest, the property and the urgency, then books it.', kind: 'chat', location: 'pestcontrol_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Treatments, inspections and recurring plans.', kind: 'quote', location: 'pestcontrol_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Calls about renewals.', line: 'Reminds customers before the next visit and asks for the review.', kind: 'voice', location: 'pestcontrol_voice_followup' },
  ],
  job: { label: 'Your average job', value: 300 },
  close: {
    book: ['book_call', 'pestcontrol_bottom'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'pestcontrol_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForPestControl: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-pest-control', label: VERTICAL_LABELS['/ai-for-pest-control'] });

  return (
    <>
      <Helmet>
        <title>AI for Pest Control Companies | After-Hours Emergency Capture & Renewals</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Pest Control Companies | DigitalCraft AI" />
        <meta property="og:description" content="AI agents built for residential pest control companies: never miss a rodent or wasp emergency call after hours, send quarterly recurring-service renewal reminders on autopilot, and chase every 5-star review after a finished treatment. Live demos free." />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-pest-control" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForPestControl;

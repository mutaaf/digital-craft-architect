import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Sparkles } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Long-tail landing page for the "AI for cleaning business" query class.
// Reuses the three existing home-services demos verbatim - no new demo, no
// new backend. Modeled on src/pages/AiForLandscapers.tsx (ticket 0041) per
// ticket 0050 engineering notes; NOT on AiForPropertyManagers.tsx, which
// routes to /realestate/demo/* (wrong family for cleaning services).
//
// Defensible-language note: industry-standard market context only - the
// after-hours / weekend booking pattern is publicly observable in trade-
// association write-ups (ISSA, ARCSI) and field-service-software marketing
// (ZenMaid, Jobber, Housecall Pro), not DCA client results. No invented
// client quotes, dollar figures, or efficacy percentages.

// 2026-05-25 mirror-source rule: the Helmet meta description and the
// Service schema description both read from META_DESCRIPTION so a copy edit
// cannot drift the visible text and the structured data apart.
const META_DESCRIPTION =
  'AI for residential and commercial cleaning companies: after-hours and weekend booking-request capture, instant move-out and deep-clean quote turnaround, and automated review collection after a finished clean. Live demos built for cleaning services - try in under 60 seconds.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Cleaning Services',
      item: 'https://digitalcraftai.com/ai-for-cleaning-services',
    },
  ],
};

// Sibling Service schema. Per the 2026-05-25 mirror-source rule the
// description field shares the META_DESCRIPTION constant so a copy edit
// cannot drift the meta tag and the structured-data description apart.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Cleaning Services',
  description: META_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Residential and Commercial Cleaning Businesses',
  url: 'https://digitalcraftai.com/ai-for-cleaning-services',
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'cleaningservices',
  vertical: 'homeservices',
  icon: Sparkles,
  name: 'AI for Cleaning Companies',
  headline: 'Weekend booking requests. Answered.',
  lead: 'Weekend and after-hours requests answered, move-out and deep-clean quotes sent, reviews asked for.',
  phone: {
    contact: 'Priya S.',
    initials: 'PS',
    inbound: 'Need a move-out clean Saturday for a 2-bed apartment. Do you have anything?',
    reply: 'We do. A crew can be there Saturday at 9 or 1. Which works?',
    followIn: '9 works',
    confirm: 'You’re booked Saturday at 9. We’ll text you the night before.',
    booked: 'Booked · Sat 9:00 AM',
    bookedDetail: 'Move-out clean · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the cleaning demo', track: ['try_demo', 'cleaningservices_hero_lead_responder'] },
  book: ['book_call', 'cleaningservices_hero'],
  painTitle: 'Where the bookings slip away.',
  pains: [
    { title: 'Weekend requests hit voicemail.', line: 'Sunday afternoon, the crew is off and the inquiry goes elsewhere.' },
    { title: 'Move-out quotes are too slow.', line: 'The first crew to text a number gets the job.' },
    { title: 'The review window closes.', line: 'Ask the afternoon the van rolls off a finished clean.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every request.', line: 'Qualifies the home, the clean and the date, then books it.', kind: 'chat', location: 'cleaningservices_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Move-out, deep and post-construction cleans.', kind: 'quote', location: 'cleaningservices_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Calls about renewals.', line: 'Follows up by phone to keep recurring cleans on the calendar.', kind: 'voice', location: 'cleaningservices_voice_followup' },
  ],
  job: { label: 'Your average job', value: 250 },
  close: {
    book: ['book_call', 'cleaningservices_bottom'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'cleaningservices_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForCleaningServices: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-cleaning-services', label: VERTICAL_LABELS['/ai-for-cleaning-services'] });

  return (
    <>
      <Helmet>
        <title>AI for Cleaning Companies | Weekend Booking Capture & Instant Quotes</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Cleaning Companies | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for residential and commercial cleaning companies: never miss a weekend booking request, turn around move-out and deep-clean quotes the same hour, and chase every 5-star review after a finished clean. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-cleaning-services" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForCleaningServices;

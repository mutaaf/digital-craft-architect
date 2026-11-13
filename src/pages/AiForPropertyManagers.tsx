import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Building2 } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Long-tail landing page for the "AI for property managers" query class.
// Ticket 0047 - the SEVENTH page in the trade-page long-tail family and the
// FIRST non-trade variant. Reuses the two existing real-estate demos (the
// shared /realestate/demo/lead-responder and /realestate/demo/voice-negotiator
// already calibrated for the real-estate ICP) rather than spawning a third
// demo family - no new demo, no new backend, no new pricing. Modeled 1:1 on
// src/pages/AiForLandscapers.tsx (ticket 0041), but the two demo CTAs route
// to /realestate/demo/* (NOT /homeservices/demo/* as the six trade pages do)
// per the ticket 0047 acceptance criteria - this is the structural
// difference and the named regression check.

// Defensible market context cited in the SERVICE_DESCRIPTION and on-page
// copy. The page makes no LTV or cap-rate claims; the "highest-LTV ICP" framing
// in the ticket's Stakeholder lens stays inside the ticket and is NOT mirrored
// to public copy because there is no publicly attributable single source for a
// blended residential-property-management LTV. The "three property-management
// pain points" framing is industry-standard operator vocabulary (NARPM-adjacent
// forum threads, public Buildium / AppFolio marketing copy) - not a DCA
// client result. No invented testimonials, no efficacy percentages.

// 2026-05-25 mirror-source rule: every string used in the hero H1, the
// Helmet description, and the Service schema description lives as a single
// shared constant inside this module so a later copy edit cannot drift the
// visible text and the structured data apart.
const META_DESCRIPTION =
  'AI for property managers: after-hours and weekend leasing inquiry capture, instant maintenance-request triage, and renewal follow-up that closes the 30-day window. Live demos calibrated for property management - try in under 60 seconds, no signup.';
const SERVICE_DESCRIPTION =
  'AI for property managers: after-hours and weekend leasing inquiry capture, instant maintenance-request triage, and renewal follow-up that closes the 30-day window. Live demos calibrated for property management - try in under 60 seconds, no signup.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Property Managers',
      item: 'https://digitalcraftai.com/ai-for-property-managers',
    },
  ],
};

// Sibling Service schema mirroring the AiForLandscapers pattern, with
// serviceType naming property management companies per ticket acceptance
// box 2. description mirrors META_DESCRIPTION per the 2026-05-25
// mirror-source rule (same constant feeds the Helmet meta tag and the
// Service.description field).
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Property Managers',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Property Management Companies',
  url: 'https://digitalcraftai.com/ai-for-property-managers',
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'propertymanagers',
  vertical: 'realestate',
  icon: Building2,
  name: 'AI for Property Managers',
  headline: 'Saturday leasing inquiries. Answered.',
  lead: 'Tenant inquiries answered, maintenance requests triaged, renewal conversations kept alive.',
  phone: {
    contact: 'Jordan P.',
    initials: 'JP',
    inbound: 'Is the 3-bed on Maple still available? Could I see it this weekend?',
    reply: 'It is. I can show it Saturday at 11 or Sunday at 2. Which works?',
    followIn: 'Saturday at 11',
    confirm: 'You’re set for Saturday at 11. I’ll text the address and parking details.',
    booked: 'Showing · Sat 11:00 AM',
    bookedDetail: '3-bed on Maple · on your calendar',
  },
  primary: { to: '/realestate/demo/lead-responder', label: 'Try the property management demo', track: ['try_demo', 'propertymanagers_hero_lead_responder'] },
  book: ['book_call', 'propertymanagers_hero'],
  painTitle: 'Where the leases slip away.',
  pains: [
    { title: 'Leasing inquiries hit voicemail.', line: 'Weekend prospects keep scrolling if nobody answers.' },
    { title: 'Maintenance triage runs slow.', line: 'A 9pm leak with no answer becomes a one-star review.' },
    { title: 'Renewals drop off.', line: 'The 30-day window closes when outreach slips.' },
  ],
  demos: [
    { to: '/realestate/demo/lead-responder', title: 'Answers every inquiry.', line: 'Qualifies the prospect and books the showing.', kind: 'chat', location: 'propertymanagers_lead_responder' },
    { to: '/realestate/demo/voice-negotiator', title: 'Calls about renewals.', line: 'A live AI voice that follows up so renewals don’t lapse.', kind: 'voice', location: 'propertymanagers_voice_negotiator' },
  ],
  job: { label: 'What a new lease is worth', value: 1800 },
  close: {
    book: ['book_call', 'propertymanagers_bottom'],
    try: { to: '/realestate/demo/voice-negotiator', label: 'Try the voice demo', track: ['try_demo', 'propertymanagers_bottom_voice'] },
  },
  pricing: { to: '/realestate', label: 'See pricing' },
};

const AiForPropertyManagers: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-property-managers', label: VERTICAL_LABELS['/ai-for-property-managers'] });

  return (
    <>
      <Helmet>
        <title>AI for Property Managers | After-Hours Leasing Capture & Renewal Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Property Managers | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for property managers: never miss an after-hours leasing inquiry, triage maintenance requests before the one-star review lands, and close the 30-day renewal window. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-property-managers" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForPropertyManagers;

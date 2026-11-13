import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Brush } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Long-tail landing page for the "AI for painters" query class. Reuses
// the two existing home-services demos verbatim and links to the existing
// /homeservices pricing tiers - no new demo, no new backend, no new pricing.
// Modeled on src/pages/AiForElectricians.tsx per ticket 0037 engineering notes
// (the most recent peer in the trade-quintet pattern).

// 2026-05-25 mirror-source rule: every string used in the hero H1, the
// Helmet description, and the Service schema description lives as a single
// shared constant inside this module so a later copy edit cannot drift the
// visible text and the structured data apart.
const META_DESCRIPTION =
  'AI for painting contractors: after-hours estimate-request capture during peak season, instant on-site interior and exterior quote follow-up, and automated review collection. Live demos built for painters - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI estimate-request capture, on-site quoting assistance, and review automation built for painting contractors. After-hours interior and exterior request response, same-day quote follow-up on residential and commercial repaints, and review collection that never forgets.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Painters',
      item: 'https://digitalcraftai.com/ai-for-painters',
    },
  ],
};

// Sibling Service schema mirroring the AiForElectricians pattern, with
// serviceType naming painting contractors per ticket acceptance criteria.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Painters',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Painting Contractors',
  url: 'https://digitalcraftai.com/ai-for-painters',
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'painters',
  vertical: 'homeservices',
  icon: Brush,
  name: 'AI for Painting Contractors',
  headline: 'Every estimate request. Answered tonight.',
  lead: 'After-hours estimate requests answered, interior and exterior quotes sent, reviews asked for.',
  phone: {
    contact: 'Amy L.',
    initials: 'AL',
    inbound: 'Hi, we want the outside of the house repainted this spring. Can someone quote it?',
    reply: 'Happy to. We can walk it Thursday at 5 or Saturday at 10. Which works?',
    followIn: 'Saturday',
    confirm: 'You’re set for Saturday at 10. We’ll measure and send your written estimate.',
    booked: 'Booked · Sat 10:00 AM',
    bookedDetail: 'Exterior estimate walkthrough · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the painting demo', track: ['try_demo', 'painters_hero_lead_responder'] },
  book: ['book_call', 'painters_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'Peak season, requests pile up.', line: 'A request at 8pm goes to whoever replies before bedtime.' },
    { title: 'Quotes arrive too late.', line: 'Interior or exterior, the first written number usually wins.' },
    { title: 'No one asks for the review.', line: 'Ask the afternoon the drop cloths come up.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every request.', line: 'Qualifies the rooms, the surfaces and the timing, then books the walkthrough.', kind: 'chat', location: 'painters_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Estimates in minutes.', line: 'Interior and exterior repaints, trim and more.', kind: 'quote', location: 'painters_estimate' },
  ],
  job: { label: 'Your average job', value: 4500 },
  close: {
    book: ['book_call', 'painters_bottom'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the estimate demo', track: ['try_demo', 'painters_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForPainters: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-painters', label: VERTICAL_LABELS['/ai-for-painters'] });

  return (
    <>
      <Helmet>
        <title>AI for Painting Contractors | Peak-Season Estimate Capture & Instant Quotes</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Painting Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for painting contractors: never miss a peak-season estimate request, follow up on interior and exterior quotes the same day, and chase every 5-star review. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-painters" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForPainters;

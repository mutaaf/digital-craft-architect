import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Flame } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Ticket 0072 - long-tail landing page for the "AI for restoration services"
// query class. Reuses the three existing home-services demos verbatim.
// Modeled on src/pages/AiForPoolService.tsx (ticket 0058) per the ticket
// engineering notes; NOT on AiForPropertyManagers.tsx (routes to
// /realestate/demo/*). Industry-standard market context only (RIA /
// Restoration Industry Association market write-ups; not DCA client
// results), no invented testimonials.
// Emits BreadcrumbList JSON-LD only - no sibling Service block per the
// ticket Out of Scope and the ticket 0058 precedent. The Helmet meta
// description and the JSON-LD read from shared module-level constants per
// the 2026-05-25 mirror-source rule.
const META_DESCRIPTION =
  'AI for residential restoration and remediation companies: after-hours water and fire emergency call capture when the answering service drops the call, insurance-carrier scope-of-work answers a dispatcher cannot give at 2am, and review-request timing that hits the day a crew finishes a mitigation job. Live demos built for restoration - try in under 60 seconds.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Restoration Services',
      item: 'https://digitalcraftai.com/ai-for-restoration-services',
    },
  ],
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD.
const PAGE: SeoLandingData = {
  testid: 'restoration',
  vertical: 'homeservices',
  icon: Flame,
  name: 'AI for Restoration Companies',
  headline: 'The midnight water call. Answered.',
  lead: 'Water and fire emergencies answered at any hour, insurance questions handled, reviews asked for.',
  phone: {
    contact: 'Chris D.',
    initials: 'CD',
    inbound: 'A pipe burst upstairs and water is coming through the ceiling. Can someone come now?',
    reply: 'I’m sorry. Shut off the main if you can. A crew can come tonight or first thing at 7. Which do you want?',
    followIn: 'Tonight please',
    confirm: 'A crew is on the way. Take photos for your insurance carrier before anything moves.',
    booked: 'Dispatched · Tonight',
    bookedDetail: 'Water mitigation · on the board',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the restoration demo', track: ['try_demo', 'restoration_hero_lead_responder'] },
  book: ['book_call', 'restoration_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'Midnight emergencies hit voicemail.', line: 'An inch of water at 11pm goes to whoever picks up.' },
    { title: 'Insurance questions at 2am.', line: 'Homeowners want to know what the carrier covers before demo starts.' },
    { title: 'Review timing slips.', line: 'Ask at the final walk-through, while the space is dry and restored.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every emergency.', line: 'Qualifies the loss and the address, then books the crew.', kind: 'chat', location: 'restoration_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Scopes in minutes.', line: 'Mitigation and restoration scope, priced as a range.', kind: 'quote', location: 'restoration_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Follows up by phone.', line: 'Walks homeowners through insurance scoping and asks for the review.', kind: 'voice', location: 'restoration_voice_followup' },
  ],
  job: { label: 'Your average job', value: 5000 },
  close: {
    book: ['book_call', 'restoration_bottom'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'restoration_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForRestorationServices: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-restoration-services', label: VERTICAL_LABELS['/ai-for-restoration-services'] });

  return (
    <>
      <Helmet>
        <title>AI for Restoration Companies | Midnight Emergency Capture & Insurance Scoping</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Restoration Companies | DigitalCraft AI" />
        <meta property="og:description" content="AI agents built for residential restoration and remediation companies: never miss an after-hours water or fire emergency, answer insurance-carrier scope questions at 2am, and book five-star review requests the hour a mitigation crew finishes. Live demos free." />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-restoration-services" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForRestorationServices;

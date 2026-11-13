import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { AppWindow } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Ticket 0087 - long-tail landing page for the "AI for window installers"
// query class. Reuses the three existing home-services demos verbatim
// (lead-responder, estimate, voice-followup) - no new demo, no new backend,
// no new pricing data.
// Modeled on src/pages/AiForSolarInstallers.tsx (ticket 0084) per the
// ticket engineering notes; the file structure, JSON-LD emission, and FAQ
// mirror-source pattern are 1:1 with the solar-installers predecessor, with
// window-installer-specific copy in every string slot.

// Mirror-source constants: every visible string that also appears inside a
// JSON-LD block is defined ONCE here so a copy edit cannot drift the visible
// text and the structured data apart.
const META_DESCRIPTION =
  'AI for residential window installers: whole-house replacement inbounds that go to voicemail during an in-home measurement, long-tail frame-material and glass-package questions a dispatcher cannot answer without the opening dimensions in hand, and manufacturer-lead-time and permit follow-up cadence that slips between contract signing and install day. Live demos built for windows - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and manufacturer-lead-time and permit follow-up built for residential window installers, full-frame vinyl and fiberglass replacement contractors, window-and-siding hybrids, authorized-dealer showrooms, and storm-window specialists. Whole-house replacement response when the crew is on an in-home measurement, opening-count and frame-material and glass-package triage a dispatcher cannot answer without the opening dimensions in hand, and follow-up cadence that carries a contract from deposit through install day.';

// FAQ items - single source of truth for both the visible cards and the
// FAQPage JSON-LD block per the 2026-05-25 mirror-source rule. Hyphen-only,
// defensible language, no invented client quotes, no tax-credit or building-
// code claims per the ticket Out of scope box.
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Will the AI answer a whole-house replacement call the way a window-installer dispatcher would?',
    a: 'Yes. The AI qualifies the opening count, the frame-material preference (vinyl, fiberglass, wood, aluminum-clad), the window style mix (double-hung, casement, picture, slider), the glass package (single, dual, argon-fill low-e), the storm-shutter or egress requirement, and the callback number in under 60 seconds, then books the in-home measurement on your calendar. The homeowner hears a natural conversation, not a menu tree.',
  },
  {
    q: 'What happens with long-tail questions about frame material, glass package, or egress compliance?',
    a: 'The AI asks the same follow-up questions a seasoned dispatcher would (opening count, room-by-room mix, frame-material preference, glass-package interest, storm-shutter compatibility, financing preference between cash, loan, or lease) and returns a defensible per-opening and whole-house ballpark from the same home-services estimate demo, then hands the qualified lead to your estimator with the intake already filled in. Specific building-code numbers and manufacturer warranty terms stay with your team, so the AI never quotes a stale code cite or a warranty clause it should not.',
  },
  {
    q: 'Can the AI call a homeowner at each manufacturer and install milestone so they stop calling the office?',
    a: 'Yes. The voice follow-up demo triggers a callback the day the order goes to the manufacturer, the day the windows land at the shop, the day the install crew is scheduled, and the day the city inspection lands, walks the homeowner through a natural conversation about the next step, and drops a status link in a follow-up text. If a milestone slips, the AI flags the delay to your operations lead instead of leaving the homeowner guessing.',
  },
];

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Window Installers',
      item: 'https://digitalcraftai.com/ai-for-window-installers',
    },
  ],
};

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Window Installers',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Window Installers',
  url: 'https://digitalcraftai.com/ai-for-window-installers',
};

// Mirror-source: mainEntity strings come directly from FAQ_ITEMS so the
// visible FAQ cards and the FAQPage block can never drift.
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

// The page's words on the keynote template (src/v3/SeoLanding.tsx). Short on purpose; the long
// form lives in the meta description, the Service JSON-LD and the FAQ.
const PAGE: SeoLandingData = {
  testid: 'window-installers',
  vertical: 'homeservices',
  icon: AppWindow,
  name: 'AI for Window Installers',
  headline: 'Whole-house inquiries. Answered mid-measure.',
  lead: 'Replacement inquiries answered during in-home measurements, frame and glass questions handled, install-day follow-up sent.',
  phone: {
    contact: 'Beth C.',
    initials: 'BC',
    inbound: 'Our windows are drafty. Thinking about replacing all 15. Can someone come measure?',
    reply: 'Glad to. Vinyl or fiberglass in mind? We can measure Wednesday at 5 or Saturday at 9.',
    followIn: 'Saturday. Probably vinyl.',
    confirm: 'You’re booked Saturday at 9. We’ll bring frame and glass samples.',
    booked: 'Booked · Sat 9:00 AM',
    bookedDetail: 'In-home measurement · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the window demo', track: ['try_demo', 'window_installers_hero_lead_responder'] },
  book: ['book_call', 'window_installers_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'Inquiries hit voicemail mid-measure.', line: 'Your estimator is tape-measuring. The homeowner calls the next shop.' },
    { title: 'Frame and glass questions at 8pm.', line: 'Vinyl or fiberglass, double-hung or picture: someone has to answer.' },
    { title: 'Lead-time follow-up slips.', line: 'Manufacturer, permit and install-day updates fall through the cracks.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the openings, the frames and the glass, then books the measure.', kind: 'chat', location: 'window_installers_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Window replacement, priced as a range.', kind: 'quote', location: 'window_installers_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Calls at every milestone.', line: 'Manufacturer lead times and install-day updates by phone.', kind: 'voice', location: 'window_installers_voice_followup' },
  ],
  job: { label: 'Your average job', value: 15000 },
  faqs: FAQ_ITEMS,
  close: {
    book: ['window_installers_book_call', 'window_installers_footer'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'window_installers_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForWindowInstallers: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-window-installers', label: VERTICAL_LABELS['/ai-for-window-installers'] });

  return (
    <>
      <Helmet>
        <title>AI for Window Installers | Whole-House Replacement Capture & Install Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Window Installers | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for residential window installers and full-frame replacement contractors: never miss a whole-house replacement call, triage frame-material and glass-package and egress questions in under 60 seconds, and follow up at every manufacturer and install milestone. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-window-installers" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForWindowInstallers;

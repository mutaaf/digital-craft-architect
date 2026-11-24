import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Sun } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Ticket 0084 - long-tail landing page for the "AI for solar installers"
// query class. Reuses the three existing home-services demos verbatim
// (lead-responder, estimate, voice-followup) - no new demo, no new backend,
// no new pricing data.
// Modeled on src/pages/AiForMovingCompanies.tsx (ticket 0080) per the
// ticket engineering notes; the file structure, JSON-LD emission, and FAQ
// mirror-source pattern are 1:1 with the moving-companies predecessor, with
// solar-installer-specific copy in every string slot.

// Mirror-source constants: every visible string that also appears inside a
// JSON-LD block is defined ONCE here so a copy edit cannot drift the visible
// text and the structured data apart.
const META_DESCRIPTION =
  'AI for residential solar installers: walk-in rooftop assessment inbounds that go to voicemail during a site visit, long-tail system-sizing and financing questions a dispatcher cannot answer without the utility bill in hand, and permit-and-inspection follow-up cadence that slips between signing and grid interconnection. Live demos built for solar - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and permit-and-inspection follow-up built for residential solar installers, solar-plus-storage integrators, and EPC operators. Rooftop assessment response when the crew is on a site visit, system-sizing and battery add-on triage a dispatcher cannot answer without the utility bill in hand, and follow-up cadence that carries a contract from signing through utility interconnection.';

// FAQ items - single source of truth for both the visible cards and the
// FAQPage JSON-LD block per the 2026-05-25 mirror-source rule. Hyphen-only,
// defensible language, no invented client quotes, no incentive-rate claims
// per the ticket Out of scope box.
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Will the AI answer a rooftop assessment call the way a solar-installer dispatcher would?',
    a: 'Yes. The AI qualifies the roof type (asphalt shingle, tile, metal, flat commercial), the orientation and shade profile, the current monthly electric bill, the interest in battery storage or an EV charger, the utility company, and the callback number in under 60 seconds, then books the site survey on your calendar. The homeowner hears a natural conversation, not a menu tree.',
  },
  {
    q: 'What happens with long-tail questions about panel count, battery sizing, or financing?',
    a: 'The AI asks the same follow-up questions a seasoned dispatcher would (roof orientation, monthly kWh usage, shade windows, battery add-on interest, financing preference between cash, loan, or lease) and returns a defensible system-size and ballpark range from the same home-services estimate demo, then hands the qualified lead to your estimator with the intake already filled in. Specific incentive rates and utility net-metering rules stay with your team, so the AI never quotes a stale credit or interconnection policy.',
  },
  {
    q: 'Can the AI call a homeowner at each permit and inspection gate so they stop calling the office?',
    a: 'Yes. The voice follow-up demo triggers a callback the day the permit is filed, the day the panels are installed, the day the city inspection lands, and the day the utility signs off on net metering, walks the homeowner through a natural conversation about the next step, and drops a status link in a follow-up text. If a milestone slips, the AI flags the delay to your operations lead instead of leaving the homeowner guessing.',
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
      name: 'AI for Solar Installers',
      item: 'https://digitalcraftai.com/ai-for-solar-installers',
    },
  ],
};

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Solar Installers',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Solar Installers',
  url: 'https://digitalcraftai.com/ai-for-solar-installers',
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
  testid: 'solar-installers',
  vertical: 'homeservices',
  icon: Sun,
  name: 'AI for Solar Installers',
  headline: 'Every rooftop assessment. Booked.',
  lead: 'Assessment requests answered during a site visit, system-sizing questions handled, permit and interconnection follow-up sent.',
  phone: {
    contact: 'Raj P.',
    initials: 'RP',
    inbound: 'Our electric bill was brutal this summer. Is our roof any good for solar?',
    reply: 'Let’s find out. I can book a rooftop assessment Thursday at 4 or Saturday at 10. Which works?',
    followIn: 'Saturday',
    confirm: 'You’re set for Saturday at 10. Have a recent utility bill handy for sizing.',
    booked: 'Booked · Sat 10:00 AM',
    bookedDetail: 'Rooftop assessment · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the solar demo', track: ['try_demo', 'solar_installers_hero_lead_responder'] },
  book: ['book_call', 'solar_installers_hero'],
  painTitle: 'Where the deals slip away.',
  pains: [
    { title: 'Assessment calls hit voicemail.', line: 'The crew is on a roof. The homeowner calls the next installer.' },
    { title: 'Sizing questions at 8pm.', line: 'Roof, shade, bill and battery: someone has to answer tonight.' },
    { title: 'Permit follow-up slips.', line: 'From contract to interconnection, every milestone needs a call.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the roof, the bill and the interest in storage, then books it.', kind: 'chat', location: 'solar_installers_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Solar and battery systems, sized from the bill.', kind: 'quote', location: 'solar_installers_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Calls at every milestone.', line: 'Permit, inspection and interconnection updates by phone.', kind: 'voice', location: 'solar_installers_voice_followup' },
  ],
  job: { label: 'Your average job', value: 25000 },
  faqs: FAQ_ITEMS,
  close: {
    book: ['solar_installers_book_call', 'solar_installers_footer'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'solar_installers_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForSolarInstallers: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-solar-installers', label: VERTICAL_LABELS['/ai-for-solar-installers'] });

  return (
    <>
      <Helmet>
        <title>AI for Solar Installers | Rooftop Assessment Capture & Permit Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Solar Installers | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for residential solar installers and EPC operators: never miss a rooftop assessment call, triage system-sizing and battery and financing questions in under 60 seconds, and follow up at every permit and interconnection gate. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-solar-installers" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForSolarInstallers;

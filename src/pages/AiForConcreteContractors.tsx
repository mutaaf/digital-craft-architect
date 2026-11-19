import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Construction } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Ticket 0106 - long-tail landing page for the "AI for concrete contractors"
// query class. Reuses the three existing home-services demos verbatim
// (lead-responder, estimate, voice-followup) - no new demo, no new backend,
// no new pricing data.
// Modeled on src/pages/AiForFencingContractors.tsx (ticket 0096) per the
// ticket engineering notes; the file structure, JSON-LD emission, and FAQ
// mirror-source pattern are 1:1 with the fencing-contractors predecessor,
// with concrete-contractor-specific copy in every string slot.

// Mirror-source constants: every visible string that also appears inside a
// JSON-LD block is defined ONCE here so a copy edit cannot drift the visible
// text and the structured data apart.
const META_DESCRIPTION =
  'AI for residential and light-commercial concrete contractors: weather-dependent pour reschedules and same-week booking inbounds that go to voicemail while the crew is finishing a Friday patio, long-tail square-footage and pour-type and finish triage a dispatcher cannot answer without seeing the slab, and crew-on-the-way and cure-cycle follow-up that slips between the pour and the sealant visit. Live demos built for concrete contractors - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and crew-on-the-way and cure-cycle follow-up built for residential and light-commercial concrete contractors, single-crew flatwork outfits pouring driveways and patios with a trailer-mounted mixer, two-crew foundation-and-footing operations running a boom truck and a laser-screed, decorative-concrete specialists selling stamped and stained patios plus pool decks, repair-and-leveling specialists doing mudjacking and polyjacking on settled slabs, and HOA-and-property-manager subs pouring sidewalks and curb-and-gutter work. Weather-dependent pour reschedules and after-hours same-week booking inbounds, square-footage and pour-type and finish triage a dispatcher cannot resolve without a photo or a site visit, and follow-up cadence that carries a booking from pour confirmation through the control-joint and sealant visit.';

// FAQ items - single source of truth for both the visible cards and the
// FAQPage JSON-LD block per the 2026-05-25 mirror-source rule. Hyphen-only,
// defensible language, no invented client quotes, no manufacturer endorsement
// or certification-count claims per the ticket Out of scope box.
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Will the AI answer an after-hours same-week pour inbound the way a concrete-company office manager would?',
    a: 'Yes. The AI qualifies the pour type (flatwork, structural, footing), the finish (broom, stamped, stained, polished, exposed-aggregate), the square footage and thickness, the reinforcement (rebar, mesh), the property type (residential, HOA, light-commercial, property-manager), the job type (new pour, tear-out and replace, repair, mudjacking, control-joint saw cut, sealant visit), and the callback number in under 60 seconds, then books the earliest measure slot on your calendar. The homeowner hears a natural conversation, not a menu tree.',
  },
  {
    q: 'What happens with long-tail questions about pour type, finish choice, thickness, reinforcement, or cure-cycle windows?',
    a: 'The AI asks the same follow-up questions a seasoned dispatcher would (pour type, square footage, thickness, finish, rebar versus mesh, cure window, control-joint saw cuts, sealant preference, HOA setback or pool-code sign-off) and returns a defensible per-job ballpark from the same home-services estimate demo, then hands the qualified lead to your estimator with the intake already filled in. City permit rules, specific cost-per-square-foot figures, and neighborhood-specific HOA constraints stay with your team, so the AI never quotes a stale permit fee or a slab-cost table it should not.',
  },
  {
    q: 'Can the AI follow up through the pour, the control-joint saw cuts, and the sealant visit so homeowners stop calling the office?',
    a: 'Yes. The voice follow-up demo triggers a callback the evening before the pour to confirm the two-hour arrival window, calls again the morning of when the crew heads out, follows up at the 24-hour control-joint saw-cut mark, and calls once more at the sealant visit to ask for a review while the crew name is still fresh. If a weather delay slips the pour or the cure window shifts, the AI flags the change to your dispatcher instead of leaving the homeowner guessing.',
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
      name: 'AI for Concrete Contractors',
      item: 'https://digitalcraftai.com/ai-for-concrete-contractors',
    },
  ],
};

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Concrete Contractors',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Concrete Contractors',
  url: 'https://digitalcraftai.com/ai-for-concrete-contractors',
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
  testid: 'concrete-contractors',
  vertical: 'homeservices',
  icon: Construction,
  name: 'AI for Concrete Contractors',
  headline: 'Pour inquiries. Answered mid-pour.',
  lead: 'After-hours inquiries answered, square-footage and finish questions handled, cure-cycle follow-up sent.',
  phone: {
    contact: 'Luis M.',
    initials: 'LM',
    inbound: 'Want a 400 sq ft stamped patio poured before Memorial Day. Can you fit us in?',
    reply: 'Let’s see. Someone can look at the site Wednesday at 5 or Saturday at 9. Which works?',
    followIn: 'Saturday',
    confirm: 'Booked for Saturday at 9. We’ll talk finish, color and the pour date on site.',
    booked: 'Booked · Sat 9:00 AM',
    bookedDetail: 'Patio site visit · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the concrete demo', track: ['try_demo', 'concrete_contractors_hero_lead_responder'] },
  book: ['book_call', 'concrete_contractors_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'Pour inquiries hit voicemail.', line: 'Friday patio, crew finishing. The next call goes elsewhere.' },
    { title: 'Square-footage and finish triage at 8pm.', line: 'Broom, stamped or stained. Driveway, patio or footing.' },
    { title: 'Cure-cycle follow-up slips.', line: 'Saw cuts and the sealant visit each need a call.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the pour, the finish and the square footage, then books the visit.', kind: 'chat', location: 'concrete_contractors_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Pours and repairs, priced as a range.', kind: 'quote', location: 'concrete_contractors_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Follows the pour through.', line: 'Calls before the pour, at the saw cuts and at the sealant visit.', kind: 'voice', location: 'concrete_contractors_voice_followup' },
  ],
  job: { label: 'Your average job', value: 7500 },
  faqs: FAQ_ITEMS,
  close: {
    book: ['concrete_contractors_book_call', 'concrete_contractors_footer'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'concrete_contractors_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForConcreteContractors: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-concrete-contractors', label: VERTICAL_LABELS['/ai-for-concrete-contractors'] });

  return (
    <>
      <Helmet>
        <title>AI for Concrete Contractors | After-Hours Pour Capture & Cure-Cycle Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Concrete Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for residential and light-commercial concrete contractors: never miss an after-hours same-week pour inbound, triage square-footage and pour-type and finish questions in under 60 seconds, and follow up through the pour, the control-joint saw cuts, and the sealant visit. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-concrete-contractors" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForConcreteContractors;

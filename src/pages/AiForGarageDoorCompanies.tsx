import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { DoorOpen } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Ticket 0089 - long-tail landing page for the "AI for garage door companies"
// query class. Reuses the three existing home-services demos verbatim
// (lead-responder, estimate, voice-followup) - no new demo, no new backend,
// no new pricing data.
// Modeled on src/pages/AiForWindowInstallers.tsx (ticket 0087) per the
// ticket engineering notes; the file structure, JSON-LD emission, and FAQ
// mirror-source pattern are 1:1 with the window-installers predecessor, with
// garage-door-specific copy in every string slot.

// Mirror-source constants: every visible string that also appears inside a
// JSON-LD block is defined ONCE here so a copy edit cannot drift the visible
// text and the structured data apart.
const META_DESCRIPTION =
  'AI for residential garage door companies: after-hours broken-spring emergencies that go to voicemail while the homeowner cannot get their car out, long-tail opener-brand and spring-size triage questions a dispatcher cannot answer without the door specs in hand, and next-day appointment-window confirmations and technician-on-the-way follow-ups that slip between booking and arrival. Live demos built for garage doors - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and appointment-window and technician-on-the-way follow-up built for residential garage door companies, single-truck overhead-door repair shops, opener-and-spring specialists, full sales-service-install regional operations, hurricane-code coastal dealers, and franchise territory owners running multiple trucks on emergency broken-spring calls. After-hours broken-spring and stuck-door response when both trucks are mid-job, opener-brand and torsion-vs-extension-spring and section-vs-full-door triage a dispatcher cannot answer without the door specs in hand, and follow-up cadence that carries a booking from confirmation through technician arrival.';

// FAQ items - single source of truth for both the visible cards and the
// FAQPage JSON-LD block per the 2026-05-25 mirror-source rule. Hyphen-only,
// defensible language, no invented client quotes, no manufacturer endorsement
// or spring-cycle-lifetime claims per the ticket Out of scope box.
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Will the AI answer a broken-spring emergency call the way a garage-door dispatcher would?',
    a: 'Yes. The AI qualifies the door size (single or double, 8x7 through 18x8), the opener brand (LiftMaster, Chamberlain, Genie, Craftsman, Sommer), the spring type (torsion or extension), the failure mode (snapped spring, dead opener, cable off drum, panel damage, remote will not pair), and the callback number in under 60 seconds, then books the earliest emergency slot on your calendar. The homeowner hears a natural conversation, not a menu tree.',
  },
  {
    q: 'What happens with long-tail questions about opener brand, spring size, or repair-versus-replace?',
    a: 'The AI asks the same follow-up questions a seasoned dispatcher would (door size, opener brand, spring type, panel condition, car-impact damage, insulation preference, interest in a new opener with a smartphone app) and returns a defensible per-repair and full-door-replacement ballpark from the same home-services estimate demo, then hands the qualified lead to your technician with the intake already filled in. Specific manufacturer warranty terms and city permit rules for full-door replacement stay with your team, so the AI never quotes a stale warranty clause or a permit fee it should not.',
  },
  {
    q: 'Can the AI call a homeowner the night before and the morning of the appointment so they stop calling the office?',
    a: 'Yes. The voice follow-up demo triggers a callback the evening before the appointment to confirm the two-hour window, calls again the morning of when the technician heads out, and calls once more after the repair to ask for a review while the technician name is still fresh. If a milestone slips or the technician is running behind, the AI flags the delay to your dispatcher instead of leaving the homeowner guessing.',
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
      name: 'AI for Garage Door Companies',
      item: 'https://digitalcraftai.com/ai-for-garage-door-companies',
    },
  ],
};

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Garage Door Companies',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Garage Door Companies',
  url: 'https://digitalcraftai.com/ai-for-garage-door-companies',
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
  testid: 'garage-door-companies',
  vertical: 'homeservices',
  icon: DoorOpen,
  name: 'AI for Garage Door Companies',
  headline: 'A broken spring at 8pm. Booked.',
  lead: 'After-hours emergencies answered, opener and spring questions handled, technician-on-the-way texts sent.',
  phone: {
    contact: 'Mike R.',
    initials: 'MR',
    inbound: 'Garage door won’t open and my car is stuck inside. I think a spring snapped.',
    reply: 'Sorry, that’s stressful. A technician can be there tomorrow 8 to 10 or 12 to 2. Which works?',
    followIn: '8 to 10',
    confirm: 'Booked for 8 to 10 AM. Don’t try to lift the door. We’ll text when the tech is on the way.',
    booked: 'Booked · Tomorrow 8 to 10 AM',
    bookedDetail: 'Broken spring repair · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the garage door demo', track: ['try_demo', 'garage_door_companies_hero_lead_responder'] },
  book: ['book_call', 'garage_door_companies_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'Broken-spring calls hit voicemail.', line: 'Car stuck inside, she books whoever picks up.' },
    { title: 'Opener and spring triage at 8pm.', line: 'Torsion or extension, which opener, repair or replace.' },
    { title: 'Arrival follow-up slips.', line: 'The appointment window and the on-the-way text fall off the list.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the door, the spring and the opener, then books the technician.', kind: 'chat', location: 'garage_door_companies_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Springs, openers and door replacements.', kind: 'quote', location: 'garage_door_companies_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Calls ahead of arrival.', line: 'Confirms the window and sends the on-the-way update.', kind: 'voice', location: 'garage_door_companies_voice_followup' },
  ],
  job: { label: 'Your average job', value: 450 },
  faqs: FAQ_ITEMS,
  close: {
    book: ['garage_door_companies_book_call', 'garage_door_companies_footer'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'garage_door_companies_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForGarageDoorCompanies: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-garage-door-companies', label: VERTICAL_LABELS['/ai-for-garage-door-companies'] });

  return (
    <>
      <Helmet>
        <title>AI for Garage Door Companies | After-Hours Emergency Capture & Appointment Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Garage Door Companies | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for residential garage door companies and overhead-door repair shops: never miss an after-hours broken-spring call, triage opener-brand and spring-size and repair-versus-replace questions in under 60 seconds, and follow up the night before and morning of every appointment. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-garage-door-companies" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForGarageDoorCompanies;

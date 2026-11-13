import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { TreeDeciduous } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Ticket 0092 - long-tail landing page for the "AI for tree services" query
// class. Reuses the three existing home-services demos verbatim
// (lead-responder, estimate, voice-followup) - no new demo, no new backend,
// no new pricing data.
// Modeled on src/pages/AiForGarageDoorCompanies.tsx (ticket 0089) per the
// ticket engineering notes; the file structure, JSON-LD emission, and FAQ
// mirror-source pattern are 1:1 with the garage-door predecessor, with
// tree-service-specific copy in every string slot.

// Mirror-source constants: every visible string that also appears inside a
// JSON-LD block is defined ONCE here so a copy edit cannot drift the visible
// text and the structured data apart.
const META_DESCRIPTION =
  'AI for residential tree services: after-hours storm-damage emergency inbounds that go to voicemail while a fallen limb is on the homeowner roof or driveway, long-tail species and access triage questions a dispatcher cannot answer without seeing the tree in person, and next-day appointment-window confirmations and crew-on-the-way follow-ups that slip between the walk-through and crew arrival. Live demos built for tree services - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and appointment-window and crew-on-the-way follow-up built for residential tree services, single-crew climber-and-groundman shops taking storm-damage callouts, two-crew removal-and-pruning operations running bucket trucks and chippers, full-service arboriculture firms carrying certified arborists, stump-grinding subcontractors, and emergency storm-response tree crews answering utility-corridor callouts. After-hours storm-damage and fallen-limb response when both crews are mid-removal, species and canopy and drop-zone triage a dispatcher cannot resolve without a photo or a site visit, and follow-up cadence that carries a booking from confirmation through crew arrival.';

// FAQ items - single source of truth for both the visible cards and the
// FAQPage JSON-LD block per the 2026-05-25 mirror-source rule. Hyphen-only,
// defensible language, no invented client quotes, no manufacturer endorsement
// or certification-count claims per the ticket Out of scope box.
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Will the AI answer a storm-damage emergency call the way a tree-service dispatcher would?',
    a: 'Yes. The AI qualifies the species (oak, pine, maple, elm, cottonwood), the trunk diameter and canopy height, the drop-zone hazards (nearby structures, fences, power lines), the access (bucket-truck versus climber, chipper backup path), the job type (pruning, full removal, stump grinding, storm-damage cleanup), and the callback number in under 60 seconds, then books the earliest emergency slot on your calendar. The homeowner hears a natural conversation, not a menu tree.',
  },
  {
    q: 'What happens with long-tail questions about species, canopy access, or pruning-versus-full-removal?',
    a: 'The AI asks the same follow-up questions a seasoned dispatcher would (species, trunk diameter, canopy height, proximity to structures and power lines, bucket-truck versus climber access, chipper backup path, interest in stump grinding after removal) and returns a defensible per-job ballpark from the same home-services estimate demo, then hands the qualified lead to your crew with the intake already filled in. Utility-corridor coordination and city permit rules for near-structure removals stay with your team, so the AI never quotes a stale utility clearance rule or a permit fee it should not.',
  },
  {
    q: 'Can the AI call a homeowner the night before and the morning of the appointment so they stop calling the office?',
    a: 'Yes. The voice follow-up demo triggers a callback the evening before the appointment to confirm the two-hour arrival window, calls again the morning of when the crew heads out, and calls once more after the removal to ask for a review while the crew name is still fresh. If a milestone slips or the crew is running behind, the AI flags the delay to your dispatcher instead of leaving the homeowner guessing.',
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
      name: 'AI for Tree Services',
      item: 'https://digitalcraftai.com/ai-for-tree-services',
    },
  ],
};

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Tree Services',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Tree Services',
  url: 'https://digitalcraftai.com/ai-for-tree-services',
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
  testid: 'tree-services',
  vertical: 'homeservices',
  icon: TreeDeciduous,
  name: 'AI for Tree Services',
  headline: 'A limb on the roof at 8pm. Booked.',
  lead: 'After-hours storm calls answered, species and access questions handled, crew-on-the-way texts sent.',
  phone: {
    contact: 'Jill A.',
    initials: 'JA',
    inbound: 'The storm brought a big oak limb down on our roof. Can someone come look?',
    reply: 'Sorry about that. Stay clear of it. A crew can assess it tomorrow 7 to 9 or 11 to 1. Which works?',
    followIn: '7 to 9',
    confirm: 'You’re booked 7 to 9 AM. We’ll text when the crew is on the way.',
    booked: 'Booked · Tomorrow 7 to 9 AM',
    bookedDetail: 'Storm limb removal · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the tree service demo', track: ['try_demo', 'tree_services_hero_lead_responder'] },
  book: ['book_call', 'tree_services_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'Storm calls hit voicemail.', line: 'A limb on the roof goes to whoever answers first.' },
    { title: 'Species and access triage at 8pm.', line: 'Oak or pine, bucket truck or climber: someone has to sort it.' },
    { title: 'Crew-arrival follow-up slips.', line: 'Arrival windows and on-the-way texts fall off the list.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the tree, the damage and the access, then books the crew.', kind: 'chat', location: 'tree_services_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Removals, pruning and stump grinding.', kind: 'quote', location: 'tree_services_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Calls ahead of arrival.', line: 'Confirms the window and sends the crew-on-the-way update.', kind: 'voice', location: 'tree_services_voice_followup' },
  ],
  job: { label: 'Your average job', value: 1500 },
  faqs: FAQ_ITEMS,
  close: {
    book: ['tree_services_book_call', 'tree_services_footer'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'tree_services_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForTreeServices: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-tree-services', label: VERTICAL_LABELS['/ai-for-tree-services'] });

  return (
    <>
      <Helmet>
        <title>AI for Tree Services | After-Hours Storm-Damage Capture & Appointment Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Tree Services | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for residential tree services and storm-response crews: never miss an after-hours storm-damage call, triage species and canopy and access questions in under 60 seconds, and follow up the night before and morning of every appointment. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-tree-services" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForTreeServices;

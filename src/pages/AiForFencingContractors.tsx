import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Fence } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Ticket 0096 - long-tail landing page for the "AI for fencing contractors"
// query class. Reuses the three existing home-services demos verbatim
// (lead-responder, estimate, voice-followup) - no new demo, no new backend,
// no new pricing data.
// Modeled on src/pages/AiForTreeServices.tsx (ticket 0092) per the ticket
// engineering notes; the file structure, JSON-LD emission, and FAQ
// mirror-source pattern are 1:1 with the tree-services predecessor, with
// fencing-contractor-specific copy in every string slot.

// Mirror-source constants: every visible string that also appears inside a
// JSON-LD block is defined ONCE here so a copy edit cannot drift the visible
// text and the structured data apart.
const META_DESCRIPTION =
  'AI for residential and light-commercial fencing contractors: after-hours inbound quote requests from homeowners who want a same-week measure that go to voicemail while a crew is on a Saturday install, long-tail linear-footage and material-choice triage a dispatcher cannot answer without seeing the yard, and next-morning measure-appointment and crew-on-the-way confirmations that slip between the site visit and the arrival. Live demos built for fencing contractors - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and appointment-window and crew-on-the-way follow-up built for residential and light-commercial fencing contractors, single-crew wood-privacy installers running a skid steer and a post-hole auger, two-crew chain-link-and-vinyl operations, full-service outfits selling ornamental aluminum, cedar privacy, chain link, PVC picket, and welded wire, repair-and-gate-service specialists replacing storm-damaged panels, and HOA-and-property-manager subs. After-hours same-week measure inbounds when both crews are on Saturday installs, linear-footage and material-choice triage a dispatcher cannot resolve without a photo or a site visit, and follow-up cadence that carries a booking from measure confirmation through crew arrival.';

// FAQ items - single source of truth for both the visible cards and the
// FAQPage JSON-LD block per the 2026-05-25 mirror-source rule. Hyphen-only,
// defensible language, no invented client quotes, no manufacturer endorsement
// or certification-count claims per the ticket Out of scope box.
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Will the AI answer an after-hours same-week measure request the way a fence-company office manager would?',
    a: 'Yes. The AI qualifies the material (wood privacy, vinyl, ornamental aluminum, chain link, PVC picket, welded wire), the linear footage and height (4ft, 5ft, 6ft, 8ft), the gate count and gate widths, the property type (residential, HOA, light-commercial, property-manager), the job type (new install, panel replacement, storm-damage repair, gate service), and the callback number in under 60 seconds, then books the earliest measure slot on your calendar. The homeowner hears a natural conversation, not a menu tree.',
  },
  {
    q: 'What happens with long-tail questions about linear footage, material choice, HOA setback, or pool-code sign-off?',
    a: 'The AI asks the same follow-up questions a seasoned dispatcher would (material, linear footage, height, gate count and widths, post-spacing, HOA setback rules, pool-code sign-off, storm-damaged panel replacement) and returns a defensible per-job ballpark from the same home-services estimate demo, then hands the qualified lead to your estimator with the intake already filled in. City permit rules and neighborhood-specific HOA constraints stay with your team, so the AI never quotes a stale permit fee or a setback rule it should not.',
  },
  {
    q: 'Can the AI call a homeowner the night before and the morning of the measure so they stop calling the office?',
    a: 'Yes. The voice follow-up demo triggers a callback the evening before the measure to confirm the two-hour arrival window, calls again the morning of when the estimator heads out, and calls once more after the install to ask for a review while the crew name is still fresh. If a milestone slips or the crew is running behind, the AI flags the delay to your dispatcher instead of leaving the homeowner guessing.',
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
      name: 'AI for Fencing Contractors',
      item: 'https://digitalcraftai.com/ai-for-fencing-contractors',
    },
  ],
};

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Fencing Contractors',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Fencing Contractors',
  url: 'https://digitalcraftai.com/ai-for-fencing-contractors',
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
  testid: 'fencing-contractors',
  vertical: 'homeservices',
  icon: Fence,
  name: 'AI for Fencing Contractors',
  headline: 'Measure requests. Answered mid-install.',
  lead: 'After-hours quote requests answered, footage and material questions handled, measure and crew-arrival confirmations sent.',
  phone: {
    contact: 'Dana K.',
    initials: 'DK',
    inbound: 'Need about 180 feet of 6-foot cedar privacy fence around the back yard. Can you quote it?',
    reply: 'Happy to. Someone can measure Thursday at 8 or Saturday at 10. Which works?',
    followIn: 'Saturday',
    confirm: 'Booked for Saturday at 10. We’ll walk the line and send a written quote.',
    booked: 'Booked · Sat 10:00 AM',
    bookedDetail: 'Fence measure · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the fencing demo', track: ['try_demo', 'fencing_contractors_hero_lead_responder'] },
  book: ['book_call', 'fencing_contractors_hero'],
  painTitle: 'Where the jobs slip away.',
  pains: [
    { title: 'Quote requests hit voicemail.', line: 'The crew is on a Saturday install. She calls the next contractor.' },
    { title: 'Footage and material triage at 8pm.', line: 'Linear feet, cedar or vinyl, chain link or ornamental.' },
    { title: 'Measure confirmations slip.', line: 'Next-morning measures and crew arrivals fall off the list.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the footage, the material and the yard, then books the measure.', kind: 'chat', location: 'fencing_contractors_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Installs and repairs, priced as a range.', kind: 'quote', location: 'fencing_contractors_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Calls ahead of arrival.', line: 'Confirms the measure and the crew-on-the-way.', kind: 'voice', location: 'fencing_contractors_voice_followup' },
  ],
  job: { label: 'Your average job', value: 5000 },
  faqs: FAQ_ITEMS,
  close: {
    book: ['fencing_contractors_book_call', 'fencing_contractors_footer'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'fencing_contractors_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForFencingContractors: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-fencing-contractors', label: VERTICAL_LABELS['/ai-for-fencing-contractors'] });

  return (
    <>
      <Helmet>
        <title>AI for Fencing Contractors | After-Hours Measure Capture & Appointment Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Fencing Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for residential and light-commercial fencing contractors: never miss an after-hours same-week measure request, triage linear-footage and material and gate questions in under 60 seconds, and follow up the night before and morning of every measure. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-fencing-contractors" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForFencingContractors;

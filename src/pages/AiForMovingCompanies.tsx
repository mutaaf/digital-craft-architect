import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Truck } from 'lucide-react';
import SeoLanding, { type SeoLandingData } from '@/v3/SeoLanding';

// Ticket 0080 - long-tail landing page for the "AI for moving companies"
// query class. Reuses the three existing home-services demos verbatim
// (lead-responder, estimate, voice-followup) - no new demo, no new backend,
// no new pricing data.
// Modeled on src/pages/AiForRestorationServices.tsx (ticket 0072) per the
// ticket engineering notes; ticket 0080 additionally requires three JSON-LD
// blocks (Service, BreadcrumbList, FAQPage) with a visible FAQ card section
// whose copy mirrors the FAQPage block byte-for-byte per the 2026-05-25
// mirror-source rule. The Service block mirrors the ticket 0034
// AiForElectricians shape; the FAQ pattern is new for the trade-page family.

// Mirror-source constants: every visible string that also appears inside a
// JSON-LD block is defined ONCE here so a copy edit cannot drift the visible
// text and the structured data apart.
const META_DESCRIPTION =
  'AI for residential and long-distance moving companies: walk-in estimate calls that go to voicemail while a crew is on a load, long-tail inventory triage questions a dispatcher cannot answer without the truck manifest, and review requests that slip the day the last box lands on the new porch. Live demos built for movers - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and review automation built for local and long-distance moving companies. Walk-in estimate response when the crew is on a load, stairs and piano and elevator triage the dispatcher cannot answer without the truck manifest, and review-request calls that hit the hour the last box lands on the new porch.';

// FAQ items - single source of truth for both the visible cards and the
// FAQPage JSON-LD block per the 2026-05-25 mirror-source rule. Hyphen-only,
// defensible language, no invented client quotes.
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Will the AI answer a walk-in estimate call the way a moving-company dispatcher would?',
    a: 'Yes. The AI qualifies the move type (studio, one-bedroom, two-bedroom, four-bedroom, or commercial), the origin and destination, the stairs and elevator situation on each end, the oversized inventory (piano, safe, treadmill), the date window, and the callback number in under 60 seconds, then books the estimator on your calendar. The homeowner hears a natural conversation, not a menu tree.',
  },
  {
    q: 'What happens with long-tail inventory questions like a piano on a fourth-floor walkup?',
    a: 'The AI asks the same follow-up questions a seasoned dispatcher would (elevator reservation window, stair count, piano type and weight, whether the crew needs a fourth mover for the day) and returns a defensible truck-hour range from the same home-services estimate demo, then hands the qualified lead to your estimator with the manifest already filled in.',
  },
  {
    q: 'Can the AI call a homeowner back the hour a crew finishes a move to ask for a review?',
    a: 'Yes. The voice follow-up demo triggers a callback the hour the crew logs the last box off the truck, walks the homeowner through a natural conversation about the move-day experience, and drops a direct link to your Google Business Profile in a follow-up text. If the review window is closed (past 24 hours) the AI skips the review ask and pivots to a referral or storage-renewal question instead.',
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
      name: 'AI for Moving Companies',
      item: 'https://digitalcraftai.com/ai-for-moving-companies',
    },
  ],
};

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Moving Companies',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Moving Companies',
  url: 'https://digitalcraftai.com/ai-for-moving-companies',
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
  testid: 'moving-companies',
  vertical: 'homeservices',
  icon: Truck,
  name: 'AI for Moving Companies',
  headline: 'Estimate calls. Answered mid-load.',
  lead: 'Walk-in estimate calls answered, inventory questions handled, moving-day confirms and review requests sent.',
  phone: {
    contact: 'Nora F.',
    initials: 'NF',
    inbound: 'Moving out of a 2-bed on the 4th floor on the 30th, with a piano. Can you quote it?',
    reply: 'Happy to. Is there an elevator? An estimator can do a video walkthrough tomorrow at 6 or Saturday at 10.',
    followIn: 'Saturday at 10. No elevator.',
    confirm: 'Got it: stairs and a piano. You’re set for Saturday at 10.',
    booked: 'Booked · Sat 10:00 AM',
    bookedDetail: 'Video estimate · on your calendar',
  },
  primary: { to: '/homeservices/demo/lead-responder', label: 'Try the moving demo', track: ['try_demo', 'moving_companies_hero_lead_responder'] },
  book: ['book_call', 'moving_companies_hero'],
  painTitle: 'Where the moves slip away.',
  pains: [
    { title: 'Estimate calls hit voicemail mid-load.', line: 'She calls three movers and books whoever picks up.' },
    { title: 'Inventory questions at 8pm.', line: 'Stairs, a piano, an elevator window: someone has to weigh it.' },
    { title: 'Review timing slips.', line: 'Ask the hour the last box lands on the new porch.' },
  ],
  demos: [
    { to: '/homeservices/demo/lead-responder', title: 'Answers every call.', line: 'Qualifies the move, the stairs and the big items, then books the estimate.', kind: 'chat', location: 'moving_companies_lead_responder' },
    { to: '/homeservices/demo/estimate', title: 'Quotes in minutes.', line: 'Local and long-distance moves.', kind: 'quote', location: 'moving_companies_estimate' },
    { to: '/homeservices/demo/voice-followup', title: 'Confirms moving day.', line: 'Calls ahead of the move, then asks for the review.', kind: 'voice', location: 'moving_companies_voice_followup' },
  ],
  job: { label: 'Your average job', value: 2000 },
  faqs: FAQ_ITEMS,
  close: {
    book: ['moving_companies_book_call', 'moving_companies_footer'],
    try: { to: '/homeservices/demo/estimate', label: 'Try the quote demo', track: ['try_demo', 'moving_companies_bottom_estimate'] },
  },
  pricing: { to: '/homeservices', label: 'See home services pricing' },
};

const AiForMovingCompanies: React.FC = () => {
  useRecordVerticalVisit({ path: '/ai-for-moving-companies', label: VERTICAL_LABELS['/ai-for-moving-companies'] });

  return (
    <>
      <Helmet>
        <title>AI for Moving Companies | Walk-In Estimate Capture & Move-Day Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Moving Companies | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for local and long-distance moving companies: never miss a walk-in estimate call, triage stairs and piano and elevator inventory questions in under 60 seconds, and book five-star review calls the hour the last box lands on the new porch. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-moving-companies" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>
      <SeoLanding data={PAGE} />
    </>
  );
};

export default AiForMovingCompanies;

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { Truck, PhoneOff, Clock, MessageSquare, ArrowRight, Phone, Calculator, Star, Mic, Boxes } from 'lucide-react';

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
const HERO_H1 =
  'AI for Moving Companies That Are Done Losing Walk-In Estimates to Voicemail During a Load';
const META_DESCRIPTION =
  'AI for residential and long-distance moving companies: walk-in estimate calls that go to voicemail while a crew is on a load, long-tail inventory triage questions a dispatcher cannot answer without the truck manifest, and review requests that slip the day the last box lands on the new porch. Live demos built for movers - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and review automation built for local and long-distance moving companies. Walk-in estimate response when the crew is on a load, stairs and piano and elevator triage the dispatcher cannot answer without the truck manifest, and review-request calls that hit the hour the last box lands on the new porch.';

const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'Walk-in estimate calls go to voicemail during a load and never call back',
    desc: 'A homeowner three weeks out from a lease-end date or a closing date does not leave a voicemail and wait a day. She calls the first three movers in the SERP and books whichever picks up first. The shop with a crew on a load and no office cover loses the walk-in estimate to the mover two listings down that answered on the first ring or texted a quote back inside 60 seconds.',
  },
  {
    icon: Boxes,
    title: 'Long-tail inventory questions land at 8pm with no truck manifest to answer them',
    desc: 'A caller wanting a quote on a fourth-floor walkup with a piano, a queen bed, and a two-hour elevator reservation window needs someone who can weigh stairs, oversized items, and time-of-day surcharges against the truck-hour rate. Dispatchers off the clock cannot pull the manifest, and the caller books the mover that gave a clear ballpark first.',
  },
  {
    icon: Star,
    title: 'Review-request timing slips the day the last box lands on the new porch',
    desc: 'The window to earn a five-star review is the hour after the crew unloads the last box, when the homeowner is standing in the new living room and remembers the foreman by name. Manual review requests slip off the office list when the front desk is already dispatching the next move, and the homeowner unpacks and the review never happens. The same gap closes referral asks and next-year storage renewals.',
  },
];

const STATS = [
  { value: '24/7', label: 'Walk-in estimate and after-hours call capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '3', label: 'Live demos calibrated for moving-company workflows', icon: Truck },
  { value: '48h', label: 'From signup to a working AI agent', icon: Truck },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Moving Companies',
    desc: 'A chat agent that qualifies the move type (studio, one-bedroom, two-bedroom, four-bedroom, commercial relocation), the origin and destination, the elevator or stairs situation on both ends, the piano or safe or antique inventory, the date window, and the callback number in under 60 seconds, then books the estimator - even at 9pm on a Sunday. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Moving Lead Responder',
    location: 'moving_companies_lead_responder',
    matters: 'The mover that answers on the first ring books the walk-in estimate; the one that hits voicemail loses the job.',
  },
  {
    icon: Calculator,
    title: 'AI Quote Generator for Local and Long-Distance Moves',
    desc: 'A guided estimator that walks a homeowner through home size, stairs and elevator floors on each end, oversized items (piano, safe, gun cabinet, treadmill), packing scope, and mileage, then returns a defensible truck-hour and mileage range your dispatcher can confirm on the walk-through. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Moving Quote Demo',
    location: 'moving_companies_estimate',
    matters: 'A same-hour ballpark beats a two-day written estimate every time the homeowner is comparing three movers.',
  },
  {
    icon: Mic,
    title: 'AI Voice Follow-Up for Move-Day Confirms and Review Requests',
    desc: 'A voice agent that calls a homeowner the morning of the move to confirm the crew ETA and the elevator reservation, calls again the hour the last box lands on the new porch to lock in a five-star review while the foreman is still fresh in mind, and follows up a week later on referrals and storage renewals. Reuses the live home-services voice follow-up demo.',
    to: '/homeservices/demo/voice-followup',
    cta: 'Try the Moving Voice Demo',
    location: 'moving_companies_voice_followup',
    matters: 'A review asked for the hour the last box lands lands the five stars; one asked next week gets ignored.',
  },
];

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

const AiForMovingCompanies: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
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
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Truck size={16} />
            Built for local and long-distance moving companies
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Walk-in estimate calls that hit voicemail while a crew is on a load, long-tail inventory questions (stairs, pianos, elevator reservations) a dispatcher cannot answer without the truck manifest, and review requests that slip the day the last box lands on the new porch - the three gaps every moving shop knows about. AI agents close them so your crews run more moves and your phone stops costing you bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/homeservices/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'moving_companies_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Moving Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'moving_companies_hero')}
            >
              <Phone size={18} />
              Book a Moving AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup. No credit card. Live demos personalized to your moving company.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-11 h-11 mx-auto mb-3 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                  <s.icon size={22} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            Figures reflect target performance of the live demos, not individual client results.
          </p>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Gaps Every Moving Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Walk-in estimates dropped to voicemail during a load, stairs and piano and elevator inventory questions the dispatcher cannot answer at 8pm, and review requests nobody sends the hour the last box lands. AI agents stand in for the office manager who already had a full plate.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p) => (
              <div
                key={p.title}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <p.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA cards */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Live Demos Built for Moving Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the moving-company playbook.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEMO_CARDS.map((d) => (
              <div
                key={d.title}
                className="flex flex-col p-7 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <d.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{d.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-1">{d.desc}</p>
                <Link
                  to={d.to}
                  data-testid="moving-companies-demo-cta"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                  onClick={() => trackCTAClick('demo_card', d.location)}
                >
                  {d.cta}
                  <ArrowRight size={18} />
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                  Why this matters: {d.matters}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - mirror-source with the FAQPage JSON-LD block above */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Common Questions From Moving Owners
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Straight answers from the same three home-services demos, calibrated for moving workflows.
            </p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                data-testid="moving-companies-faq-card"
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.q}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why now + pricing link */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Why Moving Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            A walk-in estimate call and a next-day move-out review are both same-hour decisions for the homeowner. The mover that answers first and books the estimator first wins the walk-in; the shop that calls the hour the last box lands wins the five-star review. AI agents pick up on a Sunday at 9pm when the caller is Googling movers off her phone, qualify the move type and the inventory, and book the estimator on your calendar without changing how your crews work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, roofing, electrical, painting, landscaping, cleaning, pest control, pool service, and restoration tiers. Prefer a tailored recommendation? Take the{' '}
            <Link to="/quiz" className="text-primary hover:underline">
              2-minute AI readiness quiz
            </Link>
            .
          </p>
          <div className="flex justify-center mt-6 gap-1 text-primary/40">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="currentColor" />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Put AI to Work for Your Moving Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 15-minute strategy call and we will deploy a working AI agent against your real moving-company website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="moving-companies-footer-cta"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() =>
                trackCTAClick('moving_companies_book_call', 'moving_companies_footer')
              }
            >
              <Phone size={18} />
              Book a 15-minute strategy call
            </a>
            <Link
              to="/homeservices/demo/estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'moving_companies_bottom_estimate')}
            >
              <Calculator size={18} />
              Try the Moving Quote Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForMovingCompanies;

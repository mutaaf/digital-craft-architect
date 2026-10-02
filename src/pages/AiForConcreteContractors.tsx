import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { useRecordVerticalVisit } from '@/hooks/useRecordVerticalVisit';
import { VERTICAL_LABELS } from '@/data/verticalLabels';
import { Construction, PhoneOff, Clock, MessageSquare, ArrowRight, Phone, Calculator, Star, Mic, ClipboardList } from 'lucide-react';

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
const HERO_H1 =
  'AI for Concrete Contractors That Are Done Losing After-Hours Same-Week Pour Inbounds to Voicemail While the Crew Is Finishing a Friday Patio';
const META_DESCRIPTION =
  'AI for residential and light-commercial concrete contractors: weather-dependent pour reschedules and same-week booking inbounds that go to voicemail while the crew is finishing a Friday patio, long-tail square-footage and pour-type and finish triage a dispatcher cannot answer without seeing the slab, and crew-on-the-way and cure-cycle follow-up that slips between the pour and the sealant visit. Live demos built for concrete contractors - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and crew-on-the-way and cure-cycle follow-up built for residential and light-commercial concrete contractors, single-crew flatwork outfits pouring driveways and patios with a trailer-mounted mixer, two-crew foundation-and-footing operations running a boom truck and a laser-screed, decorative-concrete specialists selling stamped and stained patios plus pool decks, repair-and-leveling specialists doing mudjacking and polyjacking on settled slabs, and HOA-and-property-manager subs pouring sidewalks and curb-and-gutter work. Weather-dependent pour reschedules and after-hours same-week booking inbounds, square-footage and pour-type and finish triage a dispatcher cannot resolve without a photo or a site visit, and follow-up cadence that carries a booking from pour confirmation through the control-joint and sealant visit.';

const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'Weather-dependent pour reschedules push same-week booking inbounds to voicemail while the crew is finishing a Friday patio',
    desc: 'A homeowner who just saw a hairline crack telegraph across her two-year-old 20x30 driveway, or who needs a 400-square-foot stamped patio poured before her Memorial Day backyard party, is not going to leave a voicemail and wait until Monday morning. She calls the first three concrete companies she finds on Google and books whichever picks up first with a same-week measure. The shop that lost Friday to a thunderstorm, spent Saturday rescheduling three pours, and let the office go to voicemail loses the after-hours quote request to the company two listings down that answered on the first ring or texted a ballpark square-footage range back inside 60 seconds.',
  },
  {
    icon: ClipboardList,
    title: 'Long-tail square-footage, pour-type, and finish triage lands at 8pm with nobody there to see the slab',
    desc: 'A caller with a 400-square-foot broom-finish patio pour on a corner lot, a cracked driveway tear-out and replace on a 20x40 pad, a stamped-concrete pool deck question with a sealant preference, a stained-and-polished garage-floor question for a basement remodel, a 4-inch versus 6-inch thickness question with rebar versus mesh, a sidewalk-and-curb property-line question for an HOA punch-list, and a mudjacking question for a settled garage slab needs someone who can weigh pour type (flatwork, structural, footing), finish (broom, stamped, stained, polished, exposed-aggregate), thickness, reinforcement, and cure-cycle window against the crew you can dispatch this week. Dispatchers off the clock cannot see the slab, and the caller books the company that walked her through a clear ballpark first.',
  },
  {
    icon: Star,
    title: 'Crew-on-the-way and cure-cycle follow-up slips between the pour, the control-joint saw cuts, and the sealant visit',
    desc: 'A confirmed next-day concrete pour commonly runs from the initial call through a next-morning two-hour arrival window through the crew-on-the-way text, then through the day-of pour, the 24-hour control-joint saw-cut visit, and the sealant visit a week later. Manual follow-up on each milestone slips off the office list when the front desk is already dispatching the next weather-delayed pour, and the homeowner starts calling the office at 9:15am asking whether the crew is still coming and whether the cure window is still on track.',
  },
];

const STATS = [
  { value: '24/7', label: 'After-hours same-week pour and quote-request capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '3', label: 'Live demos calibrated for concrete-contractor workflows', icon: Construction },
  { value: '48h', label: 'From signup to a working AI agent', icon: Construction },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Concrete Contractors',
    desc: 'A chat agent that qualifies the pour type (flatwork, structural, footing), the finish (broom, stamped, stained, polished, exposed-aggregate), the square footage and thickness, the reinforcement (rebar, mesh), the property type (residential, HOA, light-commercial, property-manager), the job type (new pour, tear-out and replace, repair, mudjacking, control-joint saw cut, sealant visit), and the callback number in under 60 seconds, then books the earliest measure slot - even at 9pm on a Sunday after a rain-out. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Concrete Contractor Lead Responder',
    location: 'concrete_contractors_lead_responder',
    matters: 'The company that answers on the first ring books the same-week pour; the one that hits voicemail loses the after-hours quote request to a competitor who picked up first.',
  },
  {
    icon: Calculator,
    title: 'AI Quote Generator for Concrete Pours and Repairs',
    desc: 'A guided estimator that walks a homeowner through pour type, square footage, thickness, finish, and new-pour-versus-repair interest, then returns a defensible per-job ballpark your estimator can confirm on the measure. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Concrete Contractor Quote Demo',
    location: 'concrete_contractors_estimate',
    matters: 'A same-hour ballpark beats a next-day written quote every time the homeowner is comparing three concrete companies before her weekend backyard project starts.',
  },
  {
    icon: Mic,
    title: 'AI Voice Follow-Up for Pour and Cure-Cycle Calls',
    desc: 'A voice agent that calls a homeowner the evening before the next-morning pour to confirm the two-hour arrival window, calls again the morning of when the crew heads out, follows up at the 24-hour control-joint saw-cut mark, and calls once more at the sealant visit to ask for a five-star review while the crew name is still fresh. Reuses the live home-services voice follow-up demo.',
    to: '/homeservices/demo/voice-followup',
    cta: 'Try the Concrete Contractor Voice Demo',
    location: 'concrete_contractors_voice_followup',
    matters: 'A homeowner who hears a friendly voice the night before the pour, the morning of, at the saw-cut visit, and at the sealant visit stops calling the office at 9:15am and leaves a five-star review the same week.',
  },
];

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

const AiForConcreteContractors: React.FC = () => {
  const { content } = useContent();
  useRecordVerticalVisit({ path: '/ai-for-concrete-contractors', label: VERTICAL_LABELS['/ai-for-concrete-contractors'] });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
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
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Construction size={16} />
            Built for residential and light-commercial concrete contractors
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Weather-dependent pour reschedules and same-week booking inbounds that hit voicemail while the crew is finishing a Friday patio, long-tail square-footage and pour-type and finish questions a dispatcher cannot answer without seeing the slab, and crew-on-the-way and cure-cycle follow-up that slips between the pour and the sealant visit - the three gaps every concrete company knows about. AI agents close them so your crews stay on pours and your phone stops costing you same-week bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/homeservices/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'concrete_contractors_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Concrete Contractor Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'concrete_contractors_hero')}
            >
              <Phone size={18} />
              Book a Concrete Contractor AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup. No credit card. Live demos personalized to your concrete-contractor company.
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
              Three Gaps Every Concrete Contractor Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Weather-dependent pour reschedules dropped to voicemail while the crew is finishing a Friday patio, square-footage and finish and thickness questions the dispatcher cannot answer at 8pm, and crew-on-the-way and cure-cycle follow-ups nobody sends between the pour and the sealant visit. AI agents stand in for the office manager who already had a full plate.
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
              Three Live Demos Built for Concrete-Contractor Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the concrete-contractor playbook.
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
                  data-testid="concrete-contractors-demo-cta"
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
              Common Questions From Concrete Contractor Owners
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Straight answers from the same three home-services demos, calibrated for concrete-contractor workflows.
            </p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                data-testid="concrete-contractors-faq-card"
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
            Why Concrete Contractor Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            An after-hours same-week pour inbound and a crew-on-the-way question are both same-hour decisions for the homeowner. The company that answers first and books the measure first wins the pour; the shop that calls the night before the appointment keeps the homeowner off Google Maps looking for another concrete company. AI agents pick up on a Sunday at 9pm when the caller is Googling concrete installation off her phone after a weekend rain-out, qualify the pour type and the square footage and the finish, and book the crew on your calendar without changing how your trucks work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, roofing, electrical, painting, landscaping, cleaning, pest control, pool service, restoration, moving, solar, window, garage-door, tree-service, and fencing-contractor tiers. Prefer a tailored recommendation? Take the{' '}
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
            Put AI to Work for Your Concrete Contractor Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 15-minute strategy call and we will deploy a working AI agent against your real concrete-contractor-company website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="concrete-contractors-footer-cta"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() =>
                trackCTAClick('concrete_contractors_book_call', 'concrete_contractors_footer')
              }
            >
              <Phone size={18} />
              Book a 15-minute strategy call
            </a>
            <Link
              to="/homeservices/demo/estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'concrete_contractors_bottom_estimate')}
            >
              <Calculator size={18} />
              Try the Concrete Contractor Quote Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForConcreteContractors;

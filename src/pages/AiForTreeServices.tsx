import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { TreePine, PhoneOff, Clock, MessageSquare, ArrowRight, Phone, Calculator, Star, Mic, ClipboardList } from 'lucide-react';

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
const HERO_H1 =
  'AI for Tree Services That Are Done Losing After-Hours Storm-Damage Emergencies to Voicemail While a Limb Is on the Homeowner Roof or Driveway';
const META_DESCRIPTION =
  'AI for residential tree services: after-hours storm-damage emergency inbounds that go to voicemail while a fallen limb is on the homeowner roof or driveway, long-tail species and access triage questions a dispatcher cannot answer without seeing the tree in person, and next-day appointment-window confirmations and crew-on-the-way follow-ups that slip between the walk-through and crew arrival. Live demos built for tree services - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and appointment-window and crew-on-the-way follow-up built for residential tree services, single-crew climber-and-groundman shops taking storm-damage callouts, two-crew removal-and-pruning operations running bucket trucks and chippers, full-service arboriculture firms carrying certified arborists, stump-grinding subcontractors, and emergency storm-response tree crews answering utility-corridor callouts. After-hours storm-damage and fallen-limb response when both crews are mid-removal, species and canopy and drop-zone triage a dispatcher cannot resolve without a photo or a site visit, and follow-up cadence that carries a booking from confirmation through crew arrival.';

const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'After-hours storm-damage emergencies go to voicemail while a fallen limb sits on the roof or driveway',
    desc: 'A homeowner staring at a snapped pine across the fence or a huge oak branch hanging over the bedroom at 8:15pm the evening after a Thursday thunderstorm is not going to leave a voicemail and wait until Monday morning. She calls the first three tree companies she finds and books whichever picks up first. The shop with both crews mid-removal on the last calls of the day and no office cover loses the fallen-limb emergency to the company two listings down that answered on the first ring or texted a ballpark back inside 60 seconds.',
  },
  {
    icon: ClipboardList,
    title: 'Long-tail species, canopy, and access triage questions land at 8pm with nobody there to see the tree',
    desc: 'A caller with a 60-foot oak leaning over a two-story roof, a snapped pine hanging above a power line, a stump-grinding question after a full removal, a bucket-truck-versus-climber access decision on a fenced back yard, and a question about whether the crew can back a chipper down the driveway needs someone who can weigh species, canopy height, trunk diameter, drop-zone hazards, and pruning-versus-full-removal-versus-stump-grinding against the crew you can dispatch tomorrow. Dispatchers off the clock cannot see the tree, and the caller books the company that walked her through a clear ballpark first.',
  },
  {
    icon: Star,
    title: 'Next-day appointment-window and crew-on-the-way follow-ups slip between the walk-through and crew arrival',
    desc: 'A confirmed next-morning tree removal commonly runs from the walk-through call through a next-day two-hour arrival window through the crew-on-the-way text. Manual follow-up on each job slips off the office list when the front desk is already dispatching the next storm-damage call, and the homeowner starts calling the office at 9:15am asking why the truck is not there yet and whether the appointment is still on.',
  },
];

const STATS = [
  { value: '24/7', label: 'After-hours storm-damage and fallen-limb call capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '3', label: 'Live demos calibrated for tree-service workflows', icon: TreePine },
  { value: '48h', label: 'From signup to a working AI agent', icon: TreePine },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Tree Services',
    desc: 'A chat agent that qualifies the species (oak, pine, maple, elm, cottonwood), the trunk diameter and canopy height, the drop-zone hazards (nearby structures, fences, power lines), the access (bucket-truck versus climber, chipper backup path), the job type (pruning, full removal, stump grinding, storm-damage cleanup), and the callback number in under 60 seconds, then books the earliest emergency slot - even at 9pm on a Sunday after a storm. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Tree Service Lead Responder',
    location: 'tree_services_lead_responder',
    matters: 'The company that answers on the first ring books the storm-damage emergency; the one that hits voicemail loses the after-hours removal.',
  },
  {
    icon: Calculator,
    title: 'AI Quote Generator for Tree Removal and Pruning',
    desc: 'A guided estimator that walks a homeowner through species, trunk diameter, canopy height, drop-zone access, and pruning-versus-removal-versus-stump-grinding interest, then returns a defensible per-job ballpark your crew can confirm on arrival. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Tree Service Quote Demo',
    location: 'tree_services_estimate',
    matters: 'A same-hour ballpark beats a next-day written quote every time the homeowner is comparing three tree companies before her driveway is cleared in the morning.',
  },
  {
    icon: Mic,
    title: 'AI Voice Follow-Up for Appointment-Window and Crew-on-the-Way Calls',
    desc: 'A voice agent that calls a homeowner the evening before the next-day appointment to confirm the two-hour arrival window, calls again the morning of when the crew heads out, and calls once more after the removal to ask for a five-star review while the crew name is still fresh. Reuses the live home-services voice follow-up demo.',
    to: '/homeservices/demo/voice-followup',
    cta: 'Try the Tree Service Voice Demo',
    location: 'tree_services_voice_followup',
    matters: 'A homeowner who hears a friendly voice the night before and the morning of the removal stops calling the office at 9:15am and leaves a five-star review the same day.',
  },
];

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

const AiForTreeServices: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
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
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <TreePine size={16} />
            Built for residential tree services and storm-response crews
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            After-hours storm-damage emergencies that hit voicemail while a fallen limb sits on a homeowner roof, long-tail species and canopy and access triage questions a dispatcher cannot answer without seeing the tree, and next-day appointment-window and crew-on-the-way follow-ups that slip between the walk-through and arrival - the three gaps every tree-service shop knows about. AI agents close them so your crews stay on jobs and your phone stops costing you emergency removals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/homeservices/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'tree_services_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Tree Service Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'tree_services_hero')}
            >
              <Phone size={18} />
              Book a Tree Service AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup. No credit card. Live demos personalized to your tree-service company.
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
              Three Gaps Every Tree Service Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              After-hours storm-damage inbounds dropped to voicemail while a fallen limb sits on the driveway, species and canopy and access questions the dispatcher cannot answer at 8pm, and next-day appointment-window and crew-on-the-way follow-ups nobody sends between the walk-through and arrival. AI agents stand in for the office manager who already had a full plate.
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
              Three Live Demos Built for Tree Service Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the tree-service playbook.
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
                  data-testid="tree-services-demo-cta"
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
              Common Questions From Tree Service Owners
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Straight answers from the same three home-services demos, calibrated for tree-service workflows.
            </p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                data-testid="tree-services-faq-card"
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
            Why Tree Service Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            A fallen-limb emergency call and a crew-on-the-way question are both same-hour decisions for the homeowner. The company that answers first and books the emergency first wins the removal; the shop that calls the night before the appointment keeps the homeowner off Google Maps looking for another tree company. AI agents pick up on a Sunday at 9pm when the caller is Googling tree removal off her phone the evening after a storm, qualify the species and the drop-zone access, and book the crew on your calendar without changing how your trucks work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, roofing, electrical, painting, landscaping, cleaning, pest control, pool service, restoration, moving, solar, window, and garage-door tiers. Prefer a tailored recommendation? Take the{' '}
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
            Put AI to Work for Your Tree Service Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 15-minute strategy call and we will deploy a working AI agent against your real tree-service-company website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="tree-services-footer-cta"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() =>
                trackCTAClick('tree_services_book_call', 'tree_services_footer')
              }
            >
              <Phone size={18} />
              Book a 15-minute strategy call
            </a>
            <Link
              to="/homeservices/demo/estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'tree_services_bottom_estimate')}
            >
              <Calculator size={18} />
              Try the Tree Service Quote Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForTreeServices;

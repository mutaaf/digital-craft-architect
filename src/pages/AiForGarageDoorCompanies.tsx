import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { DoorOpen, PhoneOff, Clock, MessageSquare, ArrowRight, Phone, Calculator, Star, Mic, ClipboardList } from 'lucide-react';

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
const HERO_H1 =
  'AI for Garage Door Companies That Are Done Losing After-Hours Broken-Spring Emergencies to Voicemail While the Homeowner Cannot Get Their Car Out';
const META_DESCRIPTION =
  'AI for residential garage door companies: after-hours broken-spring emergencies that go to voicemail while the homeowner cannot get their car out, long-tail opener-brand and spring-size triage questions a dispatcher cannot answer without the door specs in hand, and next-day appointment-window confirmations and technician-on-the-way follow-ups that slip between booking and arrival. Live demos built for garage doors - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and appointment-window and technician-on-the-way follow-up built for residential garage door companies, single-truck overhead-door repair shops, opener-and-spring specialists, full sales-service-install regional operations, hurricane-code coastal dealers, and franchise territory owners running multiple trucks on emergency broken-spring calls. After-hours broken-spring and stuck-door response when both trucks are mid-job, opener-brand and torsion-vs-extension-spring and section-vs-full-door triage a dispatcher cannot answer without the door specs in hand, and follow-up cadence that carries a booking from confirmation through technician arrival.';

const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'After-hours broken-spring emergencies go to voicemail and the homeowner calls the next number on the SERP',
    desc: 'A homeowner staring at a stuck garage door at 7:45pm Saturday, with the car trapped inside or out, is not going to leave a voicemail and wait until Monday morning. She calls the first three garage-door companies she finds and books whichever picks up first. The shop with both trucks mid-job on the last calls of the day and no office cover loses the broken-spring emergency to the company two listings down that answered on the first ring or texted a ballpark back inside 60 seconds.',
  },
  {
    icon: ClipboardList,
    title: 'Long-tail opener-brand and spring-size triage questions land at 8pm with no door specs in hand',
    desc: 'A caller with a 16-by-7 double-car door, a snapped left torsion spring, a LiftMaster opener that still runs but strains, an insulated three-layer panel, and a question about whether the whole door needs replacing after a car impact needs someone who can weigh door dimensions, opener brand, spring type torsion versus extension, and section-versus-full-door replacement against the parts on the truck. Dispatchers off the clock cannot pull the parts manifest, and the caller books the company that walked her through a clear ballpark first.',
  },
  {
    icon: Star,
    title: 'Next-day appointment-window and technician-on-the-way follow-ups slip between booking and arrival',
    desc: 'A confirmed next-morning garage-door repair commonly runs from the booking call through a next-day two-hour window through the technician-on-the-way text. Manual follow-up on each gate slips off the office list when the front desk is already dispatching the next broken-spring call, and the homeowner starts calling the office at 9:15am asking why the truck is not there yet and whether the appointment is still on.',
  },
];

const STATS = [
  { value: '24/7', label: 'After-hours broken-spring and stuck-door call capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '3', label: 'Live demos calibrated for garage-door workflows', icon: DoorOpen },
  { value: '48h', label: 'From signup to a working AI agent', icon: DoorOpen },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Garage Door Companies',
    desc: 'A chat agent that qualifies the door size (single or double, 8x7 through 18x8), the opener brand (LiftMaster, Chamberlain, Genie, Craftsman, Sommer), the spring type (torsion or extension), the failure mode (snapped spring, dead opener, cable off drum, panel damage from a car impact, remote will not pair), and the callback number in under 60 seconds, then books the earliest emergency slot - even at 9pm on a Sunday. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Garage Door Lead Responder',
    location: 'garage_door_companies_lead_responder',
    matters: 'The company that answers on the first ring books the broken-spring emergency; the one that hits voicemail loses the after-hours repair.',
  },
  {
    icon: Calculator,
    title: 'AI Quote Generator for Garage Door Repair',
    desc: 'A guided estimator that walks a homeowner through door size, spring type, opener brand, panel condition, and repair-versus-replace interest, then returns a defensible per-repair and full-door-replacement ballpark your technician can confirm on arrival. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Garage Door Quote Demo',
    location: 'garage_door_companies_estimate',
    matters: 'A same-hour ballpark beats a next-day written quote every time the homeowner is comparing three garage-door companies before her car gets picked up in the morning.',
  },
  {
    icon: Mic,
    title: 'AI Voice Follow-Up for Appointment-Window and Technician-on-the-Way Calls',
    desc: 'A voice agent that calls a homeowner the evening before the next-day appointment to confirm the two-hour window, calls again the morning of when the technician heads out, and calls once more after the repair to ask for a five-star review while the technician name is still fresh. Reuses the live home-services voice follow-up demo.',
    to: '/homeservices/demo/voice-followup',
    cta: 'Try the Garage Door Voice Demo',
    location: 'garage_door_companies_voice_followup',
    matters: 'A homeowner who hears a friendly voice the night before and the morning of the repair stops calling the office at 9:15am and leaves a five-star review the same day.',
  },
];

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

const AiForGarageDoorCompanies: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
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
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <DoorOpen size={16} />
            Built for residential garage door companies and overhead-door repair shops
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            After-hours broken-spring emergencies that hit voicemail while the homeowner cannot get her car out, long-tail opener-brand and spring-size triage questions a dispatcher cannot answer without the door specs in hand, and next-day appointment-window and technician-on-the-way follow-ups that slip between booking and arrival - the three gaps every garage-door shop knows about. AI agents close them so your trucks stay on jobs and your phone stops costing you emergency calls.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/homeservices/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'garage_door_companies_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Garage Door Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'garage_door_companies_hero')}
            >
              <Phone size={18} />
              Book a Garage Door AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup. No credit card. Live demos personalized to your garage-door company.
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
              Three Gaps Every Garage Door Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              After-hours broken-spring inbounds dropped to voicemail while the homeowner cannot get her car out, opener-brand and spring-size questions the dispatcher cannot answer at 8pm, and next-day appointment-window and technician-on-the-way follow-ups nobody sends between booking and arrival. AI agents stand in for the office manager who already had a full plate.
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
              Three Live Demos Built for Garage Door Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the garage-door playbook.
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
                  data-testid="garage-door-companies-demo-cta"
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
              Common Questions From Garage Door Owners
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Straight answers from the same three home-services demos, calibrated for garage-door workflows.
            </p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                data-testid="garage-door-companies-faq-card"
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
            Why Garage Door Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            A broken-spring call and a technician-on-the-way question are both same-hour decisions for the homeowner. The company that answers first and books the emergency first wins the repair; the shop that calls the night before the appointment keeps the homeowner off Google Maps looking for another garage-door company. AI agents pick up on a Sunday at 9pm when the caller is Googling garage-door repair off her phone, qualify the door size and the opener brand, and book the technician on your calendar without changing how your trucks work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, roofing, electrical, painting, landscaping, cleaning, pest control, pool service, restoration, moving, solar, and window tiers. Prefer a tailored recommendation? Take the{' '}
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
            Put AI to Work for Your Garage Door Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 15-minute strategy call and we will deploy a working AI agent against your real garage-door-company website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="garage-door-companies-footer-cta"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() =>
                trackCTAClick('garage_door_companies_book_call', 'garage_door_companies_footer')
              }
            >
              <Phone size={18} />
              Book a 15-minute strategy call
            </a>
            <Link
              to="/homeservices/demo/estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'garage_door_companies_bottom_estimate')}
            >
              <Calculator size={18} />
              Try the Garage Door Quote Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForGarageDoorCompanies;

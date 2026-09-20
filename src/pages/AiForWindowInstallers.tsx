import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { AppWindow, PhoneOff, Clock, MessageSquare, ArrowRight, Phone, Calculator, Star, Mic, ClipboardList } from 'lucide-react';

// Ticket 0087 - long-tail landing page for the "AI for window installers"
// query class. Reuses the three existing home-services demos verbatim
// (lead-responder, estimate, voice-followup) - no new demo, no new backend,
// no new pricing data.
// Modeled on src/pages/AiForSolarInstallers.tsx (ticket 0084) per the
// ticket engineering notes; the file structure, JSON-LD emission, and FAQ
// mirror-source pattern are 1:1 with the solar-installers predecessor, with
// window-installer-specific copy in every string slot.

// Mirror-source constants: every visible string that also appears inside a
// JSON-LD block is defined ONCE here so a copy edit cannot drift the visible
// text and the structured data apart.
const HERO_H1 =
  'AI for Window Installers That Are Done Losing Whole-House Replacement Inbounds to Voicemail During an In-Home Measurement';
const META_DESCRIPTION =
  'AI for residential window installers: whole-house replacement inbounds that go to voicemail during an in-home measurement, long-tail frame-material and glass-package questions a dispatcher cannot answer without the opening dimensions in hand, and manufacturer-lead-time and permit follow-up cadence that slips between contract signing and install day. Live demos built for windows - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and manufacturer-lead-time and permit follow-up built for residential window installers, full-frame vinyl and fiberglass replacement contractors, window-and-siding hybrids, authorized-dealer showrooms, and storm-window specialists. Whole-house replacement response when the crew is on an in-home measurement, opening-count and frame-material and glass-package triage a dispatcher cannot answer without the opening dimensions in hand, and follow-up cadence that carries a contract from deposit through install day.';

const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'Whole-house replacement inbounds go to voicemail during an in-home measurement and never call back',
    desc: 'A homeowner staring at drafty kitchen windows on a January afternoon is not going to leave a voicemail and wait a day. She calls the first three installers she finds and books whichever picks up first. The shop with a lead estimator already tape-measuring an opening two towns over and no office cover loses the whole-house replacement to the installer two listings down that answered on the first ring or texted a ballpark back inside 60 seconds.',
  },
  {
    icon: ClipboardList,
    title: 'Long-tail frame-material and glass-package questions land at 8pm with no opening dimensions in hand',
    desc: 'A caller asking about fifteen openings with a mix of double-hung and picture windows, a preference for vinyl over fiberglass, an argon-fill low-e glass package, and a question about egress compliance for a basement bedroom needs someone who can weigh opening count, frame material, glass package, and storm-shutter compatibility against local building code. Dispatchers off the clock cannot pull the manifest, and the caller books the installer that walked her through a clear ballpark first.',
  },
  {
    icon: Star,
    title: 'Manufacturer-lead-time and permit follow-up slips between contract signing and install day',
    desc: 'A signed whole-house window replacement commonly runs 4 to 8 weeks from deposit through install day: field measure, order to the manufacturer, permit filing, delivery to the shop, install-day scheduling, city inspection. Manual follow-up on each gate slips off the office list when the front desk is already dispatching the next in-home measurement, and the homeowner starts calling every Friday asking why the contract is signed but nobody has scheduled the install yet.',
  },
];

const STATS = [
  { value: '24/7', label: 'Whole-house replacement and after-hours call capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '3', label: 'Live demos calibrated for window-installer workflows', icon: AppWindow },
  { value: '48h', label: 'From signup to a working AI agent', icon: AppWindow },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Window Installers',
    desc: 'A chat agent that qualifies the opening count, the frame-material preference (vinyl, fiberglass, wood, aluminum-clad), the window style mix (double-hung, casement, picture, slider), the glass package (single, dual, argon-fill low-e), the storm-shutter or egress requirement, and the callback number in under 60 seconds, then books the in-home measurement - even at 9pm on a Sunday. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Window Lead Responder',
    location: 'window_installers_lead_responder',
    matters: 'The installer that answers on the first ring books the in-home measurement; the one that hits voicemail loses the whole-house replacement.',
  },
  {
    icon: Calculator,
    title: 'AI Quote Generator for Window Replacement',
    desc: 'A guided estimator that walks a homeowner through opening count, window styles, frame-material preference, glass-package selection, and financing interest, then returns a defensible per-opening and ballpark whole-house range your estimator can confirm on the in-home measurement. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Window Quote Demo',
    location: 'window_installers_estimate',
    matters: 'A same-hour ballpark beats a two-week written proposal every time the homeowner is comparing three installers.',
  },
  {
    icon: Mic,
    title: 'AI Voice Follow-Up for Manufacturer and Install-Day Milestones',
    desc: 'A voice agent that calls a homeowner the day the order goes to the manufacturer, the day the windows land at the shop, the day the install crew is scheduled, and the day the city inspection lands, so the customer hears a friendly voice at every gate instead of a Friday-afternoon status text. Reuses the live home-services voice follow-up demo.',
    to: '/homeservices/demo/voice-followup',
    cta: 'Try the Window Voice Demo',
    location: 'window_installers_voice_followup',
    matters: 'A homeowner who hears a friendly voice at every manufacturer and install milestone calls fewer times and leaves a five-star review on install day.',
  },
];

// FAQ items - single source of truth for both the visible cards and the
// FAQPage JSON-LD block per the 2026-05-25 mirror-source rule. Hyphen-only,
// defensible language, no invented client quotes, no tax-credit or building-
// code claims per the ticket Out of scope box.
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Will the AI answer a whole-house replacement call the way a window-installer dispatcher would?',
    a: 'Yes. The AI qualifies the opening count, the frame-material preference (vinyl, fiberglass, wood, aluminum-clad), the window style mix (double-hung, casement, picture, slider), the glass package (single, dual, argon-fill low-e), the storm-shutter or egress requirement, and the callback number in under 60 seconds, then books the in-home measurement on your calendar. The homeowner hears a natural conversation, not a menu tree.',
  },
  {
    q: 'What happens with long-tail questions about frame material, glass package, or egress compliance?',
    a: 'The AI asks the same follow-up questions a seasoned dispatcher would (opening count, room-by-room mix, frame-material preference, glass-package interest, storm-shutter compatibility, financing preference between cash, loan, or lease) and returns a defensible per-opening and whole-house ballpark from the same home-services estimate demo, then hands the qualified lead to your estimator with the intake already filled in. Specific building-code numbers and manufacturer warranty terms stay with your team, so the AI never quotes a stale code cite or a warranty clause it should not.',
  },
  {
    q: 'Can the AI call a homeowner at each manufacturer and install milestone so they stop calling the office?',
    a: 'Yes. The voice follow-up demo triggers a callback the day the order goes to the manufacturer, the day the windows land at the shop, the day the install crew is scheduled, and the day the city inspection lands, walks the homeowner through a natural conversation about the next step, and drops a status link in a follow-up text. If a milestone slips, the AI flags the delay to your operations lead instead of leaving the homeowner guessing.',
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
      name: 'AI for Window Installers',
      item: 'https://digitalcraftai.com/ai-for-window-installers',
    },
  ],
};

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Window Installers',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Window Installers',
  url: 'https://digitalcraftai.com/ai-for-window-installers',
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

const AiForWindowInstallers: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Window Installers | Whole-House Replacement Capture & Install Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Window Installers | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for residential window installers and full-frame replacement contractors: never miss a whole-house replacement call, triage frame-material and glass-package and egress questions in under 60 seconds, and follow up at every manufacturer and install milestone. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-window-installers" />
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
            <AppWindow size={16} />
            Built for residential window installers and replacement contractors
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Whole-house replacement inbounds that hit voicemail during an in-home measurement, long-tail frame-material and glass-package questions a dispatcher cannot answer without the opening dimensions in hand, and manufacturer-lead-time and permit follow-up cadence that slips between contract signing and install day - the three gaps every window shop knows about. AI agents close them so your estimators stay on measurements and your phone stops costing you contracts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/homeservices/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'window_installers_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Window Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'window_installers_hero')}
            >
              <Phone size={18} />
              Book a Window AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup. No credit card. Live demos personalized to your window company.
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
              Three Gaps Every Window Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Whole-house replacement inbounds dropped to voicemail during an in-home measurement, frame-material and glass-package questions the dispatcher cannot answer at 8pm, and manufacturer-lead-time and permit follow-up nobody sends between signing and install day. AI agents stand in for the office manager who already had a full plate.
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
              Three Live Demos Built for Window Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the window-installer playbook.
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
                  data-testid="window-installers-demo-cta"
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
              Common Questions From Window Owners
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Straight answers from the same three home-services demos, calibrated for window workflows.
            </p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                data-testid="window-installers-faq-card"
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
            Why Window Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            A whole-house replacement call and a permit-status question are both same-hour decisions for the homeowner. The installer that answers first and books the in-home measurement first wins the contract; the shop that calls the day the manufacturer order ships keeps the homeowner off Google Maps looking for another installer. AI agents pick up on a Sunday at 9pm when the caller is Googling windows off her phone, qualify the opening count and the frame-material preference, and book the estimator on your calendar without changing how your crews work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, roofing, electrical, painting, landscaping, cleaning, pest control, pool service, restoration, moving, and solar tiers. Prefer a tailored recommendation? Take the{' '}
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
            Put AI to Work for Your Window Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 15-minute strategy call and we will deploy a working AI agent against your real window-installer website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="window-installers-footer-cta"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() =>
                trackCTAClick('window_installers_book_call', 'window_installers_footer')
              }
            >
              <Phone size={18} />
              Book a 15-minute strategy call
            </a>
            <Link
              to="/homeservices/demo/estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'window_installers_bottom_estimate')}
            >
              <Calculator size={18} />
              Try the Window Quote Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForWindowInstallers;

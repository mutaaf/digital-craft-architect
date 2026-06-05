import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import {
  Zap,
  PhoneOff,
  Clock,
  MessageSquare,
  ArrowRight,
  Plug,
  Phone,
  Calculator,
  Star,
} from 'lucide-react';

// Long-tail landing page for the "AI for electricians" query class. Reuses
// the two existing home-services demos verbatim and links to the existing
// /homeservices pricing tiers - no new demo, no new backend, no new pricing.
// Modeled on src/pages/AiForRoofers.tsx per ticket 0034 engineering notes
// (the most recent peer in the trade-quartet pattern).

// 2026-05-25 mirror-source rule: every string used in the hero H1, the
// Helmet description, and the Service schema description lives as a single
// shared constant inside this module so a later copy edit cannot drift the
// visible text and the structured data apart.
const HERO_H1 = 'AI for Electrical Contractors Who Are Done Losing After-Hours Service Calls';
const META_DESCRIPTION =
  'AI for electrical contractors: after-hours service-call capture, instant on-site quotes for panel upgrades and EV-charger installs, and automated review collection. Live demos built for electricians - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, on-site quoting assistance, and review automation built for electrical contractors. After-hours service-call response, instant quote follow-up on panel upgrades and EV-charger installs, and review collection that never forgets.';

// Electrical-specific pain points. Defensible language only - no invented
// client quotes, dollar figures, or efficacy percentages. Industry-standard
// market context, not DCA client results.
const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'After-hours service calls go to voicemail and never come back',
    desc: 'Breakers tripping at 9pm, a burning-smell call at 11pm, a pool-pump outage on Saturday - the homeowner does not wait for Monday. The electrician who answers (or texts back inside 60 seconds) books the trip charge; the office voicemail loses the job to the next listing in the search result.',
  },
  {
    icon: Calculator,
    title: 'Panel upgrades and EV-charger quotes follow up too slowly',
    desc: 'A 200-amp service upgrade or a Level 2 EV-charger install needs a written estimate the homeowner can compare against two other bids. A quote that lands in the inbox three days after the on-site walkthrough is a job that goes to the contractor who texted a range the same afternoon.',
  },
  {
    icon: Star,
    title: 'Review chasing after a finished job slips off the dispatcher list',
    desc: 'The window to ask a happy homeowner for a 5-star review is the afternoon the truck rolls out, not the following week. Manual review chasing slips off the dispatcher list every Friday, and the Google Business Profile ranking stops climbing in the local map pack.',
  },
];

const STATS = [
  { value: '24/7', label: 'After-hours and weekend service-call capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '2', label: 'Live demos built for electrical workflows', icon: Zap },
  { value: '48h', label: 'From signup to a working AI agent', icon: Plug },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Electrical Contractors',
    desc: 'A chat agent that qualifies the trouble pattern (breaker tripping, no power, panel upgrade, EV-charger install), the urgency, and the address in under 60 seconds, then books the truck roll - even on a Saturday night. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Electrical Lead Responder',
    location: 'electricians_lead_responder',
  },
  {
    icon: Calculator,
    title: 'AI Estimate Generator for Electrical Contractors',
    desc: 'A guided estimator that walks a homeowner through service calls, panel upgrades, EV-charger installs, and rewire scopes, then returns a defensible price range your master electrician can confirm on the next site visit. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Electrical Estimate Demo',
    location: 'electricians_estimate',
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
      name: 'AI for Electricians',
      item: 'https://digitalcraftai.com/ai-for-electricians',
    },
  ],
};

// Sibling Service schema mirroring the AiForRoofers pattern, with
// serviceType naming electrical contractors per ticket acceptance criteria.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Electricians',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Electrical Contractors',
  url: 'https://digitalcraftai.com/ai-for-electricians',
};

const AiForElectricians: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Electrical Contractors | After-Hours Call Capture & Instant Estimates</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Electrical Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for electrical contractors: never miss an after-hours service call, follow up on panel and EV-charger quotes the same day, and chase every 5-star review. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-electricians" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Zap size={16} />
            Built for electrical contractors
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            After-hours service calls that hit voicemail, slow follow-up on panel and EV-charger quotes, missed review windows after a finished job - the three gaps every electrical shop knows about. AI agents close them so your master electricians run more jobs and your phone stops costing you bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/homeservices/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'electricians_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Electrical Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'electricians_hero')}
            >
              <Phone size={18} />
              Book an Electrical AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup · No credit card · Live demos personalized to your electrical company
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

      {/* Electrical pain points */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Gaps Every Electrical Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Service calls at night, panel and EV-charger quotes that need the same-day turnaround, and reviews nobody asks for. AI agents stand in for the dispatcher who already had a full plate.
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
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Two Live Demos Built for Electrical Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the electrical playbook.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEMO_CARDS.map((d) => (
              <div
                key={d.title}
                className="flex flex-col p-7 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <d.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{d.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5 flex-1">{d.desc}</p>
                <Link
                  to={d.to}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                  onClick={() => trackCTAClick('demo_card', d.location)}
                >
                  {d.cta}
                  <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why now + pricing link */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Why Electrical Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            An electrical service call is a same-hour decision. The shop that answers first and quotes a range first books the truck roll. AI agents pick up at 11pm during a panel-trip surge, qualify the trouble pattern and the urgency, and book the visit on your calendar without changing how your crews work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, and roofing tiers. Prefer a tailored recommendation? Take the{' '}
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
            Put AI to Work for Your Electrical Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 30-minute call and we will deploy a working AI agent against your real electrical website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'electricians_bottom')}
            >
              <Phone size={18} />
              Book an Electrical AI Strategy Call
            </a>
            <Link
              to="/homeservices/demo/estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'electricians_bottom_estimate')}
            >
              <Calculator size={18} />
              Try the Electrical Estimate Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForElectricians;

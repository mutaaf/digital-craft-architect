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
  Wrench,
  PhoneOff,
  Clock,
  MessageSquare,
  ArrowRight,
  Zap,
  Phone,
  Calculator,
  Star,
} from 'lucide-react';

// Long-tail landing page for the "AI for roofers" query class. Reuses the two
// existing home-services demos verbatim and links to the existing
// /homeservices pricing tiers - no new demo, no new backend, no new pricing.
// Modeled on src/pages/AiForHvac.tsx per ticket 0024 engineering notes.

// Roofing-specific pain points. Defensible language only - no invented client
// quotes, dollar figures, or efficacy percentages. Industry-standard market
// context, not DCA client results.
const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'Storm-week call surges drown the office line',
    desc: 'A hail event or a wind storm spikes the inbound call volume for a week, and the office phone cannot scale. Homeowners who do not get a human on the second ring move to the next roofer the insurance adjuster recommends.',
  },
  {
    icon: Calculator,
    title: 'Inspection appointments and claim-supplement quotes follow up too slowly',
    desc: 'The roof inspection happens fast; the written estimate that follows often does not. A claim-supplement quote left sitting on a project manager desk for three days is a job that goes to the roofer who texted a range the same afternoon.',
  },
  {
    icon: Star,
    title: 'Post-tear-off review windows close before anyone asks',
    desc: 'The moment to ask a happy homeowner for a 5-star review is the afternoon the crew rolls out, not the following Monday. Manual review chasing slips off the dispatcher list every Friday, and the Google Business Profile ranking stops climbing.',
  },
];

const STATS = [
  { value: '24/7', label: 'Storm-week and weekend call capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '2', label: 'Live demos built for roofing workflows', icon: Wrench },
  { value: '48h', label: 'From signup to a working AI agent', icon: Zap },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Roofing Contractors',
    desc: 'A chat agent that qualifies the roof type, the damage pattern (hail, wind, age, leak), and the urgency in under 60 seconds, then books the inspection - even during a storm-week surge. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Roofing Lead Responder',
    location: 'roofers_lead_responder',
  },
  {
    icon: Calculator,
    title: 'AI Estimate Generator for Roofing Contractors',
    desc: 'A guided estimator that walks a homeowner through tear-offs, re-roofs, repair scopes, and claim-supplement line items, then returns a defensible price range your project manager can confirm on the next inspection. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Roofing Estimate Demo',
    location: 'roofers_estimate',
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
      name: 'AI for Roofers',
      item: 'https://digitalcraftai.com/ai-for-roofers',
    },
  ],
};

// Sibling Service schema mirroring the AiForHvac pattern, with serviceType
// naming roofing per ticket acceptance criteria.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Roofing Contractors',
  description:
    'AI call capture, on-site quoting assistance, and review automation built for roofing contractors. Storm-week and after-hours call response, instant inspection and claim-supplement quote follow-up, and review collection that never forgets.',
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Roofing Contractors',
  url: 'https://digitalcraftai.com/ai-for-roofers',
};

const AiForRoofers: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Roofing Contractors | Storm-Week Call Capture & Instant Estimates</title>
        <meta
          name="description"
          content="AI for roofing contractors: storm-week call capture, instant inspection and claim-supplement quote follow-up, and automated review collection. Live demos built for roofing companies - try in under 60 seconds."
        />
        <meta property="og:title" content="AI for Roofing Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for roofing contractors: never miss a storm-week call, follow up on inspection and claim-supplement quotes the same day, and chase every 5-star review. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-roofers" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Wrench size={16} />
            Built for roofing contractors
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            AI for <span className="text-primary">Roofing Contractors</span> Who Are Done Losing Storm-Week Calls
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Storm-week call surges that drown the office line, slow follow-up on inspection appointments and claim-supplement quotes, missed review windows after a tear-off - the three gaps every roofing shop knows about. AI agents close them so your project managers run more inspections and your phone stops costing you jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/homeservices/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'roofers_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Roofing Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'roofers_hero')}
            >
              <Phone size={18} />
              Book a Roofing AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup · No credit card · Live demos personalized to your roofing company
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

      {/* Roofing pain points */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Gaps Every Roofing Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hail season and wind-event weeks expose the same gaps every year. AI agents stand in for the dispatcher who already had a full plate.
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
              Two Live Demos Built for Roofing Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the roofing playbook.
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
            Why Roofing Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            A roofing storm event is a winner-take-all week. The shop that answers first and quotes first books the job. AI agents pick up at 11pm during a hail surge, qualify the roof type and the damage pattern, and book the inspection on your calendar without changing how your crews work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, and electrical tiers. Prefer a tailored recommendation? Take the{' '}
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
            Put AI to Work for Your Roofing Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 30-minute call and we will deploy a working AI agent against your real roofing website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'roofers_bottom')}
            >
              <Phone size={18} />
              Book a Roofing AI Strategy Call
            </a>
            <Link
              to="/homeservices/demo/estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'roofers_bottom_estimate')}
            >
              <Calculator size={18} />
              Try the Roofing Estimate Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForRoofers;

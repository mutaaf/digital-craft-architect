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
  TreePine,
  PhoneOff,
  Clock,
  MessageSquare,
  ArrowRight,
  Sprout,
  Phone,
  Calculator,
  Star,
} from 'lucide-react';

// Long-tail landing page for the "AI for landscapers" query class. Reuses
// the two existing home-services demos verbatim and links to the existing
// /homeservices pricing tiers - no new demo, no new backend, no new pricing.
// Modeled on src/pages/AiForElectricians.tsx per ticket 0041 engineering notes
// (the closest peer in the trade-quintet pattern).

// 2026-05-25 mirror-source rule: every string used in the hero H1, the
// Helmet description, and the Service schema description lives as a single
// shared constant inside this module so a later copy edit cannot drift the
// visible text and the structured data apart.
const HERO_H1 = 'AI for Landscape Contractors Who Are Done Losing Spring-Cleanup Quotes';
const META_DESCRIPTION =
  'AI for landscape contractors: after-hours and weekend spring-cleanup quote capture, instant maintenance-contract bid follow-up, and automated review collection after a finished install. Live demos built for landscapers - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI lead capture, on-site quoting assistance, and review automation built for landscape contractors. Spring-cleanup and lawn-renovation request response, same-day maintenance-contract bid follow-up, and review collection that never forgets the install that just wrapped.';

// Landscaping-specific pain points. Defensible language only - no invented
// client quotes, dollar figures, or efficacy percentages. Industry-standard
// market context, not DCA client results.
const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'Spring-cleanup quote requests go to voicemail and never come back',
    desc: 'The phone rings on the first warm Saturday in March, on a Sunday evening when a homeowner walks the yard, and at 7am before the crew rolls out. The landscaper who answers (or texts back inside 60 seconds) books the walkthrough; the contact form that sits until Monday loses the cleanup to the next listing in the search result.',
  },
  {
    icon: Calculator,
    title: 'Maintenance-contract bids turn around too slowly',
    desc: 'A weekly lawn-maintenance contract or a full-property landscape-design bid needs a written number the homeowner can compare against two other crews. A bid that lands three days after the on-site walkthrough is a season of mowing that goes to the contractor who texted a range that same afternoon.',
  },
  {
    icon: Star,
    title: 'Review windows close before anyone asks after a finished install',
    desc: 'The window to ask a happy homeowner for a 5-star review is the afternoon the truck rolls off a finished hardscape or irrigation install, not the following week. Manual review chasing slips off the crew lead list every Friday, and the Google Business Profile ranking stops climbing in the local map pack.',
  },
];

const STATS = [
  { value: '24/7', label: 'After-hours and weekend lead capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '2', label: 'Live demos built for landscaping workflows', icon: TreePine },
  { value: '48h', label: 'From signup to a working AI agent', icon: Sprout },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Landscape Contractors',
    desc: 'A chat agent that qualifies the scope (spring cleanup, weekly maintenance, irrigation install, hardscape, tree work, full landscape design), the lot size, the timeline, and the address in under 60 seconds, then books the walkthrough - even on a Sunday evening. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Landscaping Lead Responder',
    location: 'landscapers_lead_responder',
  },
  {
    icon: Calculator,
    title: 'AI Estimate Generator for Landscape Contractors',
    desc: 'A guided estimator that walks a homeowner through cleanup scope, maintenance frequency, irrigation footprint, hardscape square footage, and tree work, then returns a defensible price range your crew lead can confirm on the next site visit. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Landscaping Estimate Demo',
    location: 'landscapers_estimate',
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
      name: 'AI for Landscapers',
      item: 'https://digitalcraftai.com/ai-for-landscapers',
    },
  ],
};

// Sibling Service schema mirroring the AiForElectricians pattern, with
// serviceType naming landscape contractors per ticket acceptance criteria.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Landscapers',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Landscape Contractors',
  url: 'https://digitalcraftai.com/ai-for-landscapers',
};

const AiForLandscapers: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Landscape Contractors | Spring-Cleanup Capture & Instant Bids</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Landscape Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for landscape contractors: never miss a spring-cleanup quote, follow up on maintenance-contract bids the same day, and chase every 5-star review after a finished install. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-landscapers" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <TreePine size={16} />
            Built for landscape contractors
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Spring-cleanup requests that hit voicemail on a Saturday morning, slow follow-up on maintenance-contract bids when the homeowner is still comparing crews, and review windows that close before anyone asks - the three gaps every landscaping shop knows about. AI agents close them so your crews run more jobs and your phone stops costing you bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/homeservices/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'landscapers_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Landscaping Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'landscapers_hero')}
            >
              <Phone size={18} />
              Book a Landscaping AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup · No credit card · Live demos personalized to your landscaping company
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

      {/* Landscaping pain points */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Gaps Every Landscaping Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Spring-cleanup leads after hours, maintenance-contract bids that need the same-day turnaround, and reviews nobody asks for. AI agents stand in for the office manager who already had a full plate.
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
              Two Live Demos Built for Landscaping Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the landscaping playbook.
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
                  data-testid="landscapers-demo-cta"
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
            Why Landscaping Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            A spring-cleanup request is a same-week decision. The shop that replies first and quotes a range first books the walkthrough. AI agents pick up on a Sunday evening when the homeowner is still standing in the yard, qualify the scope and the lot size, and book the visit on your calendar without changing how your crews work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, roofing, electrical, and painting tiers. Prefer a tailored recommendation? Take the{' '}
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
            Put AI to Work for Your Landscaping Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 30-minute call and we will deploy a working AI agent against your real landscaping website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'landscapers_bottom')}
            >
              <Phone size={18} />
              Book a Landscaping AI Strategy Call
            </a>
            <Link
              to="/homeservices/demo/estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'landscapers_bottom_estimate')}
            >
              <Calculator size={18} />
              Try the Landscaping Estimate Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForLandscapers;

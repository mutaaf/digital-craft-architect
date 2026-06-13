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
  Sparkles,
  PhoneOff,
  Clock,
  MessageSquare,
  ArrowRight,
  Phone,
  Calculator,
  Star,
  Mic,
} from 'lucide-react';

// Long-tail landing page for the "AI for cleaning business" query class.
// Reuses the three existing home-services demos verbatim - no new demo, no
// new backend. Modeled on src/pages/AiForLandscapers.tsx (ticket 0041) per
// ticket 0050 engineering notes; NOT on AiForPropertyManagers.tsx, which
// routes to /realestate/demo/* (wrong family for cleaning services).
//
// Defensible-language note: industry-standard market context only - the
// after-hours / weekend booking pattern is publicly observable in trade-
// association write-ups (ISSA, ARCSI) and field-service-software marketing
// (ZenMaid, Jobber, Housecall Pro), not DCA client results. No invented
// client quotes, dollar figures, or efficacy percentages.

// 2026-05-25 mirror-source rule: the Helmet meta description and the
// Service schema description both read from META_DESCRIPTION so a copy edit
// cannot drift the visible text and the structured data apart.
const HERO_H1 = 'AI for Cleaning Companies That Are Done Losing Weekend Booking Requests';
const META_DESCRIPTION =
  'AI for residential and commercial cleaning companies: after-hours and weekend booking-request capture, instant move-out and deep-clean quote turnaround, and automated review collection after a finished clean. Live demos built for cleaning services - try in under 60 seconds.';

// Cleaning-service-specific pain points. Defensible language only - no
// invented client quotes, dollar figures, or efficacy percentages. Industry-
// standard market context, not DCA client results.
const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'Weekend and after-hours booking requests go to voicemail',
    desc: 'The phone rings on a Sunday afternoon when a homeowner walks into a kitchen they need spotless before Monday, on Friday evening for a move-out clean that has to happen Saturday, and at 7am before the crew loads the van. The shop that answers (or texts back inside 60 seconds) books the clean; the contact form that sits until Monday loses the job to the competitor who answered on Sunday.',
  },
  {
    icon: Calculator,
    title: 'Move-out and deep-clean quote turnaround is too slow',
    desc: 'A move-out clean by Saturday or a post-construction deep clean needs a written number the homeowner can compare against two other crews. A quote that lands two days after the inquiry is a job that goes to the cleaner who texted a range that same afternoon - and the homeowner never circles back to explain why.',
  },
  {
    icon: Star,
    title: 'Review windows close before anyone asks after a finished clean',
    desc: 'The window to ask a happy homeowner for a 5-star review is the afternoon the van rolls off a finished recurring clean or a move-out turnover, not the following week. Manual review chasing slips off the crew lead list every Friday, and the Google Business Profile ranking stops climbing in the local map pack where every recurring-clean lead starts.',
  },
];

const STATS = [
  { value: '24/7', label: 'After-hours and weekend booking-request capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '3', label: 'Live demos calibrated for cleaning services', icon: Sparkles },
  { value: '48h', label: 'From signup to a working AI agent', icon: Sparkles },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Cleaning Companies',
    desc: 'A chat agent that qualifies the scope (recurring residential clean, one-time deep clean, move-out turnover, light commercial janitorial, Airbnb turnover), the square footage or room count, the timeline, and the address in under 60 seconds, then books the walkthrough or first clean - even on a Sunday evening. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Cleaning Lead Responder',
    location: 'cleaningservices_lead_responder',
  },
  {
    icon: Calculator,
    title: 'AI Quote Generator for Move-Out and Deep Cleans',
    desc: 'A guided estimator that walks a homeowner through square footage, room count, recurring frequency, move-out vs deep-clean scope, and add-ons (inside-oven, inside-fridge, baseboards, windows), then returns a defensible price range your crew lead can confirm on the walkthrough. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Cleaning Quote Demo',
    location: 'cleaningservices_estimate',
  },
  {
    icon: Mic,
    title: 'AI Voice Follow-Up for Recurring-Clean Renewals',
    desc: 'A voice agent that calls back a homeowner who requested a quote, confirms the schedule for a weekly or biweekly recurring clean, and asks for a review the afternoon a finished job wraps - so the review-request ask never slips off the crew lead list on a Friday. Reuses the live home-services voice follow-up demo.',
    to: '/homeservices/demo/voice-followup',
    cta: 'Try the Cleaning Voice Demo',
    location: 'cleaningservices_voice_followup',
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
      name: 'AI for Cleaning Services',
      item: 'https://digitalcraftai.com/ai-for-cleaning-services',
    },
  ],
};

// Sibling Service schema. Per the 2026-05-25 mirror-source rule the
// description field shares the META_DESCRIPTION constant so a copy edit
// cannot drift the meta tag and the structured-data description apart.
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Cleaning Services',
  description: META_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Residential and Commercial Cleaning Businesses',
  url: 'https://digitalcraftai.com/ai-for-cleaning-services',
};

const AiForCleaningServices: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Cleaning Companies | Weekend Booking Capture & Instant Quotes</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Cleaning Companies | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for residential and commercial cleaning companies: never miss a weekend booking request, turn around move-out and deep-clean quotes the same hour, and chase every 5-star review after a finished clean. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-cleaning-services" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Built for cleaning businesses
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Weekend booking requests that hit voicemail on a Sunday afternoon, slow move-out quote turnaround when the homeowner is still comparing crews, and review windows that close before anyone asks - the three gaps every cleaning shop knows about. AI agents close them so your crews run more jobs and your phone stops costing you bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/homeservices/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'cleaningservices_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Cleaning Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'cleaningservices_hero')}
            >
              <Phone size={18} />
              Book a Cleaning AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup · No credit card · Live demos personalized to your cleaning company
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

      {/* Cleaning-service pain points */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Gaps Every Cleaning Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Weekend and after-hours booking leaks, move-out quotes that need the same-hour turnaround, and reviews nobody asks for. AI agents stand in for the office manager who already had a full plate.
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
              Three Live Demos Built for Cleaning Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the cleaning playbook.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  data-testid="cleaningservices-demo-cta"
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
            Why Cleaning Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            A recurring residential clean and a move-out turnover are both same-week decisions. The shop that replies first and quotes a range first books the job. AI agents pick up on a Sunday evening when the homeowner is still standing in the kitchen, qualify the scope and the square footage, and book the visit on your calendar without changing how your crews work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, roofing, electrical, painting, and landscaping tiers. Prefer a tailored recommendation? Take the{' '}
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
            Put AI to Work for Your Cleaning Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 30-minute call and we will deploy a working AI agent against your real cleaning website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'cleaningservices_bottom')}
            >
              <Phone size={18} />
              Book a Cleaning AI Strategy Call
            </a>
            <Link
              to="/homeservices/demo/estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'cleaningservices_bottom_estimate')}
            >
              <Calculator size={18} />
              Try the Cleaning Quote Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForCleaningServices;

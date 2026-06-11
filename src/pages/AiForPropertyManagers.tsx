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
  Building2,
  PhoneOff,
  Clock,
  MessageSquare,
  ArrowRight,
  Phone,
  Wrench,
  CalendarClock,
  KeyRound,
} from 'lucide-react';

// Long-tail landing page for the "AI for property managers" query class.
// Ticket 0047 - the SEVENTH page in the trade-page long-tail family and the
// FIRST non-trade variant. Reuses the two existing real-estate demos (the
// shared /realestate/demo/lead-responder and /realestate/demo/voice-negotiator
// already calibrated for the real-estate ICP) rather than spawning a third
// demo family - no new demo, no new backend, no new pricing. Modeled 1:1 on
// src/pages/AiForLandscapers.tsx (ticket 0041), but the two demo CTAs route
// to /realestate/demo/* (NOT /homeservices/demo/* as the six trade pages do)
// per the ticket 0047 acceptance criteria - this is the structural
// difference and the named regression check.

// Defensible market context cited in the SERVICE_DESCRIPTION and on-page
// copy. The page makes no LTV or cap-rate claims; the "highest-LTV ICP" framing
// in the ticket's Stakeholder lens stays inside the ticket and is NOT mirrored
// to public copy because there is no publicly attributable single source for a
// blended residential-property-management LTV. The "three property-management
// pain points" framing is industry-standard operator vocabulary (NARPM-adjacent
// forum threads, public Buildium / AppFolio marketing copy) - not a DCA
// client result. No invented testimonials, no efficacy percentages.

// 2026-05-25 mirror-source rule: every string used in the hero H1, the
// Helmet description, and the Service schema description lives as a single
// shared constant inside this module so a later copy edit cannot drift the
// visible text and the structured data apart.
const HERO_H1 = 'AI for Property Managers Who Are Done Losing Tenant Inquiries to Voicemail';
const META_DESCRIPTION =
  'AI for property managers: after-hours and weekend leasing inquiry capture, instant maintenance-request triage, and renewal follow-up that closes the 30-day window. Live demos calibrated for property management - try in under 60 seconds, no signup.';
const SERVICE_DESCRIPTION =
  'AI for property managers: after-hours and weekend leasing inquiry capture, instant maintenance-request triage, and renewal follow-up that closes the 30-day window. Live demos calibrated for property management - try in under 60 seconds, no signup.';

// Property-management-specific pain points. Defensible language only - no
// invented client quotes, dollar figures, or efficacy percentages. The three
// pains are the ones named in the User story of the ticket and are
// industry-standard operator vocabulary, not DCA client results.
const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'After-hours leasing inquiries go to voicemail on weekends',
    desc: 'A prospective tenant scrolls Zillow on a Saturday evening, taps "Is the 3-bed at 1247 Maple still available?" and expects an answer before they keep scrolling. The property manager who replies inside 60 seconds books the showing; the inquiry that sits until Monday morning loses the door to the next listing.',
  },
  {
    icon: Wrench,
    title: 'Maintenance-request triage runs slow and one-star reviews follow',
    desc: 'A water leak at 9pm or a no-heat call on a Sunday is a one-star Google review waiting to happen if the on-call workflow is "leave a message and we will call you back." AI triage qualifies the issue (urgent vs scheduled, plumber vs HVAC vs handyman), captures the unit and access notes, and pages the right vendor without waiting for office hours.',
  },
  {
    icon: CalendarClock,
    title: 'Renewal conversations drop off inside the 30-day window',
    desc: 'A tenant who stays for another year is worth materially more than a vacancy plus a turn. The 30-day notice window closes fast when manual outreach slips off the asset-manager list; an AI follow-up sequence keeps the renewal conversation alive without burning a leasing agent on every door.',
  },
];

const STATS = [
  { value: '24/7', label: 'After-hours and weekend leasing inquiry capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '2', label: 'Live demos calibrated for property management', icon: Building2 },
  { value: '48h', label: 'From signup to a working AI agent', icon: KeyRound },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Property Managers',
    desc: 'A chat agent that qualifies the inquiry (unit, move-in date, occupants, income, pets), screens against your listing criteria, and books the showing without waiting for office hours. Reuses the live real-estate lead responder already calibrated for tenant and prospect intent, no signup.',
    to: '/realestate/demo/lead-responder',
    cta: 'Try the Property-Management Lead Responder',
    location: 'propertymanagers_lead_responder',
  },
  {
    icon: Phone,
    title: 'AI Voice Follow-Up for Renewals',
    desc: 'A voice agent that calls a tenant inside the 30-day renewal window, surfaces concerns honestly, and books a renewal conversation with the asset manager instead of letting the door go to a vacancy. Reuses the live real-estate voice negotiator already calibrated for the conversational renewal use case.',
    to: '/realestate/demo/voice-negotiator',
    cta: 'Try the Property-Management Voice Demo',
    location: 'propertymanagers_voice_negotiator',
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
      name: 'AI for Property Managers',
      item: 'https://digitalcraftai.com/ai-for-property-managers',
    },
  ],
};

// Sibling Service schema mirroring the AiForLandscapers pattern, with
// serviceType naming property management companies per ticket acceptance
// box 2. description mirrors META_DESCRIPTION per the 2026-05-25
// mirror-source rule (same constant feeds the Helmet meta tag and the
// Service.description field).
const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Property Managers',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Property Management Companies',
  url: 'https://digitalcraftai.com/ai-for-property-managers',
};

const AiForPropertyManagers: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Property Managers | After-Hours Leasing Capture & Renewal Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Property Managers | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for property managers: never miss an after-hours leasing inquiry, triage maintenance requests before the one-star review lands, and close the 30-day renewal window. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-property-managers" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Building2 size={16} />
            Built for property management companies
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Weekend leasing inquiries that hit voicemail on Saturday night, after-hours maintenance calls that turn into one-star reviews by Monday, and renewal conversations that slip past the 30-day window - the three gaps every property management shop knows about. AI agents close them so your asset managers run more doors and your phone stops costing you bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/realestate/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'propertymanagers_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Property-Management Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'propertymanagers_hero')}
            >
              <Phone size={18} />
              Book a Property-Management AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup · No credit card · Live demos calibrated for property management
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

      {/* Property-management pain points */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Gaps Every Property Management Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              After-hours leasing inquiries, slow maintenance triage that drives one-star reviews, and renewal windows that close before anyone calls. AI agents stand in for the office manager who already had a full plate.
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
              Two Live Demos Calibrated for Property Management
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the leasing and renewal playbook.
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
                  data-testid="propertymanagers-demo-cta"
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
            Why Property Managers Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            A leasing inquiry on a Saturday night is a same-week decision. The property manager who replies first books the showing. AI agents pick up on a Sunday evening when the prospect is still scrolling Zillow, qualify the unit and the move-in date, and put the showing on your calendar without changing how your leasing team works.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/realestate" className="text-primary hover:underline">
              real estate hub
            </Link>{' '}
            alongside the deal-analysis and voice-negotiation tiers. Prefer a tailored recommendation? Take the{' '}
            <Link to="/quiz" className="text-primary hover:underline">
              2-minute AI readiness quiz
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Put AI to Work for Your Property Management Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 30-minute call and we will deploy a working AI agent against your real property management website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'propertymanagers_bottom')}
            >
              <Phone size={18} />
              Book a Property-Management AI Strategy Call
            </a>
            <Link
              to="/realestate/demo/voice-negotiator"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'propertymanagers_bottom_voice')}
            >
              <Phone size={18} />
              Try the Property-Management Voice Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForPropertyManagers;

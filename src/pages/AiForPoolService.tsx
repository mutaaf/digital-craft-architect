import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { Sparkles, PhoneOff, Clock, MessageSquare, ArrowRight, Phone, Calculator, Star, Mic, RefreshCcw } from 'lucide-react';

// Ticket 0058 - long-tail landing page for the "AI for pool service" query
// class. Reuses the three existing home-services demos verbatim. Modeled on
// src/pages/AiForPestControl.tsx (ticket 0056) per the ticket engineering
// notes; NOT on AiForPropertyManagers.tsx (routes to /realestate/demo/*).
// Industry-standard market context only (PHTA / Pool & Hot Tub Alliance
// market write-ups; not DCA client results), no invented testimonials.
// Emits BreadcrumbList JSON-LD only - no sibling Service block per the ticket
// Out of Scope and the ticket 0056 precedent. The Helmet meta description and
// the JSON-LD read from shared module-level constants per the 2026-05-25
// mirror-source rule.
const HERO_H1 =
  'AI for Pool Service Companies That Are Done Losing Same-Day Green-Pool and Equipment-Failure Calls to Voicemail';
const META_DESCRIPTION =
  'AI for residential pool service companies: peak-season green-pool and equipment-failure emergency-call capture, weekly recurring-service skip-notice automation when the route is rained out, and end-of-season closing appointment reminders before the first freeze. Live demos built for pool service - try in under 60 seconds.';

// Pool-service-specific pain points. Defensible language only.
const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'Peak-season green-pool and equipment-failure emergencies go to voicemail',
    desc: 'A homeowner who comes home to a green pool on a Saturday morning, a pump that quit running in 95-degree heat, or a heater that failed the day before a backyard party does not wait for Monday. The shop that picks up (or texts back inside 60 seconds) books the same-day visit; the contact form that sits until Monday loses the job to the pool company that answered on Saturday.',
  },
  {
    icon: RefreshCcw,
    title: 'Weekly recurring-service skip notices slip off the office manager list',
    desc: 'Weekly chlorine routes, biweekly chemical balancing, and salt-cell maintenance contracts only stay on-cycle if someone tells the homeowner when a route is rained out or a tech is rerouted. Manual skip notices slip off the office manager list when the front desk is fielding three new-customer calls, and the next visit shows up to a frustrated homeowner who thought you forgot them.',
  },
  {
    icon: Star,
    title: 'End-of-season closing appointments forgotten until the first freeze',
    desc: 'The window to book a winter pool closing is the four weeks before the first hard freeze, not the morning after one. Manual closing reminders fall off the office list every September, and homeowners call in panic the week of the freeze when every closing slot is already booked. The same gap closes spring openings, heater swaps, and annual cover replacements.',
  },
];

const STATS = [
  { value: '24/7', label: 'Peak-season green-pool and equipment-failure emergency capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '3', label: 'Live demos calibrated for pool service', icon: Sparkles },
  { value: '48h', label: 'From signup to a working AI agent', icon: Sparkles },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Pool Service Companies',
    desc: 'A chat agent that qualifies the scope (weekly maintenance, green-pool cleanup, pump or filter repair, heater service, salt-cell replacement, automation install), the pool type and size, the urgency (same-day emergency vs scheduled visit), and the address in under 60 seconds, then books the visit - even on a Saturday morning. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Pool Service Lead Responder',
    location: 'poolservice_lead_responder',
  },
  {
    icon: Calculator,
    title: 'AI Quote Generator for Service Visits and Repairs',
    desc: 'A guided estimator that walks a homeowner through pool type, gallons, in-ground vs above-ground, weekly vs one-time scope, and add-ons (green-pool cleanup, equipment repair, heater service, opening or closing), then returns a defensible price range your tech can confirm at the door. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Pool Service Quote Demo',
    location: 'poolservice_estimate',
  },
  {
    icon: Mic,
    title: 'AI Voice Follow-Up for Skip Notices and Closing Reminders',
    desc: 'A voice agent that calls a homeowner the morning of a rained-out route to reschedule, confirms the next weekly visit on your calendar, and books the end-of-season closing appointment in late summer before every slot fills - so the skip notice never slips and the closing window never closes on you. Reuses the live home-services voice follow-up demo.',
    to: '/homeservices/demo/voice-followup',
    cta: 'Try the Pool Service Voice Demo',
    location: 'poolservice_voice_followup',
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
      name: 'AI for Pool Service',
      item: 'https://digitalcraftai.com/ai-for-pool-service',
    },
  ],
};

const AiForPoolService: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Pool Service Companies | Green-Pool Emergency Capture & Closing Reminders</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Pool Service Companies | DigitalCraft AI" />
        <meta property="og:description" content="AI agents built for residential pool service companies: never miss a peak-season green-pool or equipment-failure emergency, send weekly recurring-service skip notices on autopilot, and book every end-of-season closing before the first freeze. Live demos free." />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-pool-service" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Built for pool service companies
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Peak-season green-pool and equipment-failure emergency calls that go straight to voicemail, weekly recurring-service skip notices the office manager forgets to send when a route is rained out, and end-of-season closing appointments customers forget until the first freeze - the three gaps every pool service shop knows about. AI agents close them so your techs run more visits and your phone stops costing you bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link to="/homeservices/demo/lead-responder" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('try_demo', 'poolservice_hero_lead_responder')}>
              <MessageSquare size={18} />
              Try the Pool Service Demo
            </Link>
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('book_call', 'poolservice_hero')}>
              <Phone size={18} />
              Book a Pool Service AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup. No credit card. Live demos personalized to your pool service company.
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

      {/* Pool-service pain points */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Gaps Every Pool Service Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Peak-season green-pool and equipment-failure emergency leaks, weekly skip notices nobody remembers to send when the route is rained out, and end-of-season closings nobody books until the freeze. AI agents stand in for the office manager who already had a full plate.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p) => (
              <div key={p.title} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
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
              Three Live Demos Built for Pool Service Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the pool service playbook.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_CARDS.map((d) => (
              <div key={d.title} className="flex flex-col p-7 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <d.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{d.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5 flex-1">{d.desc}</p>
                <Link to={d.to} data-testid="poolservice-demo-cta" className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all" onClick={() => trackCTAClick('demo_card', d.location)}>
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
            Why Pool Service Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            A same-day green-pool or equipment-failure emergency and an end-of-season closing booking are both same-week decisions for the homeowner. The shop that answers first and confirms the visit first books the job and holds the recurring route. AI agents pick up on a Saturday morning when the homeowner is still standing at the pool edge, qualify the pool type and the scope, and book the tech on your calendar without changing how your crews work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, roofing, electrical, painting, landscaping, cleaning, and pest control tiers. Prefer a tailored recommendation? Take the{' '}
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
            Put AI to Work for Your Pool Service Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 30-minute call and we will deploy a working AI agent against your real pool service website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('book_call', 'poolservice_bottom')}>
              <Phone size={18} />
              Book a Pool Service AI Strategy Call
            </a>
            <Link to="/homeservices/demo/estimate" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('try_demo', 'poolservice_bottom_estimate')}>
              <Calculator size={18} />
              Try the Pool Service Quote Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForPoolService;

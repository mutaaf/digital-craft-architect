import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { Sparkles, PhoneOff, Clock, MessageSquare, ArrowRight, Phone, Calculator, Star, Mic, FileText } from 'lucide-react';

// Ticket 0072 - long-tail landing page for the "AI for restoration services"
// query class. Reuses the three existing home-services demos verbatim.
// Modeled on src/pages/AiForPoolService.tsx (ticket 0058) per the ticket
// engineering notes; NOT on AiForPropertyManagers.tsx (routes to
// /realestate/demo/*). Industry-standard market context only (RIA /
// Restoration Industry Association market write-ups; not DCA client
// results), no invented testimonials.
// Emits BreadcrumbList JSON-LD only - no sibling Service block per the
// ticket Out of Scope and the ticket 0058 precedent. The Helmet meta
// description and the JSON-LD read from shared module-level constants per
// the 2026-05-25 mirror-source rule.
const HERO_H1 =
  'AI for Restoration Companies That Are Done Losing Midnight Emergency Calls to Voicemail';
const META_DESCRIPTION =
  'AI for residential restoration and remediation companies: after-hours water and fire emergency call capture when the answering service drops the call, insurance-carrier scope-of-work answers a dispatcher cannot give at 2am, and review-request timing that hits the day a crew finishes a mitigation job. Live demos built for restoration - try in under 60 seconds.';

// Restoration-specific pain points. Defensible language only.
const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'After-hours water and fire emergency calls hit voicemail and never call back',
    desc: 'A homeowner standing in an inch of water at 11pm after a burst pipe, or watching smoke damage settle after a kitchen fire, does not leave a voicemail and wait until morning. The shop that answers on the first ring (or texts back inside 60 seconds) books the mitigation visit that night; the contact form that sits until Monday loses the job to the restoration company two SERP results down that picked up.',
  },
  {
    icon: FileText,
    title: 'Insurance-carrier scope-of-work questions land at 2am with no dispatcher to answer',
    desc: 'A homeowner on the phone with their insurance adjuster at 2am wants to know whether the carrier covers structural drying, mold remediation on the drywall, or contents-pack-out before demo begins. Manual on-call rotations mean the dispatcher who could answer is asleep, and the homeowner picks the shop that gave a clear answer first. AI stands in with the scope-of-work language the office manager already uses on the phone.',
  },
  {
    icon: Star,
    title: 'Review-request timing slips the day a crew finishes a mitigation job',
    desc: 'The window to earn a five-star review is the two hours after the final walk-through, when the homeowner is standing in a dry, restored space and remembers who showed up at midnight. Manual review requests slip off the office list when the front desk is already dispatching the next emergency, and the homeowner logs off and the review never happens. The same gap closes referral asks, warranty check-ins, and mold-clearance follow-ups.',
  },
];

const STATS = [
  { value: '24/7', label: 'After-hours water and fire emergency call capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '3', label: 'Live demos calibrated for restoration workflows', icon: Sparkles },
  { value: '48h', label: 'From signup to a working AI agent', icon: Sparkles },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Restoration Companies',
    desc: 'A chat agent that qualifies the loss type (water, fire and smoke, mold, storm), the scope (mitigation, structural drying, contents pack-out, full rebuild), the urgency (active leak tonight vs scheduled scoping), the affected rooms, and the insurance carrier in under 60 seconds, then books the tech - even at 11pm on a Saturday. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Restoration Lead Responder',
    location: 'restoration_lead_responder',
  },
  {
    icon: Calculator,
    title: 'AI Quote Generator for Mitigation and Restoration Scope',
    desc: 'A guided estimator that walks a homeowner through loss type, affected rooms, category of water (1, 2, or 3), structural drying days, and add-ons (mold remediation, contents pack-out, reconstruction scope), then returns a defensible range your project manager can confirm on the walk-through. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Restoration Quote Demo',
    location: 'restoration_estimate',
  },
  {
    icon: Mic,
    title: 'AI Voice Follow-Up for Insurance Scoping and Review Requests',
    desc: 'A voice agent that calls a homeowner the morning after a mitigation visit to confirm the drying-equipment placement, walks them through the insurance-carrier scope questions their adjuster is about to ask, and calls again the hour a crew finishes to lock in a five-star review while the homeowner is still standing in the restored room. Reuses the live home-services voice follow-up demo.',
    to: '/homeservices/demo/voice-followup',
    cta: 'Try the Restoration Voice Demo',
    location: 'restoration_voice_followup',
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
      name: 'AI for Restoration Services',
      item: 'https://digitalcraftai.com/ai-for-restoration-services',
    },
  ],
};

const AiForRestorationServices: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Restoration Companies | Midnight Emergency Capture & Insurance Scoping</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Restoration Companies | DigitalCraft AI" />
        <meta property="og:description" content="AI agents built for residential restoration and remediation companies: never miss an after-hours water or fire emergency, answer insurance-carrier scope questions at 2am, and book five-star review requests the hour a mitigation crew finishes. Live demos free." />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-restoration-services" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Built for restoration and remediation companies
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            After-hours water and fire emergency calls that go straight to voicemail, insurance-carrier scope-of-work questions a dispatcher cannot answer at 2am, and review-request timing that slips the day a crew finishes a mitigation job - the three gaps every restoration shop knows about. AI agents close them so your crews run more jobs and your phone stops costing you bookings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link to="/homeservices/demo/lead-responder" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('try_demo', 'restoration_hero_lead_responder')}>
              <MessageSquare size={18} />
              Try the Restoration Demo
            </Link>
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('book_call', 'restoration_hero')}>
              <Phone size={18} />
              Book a Restoration AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup. No credit card. Live demos personalized to your restoration company.
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

      {/* Restoration pain points */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Gaps Every Restoration Shop Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              After-hours emergencies dropped by voicemail, insurance-carrier scope questions the dispatcher cannot answer at 2am, and review requests nobody sends the hour a crew finishes. AI agents stand in for the office manager who already had a full plate.
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
              Three Live Demos Built for Restoration Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the restoration playbook.
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
                <Link to={d.to} data-testid="restoration-demo-cta" className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all" onClick={() => trackCTAClick('demo_card', d.location)}>
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
            Why Restoration Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            A midnight water-mitigation call and a next-morning insurance-scope question are both same-hour decisions for the homeowner. The shop that answers first and confirms the visit first books the job and locks the insurance approval. AI agents pick up on a Saturday at 11pm when the homeowner is still standing in the flooded kitchen, qualify the loss type and the scope, and book the tech on your calendar without changing how your crews work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, roofing, electrical, painting, landscaping, cleaning, pest control, and pool service tiers. Prefer a tailored recommendation? Take the{' '}
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
            Put AI to Work for Your Restoration Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 30-minute call and we will deploy a working AI agent against your real restoration website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('book_call', 'restoration_bottom')}>
              <Phone size={18} />
              Book a Restoration AI Strategy Call
            </a>
            <Link to="/homeservices/demo/estimate" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('try_demo', 'restoration_bottom_estimate')}>
              <Calculator size={18} />
              Try the Restoration Quote Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForRestorationServices;

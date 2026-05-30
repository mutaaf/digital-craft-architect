import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { getRecentDemos, recordDemoVisit } from '@/utils/recentDemosStore';
import { Sparkles, ArrowRight, Phone } from 'lucide-react';

const SITE_URL = 'https://digitalcraftai.com';

interface DemoLink {
  title: string;
  description: string;
  // Path of an existing /.../demo/<tool> route registered in src/App.tsx.
  path: string;
}

interface DemoGroup {
  vertical: string;
  demos: DemoLink[];
}

// Catalog of every live demo, sourced 1:1 from the /.../demo/<tool> routes in
// src/App.tsx. Adding a demo route there is a one-line addition here. No demo is
// invented; each path below resolves to a registered route.
const DEMO_GROUPS: DemoGroup[] = [
  {
    vertical: 'Construction',
    demos: [
      { title: 'AI Lead Responder', description: 'Qualifies inbound construction leads in under a minute by project type, budget, and timeline.', path: '/construction/demo/lead-responder' },
      { title: 'Smart Estimate Generator', description: 'Builds an interactive cost estimate for additions, kitchens, baths, and renovations.', path: '/construction/demo/estimate' },
      { title: 'Invoice Generator', description: 'Turns project details into a clean, itemized invoice in seconds.', path: '/construction/demo/invoice' },
      { title: 'SMS Follow-Up Sequence', description: 'Drafts a multi-step text follow-up sequence to keep leads warm.', path: '/construction/demo/sms-sequence' },
      { title: 'Lead Scoring', description: 'Scores a pasted lead from 1 to 100 with reasoning on budget fit and urgency.', path: '/construction/demo/lead-scoring' },
      { title: 'Review System', description: 'Automates Google review requests and on-brand responses at scale.', path: '/construction/demo/reviews' },
      { title: 'Deal Analyzer', description: 'Runs comps, calculates a max bid, and drafts seller outreach for a property.', path: '/construction/demo/property-negotiator' },
      { title: 'Voice Negotiator', description: 'A live AI voice agent that calls sellers, qualifies, and negotiates by phone.', path: '/construction/demo/voice-negotiator' },
    ],
  },
  {
    vertical: 'Real Estate',
    demos: [
      { title: 'AI Lead Responder', description: 'Captures buyer intent, budget, and timeline, then schedules follow-up automatically.', path: '/realestate/demo/lead-responder' },
      { title: 'Deal Analyzer', description: 'Extracts property data, runs comparable sales, and drafts seller messages.', path: '/realestate/demo/property-negotiator' },
      { title: 'Contract Drafter', description: 'Drafts purchase contracts and addenda from your deal inputs.', path: '/realestate/demo/contract' },
      { title: 'Market Analyzer', description: 'Summarizes local market data to support a pricing or offer decision.', path: '/realestate/demo/market-analysis' },
      { title: 'Voice Negotiator', description: 'An AI voice agent that makes seller calls and negotiates with humans by phone.', path: '/realestate/demo/voice-negotiator' },
    ],
  },
  {
    vertical: 'Events',
    demos: [
      { title: 'Inquiry Qualifier', description: 'Qualifies event inquiries by date, headcount, budget, and venue needs.', path: '/events/demo/inquiry' },
      { title: 'Proposal Generator', description: 'Turns event requirements into a polished, itemized proposal.', path: '/events/demo/proposal' },
      { title: 'Voice Booking Agent', description: 'A voice agent that fields booking calls and captures event details.', path: '/events/demo/voice-booking' },
    ],
  },
  {
    vertical: 'Home Services',
    demos: [
      { title: 'AI Lead Responder', description: 'Qualifies service requests and books the right job type fast.', path: '/homeservices/demo/lead-responder' },
      { title: 'Estimate Generator', description: 'Produces a quick, transparent estimate for common service jobs.', path: '/homeservices/demo/estimate' },
      { title: 'Voice Follow-Up', description: 'An AI voice agent that follows up on quotes and reschedules no-shows.', path: '/homeservices/demo/voice-followup' },
    ],
  },
  {
    vertical: 'Healthcare',
    demos: [
      { title: 'Patient Intake', description: 'Collects intake details and routes patients to the right next step.', path: '/healthcare/demo/intake' },
      { title: 'Scheduler', description: 'Proposes appointment slots and confirms bookings conversationally.', path: '/healthcare/demo/scheduler' },
      { title: 'Voice Follow-Up', description: 'A voice agent for appointment reminders and recall outreach.', path: '/healthcare/demo/voice-followup' },
    ],
  },
  {
    vertical: 'Legal',
    demos: [
      { title: 'Client Intake', description: 'Screens potential clients and gathers matter details before a consult.', path: '/legal/demo/intake' },
      { title: 'Consultation Scheduler', description: 'Turns an intake into a scheduled consultation with the right attorney.', path: '/legal/demo/consultation' },
      { title: 'Voice Follow-Up', description: 'A voice agent that follows up on consultations and missed calls.', path: '/legal/demo/voice-followup' },
    ],
  },
  {
    vertical: 'Restaurant',
    demos: [
      { title: 'Reservations Assistant', description: 'Handles reservation requests and answers common guest questions.', path: '/restaurant/demo/reservations' },
      { title: 'Catering Estimator', description: 'Builds a catering quote from headcount, menu, and event details.', path: '/restaurant/demo/catering' },
      { title: 'Review System', description: 'Requests and responds to guest reviews to protect your reputation.', path: '/restaurant/demo/reviews' },
    ],
  },
  {
    vertical: 'Kids Play',
    demos: [
      { title: 'Party Booker', description: 'Qualifies party inquiries and captures the details to book.', path: '/kidsplay/demo/party-booker' },
      { title: 'Package Estimator', description: 'Recommends and prices the right party package for the request.', path: '/kidsplay/demo/packages' },
      { title: 'Voice Booking Agent', description: 'A voice agent that takes booking calls and confirms party slots.', path: '/kidsplay/demo/voice-booking' },
    ],
  },
  {
    vertical: 'Fitness',
    demos: [
      { title: 'Lead Qualifier', description: 'Qualifies membership inquiries by goals, schedule, and budget.', path: '/fitness/demo/lead-qualifier' },
      { title: 'Membership Estimator', description: 'Matches a prospect to the right plan and shows pricing instantly.', path: '/fitness/demo/membership' },
      { title: 'Voice Retention', description: 'A voice agent that re-engages lapsed members and books them back.', path: '/fitness/demo/voice-retention' },
    ],
  },
  {
    vertical: 'Dental',
    demos: [
      { title: 'Patient Intake', description: 'Collects new-patient details and routes urgent cases first.', path: '/dental/demo/intake' },
      { title: 'Treatment Estimator', description: 'Estimates treatment costs and explains options in plain language.', path: '/dental/demo/estimate' },
      { title: 'Voice Recall', description: 'A voice agent that handles recall reminders and re-books cleanings.', path: '/dental/demo/voice-recall' },
    ],
  },
  {
    vertical: 'Salon',
    demos: [
      { title: 'Booking Assistant', description: 'Books appointments and answers service questions conversationally.', path: '/salon/demo/booking' },
      { title: 'Service Estimator', description: 'Prices a service or package based on what the client wants.', path: '/salon/demo/services' },
      { title: 'Voice Rebook', description: 'A voice agent that follows up to rebook clients after a visit.', path: '/salon/demo/voice-rebook' },
    ],
  },
  {
    vertical: 'Auto Repair',
    demos: [
      { title: 'Service Advisor', description: 'Triages repair requests and captures vehicle and issue details.', path: '/autorepair/demo/advisor' },
      { title: 'Repair Estimator', description: 'Gives a quick estimate range for common repair jobs.', path: '/autorepair/demo/estimate' },
      { title: 'Voice Reminder', description: 'A voice agent for service reminders and overdue maintenance calls.', path: '/autorepair/demo/voice-reminder' },
    ],
  },
];

const TOTAL_DEMOS = DEMO_GROUPS.reduce((sum, g) => sum + g.demos.length, 0);

// ItemList structured data mirroring every rendered demo link, following the
// inline JSON-LD pattern used on the vertical pages (src/pages/Construction.tsx).
const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'DigitalCraft AI Live Demos',
  description: 'Every live, interactive AI demo available across DigitalCraft AI verticals.',
  numberOfItems: TOTAL_DEMOS,
  itemListElement: DEMO_GROUPS.flatMap((group) => group.demos).map((demo, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: `${demo.title} (${
      DEMO_GROUPS.find((g) => g.demos.some((d) => d.path === demo.path))?.vertical ?? ''
    })`,
    url: `${SITE_URL}${demo.path}`,
  })),
};

const Demos: React.FC = () => {
  const { content } = useContent();
  // Snapshot read on mount; the recap is stable for the page lifetime since
  // recordDemoVisit fires AFTER navigation away from /demos.
  const recent = getRecentDemos();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>All Live AI Demos | Try Every Tool by Industry | DigitalCraft AI</title>
        <meta
          name="description"
          content="Browse every live AI demo from DigitalCraft AI in one place: lead responders, smart estimates, deal analyzers, and voice agents across construction, real estate, healthcare, and more."
        />
        <link rel="canonical" href={`${SITE_URL}/demos`} />
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Live Demo Catalog
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Every Demo, <span className="text-primary">In One Place</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Try {TOTAL_DEMOS} live AI tools across {DEMO_GROUPS.length} industries. Each one runs in
            your browser with no signup, and most can be personalized to your own company in seconds.
          </p>
        </div>
      </section>

      {/* Vertical jump nav */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {DEMO_GROUPS.map((group) => (
              <a
                key={group.vertical}
                href={`#${group.vertical.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              >
                {group.vertical}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Recently viewed recap (returning visitors only) */}
      {recent.length > 0 && (
        <section
          data-testid="recent-demos-recap"
          className="py-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
        >
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
              Recently viewed
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((entry) => (
                <Link
                  key={entry.path}
                  to={entry.path}
                  data-testid="recent-demo-card"
                  onClick={() => trackCTAClick('recent_demo', 'demos_hub_recap')}
                  className="group flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all"
                >
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {entry.title}
                  </h3>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                    {entry.vertical}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Try it again
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Demo groups */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-5xl space-y-14">
          {DEMO_GROUPS.map((group) => {
            const anchor = group.vertical.toLowerCase().replace(/\s+/g, '-');
            return (
              <div key={group.vertical} id={anchor} className="scroll-mt-28">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {group.vertical}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.demos.map((demo) => (
                    <Link
                      key={demo.path}
                      to={demo.path}
                      onClick={() => {
                        trackCTAClick('open_demo', `demos_hub_${anchor}`);
                        recordDemoVisit(demo.path, demo.title, group.vertical);
                      }}
                      className="group flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {demo.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                        {demo.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Try it
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Want These Built for Your Business?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            These demos show what is possible. Book a free call and we will tailor the right ones to
            your company, or browse the industry pages to see how they fit together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_a_call', 'demos_cta')}
            >
              <Phone size={18} />
              Book a Free Discovery Call
            </a>
            <Link
              to="/industries"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('view_industries', 'demos_cta')}
            >
              Browse Industries
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Demos;

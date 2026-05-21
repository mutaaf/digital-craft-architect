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
  MapPin,
  HardHat,
  Building2,
  Users,
  TrendingUp,
  Clock,
  Phone,
  Zap,
  ArrowRight,
  Star,
  Quote,
  CheckCircle2,
} from 'lucide-react';

// Texas market context. These are publicly cited statewide figures, framed as
// market context (not DCA client results) so the claims stay defensible.
const STATS = [
  { value: '30M+', label: 'Texans statewide', icon: Users },
  { value: '1,000+', label: 'New residents moving to Texas daily', icon: TrendingUp },
  { value: '3', label: 'Major metros served: Dallas, Houston, Austin', icon: MapPin },
  { value: '24/7', label: 'AI coverage in your Central Time zone', icon: Clock },
];

const CITIES = [
  {
    name: 'Dallas-Fort Worth',
    blurb:
      'The fastest-growing major metro in the country keeps DFW contractors and agents buried in inbound. Construction AI in Dallas answers every estimate request and missed call so a booming pipeline never leaks leads to the competitor who replied first.',
  },
  {
    name: 'Houston',
    blurb:
      'From energy-corridor commercial builds to sprawling residential turf, Houston operators field high call volume across a huge service area. AI voice and chat agents qualify the job, capture the details, and book the appointment before the lead cools.',
  },
  {
    name: 'Austin',
    blurb:
      'Austin\'s tech-savvy buyers and tight housing supply reward speed. Texas real estate AI handles deal analysis, instant lead response, and seller follow-up so agents stay first-to-respond in one of the most competitive markets in the state.',
  },
];

const VERTICALS = [
  {
    icon: HardHat,
    title: 'AI for Texas Construction',
    desc: 'Lead response in under 60 seconds, AI-generated estimates, voice agents that answer every missed call, and automated review collection. Built for contractors, builders, and remodelers across Texas.',
    to: '/construction',
    cta: 'Explore Construction AI',
    location: 'texas_construction',
  },
  {
    icon: Building2,
    title: 'AI for Texas Real Estate',
    desc: 'Deal analysis, instant lead qualification, AI voice outreach to sellers, and contract drafting. Built for Texas agents, brokers, and investors who win by responding first.',
    to: '/realestate',
    cta: 'Explore Real Estate AI',
    location: 'texas_realestate',
  },
];

// Placeholder testimonials. Per the backlog spec these are intentional
// placeholders, not invented quotes - a Texas business owner swaps in real
// client stories as they onboard.
const TESTIMONIAL_PLACEHOLDERS = [
  { city: 'Dallas, TX', industry: 'General Contractor' },
  { city: 'Houston, TX', industry: 'Real Estate Brokerage' },
  { city: 'Austin, TX', industry: 'Custom Home Builder' },
];

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI Automation in Texas',
      item: 'https://digitalcraftai.com/locations/texas',
    },
  ],
};

const Texas: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI Automation in Texas | Construction AI Dallas & Texas Real Estate AI</title>
        <meta
          name="description"
          content="AI automation for Texas construction and real estate businesses in Dallas, Houston, and Austin. Lead response, voice agents, and deal analysis built for Texas operators. Try live demos free."
        />
        <meta property="og:title" content="AI Automation in Texas | DigitalCraft AI" />
        <meta
          property="og:description"
          content="Construction AI in Dallas and Texas real estate AI for Houston and Austin. Pre-built AI agents that respond first and never miss a lead. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/locations/texas" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <MapPin size={16} />
            Serving Dallas, Houston & Austin
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            AI Automation for{' '}
            <span className="text-primary">Texas</span> Construction & Real Estate
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Texas is growing faster than anyone can answer the phone. We build AI
            agents that respond to every lead, qualify every job, and follow up
            around the clock so your business never loses a deal to a faster competitor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'texas_hero')}
            >
              <Phone size={18} />
              Book a Free Texas Strategy Call
            </a>
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('take_quiz', 'texas_hero')}
            >
              <Zap size={18} />
              Take the 2-Min AI Readiness Quiz
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup · No credit card · Live demos personalized to your company
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
            Figures reflect Texas statewide market context, not individual client results.
          </p>
        </div>
      </section>

      {/* Verticals */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Built for Texas Construction & Real Estate
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Two of the largest markets in the country, two playbooks for winning the lead before anyone else does.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VERTICALS.map((v) => (
              <div
                key={v.title}
                className="flex flex-col p-7 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <v.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5 flex-1">{v.desc}</p>
                <Link
                  to={v.to}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                  onClick={() => trackCTAClick('vertical_card', v.location)}
                >
                  {v.cta}
                  <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              On the Ground Across Texas
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From the DFW Metroplex to the Gulf Coast to the Hill Country, the playbook is the same: respond first, qualify fast, follow up forever.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CITIES.map((c) => (
              <div
                key={c.name}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{c.name}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{c.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial placeholders */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Texas Success Stories
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Client spotlights coming soon. Your business could be the next one featured here.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIAL_PLACEHOLDERS.map((t) => (
              <div
                key={t.city + t.industry}
                className="p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
              >
                <Quote size={28} className="text-primary/40 mb-3" />
                <p className="text-sm italic text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                  "Your Texas success story goes here. We are onboarding local businesses now."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    TX
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{t.industry}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin size={11} /> {t.city}
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5 mt-4 text-gray-300 dark:text-gray-600">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why now */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Why Texas Businesses Are Adopting AI Now
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              Texas added more residents than any other state in recent years, and that
              growth lands squarely on the desks of contractors, builders, and real estate
              professionals. More inbound leads sounds like a good problem until you realize
              most of them go unanswered. The contractor who calls back in five minutes wins
              the job; the one who calls back the next afternoon is quoting against a signed contract.
            </p>
            <p>
              That is the gap AI closes. A construction AI agent in Dallas can answer an
              estimate request the second it arrives, capture the project scope, and book a
              site visit before your competitor has finished lunch. A Texas real estate AI can
              qualify a buyer, run a quick deal analysis, and follow up with a seller on a
              schedule no human team could sustain. None of it requires you to learn new
              software, hire a developer, or change how you already work.
            </p>
            <p>
              We deploy pre-built agents tuned to your trade and your market, live in 48 hours,
              and we keep them running. Start with the{' '}
              <Link to="/quiz" className="text-primary hover:underline">
                2-minute readiness quiz
              </Link>{' '}
              or browse every supported{' '}
              <Link to="/industries" className="text-primary hover:underline">
                industry we serve
              </Link>{' '}
              to see what fits.
            </p>
          </div>
          <ul className="mt-8 space-y-3">
            {[
              'Live in 48 hours, no engineers required',
              'Answers every lead in your Central Time zone, day or night',
              'Tuned to Texas construction and real estate workflows',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Put AI to Work for Your Texas Business
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 30-minute call and we will deploy a working AI agent against your real
            website while you watch, or take the quiz for a tailored recommendation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'texas_bottom')}
            >
              <Phone size={18} />
              Book a Free Strategy Call
            </a>
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('take_quiz', 'texas_bottom')}
            >
              <Zap size={18} />
              Take the AI Readiness Quiz
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default Texas;

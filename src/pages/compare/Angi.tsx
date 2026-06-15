import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { Phone, ChevronRight, Sparkles, Mic, Zap, MessageSquare, Users, Calendar } from 'lucide-react';

// Ticket 0053 - "Digital Craft vs Angi" comparison page. Modeled 1:1 on
// src/pages/compare/Thumbtack.tsx (ticket 0049) because Angi and
// Thumbtack are the same structural class of incumbent: pay-per-lead
// acquisition marketplaces, not field-service software. Positioning
// frame: the marketplace SELLS you leads, Digital Craft HANDLES the
// leads you already have. Copy departures: Angi's shared-lead fan-out
// (same inquiry to four other pros in the same ZIP) and Angi's Angie's
// List brand-recognition heritage drive the "Use both" framing.
// Hub-aware breadcrumb middle item is "Compare" linking to /compare
// (ticket 0048).
//
// 2026-05-25 mirror-source rule: META_DESCRIPTION feeds the Helmet meta
// tag AND the WebPage JSON-LD description. 2026-05-07 em-dash Hard NO:
// every string uses hyphens, never U+2014. Pricing claim sourcing:
// src: https://pro.angi.com (contractor-side pricing intro)
// src: https://help.angi.com (shared-lead pricing public docs)

interface ComparisonRow { dimension: string; angi: string; dca: string; }

// Four-row comparison table per the ticket acceptance criteria. Short
// text cells, not check/x icons, because the two products solve
// different jobs (an icon would mis-frame this as a feature shootout).
const COMPARISON_ROWS: ComparisonRow[] = [
  {
    dimension: 'Lead source',
    angi: 'Angi-owned homeowner marketplace and brand search',
    dca: 'Your own website, phone line, and ads',
  },
  {
    dimension: 'Exclusivity per lead',
    angi: 'Shared - same inquiry sent to multiple pros in the ZIP',
    dca: 'Every lead is exclusively yours',
  },
  {
    dimension: 'Response speed',
    angi: 'Race against three other pros to call the homeowner first',
    dca: 'AI agent answers in seconds, 24/7',
  },
  {
    dimension: 'Cost model',
    angi: 'Pay-per-shared-lead, billed per inquiry delivered*',
    dca: 'Flat monthly subscription, no per-lead fee',
  },
];

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Chat on Your Own Website',
    desc: 'Digital Craft AI ships AI lead chat trained on your own scraped website. After-hours form fills get qualified and the booking lands as a warm lead. Angi qualifies leads inside Angi and sends them to every pro who bought the lead; your own website still goes unanswered after 5pm.',
  },
  {
    icon: Mic,
    title: 'Live AI Voice Answering That Books',
    desc: 'Every Digital Craft AI plan ships AI voice agents that answer the phone in your shop name, qualify the project, and book the appointment. Angi does not answer your phone; the homeowners who call you directly still hit voicemail when the crew is on a jobsite.',
  },
  {
    icon: Zap,
    title: 'Flat Monthly Cost, No Per-Shared-Lead Fee',
    desc: 'Digital Craft AI is a flat monthly subscription. Your cost does not climb with job volume and you are not paying for an inquiry three other pros in the same ZIP also received. Angi shared-lead pricing for residential trades is commonly reported in the $40 to $100 per-inquiry range.',
  },
];

// Single source of truth for breadcrumb labels + URLs. Hub-aware shape:
// middle item names "Compare" and links to /compare from ticket 0048.
type Crumb = { name: string; href: string; url: string };
const CRUMBS: ReadonlyArray<Crumb> = [
  { name: 'Home', href: '/', url: 'https://digitalcraftai.com' },
  { name: 'Compare', href: '/compare', url: 'https://digitalcraftai.com/compare' },
  { name: 'Digital Craft vs Angi', href: '/compare/angi', url: 'https://digitalcraftai.com/compare/angi' },
];

const SITE_URL = 'https://digitalcraftai.com';

const PAGE_H1 = 'Digital Craft AI vs Angi';
const PAGE_NAME = 'Digital Craft AI vs Angi Comparison';
const META_DESCRIPTION =
  'Compare Digital Craft AI and Angi honestly. Angi sells you shared leads where the same inquiry goes to multiple pros in the same ZIP code. Digital Craft AI is the AI agent layer that answers and qualifies the leads you already have on your website and phone line, for a flat monthly cost. The two are complements, not substitutes - pick what fits your next $500.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: CRUMBS.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: c.url,
  })),
};

const WEBPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: PAGE_NAME,
  description: META_DESCRIPTION,
  url: `${SITE_URL}/compare/angi`,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', url: SITE_URL },
};

const AngiComparison: React.FC = () => {
  const { content } = useContent();
  const lastCrumb = CRUMBS.length - 1;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Digital Craft AI vs Angi | Stop Paying for Shared Leads, Start Booking Your Own</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="Digital Craft AI vs Angi | Honest Comparison" />
        <meta
          property="og:description"
          content="Side-by-side comparison of Digital Craft AI and Angi for residential trades evaluating whether the next $500 is better spent on more Angi shared leads or an AI agent layer that books the leads you already have."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/angi" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(WEBPAGE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto w-full px-4 pt-24 sm:pt-28 text-xs sm:text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-gray-500 dark:text-gray-400">
          {CRUMBS.map((crumb, i) => {
            const isLast = i === lastCrumb;
            return (
              <li key={crumb.href} data-breadcrumb-item className="inline-flex items-center gap-1">
                {isLast ? (
                  <span aria-current="page" className="font-medium text-gray-700 dark:text-gray-200">{crumb.name}</span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
                {!isLast && <ChevronRight aria-hidden="true" className="size-3 text-gray-400 dark:text-gray-500" />}
              </li>
            );
          })}
        </ol>
      </nav>

      <section className="pt-8 pb-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Honest Comparison
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {PAGE_H1.split(' vs ')[0]} vs <span className="text-primary">Angi</span> for Service Businesses Tired of Shared Leads
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            Angi sells you shared leads where the same homeowner inquiry is sent to three or four other pros in the same ZIP code. Digital Craft AI is the AI agent layer that answers and qualifies the leads you already have on your own website and phone line, so the leads you do pay Angi for actually book. The two are complements, not substitutes.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated June 2026. We strive to keep this comparison accurate and fair.</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">How the Two Stack Up</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/3">Dimension</th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-gray-500 dark:text-gray-400 w-1/3">Angi</th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-primary w-1/3">Digital Craft AI</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.dimension}
                    data-testid="compare-row"
                    className={i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/50 dark:bg-gray-900/50'}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">{row.dimension}</td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-700 dark:text-gray-300">{row.angi}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-700 dark:text-gray-300">{row.dca}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * Angi publishes contractor-side pricing on its public pro pages. Shared-lead prices vary by category, region, and project value; pricing for residential trades is commonly reported in the $40 to $100 per-inquiry range. Check pro.angi.com for the current numbers before scaling spend.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Where Digital Craft AI Stands Out</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Both products solve a real problem. Here is where Digital Craft AI adds capabilities Angi does not.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="p-6 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <d.icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{d.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="p-8 rounded-2xl border border-primary/30 dark:border-primary/40 bg-gray-50 dark:bg-gray-900">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-xs font-medium mb-4">
              <Sparkles size={14} />
              Use Both
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white">Angi for Homeowner-Facing Brand Reach, Digital Craft AI for Qualification</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              The honest position: Angi and Digital Craft AI are complements, not substitutes. Angi has the Angie's List brand recognition with homeowners and puts a paid inquiry in front of you. Digital Craft AI makes sure your AI agent answers that inquiry in seconds rather than letting the homeowner book the next pro who responded faster. Together they raise the booking rate per Angi lead you buy and the booking rate per organic call that hits your own line after hours.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Plenty of our home-services customers keep an Angi budget for homeowner-facing brand reach while running Digital Craft AI as the response layer for every channel. The 48-hour setup with no annual commitment means you can test the combination in a week without renegotiating your Angi spend.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Users size={16} />
            See the Difference Yourself
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Try the AI Layer on Your Own Leads</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Live demos built for residential trades: AI lead chat, AI voice follow-up, and instant estimate generation. No signup, no credit card, no Angi migration.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link
              to="/homeservices/demo/lead-responder"
              data-testid="compareangi-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_lead_responder', 'compareangi_demo_lead_responder')}
            >
              <MessageSquare className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Lead Chat</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Qualifies your website leads</span>
            </Link>
            <Link
              to="/homeservices/demo/voice-followup"
              data-testid="compareangi-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_voice_followup', 'compareangi_demo_voice_followup')}
            >
              <Mic className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Voice Follow-up</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Answers calls after hours</span>
            </Link>
            <Link
              to="/homeservices/demo/estimate"
              data-testid="compareangi-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_estimate', 'compareangi_demo_estimate')}
            >
              <Zap className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Instant Estimate</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Drafts a quote in seconds</span>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'compareangi_strategy_call')}
            >
              <Calendar size={18} />
              Book a 20-Minute Strategy Call
            </a>
            <a
              href="tel:+18335558226"
              className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
              onClick={() => trackCTAClick('call_us', 'compareangi_phone')}
            >
              <Phone size={14} />
              or call us
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">Already running Angi? Keep the shared leads that work, add the AI agent layer on top.</p>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AngiComparison;

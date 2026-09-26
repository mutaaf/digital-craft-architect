import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { recordCompareVisit } from '@/utils/recentComparesStore';
import { Phone, ChevronRight, Sparkles, Mic, Zap, MessageSquare, Users, Calendar } from 'lucide-react';

// Ticket 0099 - "Digital Craft vs BoldTrail" comparison page for real-
// estate CRM lead-generation switchers ("BoldTrail alternative",
// "BoldTrail vs", "BoldTrail AI integration", "AI for real estate CRM",
// "Inside Real Estate BoldTrail comparison", "BoldTrail kvCORE
// difference"). Modeled 1:1 on src/pages/compare/KvCore.tsx (ticket
// 0086, the direct real-estate-vertical peer at similar file size AND
// hub-aware breadcrumb shape) with cross-reference to
// src/pages/compare/FollowUpBoss.tsx (ticket 0065) for the "specialist
// tool plus AI layer" narrative shape. Structural notes: BoldTrail is
// Inside Real Estate's next-generation consolidated platform that
// bundles IDX websites, squeeze-page and paid-lead capture, CRM, drip
// campaigns, and smart plans (the successor and rebrand of kvCORE plus
// BoomTown), so the positioning is complement-not-replace and the four
// dimensions are Lead capture, First response, Qualification, and Voice
// negotiation per the ticket. Demo CTAs route to /realestate/demo/* (the
// three real-estate demos ticket 0086 already funnels into).
//
// 2026-05-25 mirror-source rule: META_DESCRIPTION feeds the Helmet meta
// tag AND the WebPage JSON-LD description. 2026-05-07 em-dash Hard NO:
// every string uses hyphens, never U+2014. Pricing / product-scope
// claim sourcing (per the 2026-05-25 mirror-source-fix rule -
// referenced only, no invented figures written into copy):
// src: https://www.insiderealestate.com (Inside Real Estate portfolio)
// src: https://www.boldtrail.com (BoldTrail product overview: IDX
//      websites, squeeze pages, smart CRM, smart plans, paid-lead
//      capture; positioned as the next-generation platform absorbing
//      kvCORE and BoomTown)

interface ComparisonRow { dimension: string; boldtrail: string; dca: string; }

// Four-row comparison table per the ticket acceptance criteria. Short
// text cells, not check/x icons, because the two products solve
// different jobs (an icon would mis-frame this as a feature shootout).
const COMPARISON_ROWS: ComparisonRow[] = [
  {
    dimension: 'Lead capture',
    boldtrail: 'IDX website + squeeze pages + paid-lead capture into the CRM',
    dca: 'Answers form fills and calls in seconds, 24/7',
  },
  {
    dimension: 'First response',
    boldtrail: 'Smart plans and drip texts fire on a schedule',
    dca: 'AI agent answers on the first ring or first form fill',
  },
  {
    dimension: 'Qualification',
    boldtrail: 'Contact record stores stage, timeline, and notes for the agent',
    dca: 'AI qualifies buyer motivation and timeline in a live chat or call',
  },
  {
    dimension: 'Voice negotiation',
    boldtrail: 'Not in scope - the assigned agent handles the call',
    dca: 'Live AI voice negotiation on browser or phone',
  },
];

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Chat On Your Own IDX Site',
    desc: 'Digital Craft AI ships AI lead chat trained on your own scraped website, ready to sit alongside the BoldTrail IDX pages. After-hours squeeze-page fills get qualified in-thread and the booking lands as a warm lead for the on-call agent. BoldTrail stores the lead once it arrives, but it does not answer the buyer in the moment they filled the squeeze page.',
  },
  {
    icon: Mic,
    title: 'Live AI Voice Answering And Negotiation',
    desc: 'Every Digital Craft AI plan ships AI voice agents that answer the phone in your brokerage name, qualify the buyer or seller, and can negotiate a property deal on a live call. BoldTrail does not answer your phone; leads who call after 5pm still hit voicemail while the smart plan waits for the next scheduled text.',
  },
  {
    icon: Zap,
    title: 'Deal Analysis The Real-Estate CRM Was Not Built For',
    desc: 'Digital Craft AI runs comps, ARV, and bid-range analysis from a property URL or address in seconds, then drafts the seller-outreach message. BoldTrail tracks the contact through the funnel; Digital Craft AI does the deal math and outreach copy the agent would otherwise draft by hand.',
  },
];

// Single source of truth for breadcrumb labels + URLs. Hub-aware shape:
// middle item names "Compare" and links to /compare from ticket 0048.
type Crumb = { name: string; href: string; url: string };
const CRUMBS: ReadonlyArray<Crumb> = [
  { name: 'Home', href: '/', url: 'https://digitalcraftai.com' },
  { name: 'Compare', href: '/compare', url: 'https://digitalcraftai.com/compare' },
  { name: 'Digital Craft vs BoldTrail', href: '/compare/boldtrail', url: 'https://digitalcraftai.com/compare/boldtrail' },
];

const SITE_URL = 'https://digitalcraftai.com';

const PAGE_H1 = 'Digital Craft AI vs BoldTrail';
const PAGE_NAME = 'Digital Craft AI vs BoldTrail Comparison';
const META_DESCRIPTION =
  'Compare Digital Craft AI and BoldTrail honestly. BoldTrail is Inside Real Estate\'s next-generation residential-real-estate operating system that bundles IDX websites, squeeze-page and paid-lead capture, CRM, and smart-plan drip campaigns for brokerages and teams. Digital Craft AI is the AI agent layer that answers those leads in seconds, qualifies them by chat or voice, and can negotiate deals live. The two are complements, not substitutes - BoldTrail keeps the pipeline and the site, the AI layer works the leads.';

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
  url: `${SITE_URL}/compare/boldtrail`,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', url: SITE_URL },
};

// Ticket 0074 - tool name derived from PAGE_H1 per the 2026-05-25
// mirror-source rule; used by recordCompareVisit for the /my
// RecentComparesCard.
const TOOL_NAME = PAGE_H1.split(' vs ')[1];

const BoldTrailComparison: React.FC = () => {
  const { content } = useContent();
  const lastCrumb = CRUMBS.length - 1;

  // Ticket 0074 - record this compare-page visit for the /my dashboard's
  // RecentComparesCard. Empty dep array so the effect fires once per mount.
  useEffect(() => {
    recordCompareVisit(window.location.pathname, TOOL_NAME);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Digital Craft AI vs BoldTrail | Answer The Leads Your CRM Stores</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="Digital Craft AI vs BoldTrail | Honest Comparison" />
        <meta
          property="og:description"
          content="Side-by-side comparison of Digital Craft AI and BoldTrail for real-estate teams evaluating whether the AI agent layer replaces the IDX-plus-CRM bundle or sits on top of it."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/boldtrail" />
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
            {PAGE_H1.split(' vs ')[0]} vs <span className="text-primary">BoldTrail</span> for Real-Estate Teams Tired of Unanswered Leads
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            BoldTrail is Inside Real Estate's next-generation residential real-estate operating system that bundles IDX websites, squeeze-page and paid-lead capture, CRM, and smart-plan drip campaigns for brokerages and teams. Digital Craft AI is the AI agent layer that answers those leads the moment they arrive, qualifies them by chat or voice, and can negotiate a deal live. The two are complements, not substitutes.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated September 2026. We strive to keep this comparison accurate and fair.</p>
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
                  <th className="px-6 py-4 text-sm font-semibold text-center text-gray-500 dark:text-gray-400 w-1/3">BoldTrail</th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-primary w-1/3">Digital Craft AI</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.dimension}
                    data-testid="boldtrail-comparison-row"
                    className={i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/50 dark:bg-gray-900/50'}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">{row.dimension}</td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-700 dark:text-gray-300">{row.boldtrail}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-700 dark:text-gray-300">{row.dca}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * BoldTrail publishes plan pricing through Inside Real Estate at insiderealestate.com and boldtrail.com. Bundle contents and per-seat costs change over time; check the BoldTrail product page before renewing.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Where Digital Craft AI Stands Out</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Both products solve a real problem. Here is where Digital Craft AI adds capabilities BoldTrail does not.</p>
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
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white">BoldTrail For The IDX Site And Pipeline, Digital Craft AI For First Touch And Voice Negotiation</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              The honest position: BoldTrail and Digital Craft AI are complements, not substitutes. BoldTrail owns the IDX website, the squeeze-page and paid-lead capture, and the CRM record every agent works from. Digital Craft AI answers the lead in seconds, qualifies it, and either books the appointment or drops the qualified lead back into BoldTrail for the assigned agent to work.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Plenty of the teams we work with keep their BoldTrail seats and add the AI layer alongside for first-touch, after-hours, and live voice negotiation. The 48-hour setup with no annual commitment means you can test the combination without renegotiating the BoldTrail contract.
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Try The AI Layer On Your Own Leads</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Live demos built for real-estate teams: AI lead chat, AI property-deal analysis, and AI voice negotiation. No signup, no credit card, no CRM migration.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link
              to="/realestate/demo/lead-responder"
              data-testid="compareboldtrail-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_lead_responder', 'compareboldtrail_demo_lead_responder')}
            >
              <MessageSquare className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Lead Chat</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Qualifies your website leads</span>
            </Link>
            <Link
              to="/realestate/demo/property-negotiator"
              data-testid="compareboldtrail-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_property_negotiator', 'compareboldtrail_demo_property_negotiator')}
            >
              <Zap className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Property Analysis</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Comps, ARV, seller messages</span>
            </Link>
            <Link
              to="/realestate/demo/voice-negotiator"
              data-testid="compareboldtrail-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_voice_negotiator', 'compareboldtrail_demo_voice_negotiator')}
            >
              <Mic className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Voice Negotiation</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Live negotiation by voice</span>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'compareboldtrail_strategy_call')}
            >
              <Calendar size={18} />
              Book a 20-Minute Strategy Call
            </a>
            <a
              href="tel:+18335558226"
              className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
              onClick={() => trackCTAClick('call_us', 'compareboldtrail_phone')}
            >
              <Phone size={14} />
              or call us
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">Already running BoldTrail? Keep the seats that work, add the AI agent layer on top.</p>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default BoldTrailComparison;

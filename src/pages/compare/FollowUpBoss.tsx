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

// Ticket 0065 - "Digital Craft vs Follow Up Boss" comparison page for
// real-estate CRM switchers ("Follow Up Boss alternative", "Follow Up
// Boss vs", "AI for real estate CRM", "FUB alternative"). Modeled 1:1 on
// src/pages/compare/Angi.tsx (ticket 0053, the most recent hub-aware
// peer at a similar file size). Structural differences: Follow Up Boss
// is a CRM the team already operates (not a lead marketplace), so the
// positioning is complement-not-replace; demo CTAs route to
// /realestate/demo/* (the three real-estate demos the property-managers
// landing page funnels into); the four dimensions are Lead capture,
// First response, Property analysis, Negotiation per the ticket.
//
// 2026-05-25 mirror-source rule: META_DESCRIPTION feeds the Helmet meta
// tag AND the WebPage JSON-LD description. 2026-05-07 em-dash Hard NO:
// every string uses hyphens, never U+2014. Pricing claim sourcing:
// src: https://www.followupboss.com/pricing (per-seat tier pricing)
// src: https://www.followupboss.com (product overview)

interface ComparisonRow { dimension: string; fub: string; dca: string; }

// Four-row comparison table per the ticket acceptance criteria. Short
// text cells, not check/x icons, because the two products solve
// different jobs (an icon would mis-frame this as a feature shootout).
const COMPARISON_ROWS: ComparisonRow[] = [
  {
    dimension: 'Lead capture',
    fub: 'Stores leads from portals, IDX sites, and forms',
    dca: 'Answers form fills and calls in seconds, 24/7',
  },
  {
    dimension: 'First response',
    fub: 'Action plans and drip texts on a schedule',
    dca: 'AI agent answers on the first ring or first form fill',
  },
  {
    dimension: 'Property analysis',
    fub: 'Not in scope - CRM tracks contact and stage data',
    dca: 'Comps, ARV, bid range, and seller messages in one pass',
  },
  {
    dimension: 'Negotiation',
    fub: 'Not in scope - agent handles the call',
    dca: 'Live AI voice negotiation on browser or phone',
  },
];

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Chat On Your Own Website',
    desc: 'Digital Craft AI ships AI lead chat trained on your own scraped website. After-hours form fills get qualified and the booking lands as a warm lead for the on-call agent. Follow Up Boss stores the lead once it arrives, but it does not answer the homeowner in the moment they filled the form.',
  },
  {
    icon: Mic,
    title: 'Live AI Voice Answering And Negotiation',
    desc: 'Every Digital Craft AI plan ships AI voice agents that answer the phone in your brokerage name, qualify the buyer or seller, and can negotiate a property deal on a live call. Follow Up Boss does not answer your phone; leads who call after 5pm still hit voicemail while the CRM waits for the next drip step.',
  },
  {
    icon: Zap,
    title: 'Property Analysis The CRM Was Not Built For',
    desc: 'Digital Craft AI runs comps, ARV, and bid-range analysis from a property URL or address in seconds, then drafts the seller-outreach message. Follow Up Boss tracks the lead through the funnel; Digital Craft AI does the deal math and outreach copy the agent would otherwise draft by hand.',
  },
];

// Single source of truth for breadcrumb labels + URLs. Hub-aware shape:
// middle item names "Compare" and links to /compare from ticket 0048.
type Crumb = { name: string; href: string; url: string };
const CRUMBS: ReadonlyArray<Crumb> = [
  { name: 'Home', href: '/', url: 'https://digitalcraftai.com' },
  { name: 'Compare', href: '/compare', url: 'https://digitalcraftai.com/compare' },
  { name: 'Digital Craft vs Follow Up Boss', href: '/compare/followupboss', url: 'https://digitalcraftai.com/compare/followupboss' },
];

const SITE_URL = 'https://digitalcraftai.com';

const PAGE_H1 = 'Digital Craft AI vs Follow Up Boss';
const PAGE_NAME = 'Digital Craft AI vs Follow Up Boss Comparison';
const META_DESCRIPTION =
  'Compare Digital Craft AI and Follow Up Boss honestly. Follow Up Boss is a per-seat real-estate CRM that stores your leads and runs action-plan drip sequences. Digital Craft AI is the AI agent layer that answers those leads in seconds, runs property analysis, and can negotiate deals by voice. The two are complements, not substitutes - the CRM keeps the pipeline, the AI layer works the leads.';

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
  url: `${SITE_URL}/compare/followupboss`,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', url: SITE_URL },
};

const FollowUpBossComparison: React.FC = () => {
  const { content } = useContent();
  const lastCrumb = CRUMBS.length - 1;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Digital Craft AI vs Follow Up Boss | Answer The Leads Your CRM Stores</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="Digital Craft AI vs Follow Up Boss | Honest Comparison" />
        <meta
          property="og:description"
          content="Side-by-side comparison of Digital Craft AI and Follow Up Boss for real-estate teams evaluating whether the AI agent layer replaces the CRM or sits on top of it."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/followupboss" />
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
            {PAGE_H1.split(' vs ')[0]} vs <span className="text-primary">Follow Up Boss</span> for Real-Estate Teams Tired of Unanswered Leads
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            Follow Up Boss is a per-seat real-estate CRM that stores your leads and runs action-plan drip sequences. Digital Craft AI is the AI agent layer that answers those leads the moment they arrive, runs property analysis, and can negotiate a deal by voice. The two are complements, not substitutes.
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
                  <th className="px-6 py-4 text-sm font-semibold text-center text-gray-500 dark:text-gray-400 w-1/3">Follow Up Boss</th>
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
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-700 dark:text-gray-300">{row.fub}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-700 dark:text-gray-300">{row.dca}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * Follow Up Boss publishes per-seat pricing on its public pricing page. Tier costs and seat counts change over time; check followupboss.com/pricing for the current numbers before scaling seats.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Where Digital Craft AI Stands Out</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Both products solve a real problem. Here is where Digital Craft AI adds capabilities Follow Up Boss does not.</p>
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
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white">Follow Up Boss For Storage And Pipeline, Digital Craft AI For First Touch And Property Analysis</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              The honest position: Follow Up Boss and Digital Craft AI are complements, not substitutes. Follow Up Boss owns the lead database, smart lists, and pipeline reporting the broker relies on to run the team. Digital Craft AI answers the lead in seconds, qualifies it, and either books the appointment or drops the qualified lead back into Follow Up Boss for the assigned agent to work.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Plenty of the teams we work with keep their Follow Up Boss seats and add the AI layer on top for first-touch, after-hours, and property analysis. The 48-hour setup with no annual commitment means you can test the combination without renegotiating your CRM subscription.
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
              data-testid="comparefollowupboss-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_lead_responder', 'comparefollowupboss_demo_lead_responder')}
            >
              <MessageSquare className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Lead Chat</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Qualifies your website leads</span>
            </Link>
            <Link
              to="/realestate/demo/property-negotiator"
              data-testid="comparefollowupboss-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_property_negotiator', 'comparefollowupboss_demo_property_negotiator')}
            >
              <Zap className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Property Analysis</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Comps, ARV, seller messages</span>
            </Link>
            <Link
              to="/realestate/demo/voice-negotiator"
              data-testid="comparefollowupboss-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_voice_negotiator', 'comparefollowupboss_demo_voice_negotiator')}
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
              onClick={() => trackCTAClick('book_call', 'comparefollowupboss_strategy_call')}
            >
              <Calendar size={18} />
              Book a 20-Minute Strategy Call
            </a>
            <a
              href="tel:+18335558226"
              className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
              onClick={() => trackCTAClick('call_us', 'comparefollowupboss_phone')}
            >
              <Phone size={14} />
              or call us
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">Already running Follow Up Boss? Keep the seats that work, add the AI agent layer on top.</p>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default FollowUpBossComparison;

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

// Ticket 0073 - "Digital Craft vs JobTread" comparison page for
// construction-management CRM switchers ("JobTread alternative",
// "JobTread vs", "AI for construction CRM", "JobTread AI integration").
// Modeled 1:1 on src/pages/compare/FollowUpBoss.tsx (ticket 0065, the
// direct hub-aware peer at similar file size). Construction-vertical
// tone cross-referenced against src/pages/compare/Buildertrend.tsx
// (ticket 0042). Structural difference vs FUB: JobTread is a
// construction PM platform (not a per-seat CRM), so the positioning is
// complement-not-replace; demo CTAs route to /construction/demo/* (the
// three construction demos that map to the four comparison dimensions).
// Dimensions: Lead capture, First response, Estimating, Negotiation.
//
// 2026-05-25 mirror-source rule: META_DESCRIPTION feeds the Helmet meta
// tag AND the WebPage JSON-LD description. 2026-05-07 em-dash Hard NO:
// every string uses hyphens, never U+2014. Pricing claim sourcing:
// src: https://www.jobtread.com/pricing (published tier pricing)
// src: https://www.jobtread.com (product overview)

interface ComparisonRow { dimension: string; jobtread: string; dca: string; }

// Four-row comparison table per the ticket acceptance criteria. Short
// text cells, not check/x icons, because the two products solve
// different jobs (an icon would mis-frame this as a feature shootout).
const COMPARISON_ROWS: ComparisonRow[] = [
  {
    dimension: 'Lead capture',
    jobtread: 'Stores leads, contacts, and jobs on a single record',
    dca: 'Answers form fills and calls in seconds, 24/7',
  },
  {
    dimension: 'First response',
    jobtread: 'Action plans and reminder drips on a schedule',
    dca: 'AI agent answers on the first ring or first form fill',
  },
  {
    dimension: 'Estimating',
    jobtread: 'Line-item estimating with cost catalogs and takeoffs',
    dca: 'AI drafts a construction estimate from a brief plus your site',
  },
  {
    dimension: 'Negotiation',
    jobtread: 'Not in scope - PM tracks the job once it is sold',
    dca: 'Live AI voice negotiation on browser or phone',
  },
];

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Chat On Your Own Website',
    desc: 'Digital Craft AI ships AI lead chat trained on your own scraped website. After-hours form fills get qualified and the booking lands as a warm lead for the office manager. JobTread stores the lead once it arrives, but it does not answer the homeowner in the moment they filled the form.',
  },
  {
    icon: Mic,
    title: 'Live AI Voice Answering And Negotiation',
    desc: 'Every Digital Craft AI plan ships AI voice agents that answer the phone in your shop name, qualify the project, and can negotiate a change order on a live call. JobTread does not answer your phone; leads who call after 5pm still hit voicemail while the PM waits for the next action-plan step.',
  },
  {
    icon: Zap,
    title: 'Instant AI Estimate Drafts The PM Was Not Built For',
    desc: 'Digital Craft AI drafts a usable construction estimate from a project brief plus your own website in under a minute. JobTread ships mature line-item estimating with cost catalogs and takeoffs that shine in the hands of a trained estimator; Digital Craft AI produces the first-pass draft the office would otherwise write by hand.',
  },
];

// Single source of truth for breadcrumb labels + URLs. Hub-aware shape:
// middle item names "Compare" and links to /compare from ticket 0048.
type Crumb = { name: string; href: string; url: string };
const CRUMBS: ReadonlyArray<Crumb> = [
  { name: 'Home', href: '/', url: 'https://digitalcraftai.com' },
  { name: 'Compare', href: '/compare', url: 'https://digitalcraftai.com/compare' },
  { name: 'Digital Craft vs JobTread', href: '/compare/jobtread', url: 'https://digitalcraftai.com/compare/jobtread' },
];

const SITE_URL = 'https://digitalcraftai.com';

const PAGE_H1 = 'Digital Craft AI vs JobTread';
const PAGE_NAME = 'Digital Craft AI vs JobTread Comparison';
const META_DESCRIPTION =
  'Compare Digital Craft AI and JobTread honestly. JobTread is a construction project-management platform that bundles estimating, scheduling, financials, and customer portals for residential remodelers and light-commercial GCs. Digital Craft AI is the AI agent layer that answers those leads in seconds, drafts estimates, and can negotiate a job by voice. The two are complements, not substitutes - the PM keeps the job record, the AI layer works the leads.';

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
  url: `${SITE_URL}/compare/jobtread`,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', url: SITE_URL },
};

// Ticket 0074 - tool name derived from PAGE_H1 per the 2026-05-25
// mirror-source rule; used by recordCompareVisit for the /my
// RecentComparesCard.
const TOOL_NAME = PAGE_H1.split(' vs ')[1];

const JobTreadComparison: React.FC = () => {
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
        <title>Digital Craft AI vs JobTread | Answer The Leads Your PM Platform Stores</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="Digital Craft AI vs JobTread | Honest Comparison" />
        <meta
          property="og:description"
          content="Side-by-side comparison of Digital Craft AI and JobTread for construction shops evaluating whether the AI agent layer replaces the PM platform or sits in front of it."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/jobtread" />
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
            {PAGE_H1.split(' vs ')[0]} vs <span className="text-primary">JobTread</span> for Construction Shops Tired of Unanswered Leads
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            JobTread is a construction project-management platform that bundles estimating, scheduling, financials, and customer portals for residential remodelers and light-commercial GCs. Digital Craft AI is the AI agent layer that answers those leads the moment they arrive, drafts estimates, and can negotiate a job by voice. The two are complements, not substitutes.
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
                  <th className="px-6 py-4 text-sm font-semibold text-center text-gray-500 dark:text-gray-400 w-1/3">JobTread</th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-primary w-1/3">Digital Craft AI</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.dimension}
                    data-testid="jobtread-comparison-row"
                    className={i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/50 dark:bg-gray-900/50'}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">{row.dimension}</td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-700 dark:text-gray-300">{row.jobtread}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-sm text-gray-700 dark:text-gray-300">{row.dca}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * JobTread publishes its tier pricing on its public pricing page. Tier costs, seat counts, and feature scope change over time; check jobtread.com/pricing for the current numbers before scaling seats.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Where Digital Craft AI Stands Out</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Both products solve a real problem. Here is where Digital Craft AI adds capabilities JobTread does not.</p>
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
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white">JobTread For The Job Record And Financials, Digital Craft AI For First Touch And Estimate Drafts</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              The honest position: JobTread and Digital Craft AI are complements, not substitutes. JobTread owns the job record, the schedule, cost catalogs, financials, and the customer portal the GC relies on to run the shop. Digital Craft AI answers the lead in seconds, qualifies it, drafts the estimate, and either books the site visit or drops the qualified lead back into JobTread for the assigned PM to work.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Plenty of the construction shops we work with keep their JobTread seats and add the AI layer on top for first-touch, after-hours, and estimate drafts. The 48-hour setup with no annual commitment means you can test the combination without renegotiating your PM subscription.
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
            Live demos built for construction shops: AI lead chat, AI estimate generation, and AI voice negotiation. No signup, no credit card, no PM migration.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link
              to="/construction/demo/lead-responder"
              data-testid="comparejobtread-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_lead_responder', 'comparejobtread_demo_lead_responder')}
            >
              <MessageSquare className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Lead Chat</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Qualifies your website leads</span>
            </Link>
            <Link
              to="/construction/demo/estimate"
              data-testid="comparejobtread-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_estimate', 'comparejobtread_demo_estimate')}
            >
              <Zap className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Estimate Draft</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">First-pass construction quote</span>
            </Link>
            <Link
              to="/construction/demo/voice-negotiator"
              data-testid="comparejobtread-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_voice_negotiator', 'comparejobtread_demo_voice_negotiator')}
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
              onClick={() => trackCTAClick('book_call', 'comparejobtread_strategy_call')}
            >
              <Calendar size={18} />
              Book a 20-Minute Strategy Call
            </a>
            <a
              href="tel:+18335558226"
              className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
              onClick={() => trackCTAClick('call_us', 'comparejobtread_phone')}
            >
              <Phone size={14} />
              or call us
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">Already running JobTread? Keep the seats that work, add the AI agent layer on top.</p>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default JobTreadComparison;

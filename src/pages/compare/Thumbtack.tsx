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
  Check,
  X,
  Minus,
  Phone,
  ChevronRight,
  Sparkles,
  Mic,
  Zap,
  Clock,
  MessageSquare,
  Users,
  Calendar,
} from 'lucide-react';

// Ticket 0049 - "Digital Craft vs Thumbtack" comparison page for high-
// intent lead-marketplace switchers ("Thumbtack alternative", "Thumbtack
// vs", "stop paying Thumbtack", "AI to replace Thumbtack"). Modeled on
// src/pages/compare/Buildertrend.tsx (ticket 0042, the most recent peer
// in the family) with three deliberate departures called out in the
// ticket Why-now and Engineering notes:
//   1. The page is the first in the family to compare against a lead
//      MARKETPLACE rather than software a contractor operates, so the
//      positioning frame is "Thumbtack sells you leads, Digital Craft
//      books the leads you already have" rather than the usual
//      head-to-head feature comparison. A new "Use both" section
//      reflects that complementary stack.
//   2. The breadcrumb middle item is "Compare" linking to the /compare
//      hub from ticket 0048 (Home -> Compare -> Digital Craft vs
//      Thumbtack). The ten predecessor compare pages breadcrumb
//      Home -> Comparison directly because they shipped before /compare
//      existed; updating their breadcrumbs is its own ticket per the
//      AGENTS.md small-focused-PR rule.
//   3. Demo CTAs route to /homeservices/demo/* (the family the trade
//      landing pages funnel into) rather than /construction/demo/*; the
//      strategy-call CTA points at calendly.com/mutaaf with
//      target=_blank + rel="noopener noreferrer" per the existing
//      compare-page convention.
//
// 2026-05-25 mirror-source rule: the Helmet meta description AND the
// WebPage JSON-LD description read from the SAME META_DESCRIPTION
// constant; the e2e spec asserts they match byte-for-byte.
// 2026-05-07 em-dash Hard NO: every string in this module - the H1, the
// META_DESCRIPTION, the PAGE_NAME, the four comparison-row labels and
// values, the "Use both" section copy, the JSON-LD strings, the CTA
// labels - uses hyphens, never the U+2014 character.

// Thumbtack pricing claim: Thumbtack publishes pay-per-lead credit
// pricing on its public help docs and homepage. Credit prices per
// "exact match" lead are widely reported in the high single-digit to
// low-double-digit-dollar range, with monthly contractor budgets
// commonly running in the $300-$900 range for residential trades per
// public Capterra / Reddit / r/smallbusiness reporting. The page does
// not quote a specific dollar number; it cites thumbtack.com as the
// canonical source in the asterisk footnote so a future editor can
// re-verify per the 2026-05-25 mirror-source rule.
// src: https://help.thumbtack.com (pay-per-lead credit pricing)
// src: https://www.thumbtack.com/pro (contractor-side pricing intro)

interface ComparisonRow {
  dimension: string;
  thumbtack: string;
  dca: string;
  // Optional Tailwind variant to show an icon vs a text cell.
  thumbtackVariant?: 'check' | 'x' | 'partial' | 'text';
  dcaVariant?: 'check' | 'x' | 'partial' | 'text';
}

// Four-row comparison table per the ticket acceptance criteria: Lead
// source, Cost model, Response speed, Exclusivity per lead. The cells
// are short text rather than yes/no icons because the two products
// solve different jobs - a check / x icon would mis-frame the
// comparison as a feature shootout.
const COMPARISON_ROWS: ComparisonRow[] = [
  {
    dimension: 'Lead source',
    thumbtack: 'Thumbtack-owned marketplace and search',
    dca: 'Your own website, phone line, and ads',
    thumbtackVariant: 'text',
    dcaVariant: 'text',
  },
  {
    dimension: 'Cost model',
    thumbtack: 'Pay-per-lead credits, billed per match*',
    dca: 'Flat monthly subscription, no per-lead fee',
    thumbtackVariant: 'text',
    dcaVariant: 'text',
  },
  {
    dimension: 'Response speed',
    thumbtack: 'Race against other pros bidding the same lead',
    dca: 'AI agent answers in seconds, 24/7',
    thumbtackVariant: 'text',
    dcaVariant: 'text',
  },
  {
    dimension: 'Exclusivity per lead',
    thumbtack: 'Same lead is sold to multiple pros',
    dca: 'Every lead is exclusively yours',
    thumbtackVariant: 'text',
    dcaVariant: 'text',
  },
];

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Chat on Your Own Website',
    desc: 'Digital Craft AI ships AI lead chat trained on your own scraped website in every tier. After-hours form fills get qualified, the timeline and budget get captured, and the booking lands as a warm lead for your office manager. Thumbtack qualifies leads inside Thumbtack and routes them to pros who bought the credit; your own website still goes unanswered after 5pm.',
  },
  {
    icon: Mic,
    title: 'Live AI Voice Answering That Books',
    desc: 'Every Digital Craft AI plan ships AI voice agents that answer the phone in your shop name, qualify the project, and book the appointment. Browser WebRTC and outbound dialing both work. Thumbtack does not answer your phone; the leads who call you directly after seeing your truck still hit voicemail when the crew is on a jobsite.',
  },
  {
    icon: Zap,
    title: 'Flat Monthly Cost, No Per-Lead Bidding',
    desc: 'Digital Craft AI is a flat monthly subscription. Your cost does not climb when you take on more jobs and you are not bidding against four other pros for the same homeowner. Thumbtack is pay-per-lead credit; budgets commonly run $300 to $900 a month per the public Thumbtack pro pricing pages, and the credits buy you a chance at the lead, not the lead.',
  },
  {
    icon: Clock,
    title: '48-Hour Setup, Month-to-Month',
    desc: 'Digital Craft AI ships in two business days alongside whatever tool you already use, with no annual commitment. If the AI agent layer is not the move for your shop, you stop next month. Thumbtack credits do not refund once the lead is delivered, so the spend commitment is per credit, not per month.',
  },
];

// Single source of truth for breadcrumb labels + URLs. The visible
// <nav> markup and the BreadcrumbList JSON-LD both read from this
// array so a copy edit cannot drift the schema (per the 2026-05-25
// mirror-source lesson in docs/LESSONS.md). Structural difference from
// the ten predecessor compare pages: the middle item names "Compare"
// and links to the /compare hub from ticket 0048.
type Crumb = { name: string; href: string; url: string };
const CRUMBS: ReadonlyArray<Crumb> = [
  { name: 'Home', href: '/', url: 'https://digitalcraftai.com' },
  { name: 'Compare', href: '/compare', url: 'https://digitalcraftai.com/compare' },
  {
    name: 'Digital Craft vs Thumbtack',
    href: '/compare/thumbtack',
    url: 'https://digitalcraftai.com/compare/thumbtack',
  },
];

const SITE_URL = 'https://digitalcraftai.com';

// Mirror-source constants: the Helmet meta tag AND the WebPage JSON-LD
// description read from the same META_DESCRIPTION; the H1 reads from
// PAGE_H1; the WebPage JSON-LD `name` reads from PAGE_NAME. The e2e
// spec asserts the Helmet description equals the WebPage description
// byte-for-byte.
const PAGE_H1 = 'Digital Craft AI vs Thumbtack';
const PAGE_NAME = 'Digital Craft AI vs Thumbtack Comparison';
const META_DESCRIPTION =
  'Compare Digital Craft AI and Thumbtack honestly. Thumbtack sells you pay-per-lead credits in a marketplace where the same lead goes to multiple pros. Digital Craft AI is the AI agent layer that answers and qualifies the leads you already have on your website and phone line, for a flat monthly cost. The two are complements, not substitutes - pick what fits your next $500.';

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
  url: `${SITE_URL}/compare/thumbtack`,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', url: SITE_URL },
};

function CellIcon({ value, variant }: { value: string; variant?: 'check' | 'x' | 'partial' | 'text' }) {
  if (variant === 'check')
    return <Check className="text-green-600 dark:text-green-400 mx-auto" size={20} />;
  if (variant === 'x')
    return <X className="text-gray-400 dark:text-gray-600 mx-auto" size={20} />;
  if (variant === 'partial')
    return <Minus className="text-yellow-500 dark:text-yellow-400 mx-auto" size={20} />;
  return <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>;
}

const ThumbtackComparison: React.FC = () => {
  const { content } = useContent();
  const lastCrumb = CRUMBS.length - 1;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Digital Craft AI vs Thumbtack | Stop Paying Per Lead, Start Booking Your Own</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta
          property="og:title"
          content="Digital Craft AI vs Thumbtack | Honest Comparison"
        />
        <meta
          property="og:description"
          content="Side-by-side comparison of Digital Craft AI and Thumbtack for residential trades evaluating whether the next $500 is better spent on AI lead handling or more Thumbtack credits."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/thumbtack" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(WEBPAGE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Visible breadcrumb - same crumb array as the JSON-LD above */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-6xl mx-auto w-full px-4 pt-24 sm:pt-28 text-xs sm:text-sm"
      >
        <ol className="flex flex-wrap items-center gap-1 text-gray-500 dark:text-gray-400">
          {CRUMBS.map((crumb, i) => {
            const isLast = i === lastCrumb;
            return (
              <li key={crumb.href} data-breadcrumb-item className="inline-flex items-center gap-1">
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-medium text-gray-700 dark:text-gray-200"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
                {!isLast && (
                  <ChevronRight
                    aria-hidden="true"
                    className="size-3 text-gray-400 dark:text-gray-500"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Hero */}
      <section className="pt-8 pb-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Honest Comparison
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {PAGE_H1.split(' vs ')[0]} vs{' '}
            <span className="text-primary">Thumbtack</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            Thumbtack is a pay-per-lead marketplace where residential trades buy credits to bid against other pros for the same homeowner job. Digital Craft AI is the AI agent layer that answers and qualifies the leads you already have on your own website and phone line, so the leads you do pay for actually book. The two are complements, not substitutes.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated June 2026. We strive to keep this comparison accurate and fair.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
            How the Two Stack Up
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/3">
                    Dimension
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-gray-500 dark:text-gray-400 w-1/3">
                    Thumbtack
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-primary w-1/3">
                    Digital Craft AI
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.dimension}
                    data-testid="compare-row"
                    className={
                      i % 2 === 0
                        ? 'bg-white dark:bg-gray-950'
                        : 'bg-gray-50/50 dark:bg-gray-900/50'
                    }
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {row.dimension}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellIcon value={row.thumbtack} variant={row.thumbtackVariant} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellIcon value={row.dca} variant={row.dcaVariant} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * Thumbtack publishes pay-per-lead credit pricing on its public pro help pages. Credit prices per match vary by category, region, and lead intent; contractor monthly budgets are commonly reported in the $300 to $900 range for residential trades. Check thumbtack.com for the current numbers before scaling spend.
          </p>
        </div>
      </section>

      {/* Where Digital Craft AI Stands Out */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Where Digital Craft AI Stands Out
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Both products solve a real problem. Here is where Digital Craft AI adds capabilities Thumbtack does not.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DIFFERENTIATORS.map((d) => (
              <div
                key={d.title}
                className="p-6 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800"
              >
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

      {/* What Thumbtack Does Better */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            What Thumbtack Does Better
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            We recommend the right tool, even when it is not ours.
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'Cold-start lead acquisition when your own pipeline is empty',
                desc: 'If you just opened a new territory and your website does not rank yet, Thumbtack puts you in front of homeowners who are already searching for the work. The marketplace is a real acquisition channel. Digital Craft AI does not generate leads; it answers and qualifies the ones you already have.',
              },
              {
                title: 'Brand-agnostic homeowners who shop the marketplace',
                desc: 'Some homeowners start their search inside Thumbtack rather than on Google or Nextdoor. If that is where the buying intent lives in your market, Thumbtack reaches a customer Digital Craft AI cannot.',
              },
              {
                title: 'Filling a slow week with paid leads on short notice',
                desc: 'A pay-per-lead spend can be turned up the same day to fill empty crew time. Digital Craft AI is a longer arc; it gets more out of the leads you already get, but it does not manufacture new leads on a Tuesday.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Both - the complementary stack */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="p-8 rounded-2xl border border-primary/30 dark:border-primary/40 bg-white dark:bg-gray-950">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-xs font-medium mb-4">
              <Sparkles size={14} />
              Use Both
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Thumbtack for Acquisition, Digital Craft AI for Qualification
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              The honest position: Thumbtack and Digital Craft AI are complements, not substitutes. Thumbtack puts a paid lead in front of you. Digital Craft AI makes sure your AI agent answers that lead in seconds rather than letting the homeowner book the next pro who responded faster. The two together raise the booking rate per credit you spend on Thumbtack and raise the booking rate per organic call that hits your own line after hours.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Plenty of our home-services customers keep a Thumbtack budget for cold-start acquisition while running Digital Craft AI as the response layer for every channel. The 48-hour setup with no annual commitment means you can test the combination in a week without renegotiating your Thumbtack spend.
            </p>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Stop Paying Per Lead, Start Booking Your Own
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              If you run a 6-truck plumbing shop, a residential roofing crew, or a solo HVAC outfit, the question is rarely whether to drop Thumbtack tomorrow. Thumbtack still drives a real chunk of cold-start acquisition for trades whose websites do not yet rank. The real question is whether the next $500 of marketing spend is better used on more Thumbtack credits where you bid against four other pros, or on an AI agent layer that answers every form fill and after-hours call on your own line so the leads you already get actually book.
            </p>
            <p>
              That is the gap Digital Craft AI is built to close. Our AI voice agents answer the phone in your shop name, qualify the project, and book the consult back into whatever calendar you use. Our AI lead chat does the same on your website, included in every plan rather than priced as a separate add-on. The leads land warm, the office manager does not lose an hour to phone tag, and the Thumbtack credits you do buy convert at a higher rate because no homeowner hits voicemail.
            </p>
            <p>
              Plenty of our home-services customers keep a Thumbtack budget for cold-start acquisition and add Digital Craft AI on top for voice answering, lead chat, and instant estimate generation. The 48-hour setup with no annual commitment means you can test the combination in a week without renegotiating your Thumbtack spend.
            </p>
          </div>
        </div>
      </section>

      {/* Demo CTAs - three /homeservices/demo/* targets */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Users size={16} />
            See the Difference Yourself
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Try the AI Layer on Your Own Leads
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Live demos built for residential trades: AI lead chat, AI voice follow-up, and instant estimate generation. No signup, no credit card, no Thumbtack migration.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link
              to="/homeservices/demo/lead-responder"
              data-testid="comparethumbtack-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_lead_responder', 'comparethumbtack_demo_lead_responder')}
            >
              <MessageSquare className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Lead Chat</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Qualifies your website leads</span>
            </Link>
            <Link
              to="/homeservices/demo/voice-followup"
              data-testid="comparethumbtack-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_voice_followup', 'comparethumbtack_demo_voice_followup')}
            >
              <Mic className="text-primary" size={22} />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Voice Follow-up</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Answers calls after hours</span>
            </Link>
            <Link
              to="/homeservices/demo/estimate"
              data-testid="comparethumbtack-demo-cta"
              className="inline-flex flex-col items-center justify-center gap-2 px-6 py-5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary rounded-xl transition-colors"
              onClick={() => trackCTAClick('try_estimate', 'comparethumbtack_demo_estimate')}
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
              onClick={() => trackCTAClick('book_call', 'comparethumbtack_strategy_call')}
            >
              <Calendar size={18} />
              Book a 20-Minute Strategy Call
            </a>
            <a
              href="tel:+18335558226"
              className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
              onClick={() => trackCTAClick('call_us', 'comparethumbtack_phone')}
            >
              <Phone size={14} />
              or call us
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already running Thumbtack? Keep the credits that work, add the AI agent layer on top.
          </p>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default ThumbtackComparison;

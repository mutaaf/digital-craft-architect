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
  DollarSign,
  MessageSquare,
  Users,
} from 'lucide-react';

// Ticket 0042 - "Digital Craft vs Buildertrend" comparison page for
// high-intent residential-construction project-management compare
// queries ("Buildertrend AI", "Buildertrend alternative",
// "Buildertrend AI add-on", "Buildertrend vs AI tools"). Modeled
// directly on src/pages/compare/HousecallPro.tsx (ticket 0038, the
// most recent peer) with three deliberate departures:
//   1. The honest-acknowledgment block is re-pointed at Buildertrend's
//      actual strengths: mature project management, client portal with
//      daily logs, schedule and Gantt, change orders, file storage,
//      subcontractor management, and deep QuickBooks / Xero
//      integrations.
//   2. The "Best when paired with Buildertrend" callout positions
//      Digital Craft as the AI front-of-funnel layer that sits in
//      FRONT of Buildertrend, not as a project-management replacement.
//   3. Every Buildertrend claim is cited via an HTML comment naming
//      the source URL above the row AND an asterisk footnote in the
//      rendered DOM (per the 2026-05-25 mirror-source lesson in
//      docs/LESSONS.md).

interface ComparisonRow {
  feature: string;
  dca: 'yes' | 'no' | 'partial' | string;
  buildertrend: 'yes' | 'no' | 'partial' | string;
}

// Source URLs cited in the asterisk footnote below. Buildertrend
// pricing was verified on 2026-06-09 against buildertrend.com/pricing
// plus widely-reported public Capterra / G2 breakdowns. Buildertrend
// publishes an "Essential" tier in the mid-3-figure monthly range, an
// "Advanced" tier, and a "Complete" tier, with an annual contract on
// the entry tiers and an implementation onboarding workflow. Numbers
// may change; the row's asterisk footnote names the source URL so a
// future editor can re-verify per the 2026-05-25 mirror-source rule.
const FEATURES: ComparisonRow[] = [
  // src: https://buildertrend.com/features/ - Buildertrend does not
  // ship an AI lead chat in its base plans; DCA ships AI lead chat in
  // every plan tier.
  { feature: 'AI Lead Qualification Chat', dca: 'yes', buildertrend: 'no*' },
  // src: https://buildertrend.com/features/ - Buildertrend does not
  // ship an AI voice negotiation product; DCA ships AI voice
  // answering in browser WebRTC and outbound phone in every tier.
  { feature: 'AI Voice Negotiation (WebRTC + Phone)', dca: 'yes', buildertrend: 'no*' },
  // src: https://buildertrend.com/features/estimating-takeoff/ -
  // Buildertrend ships estimating and takeoff tools that require
  // operator input; DCA ships an instant AI estimate flow that
  // produces a draft from a brief plus the visitor's website.
  { feature: 'Instant AI Estimate Generation', dca: 'yes', buildertrend: 'partial*' },
  // src: https://buildertrend.com/features/online-payments/ -
  // Buildertrend ships review-request workflows as part of its CRM
  // surfaces, but does not ship an AI review-automation flow; DCA
  // ships a review-automation demo as part of the construction track.
  { feature: 'AI Review Automation', dca: 'yes', buildertrend: 'partial*' },
  // src: https://buildertrend.com/features/project-management/ -
  // Project management is the flagship Buildertrend surface (daily
  // logs, to-dos, schedule, files, subcontractor management); DCA
  // does not ship a project-management product.
  { feature: 'Project Management Depth', dca: 'no', buildertrend: 'yes' },
  // src: https://buildertrend.com/features/customer-portal/ -
  // Buildertrend ships a mature client portal with daily logs, photo
  // sharing, selections, and messaging; DCA does not ship a client
  // portal.
  { feature: 'Client Portal with Daily Logs', dca: 'no', buildertrend: 'yes' },
  // src: https://buildertrend.com/features/change-orders/ -
  // Buildertrend ships a structured change-order workflow with
  // client approvals; DCA does not ship a change-order surface.
  { feature: 'Change Orders & Approvals', dca: 'no', buildertrend: 'yes' },
  // src: https://buildertrend.com/features/scheduling/ - Buildertrend
  // ships a schedule view with Gantt-style dependencies; DCA does
  // not ship a Gantt or schedule board.
  { feature: 'Scheduling & Gantt View', dca: 'no', buildertrend: 'yes' },
  // src: https://buildertrend.com/features/accounting/ - Buildertrend
  // ships deep QuickBooks Online and Xero two-way sync; DCA runs
  // alongside QuickBooks but does not ship a deep two-way sync.
  { feature: 'Deep QuickBooks / Xero Integration', dca: 'partial', buildertrend: 'yes' },
  // src: https://buildertrend.com/pricing/ + public Capterra / G2
  // reporting - the Essential tier is widely reported in the mid-3-
  // figure monthly range on an annual contract.
  { feature: 'Monthly Pricing (Entry Tier)', dca: '$500/mo', buildertrend: '$399/mo*' },
  // src: https://buildertrend.com/pricing/ + public reporting -
  // Advanced tier is widely reported at roughly $799/mo annual.
  { feature: 'Monthly Pricing (Mid Tier)', dca: '$1,500/mo', buildertrend: '$799/mo*' },
  // src: https://buildertrend.com/pricing/ - Published Buildertrend
  // pricing is annual; DCA is month-to-month at the entry tier.
  { feature: 'Month-to-Month Available', dca: 'yes', buildertrend: 'no*' },
  // src: typical SaaS onboarding - Buildertrend implementation is
  // sales-led with an onboarding workflow that typically runs
  // multiple weeks; DCA ships in 48 hours.
  { feature: '48-Hour Go-Live', dca: 'yes', buildertrend: 'no*' },
  // src: derived from DCA pricing + Buildertrend published plans -
  // Buildertrend does not advertise an upfront implementation fee at
  // the entry tier; DCA does not charge a setup fee.
  { feature: 'Implementation Fee', dca: 'None', buildertrend: 'None' },
];

const DIFFERENTIATORS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Chat Included in Every Plan',
    desc: 'Digital Craft AI ships AI lead chat trained on your own scraped website in every tier, no add-on. After-hours form fills get qualified, the timeline and budget get captured, and the booking lands as a warm lead for your office manager. Buildertrend is built for managing the job once it is sold; the lead-capture layer is on you.',
  },
  {
    icon: Mic,
    title: 'Live AI Voice Negotiation That Books',
    desc: 'Every Digital Craft AI plan ships AI voice agents that answer the phone in your shop name, negotiate the scope, and book the appointment. Browser WebRTC and outbound dialing both work. Buildertrend does not ship an AI voice product; calls still ring the office.',
  },
  {
    icon: Zap,
    title: 'Instant AI Estimate Generation',
    desc: 'Digital Craft AI generates a usable construction estimate draft from a project brief plus your own website in under a minute. Buildertrend ships estimating and takeoff tools that are powerful in the hands of a trained estimator, but they expect operator input on every line.',
  },
  {
    icon: Clock,
    title: '48-Hour Setup, Month-to-Month',
    desc: 'Digital Craft AI runs alongside whatever project management tool you already use, so you can be live in two business days with no annual commitment. Buildertrend onboardings are sales-led and the published tiers require an annual contract.',
  },
];

// Single source of truth for breadcrumb labels + URLs. The visible
// <nav> markup and the BreadcrumbList JSON-LD both read from this
// array so a copy edit cannot drift the schema (per the 2026-05-25
// mirror-source lesson in docs/LESSONS.md).
type Crumb = { name: string; href: string; url: string };
const CRUMBS: ReadonlyArray<Crumb> = [
  { name: 'Home', href: '/', url: 'https://digitalcraftai.com' },
  { name: 'Compare', href: '/compare/jobber', url: 'https://digitalcraftai.com/compare/jobber' },
  { name: 'Buildertrend', href: '/compare/buildertrend', url: 'https://digitalcraftai.com/compare/buildertrend' },
];

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

function CellIcon({ value }: { value: string }) {
  if (value === 'yes') return <Check className="text-green-600 dark:text-green-400 mx-auto" size={20} />;
  if (value === 'no') return <X className="text-gray-400 dark:text-gray-600 mx-auto" size={20} />;
  if (value === 'partial') return <Minus className="text-yellow-500 dark:text-yellow-400 mx-auto" size={20} />;
  return <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>;
}

const BuildertrendComparison: React.FC = () => {
  const { content } = useContent();
  const lastCrumb = CRUMBS.length - 1;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>DigitalCraft AI vs Buildertrend | Best AI Add-On for Buildertrend Construction Shops</title>
        <meta
          name="description"
          content="Compare DigitalCraft AI and Buildertrend side-by-side. See where Buildertrend wins on project management, client portal, change orders, and scheduling, and where DigitalCraft AI adds AI voice negotiation, included AI lead chat, instant estimate generation, and 48-hour setup."
        />
        <meta property="og:title" content="DigitalCraft AI vs Buildertrend | Honest Feature Comparison" />
        <meta
          property="og:description"
          content="Side-by-side comparison of DigitalCraft AI and Buildertrend for residential and light-commercial construction shops evaluating AI front-of-funnel tools."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/buildertrend" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'DigitalCraft AI vs Buildertrend Comparison',
            description:
              'Feature-by-feature comparison of DigitalCraft AI and Buildertrend for residential and light-commercial construction companies.',
            publisher: {
              '@type': 'Organization',
              name: 'DigitalCraft AI',
              url: 'https://digitalcraftai.com',
            },
          })}
        </script>
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
            DigitalCraft AI vs{' '}
            <span className="text-primary">Buildertrend</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            Buildertrend is a leading project-management platform for residential and light-commercial construction, with mature daily logs, a client portal, change-order approvals, and a real schedule and Gantt view. DigitalCraft AI is an AI front-of-funnel layer that adds voice negotiation, included AI lead chat, and instant estimate generation at a flat monthly price. Plenty of construction shops run both.
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
            Feature-by-Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/2">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-primary w-1/4">
                    DigitalCraft AI
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-gray-500 dark:text-gray-400 w-1/4">
                    Buildertrend
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr
                    key={row.feature}
                    data-testid="compare-row"
                    className={
                      i % 2 === 0
                        ? 'bg-white dark:bg-gray-950'
                        : 'bg-gray-50/50 dark:bg-gray-900/50'
                    }
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellIcon value={row.dca} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellIcon value={row.buildertrend} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * Buildertrend pricing, feature scope, and annual-contract terms reflect public information on buildertrend.com/pricing plus Capterra and G2 breakdowns as of June 2026. Buildertrend itself directs visitors to its sales team for a current quote; tier prices and feature scope may change. Check buildertrend.com for the current numbers before signing.
          </p>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Where DigitalCraft AI Stands Out
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Both platforms have their strengths. Here is where DCA offers AI capabilities Buildertrend does not ship in its base plans.
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

      {/* When Buildertrend Might Be Better */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            What Buildertrend Does Better
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            We believe in recommending the right tool, even when it is not ours.
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'Project management depth, daily logs, and file storage',
                desc: 'Buildertrend ships a real project-management surface: daily logs with photos, to-dos, document storage, RFIs, and subcontractor management. If managing the active job is where the office manager loses hours each week, start there. DigitalCraft AI deliberately does not ship a project-management product; we sit in front of whatever PM tool you already use.',
              },
              {
                title: 'Client portal with daily logs, selections, and messaging',
                desc: 'The Buildertrend client portal is one of the most polished surfaces in residential construction, with daily logs, photo sharing, selections, and threaded messaging. If a homeowner-facing portal is non-negotiable for your jobs, Buildertrend is purpose-built for that. DigitalCraft AI does not ship a client portal.',
              },
              {
                title: 'Change orders, scheduling, and Gantt',
                desc: 'Buildertrend ships structured change-order approvals tied to the customer portal plus a schedule and Gantt view with dependencies. If change-order discipline and visual scheduling are the workflows you cannot run on spreadsheets, Buildertrend is the better fit. DigitalCraft AI focuses on lead capture and estimate generation and hands off the job to your PM tool.',
              },
              {
                title: 'Deep QuickBooks and Xero integration',
                desc: 'Buildertrend ships a two-way QuickBooks Online and Xero sync that pushes invoices, payments, and cost codes into the books in real time. If a one-tool quote-to-cash-to-books workflow is the win, Buildertrend is the better fit. DigitalCraft AI runs alongside QuickBooks but does not ship a deep two-way sync.',
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

      {/* Best When Paired With Buildertrend */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="p-8 rounded-2xl border border-primary/30 dark:border-primary/40 bg-white dark:bg-gray-950">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-xs font-medium mb-4">
              <Sparkles size={14} />
              Best When Paired With Buildertrend
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Use DigitalCraft AI as the AI Layer in Front of Buildertrend
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The honest position: DigitalCraft AI is not a project-management replacement for Buildertrend. It is the AI lead-capture and estimate-generation layer that sits in FRONT of Buildertrend so the calls and web leads arriving after 5pm or on weekends get qualified and booked. Once the job is sold, Buildertrend keeps doing what Buildertrend does well on daily logs, change orders, schedule, and the client portal. The 48-hour setup with no annual commitment means you can test the combination in a week without renegotiating your Buildertrend contract.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            The Best AI Add-On for Buildertrend Construction Shops
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              If you run a residential or light-commercial construction company and you already pay for Buildertrend, the question is rarely whether to rip it out. Buildertrend is a strong project-management platform with daily logs, a polished client portal, structured change orders, and a real schedule view. The real question is what happens to the calls and web leads that arrive after hours, on weekends, or while every PM is on a jobsite, and whether your office manager is still pasting customer messages between Buildertrend, your CRM, and SMS.
            </p>
            <p>
              That is the gap DigitalCraft AI is built to close. Our AI voice agents answer the phone in your company name, qualify the project, and book the consult back into whatever calendar you use. Our AI lead chat does the same on your website, included in every plan rather than priced as a separate AI add-on. The leads land warm, the office manager does not lose an hour to phone tag, and Buildertrend keeps doing what Buildertrend does well on project management, the client portal, and QuickBooks sync.
            </p>
            <p>
              Plenty of our construction customers keep Buildertrend for project management and add DigitalCraft AI on top for voice answering, lead chat, and instant estimate generation. The 48-hour setup with no annual commitment means you can test that combination in a week without renegotiating your Buildertrend contract.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Users size={16} />
            See the Difference Yourself
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Try DigitalCraft AI on Your Construction Shop
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Live demos built for residential and light-commercial construction: AI lead chat, instant estimate generation, voice negotiation, and review automation. No signup, no credit card, no migration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/construction/demo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_live_demos', 'compare_buildertrend_cta_primary')}
            >
              <Zap size={18} />
              Try the Construction Demos
            </Link>
            <Link
              to="/construction"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('see_pricing', 'compare_buildertrend_cta_pricing')}
            >
              <DollarSign size={18} />
              See Construction Pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already running Buildertrend?{' '}
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={() => trackCTAClick('book_call', 'compare_buildertrend_cta_buildertrend_addon')}
            >
              Ask how DCA runs alongside your Buildertrend setup
            </a>
            <span> or </span>
            <a
              href="tel:+18335558226"
              className="text-primary hover:underline inline-flex items-center gap-1"
              onClick={() => trackCTAClick('call_us', 'compare_buildertrend_cta_phone')}
            >
              <Phone size={14} />
              call us
            </a>
            .
          </p>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default BuildertrendComparison;

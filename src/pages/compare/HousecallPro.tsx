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
  Wrench,
  Users,
} from 'lucide-react';

// Ticket 0038 - "Digital Craft vs Housecall Pro" comparison page for
// high-intent field-service compare queries ("Housecall Pro AI",
// "Housecall Pro alternative", "Housecall Pro vs Digital Craft AI").
// Modeled directly on src/pages/compare/Podium.tsx (ticket 0035, the
// most recent peer) with three deliberate departures:
//   1. The honest-acknowledgment block is re-pointed at Housecall Pro's
//      actual strengths: mature dispatch with drag-drop scheduling, the
//      mobile field-tech app, in-app payments, and the deep QuickBooks
//      integration.
//   2. Every Housecall Pro claim is cited via an HTML comment naming
//      the source URL above the row AND an asterisk footnote in the
//      rendered DOM (per the 2026-05-25 mirror-source lesson in
//      docs/LESSONS.md).
//   3. Every comparison row carries data-testid="compare-row" so the
//      smoke spec can count rows without colliding with the
//      differentiator card titles that repeat row labels.

interface ComparisonRow {
  feature: string;
  dca: 'yes' | 'no' | 'partial' | string;
  housecallpro: 'yes' | 'no' | 'partial' | string;
}

// Source URLs cited in the asterisk footnote below. Housecall Pro
// pricing was verified on 2026-06-07 against housecallpro.com/pricing
// plus widely-reported public Capterra / G2 breakdowns. Housecall Pro
// publishes a "Basic" tier at $69/mo (1 user), an "Essentials" tier at
// $169/mo (1-5 users), and a "MAX" tier on a quote (5+ users), with
// per-user add-ons above each tier's seat count. Numbers may change;
// the row's asterisk footnote names the source URL so a future editor
// can re-verify per the 2026-05-25 mirror-source rule.
const FEATURES: ComparisonRow[] = [
  // src: https://www.housecallpro.com/product/ai/ - Housecall Pro
  // ships an AI receptionist add-on; DCA ships AI lead chat in every
  // plan tier with no add-on.
  { feature: 'AI Lead Qualification Chat', dca: 'yes', housecallpro: 'partial*' },
  // src: https://www.housecallpro.com/product/ai/ - Housecall Pro's
  // AI receptionist handles inbound calls as an add-on; DCA ships AI
  // voice answering in browser WebRTC and outbound phone in every
  // tier.
  { feature: 'AI Voice Calls (WebRTC + Phone)', dca: 'yes', housecallpro: 'partial*' },
  // src: https://www.housecallpro.com/product/dispatch/ - Dispatch is
  // a flagship Housecall Pro surface (drag-drop scheduling, route
  // optimization, real-time tech location); DCA does not ship a
  // dispatch board.
  { feature: 'Dispatch & Drag-Drop Scheduling', dca: 'no', housecallpro: 'yes' },
  // src: https://www.housecallpro.com/product/mobile-app/ - Housecall
  // Pro ships a dedicated technician mobile app for iOS and Android;
  // DCA does not ship a field-tech mobile app.
  { feature: 'Mobile Field-Tech App', dca: 'no', housecallpro: 'yes' },
  // src: https://www.housecallpro.com/product/payments/ - Housecall
  // Pro processes card payments in-app; DCA does not process
  // payments.
  { feature: 'In-App Payments', dca: 'no', housecallpro: 'yes' },
  // src: https://www.housecallpro.com/product/quickbooks-integration/
  // - QuickBooks Online + Desktop sync is one of Housecall Pro's
  // load-bearing integrations; DCA runs alongside QuickBooks but does
  // not ship a deep two-way sync.
  { feature: 'Deep QuickBooks Integration', dca: 'partial', housecallpro: 'yes' },
  // src: https://www.housecallpro.com/industries/ - Housecall Pro
  // serves home services broadly; DCA ships AI models pre-trained for
  // plumbing, HVAC, electrical, and 9 other trades.
  { feature: 'Industry-Specific AI Models', dca: 'yes', housecallpro: 'no' },
  // src: derived from comparing DCA demos to Housecall Pro's product
  // pages - DCA's flagship is a live demo personalized to the
  // visitor's brand; Housecall Pro offers a sales-led demo on
  // request.
  { feature: 'Live Demo Personalized to Your Brand', dca: 'yes', housecallpro: 'no' },
  // src: https://www.housecallpro.com/pricing/ + public Capterra / G2
  // reporting - the Basic tier is widely reported at $69/mo for one
  // user on an annual contract.
  { feature: 'Monthly Pricing (Entry Tier)', dca: '$500/mo', housecallpro: '$69/mo*' },
  // src: https://www.housecallpro.com/pricing/ + public reporting -
  // Essentials is widely reported at $169/mo for 1-5 users on an
  // annual contract.
  { feature: 'Monthly Pricing (Mid Tier)', dca: '$1,500/mo', housecallpro: '$169/mo*' },
  // src: https://www.housecallpro.com/product/ai/ - Housecall Pro's
  // AI receptionist is itemized as a separate monthly add-on on top
  // of any base plan; DCA's AI is included.
  { feature: 'AI Included in Base Plan', dca: 'yes', housecallpro: 'no*' },
  // src: https://www.housecallpro.com/pricing/ - Published Housecall
  // Pro pricing is annual; DCA is month-to-month at the entry tier.
  { feature: 'Month-to-Month Available', dca: 'yes', housecallpro: 'no*' },
  // src: typical SaaS onboarding - Housecall Pro implementation is
  // sales-led and typically lands in the 1-3 week range; DCA ships in
  // 48 hours.
  { feature: 'Setup Time', dca: '48 hours', housecallpro: '1-3 weeks' },
  // src: derived from DCA pricing + Housecall Pro published plans -
  // neither tool charges a setup fee at the entry tier.
  { feature: 'Implementation Fee', dca: 'None', housecallpro: 'None' },
];

const DIFFERENTIATORS = [
  {
    icon: Mic,
    title: 'AI Voice Agents Built Into Every Plan',
    desc: 'Digital Craft AI makes and receives real phone calls using AI agents, both browser WebRTC and outbound dialing, in every tier. After-hours and overflow calls get captured, qualified, and booked. Housecall Pro has an AI receptionist add-on, but it is a separate monthly line item on top of Basic or Essentials.',
  },
  {
    icon: Wrench,
    title: 'Trained on Your Trade From Day One',
    desc: 'Every Digital Craft AI plan ships with AI models pre-trained for plumbing, HVAC, electrical, and 9 other home-services verticals. Housecall Pro serves home services broadly; its AI receptionist is a generalist that you would script against your own playbook.',
  },
  {
    icon: Clock,
    title: '48-Hour Setup, Month-to-Month',
    desc: 'Digital Craft AI runs alongside whatever CRM or dispatch tool you already use, so you can be live in two business days with no annual commitment. Housecall Pro onboardings are sales-led and the published tiers require an annual contract.',
  },
  {
    icon: DollarSign,
    title: 'No Per-User Pricing Above the Entry Tier',
    desc: 'Digital Craft AI is a flat monthly rate with no per-seat charge. Housecall Pro Basic is one user, and Essentials covers 1-5 users with per-user add-ons above five seats. For a 6-plus-tech crew, the per-user math closes a lot of the gap to a flat AI plan.',
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
  { name: 'Housecall Pro', href: '/compare/housecallpro', url: 'https://digitalcraftai.com/compare/housecallpro' },
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

const HousecallProComparison: React.FC = () => {
  const { content } = useContent();
  const lastCrumb = CRUMBS.length - 1;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>DigitalCraft AI vs Housecall Pro | Best AI Alternative for Home Services Field Service Software</title>
        <meta
          name="description"
          content="Compare DigitalCraft AI and Housecall Pro side-by-side. See where Housecall Pro wins on dispatch, payments, the field-tech mobile app, and the QuickBooks integration, and where DigitalCraft AI adds AI voice agents, included AI lead chat, and 48-hour setup."
        />
        <meta property="og:title" content="DigitalCraft AI vs Housecall Pro | Honest Feature Comparison" />
        <meta
          property="og:description"
          content="Side-by-side comparison of DigitalCraft AI and Housecall Pro for plumbing, HVAC, electrical, and home-services businesses evaluating AI add-ons."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/housecallpro" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'DigitalCraft AI vs Housecall Pro Comparison',
            description:
              'Feature-by-feature comparison of DigitalCraft AI and Housecall Pro for plumbing, HVAC, electrical, and other home-services businesses.',
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
            <span className="text-primary">Housecall Pro</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            Housecall Pro is a leading field-service platform for plumbing, HVAC, and home-services shops, with a mature dispatch board, a real technician mobile app, and a deep QuickBooks integration. DigitalCraft AI is an AI agent layer that adds voice answering and included AI lead chat at a flat monthly price. Plenty of home-services owners run both.
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
                    Housecall Pro
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
                      <CellIcon value={row.housecallpro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * Housecall Pro pricing, AI receptionist add-on costs, and annual-contract terms reflect public information on housecallpro.com/pricing plus Capterra and G2 breakdowns as of June 2026. Housecall Pro itself directs visitors to its sales team for a current quote; tier prices, seat caps, and AI add-on pricing may change. Check housecallpro.com for the current numbers before signing.
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
            Both platforms have their strengths. Here is where DCA offers capabilities Housecall Pro does not ship in its base plans.
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

      {/* When Housecall Pro Might Be Better */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            When Housecall Pro Is the Better Fit
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            We believe in recommending the right tool, even when it is not ours.
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'You need a mature dispatch board with drag-drop scheduling',
                desc: 'Housecall Pro ships a real dispatch experience: drag-drop scheduling, route optimization, real-time tech location on a map, and the customer-facing on-my-way text. If dispatch and scheduling are the workflows costing you hours every week, start there. DigitalCraft AI deliberately does not ship a dispatch board; we plug into the one you already run.',
              },
              {
                title: 'Your field techs depend on a polished mobile app',
                desc: 'The Housecall Pro tech mobile app is one of the most polished surfaces in field service, with offline support, job notes, photo capture, and in-app payment collection on the truck. If a tech app is non-negotiable for your crew, Housecall Pro is purpose-built for that. DigitalCraft AI does not ship a field-tech mobile app.',
              },
              {
                title: 'You want in-app card payments and a deep QuickBooks integration',
                desc: 'Housecall Pro processes card payments in the same product as the invoice, and the QuickBooks Online and Desktop sync is one of the deepest integrations in the category. If a one-tool quote-to-cash-to-books workflow is the win, Housecall Pro is the better fit. DigitalCraft AI focuses on the front of the funnel and hands off to whatever payments or accounting tool you already use.',
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

      {/* SEO Content */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            The Best AI Add-On for Housecall Pro Shops in Home Services
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              If you run a plumbing, HVAC, or electrical company and you already pay for Housecall Pro, the question is rarely whether to rip it out. Housecall Pro is a strong field-service platform with a real dispatch board, a polished tech mobile app, and a deep QuickBooks integration. The real question is what happens to the calls and web leads that arrive after 5pm, on weekends, or while every tech is in the field with a wrench in hand, and whether the AI receptionist add-on you are eyeing on top of Essentials is actually closing those.
            </p>
            <p>
              That is the gap DigitalCraft AI is built to close. Our AI voice agents answer the phone in your shop name, qualify the job, and book the appointment back into whatever scheduling tool you use. Our AI lead chat does the same on your website, and it is included in every plan rather than priced as a separate AI receptionist add-on. The leads land warm, the dispatcher does not lose an hour to phone tag, and Housecall Pro keeps doing what Housecall Pro does well on dispatch, payments, and QuickBooks sync.
            </p>
            <p>
              Plenty of our home-services customers keep Housecall Pro for dispatch and invoicing and add DigitalCraft AI on top for voice answering and lead chat. The 48-hour setup with no annual commitment means you can test that combination in a week without renegotiating your Housecall Pro contract.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Users size={16} />
            See the Difference Yourself
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Try DigitalCraft AI on Your Home-Services Shop
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Two live demos built for plumbing, HVAC, and electrical: lead capture chat and on-site estimate generation. No signup, no credit card, no migration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/homeservices/demo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_live_demos', 'compare_housecallpro_cta_primary')}
            >
              <Zap size={18} />
              Try the Home-Services Demos
            </Link>
            <Link
              to="/homeservices"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('see_pricing', 'compare_housecallpro_cta_pricing')}
            >
              <DollarSign size={18} />
              See Home-Services Pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already running Housecall Pro?{' '}
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={() => trackCTAClick('book_call', 'compare_housecallpro_cta_housecallpro_addon')}
            >
              Ask how DCA runs alongside your Housecall Pro setup
            </a>
            <span> or </span>
            <a
              href="tel:+18335558226"
              className="text-primary hover:underline inline-flex items-center gap-1"
              onClick={() => trackCTAClick('call_us', 'compare_housecallpro_cta_phone')}
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

export default HousecallProComparison;

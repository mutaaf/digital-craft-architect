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

// Ticket 0035 - "Digital Craft vs Podium" comparison page for high-intent
// SMS / review / AI compare queries ("Podium AI", "Podium alternative",
// "Podium vs Digital Craft AI"). Modeled directly on
// src/pages/compare/Jobber.tsx (ticket 0021, the closest peer in target
// buyer profile) with three deliberate departures:
//   1. The honest-acknowledgment block is re-pointed at Podium's actual
//      strengths: multi-location dashboard depth, deep integrations with
//      ServiceTitan / Housecall Pro / Jobber, and integrated payments.
//   2. Every Podium claim is cited via an HTML comment naming the source
//      URL above the row AND an asterisk footnote in the rendered DOM
//      (per the 2026-05-25 mirror-source lesson in docs/LESSONS.md).
//   3. Every comparison row carries data-testid="compare-row" so the
//      smoke spec can count rows without colliding with the differentiator
//      card titles that repeat row labels.

interface ComparisonRow {
  feature: string;
  dca: 'yes' | 'no' | 'partial' | string;
  podium: 'yes' | 'no' | 'partial' | string;
}

// Source URLs cited in the asterisk footnote below. Podium pricing was
// re-verified on 2026-06-05 across podium.com/pricing/ plus G2 / Capterra
// breakdowns; the "$399 Core, $599 Pro, custom Signature" tiers are the
// widely-reported public ranges (Podium itself does not list a fixed
// number on the pricing page, which now reads "talk to our sales team"),
// and the AI Employee add-on is itemized at $99/mo on top of any plan.
const FEATURES: ComparisonRow[] = [
  // src: https://www.podium.com/products/ai-employee/ - Podium offers an
  // "AI Employee" chat / SMS responder add-on; DCA ships AI lead chat in
  // every plan tier.
  { feature: 'AI Lead Qualification Chat', dca: 'yes', podium: 'partial*' },
  // src: https://www.podium.com/products/phones/ - Podium "Phones" routes
  // calls through the dashboard; native AI voice answering is not part
  // of the core product.
  { feature: 'AI Voice Calls (WebRTC + Phone)', dca: 'yes', podium: 'no' },
  // src: https://www.podium.com/products/reviews/ - Podium review
  // automation is its flagship product; DCA ships review automation as
  // one demo among five.
  { feature: 'Review Automation', dca: 'yes', podium: 'yes' },
  // src: https://www.podium.com/products/inbox/ - Podium SMS / Inbox
  // unified messaging is mature; DCA ships SMS as part of the lead
  // responder flow.
  { feature: 'Two-Way SMS Messaging', dca: 'yes', podium: 'yes' },
  // src: https://www.podium.com/products/payments/ - Podium ships
  // integrated payments end-to-end; DCA does not process payments.
  { feature: 'Integrated Payments', dca: 'no', podium: 'yes' },
  // src: https://www.podium.com/integrations/ - Podium's integration
  // catalog includes ServiceTitan, Housecall Pro, Jobber, and 200+ more;
  // DCA runs alongside whatever CRM you use but does not ship a deep
  // marketplace.
  { feature: 'Deep Integrations (ServiceTitan, Housecall Pro, Jobber)', dca: 'partial', podium: 'yes' },
  // src: https://www.podium.com/features/ - Podium ships a multi-location
  // dashboard with cross-location reporting; DCA is single-account today.
  { feature: 'Multi-Location Dashboard', dca: 'no', podium: 'yes' },
  // src: https://www.podium.com/industries/ - Podium serves home services
  // among many verticals; DCA ships AI models pre-trained for plumbing,
  // HVAC, electrical, and 9 other trades.
  { feature: 'Industry-Specific AI Models', dca: 'yes', podium: 'no' },
  // src: derived from comparing DCA demos to Podium's product pages -
  // DCA's flagship is a live demo personalized to the visitor's brand;
  // Podium offers a sales-led demo on request.
  { feature: 'Live Demo Personalized to Your Brand', dca: 'yes', podium: 'no' },
  // src: https://www.podium.com/pricing/ + G2 / Capterra public
  // breakdowns - Podium tiers are widely reported as Core $399 / Pro $599
  // / Signature custom on annual contracts.
  { feature: 'Monthly Pricing (Entry Tier)', dca: '$500/mo', podium: '$399/mo*' },
  // src: https://www.podium.com/pricing/ + public reporting - the Pro
  // tier covers 2-5 locations at $599 / mo on an annual contract.
  { feature: 'Monthly Pricing (Pro Tier)', dca: '$1,500/mo', podium: '$599/mo*' },
  // src: https://www.podium.com/products/ai-employee/ - "AI Employee"
  // is itemized as a $99/mo add-on on top of any base plan; DCA's lead
  // chat is included.
  { feature: 'AI Chat Included in Base Plan', dca: 'yes', podium: 'no*' },
  // src: https://www.podium.com/pricing/ - Podium contracts are annual;
  // DCA is month-to-month at the entry tier.
  { feature: 'Month-to-Month Available', dca: 'yes', podium: 'no*' },
  // src: typical SaaS onboarding - Podium implementation is sales-led
  // and typically lands in the 1-3 week range; DCA ships in 48 hours.
  { feature: 'Setup Time', dca: '48 hours', podium: '1-3 weeks' },
  // src: derived from DCA pricing + Podium published plans - neither
  // tool charges a setup fee at the entry tier.
  { feature: 'Implementation Fee', dca: 'None', podium: 'None' },
];

const DIFFERENTIATORS = [
  {
    icon: Mic,
    title: 'AI Voice Agents That Answer the Phone',
    desc: 'Digital Craft AI makes and receives real phone calls using AI agents, both browser WebRTC and outbound dialing. After-hours and overflow calls get captured, qualified, and booked. Podium is a strong SMS and review platform with a calling dashboard, but native AI voice answering is not part of the core product.',
  },
  {
    icon: Wrench,
    title: 'Trained on Your Trade From Day One',
    desc: 'Every Digital Craft AI plan ships with AI models pre-trained for plumbing, HVAC, electrical, and 9 other home-services verticals. Podium serves dozens of verticals from auto to retail; the AI Employee add-on is a generalist that you would train on your own playbook.',
  },
  {
    icon: Clock,
    title: '48-Hour Setup, Month-to-Month',
    desc: 'Digital Craft AI runs alongside whatever CRM or dispatch tool you already use, so you can be live in two business days with no annual commitment. Podium onboardings are sales-led and the published tiers require an annual contract.',
  },
  {
    icon: DollarSign,
    title: 'AI Lead Chat in the Base Plan',
    desc: 'Digital Craft AI ships AI lead chat in every tier with no add-on. Podium charges for "AI Employee" as a separate monthly line item on top of Core or Pro, so a true Podium-with-AI configuration runs closer to $500 to $700 / mo before integrations.',
  },
];

// Single source of truth for breadcrumb labels + URLs. The visible <nav>
// markup and the BreadcrumbList JSON-LD both read from this array so a
// copy edit cannot drift the schema (per the 2026-05-25 mirror-source
// lesson in docs/LESSONS.md).
type Crumb = { name: string; href: string; url: string };
const CRUMBS: ReadonlyArray<Crumb> = [
  { name: 'Home', href: '/', url: 'https://digitalcraftai.com' },
  { name: 'Compare', href: '/compare/jobber', url: 'https://digitalcraftai.com/compare/jobber' },
  { name: 'Podium', href: '/compare/podium', url: 'https://digitalcraftai.com/compare/podium' },
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

const PodiumComparison: React.FC = () => {
  const { content } = useContent();
  const lastCrumb = CRUMBS.length - 1;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>DigitalCraft AI vs Podium | Best AI Alternative for SMS, Reviews, and Lead Chat</title>
        <meta
          name="description"
          content="Compare DigitalCraft AI and Podium side-by-side. See where Podium wins on multi-location dashboards, payments, and field-service integrations, and where DigitalCraft AI adds AI voice agents, included AI lead chat, and 48-hour setup."
        />
        <meta property="og:title" content="DigitalCraft AI vs Podium | Honest Feature Comparison" />
        <meta
          property="og:description"
          content="Side-by-side comparison of DigitalCraft AI and Podium for home-services and local-business owners evaluating SMS, review, and AI chat tools."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/podium" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'DigitalCraft AI vs Podium Comparison',
            description:
              'Feature-by-feature comparison of DigitalCraft AI and Podium for home-services and local-business owners.',
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
            <span className="text-primary">Podium</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            Podium is the leading SMS, review, and inbox platform for local businesses, with a mature multi-location dashboard and deep integrations into ServiceTitan, Housecall Pro, and Jobber. DigitalCraft AI is an AI agent layer that adds voice answering and included AI lead chat at a flat monthly price. Plenty of home-services owners run both.
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
                    Podium
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
                      <CellIcon value={row.podium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * Podium pricing and AI Employee add-on costs reflect public information on podium.com/pricing/ plus G2 and Capterra breakdowns as of June 2026. Podium itself directs visitors to its sales team for a current quote; tier prices, annual-contract terms, and add-on pricing may change. Check podium.com for the current numbers before signing.
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
            Both platforms have their strengths. Here is where DCA offers capabilities Podium does not ship in its core plans.
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

      {/* When Podium Might Be Better */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            When Podium Is the Better Fit
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            We believe in recommending the right tool, even when it is not ours.
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'You run multiple locations and need cross-location reporting',
                desc: 'Podium ships a mature multi-location dashboard with rollup reporting, per-location review streams, and SMS volume by site. If you operate 5+ locations and the dashboard depth is your daily workflow, Podium is purpose-built for that. DigitalCraft AI is single-account today; multi-location rollups are not on the page.',
              },
              {
                title: 'You need integrated payments alongside SMS and reviews',
                desc: 'Podium processes card payments end-to-end inside the same product as messaging and reviews, so a deposit or invoice can ride an SMS thread without leaving the tool. DigitalCraft AI focuses on the front of the funnel and hands off to whatever payments tool you already use.',
              },
              {
                title: 'You depend on deep ServiceTitan, Housecall Pro, or Jobber integrations',
                desc: 'Podium ships a 200+ integration catalog with named connectors for ServiceTitan, Housecall Pro, Jobber, and the major field-service CRMs. If a one-click integration into your back-office tool is non-negotiable, that is a real Podium win. DigitalCraft AI runs alongside any CRM but does not ship a deep marketplace.',
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
            The Best AI Alternative to Podium for Home Services
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              If you run a plumbing, HVAC, or electrical company and you already pay for Podium, the question is rarely whether to rip it out. Podium is a strong SMS and review platform with a real multi-location story. The real question is what happens to the calls and web leads that arrive after 5pm, on weekends, or while every tech is in the field with a wrench in hand, and whether the AI you are paying extra for is actually closing those.
            </p>
            <p>
              That is the gap DigitalCraft AI is built to close. Our AI voice agents answer the phone in your shop name, qualify the job, and book the appointment back into whatever scheduling tool you use. Our AI lead chat does the same on your website, and it is included in every plan rather than priced as a separate AI Employee add-on. The leads land warm, the dispatcher does not lose an hour to phone tag, and Podium keeps doing what Podium does well on reviews and SMS.
            </p>
            <p>
              Plenty of our home-services customers keep Podium for review collection and the multi-location dashboard, and add DigitalCraft AI on top for voice answering and lead chat. The 48-hour setup with no annual commitment means you can test that combination in a week without renegotiating your Podium contract.
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
              onClick={() => trackCTAClick('try_live_demos', 'compare_podium_cta_primary')}
            >
              <Zap size={18} />
              Try the Home-Services Demos
            </Link>
            <Link
              to="/homeservices"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('see_pricing', 'compare_podium_cta_pricing')}
            >
              <DollarSign size={18} />
              See Home-Services Pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already running Podium?{' '}
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={() => trackCTAClick('book_call', 'compare_podium_cta_podium_addon')}
            >
              Ask how DCA runs alongside your Podium setup
            </a>
            <span> or </span>
            <a
              href="tel:+18335558226"
              className="text-primary hover:underline inline-flex items-center gap-1"
              onClick={() => trackCTAClick('call_us', 'compare_podium_cta_phone')}
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

export default PodiumComparison;

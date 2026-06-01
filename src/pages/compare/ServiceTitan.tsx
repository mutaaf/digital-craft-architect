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

// Ticket 0028 - "Digital Craft vs ServiceTitan" comparison page for
// high-intent home-services compare queries (e.g. "ServiceTitan AI",
// "ServiceTitan alternative", "ServiceTitan vs Digital Craft AI").
// Modeled directly on src/pages/compare/Jobber.tsx (ticket 0021), the
// cleanest and most recent single-file compare page in the repo, with
// three deliberate departures:
//   1. No em-dash characters anywhere (per the 2026-05-07 Hard NO). The
//      Jobber page was already clean; ServiceTitan keeps the same bar.
//   2. A single typed `CRUMBS` array drives both the visible breadcrumb
//      and the BreadcrumbList JSON-LD block (per the 2026-05-25
//      mirror-source lesson). Visible label and schema cannot drift.
//   3. The pricing row does NOT fabricate a per-seat number for
//      ServiceTitan (per the ticket Out-of-Scope rule). It cites a
//      defensible "high 3-figure / mo, custom-quoted*" range with an
//      asterisked source note pointing to servicetitan.com.

interface ComparisonRow {
  feature: string;
  dca: 'yes' | 'no' | 'partial' | string;
  servicetitan: 'yes' | 'no' | 'partial' | string;
}

const FEATURES: ComparisonRow[] = [
  { feature: 'AI Voice Calls (WebRTC + Phone)', dca: 'yes', servicetitan: 'no' },
  { feature: 'Industry-Specific AI Models', dca: 'yes', servicetitan: 'no' },
  { feature: 'AI Lead Qualification Chat', dca: 'yes', servicetitan: 'no' },
  { feature: 'AI Estimate Generation', dca: 'yes', servicetitan: 'partial' },
  { feature: 'AI Review Management', dca: 'yes', servicetitan: 'partial' },
  { feature: 'Live Demo Personalized to Your Brand', dca: 'yes', servicetitan: 'no' },
  { feature: 'Built-in Field-Service CRM', dca: 'no', servicetitan: 'yes' },
  { feature: 'Dispatching & Drag-and-Drop Scheduling', dca: 'no', servicetitan: 'yes' },
  { feature: 'Integrated Payments & Card Processing', dca: 'no', servicetitan: 'yes' },
  { feature: 'Deep QuickBooks / Accounting Integrations', dca: 'no', servicetitan: 'yes' },
  { feature: 'Mobile App for Field Technicians', dca: 'no', servicetitan: 'yes' },
  { feature: 'Inventory & Pricebook Management', dca: 'no', servicetitan: 'yes' },
  { feature: 'Setup Time', dca: '48 hours', servicetitan: '6-12 weeks*' },
  { feature: 'Monthly Pricing (Entry Tier)', dca: '$500/mo', servicetitan: 'high 3-figure / mo, custom-quoted*' },
  { feature: 'Onboarding / Implementation Fee', dca: 'None', servicetitan: 'Implementation fee, custom-quoted*' },
];

const DIFFERENTIATORS = [
  {
    icon: Mic,
    title: 'AI Voice Agents That Answer the Phone',
    desc: 'Digital Craft AI makes and receives real phone calls using AI agents, both browser WebRTC and outbound dialing. After-hours and overflow calls get captured, qualified, and booked. ServiceTitan is a mature field-service CRM with a strong dispatch board, but native AI voice answering is not part of the core product.',
  },
  {
    icon: Wrench,
    title: 'Trained on Your Trade From Day One',
    desc: 'Every Digital Craft AI plan ships with AI models pre-trained for plumbing, HVAC, electrical, and 9 other home-services verticals. ServiceTitan offers vertical-specific CRM tooling but the AI layer is something you would source separately and configure to match your trade.',
  },
  {
    icon: Clock,
    title: '48-Hour Setup, No Implementation Fee',
    desc: 'Digital Craft AI runs alongside whatever CRM, dispatch, or scheduling tool you already use, so you can be live in two business days. ServiceTitan onboardings typically run 6 to 12 weeks and carry an implementation fee, because you are migrating the full back office.',
  },
  {
    icon: DollarSign,
    title: 'Flat Pricing, Not Per-Tech Custom Quote',
    desc: 'Digital Craft AI is a flat monthly rate with no per-seat charge and pricing published on our site. ServiceTitan pricing starts in the high 3-figure monthly range and is custom-quoted per shop based on tech count and modules. For a 12-truck operation, the per-tech math closes a meaningful gap to a flat AI plan.',
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
  { name: 'ServiceTitan', href: '/compare/servicetitan', url: 'https://digitalcraftai.com/compare/servicetitan' },
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

const ServiceTitanComparison: React.FC = () => {
  const { content } = useContent();
  const lastCrumb = CRUMBS.length - 1;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>DigitalCraft AI vs ServiceTitan | Best AI Alternative for Home Services Field Service Software</title>
        <meta
          name="description"
          content="Compare DigitalCraft AI and ServiceTitan side-by-side. See where ServiceTitan wins on field-service CRM, dispatching, and payments, and where DigitalCraft AI adds AI voice agents, lead chat, and 48-hour setup at a flat monthly price."
        />
        <meta property="og:title" content="DigitalCraft AI vs ServiceTitan | Honest Feature Comparison" />
        <meta
          property="og:description"
          content="Side-by-side comparison of DigitalCraft AI and ServiceTitan for plumbing, HVAC, electrical, and home-services businesses."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/servicetitan" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'DigitalCraft AI vs ServiceTitan Comparison',
            description:
              'Feature-by-feature comparison of DigitalCraft AI and ServiceTitan for plumbing, HVAC, electrical, and other home-services businesses.',
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
            <span className="text-primary">ServiceTitan</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            ServiceTitan is the highest-end field-service CRM for plumbing, HVAC, and home-services shops, with dispatching, integrated payments, and deep accounting integrations. DigitalCraft AI is an AI agent layer that captures and qualifies the leads ServiceTitan was never built to answer. Most of our home-services customers run both.
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
                    ServiceTitan
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr
                    key={row.feature}
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
                      <CellIcon value={row.servicetitan} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * ServiceTitan pricing and onboarding timelines are not publicly listed at a fixed number; ranges above reflect public information on servicetitan.com plus trade-forum reports as of June 2026. Numbers may change; contact ServiceTitan for a current custom quote.
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
            Both platforms have their strengths. Here is where DCA offers capabilities ServiceTitan does not ship natively at the same price point.
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

      {/* When ServiceTitan Might Be Better */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            When ServiceTitan Is the Better Fit
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            We believe in recommending the right tool, even when it is not ours.
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'You need a mature field-service CRM with dispatching',
                desc: 'If your priority is one tool that owns client records, work orders, the dispatch board, and the call-center workflow, ServiceTitan is purpose-built for that. DigitalCraft AI deliberately does not replace your field-service CRM; we plug into the one you already run.',
              },
              {
                title: 'You want integrated payments and card processing in one tool',
                desc: 'ServiceTitan handles invoicing, card payments, and financing inside the same product as dispatch and work orders. DigitalCraft AI focuses on the front of the funnel (lead capture, qualification, voice calls) and hands off to whatever payments and invoicing tool you already use.',
              },
              {
                title: 'You need deep accounting and inventory integrations',
                desc: 'ServiceTitan ships native QuickBooks and Intacct integrations, plus inventory and pricebook management for shops that run a serious warehouse. Those are real wins if your back office lives in accounting software. DigitalCraft AI does not try to be your accounting system.',
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
            The Best AI Add-On for ServiceTitan Shops in Home Services
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              If you run a plumbing, HVAC, or electrical company and you already pay for ServiceTitan, the question is rarely whether to replace it. ServiceTitan is a strong field-service CRM for shops large enough to justify the implementation cost. The real question is what happens to the calls and web leads that arrive after 5pm, on weekends, or while every tech is in the field with a wrench in hand.
            </p>
            <p>
              That is the gap DigitalCraft AI is built to close. Our AI voice agents answer the phone in your shop name, qualify the job, and book the appointment back into whatever scheduling tool you use (ServiceTitan included). Our AI chat does the same on your website. The leads land warm, the dispatcher does not lose an hour to phone tag, and ServiceTitan keeps doing what ServiceTitan does well.
            </p>
            <p>
              Plenty of our home-services customers run ServiceTitan for dispatch, invoicing, and payments, and add DigitalCraft AI on top for lead capture and overflow calls. The 48-hour setup with no implementation fee means you can test that combination in a week without touching the back-office workflow your team already trusts.
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
              onClick={() => trackCTAClick('try_live_demos', 'compare_servicetitan_cta_primary')}
            >
              <Zap size={18} />
              Try the Home-Services Demos
            </Link>
            <Link
              to="/homeservices"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('see_pricing', 'compare_servicetitan_cta_pricing')}
            >
              <DollarSign size={18} />
              See Home-Services Pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already running ServiceTitan?{' '}
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={() => trackCTAClick('book_call', 'compare_servicetitan_cta_servicetitan_addon')}
            >
              Ask how DCA runs alongside your ServiceTitan setup
            </a>
            <span> or </span>
            <a
              href="tel:+18335558226"
              className="text-primary hover:underline inline-flex items-center gap-1"
              onClick={() => trackCTAClick('call_us', 'compare_servicetitan_cta_phone')}
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

export default ServiceTitanComparison;

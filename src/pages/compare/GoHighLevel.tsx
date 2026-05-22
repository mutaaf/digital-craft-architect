/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// TODO(eng): typecheck baseline, see docs/backlog/0005
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
  Sparkles,
  Mic,
  Zap,
  Clock,
  DollarSign,
  Building2,
  Users,
  Bot,
} from 'lucide-react';

interface ComparisonRow {
  feature: string;
  dca: 'yes' | 'no' | 'partial' | string;
  ghl: 'yes' | 'no' | 'partial' | string;
}

const FEATURES: ComparisonRow[] = [
  { feature: 'AI Voice Calls (WebRTC + Phone)', dca: 'yes', ghl: 'partial' },
  { feature: 'Industry-Specific AI Models', dca: 'yes', ghl: 'no' },
  { feature: 'AI Lead Qualification Chat', dca: 'yes', ghl: 'partial' },
  { feature: 'AI Deal & Property Analysis', dca: 'yes', ghl: 'no' },
  { feature: 'Smart Estimate Generation', dca: 'yes', ghl: 'no' },
  { feature: 'AI Review Management', dca: 'yes', ghl: 'yes' },
  { feature: 'Live Demo Personalized to Your Brand', dca: 'yes', ghl: 'no' },
  { feature: 'Setup Time', dca: '48 hours', ghl: '1–4 weeks' },
  { feature: 'SMS & Email Sequences', dca: 'no', ghl: 'yes' },
  { feature: 'Built-in CRM & Pipeline', dca: 'no', ghl: 'yes' },
  { feature: 'Funnel & Website Builder', dca: 'no', ghl: 'yes' },
  { feature: 'White-Label / Agency Mode', dca: 'no', ghl: 'yes' },
  { feature: 'Dedicated Onboarding Specialist', dca: 'yes', ghl: 'no' },
  { feature: 'Monthly Pricing (Entry Tier)', dca: '$500/mo', ghl: '$97/mo' },
  { feature: 'Monthly Pricing (Professional)', dca: '$1,500/mo', ghl: '$297/mo' },
  { feature: 'Onboarding Fee', dca: 'None', ghl: 'None' },
];

const DIFFERENTIATORS = [
  {
    icon: Mic,
    title: 'Real AI Voice Conversations',
    desc: 'DCA\'s voice AI makes and receives real phone calls — negotiating deals, qualifying leads, and booking appointments. GHL offers basic voice drops and ringless voicemail, but no live AI phone conversations.',
  },
  {
    icon: Building2,
    title: 'Pre-Trained for Your Industry',
    desc: 'DCA comes pre-configured for construction, real estate, healthcare, and 9 other verticals. GHL gives you a blank canvas — powerful but requires hours of manual workflow setup for each use case.',
  },
  {
    icon: Bot,
    title: 'AI-First, Not Bolted On',
    desc: 'DCA is built around GPT-4o from the ground up — AI powers the lead response, estimate generation, deal analysis, and voice calls. GHL\'s AI features are add-ons layered on top of a workflow platform.',
  },
  {
    icon: Clock,
    title: 'Live in 48 Hours',
    desc: 'DCA is production-ready within two business days with your branding baked in. GHL\'s flexibility means most agencies spend 1–4 weeks building and testing automation workflows before launch.',
  },
];

function CellIcon({ value }: { value: string }) {
  if (value === 'yes') return <Check className="text-green-600 dark:text-green-400 mx-auto" size={20} />;
  if (value === 'no') return <X className="text-gray-400 dark:text-gray-600 mx-auto" size={20} />;
  if (value === 'partial') return <Minus className="text-yellow-500 dark:text-yellow-400 mx-auto" size={20} />;
  return <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>;
}

const GoHighLevelComparison: React.FC = () => {
  const { data } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>DigitalCraft AI vs GoHighLevel | Best GHL Alternative for Service Businesses</title>
        <meta
          name="description"
          content="Compare DigitalCraft AI and GoHighLevel side-by-side. See why construction, real estate, and service businesses choose DCA for AI voice calls, industry models, and faster setup."
        />
        <meta property="og:title" content="DigitalCraft AI vs GoHighLevel | Feature Comparison" />
        <meta
          property="og:description"
          content="Side-by-side comparison of DigitalCraft AI and GoHighLevel for service industry businesses."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/gohighlevel" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'DigitalCraft AI vs GoHighLevel Comparison',
            description:
              'Feature-by-feature comparison of DigitalCraft AI and GoHighLevel for construction, real estate, and service industry businesses.',
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

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Honest Comparison
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            DigitalCraft AI vs{' '}
            <span className="text-primary">GoHighLevel</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            GoHighLevel is a popular all-in-one CRM and marketing platform built for agencies.
            DigitalCraft AI is a specialized AI automation system built for service-industry
            businesses. Here's how they compare.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated April 2026 · We strive to keep this comparison accurate and fair.
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
                    GoHighLevel
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
                      <CellIcon value={row.ghl} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            GoHighLevel pricing shown is list price as of April 2026.
            AI features (Conversation AI, Content AI) require an additional per-use fee on top of base plans.
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
            Both platforms serve small businesses. Here's where DCA offers capabilities GHL doesn't.
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

      {/* When GHL Might Be Better */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            When GoHighLevel Might Be the Better Fit
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            We believe in recommending the right tool, even when it's not ours.
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'You\'re a marketing agency',
                desc: 'GHL was built for agencies that manage multiple clients. Its white-label mode, SaaS reselling, and snapshot templates let you productize your services at scale.',
              },
              {
                title: 'You need an all-in-one platform',
                desc: 'If you want CRM, email sequences, SMS campaigns, funnel builders, calendar booking, reputation management, and invoicing in a single login, GHL covers all of those.',
              },
              {
                title: 'You want to build custom workflows',
                desc: 'GHL\'s visual workflow builder is excellent for DIY automation. If you enjoy configuring trigger-action sequences and want full control over every step, GHL gives you that flexibility.',
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
            The Best GoHighLevel Alternative for Service Businesses
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              If you're a construction company, real estate investor, dental practice, or any
              service business evaluating GoHighLevel alternatives, DigitalCraft AI offers a
              different philosophy: instead of building automation from scratch, you get AI systems
              that already know your industry.
            </p>
            <p>
              GoHighLevel's strength is breadth — it replaces 10+ tools with one platform. DCA's
              strength is depth — our AI voice agent doesn't just send voicemails, it has real phone
              conversations. Our lead qualifier doesn't follow a decision tree, it uses GPT-4o to
              respond naturally and capture the information that matters. Our estimate generator
              doesn't send a template, it builds custom proposals using your pricing data.
            </p>
            <p>
              Many businesses use both: GoHighLevel for their CRM, email, and SMS workflows, and
              DigitalCraft AI for the intelligent automation layer — the AI voice calls, instant
              lead response, and deal analysis that a workflow builder can't replicate. The two
              platforms complement each other well.
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
            Try DigitalCraft AI — No Credit Card Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Enter your website URL and experience AI demos personalized to your business. Then decide
            which platform is right for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/construction/demo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_live_demos', 'ghl_comparison_cta')}
            >
              <Zap size={18} />
              Try Live AI Demos
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_a_call', 'ghl_comparison_cta')}
            >
              <Phone size={18} />
              Book a Free Discovery Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already using GoHighLevel?{' '}
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={() => trackCTAClick('ghl_migration', 'ghl_comparison_cta')}
            >
              Ask about running DCA alongside your GHL setup
            </a>
            .
          </p>
        </div>
      </section>

      {data?.footer && <Footer data={data.footer} />}
      <StickyCTA />
    </div>
  );
};

export default GoHighLevelComparison;

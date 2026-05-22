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
  ArrowRight,
  Sparkles,
  Mic,
  Zap,
  Clock,
  DollarSign,
  Building2,
  Users,
} from 'lucide-react';

interface ComparisonRow {
  feature: string;
  dca: 'yes' | 'no' | 'partial' | string;
  hubspot: 'yes' | 'no' | 'partial' | string;
}

const FEATURES: ComparisonRow[] = [
  { feature: 'AI Voice Calls (WebRTC + Phone)', dca: 'yes', hubspot: 'no' },
  { feature: 'Industry-Specific AI Models', dca: 'yes', hubspot: 'no' },
  { feature: 'AI Lead Qualification Chat', dca: 'yes', hubspot: 'partial' },
  { feature: 'AI Deal & Property Analysis', dca: 'yes', hubspot: 'no' },
  { feature: 'Smart Estimate Generation', dca: 'yes', hubspot: 'no' },
  { feature: 'AI Review Management', dca: 'yes', hubspot: 'no' },
  { feature: 'Live Demo Personalized to Your Brand', dca: 'yes', hubspot: 'no' },
  { feature: 'Setup Time', dca: '48 hours', hubspot: '2–6 weeks' },
  { feature: 'Email Marketing & Sequences', dca: 'no', hubspot: 'yes' },
  { feature: 'Built-in CRM Database', dca: 'no', hubspot: 'yes' },
  { feature: 'Landing Page Builder', dca: 'no', hubspot: 'yes' },
  { feature: 'Dedicated Onboarding Specialist', dca: 'yes', hubspot: 'partial' },
  { feature: 'Monthly Pricing (Entry Tier)', dca: '$500/mo', hubspot: '$20/mo*' },
  { feature: 'Monthly Pricing (Professional)', dca: '$1,500/mo', hubspot: '$890/mo*' },
  { feature: 'Onboarding Fee', dca: 'None', hubspot: '$1,500–$3,000' },
];

const DIFFERENTIATORS = [
  {
    icon: Mic,
    title: 'AI Voice Negotiation',
    desc: 'DCA makes and receives real phone calls using AI — browser WebRTC and outbound dialing. HubSpot has no native voice AI; calls require a third-party integration like Aircall or RingCentral.',
  },
  {
    icon: Building2,
    title: 'Built for Your Industry',
    desc: 'Every DCA plan comes with AI models trained on construction, real estate, healthcare, and 9 other verticals. HubSpot is industry-agnostic — you configure everything from scratch.',
  },
  {
    icon: Clock,
    title: '48-Hour Setup',
    desc: 'DCA is live within two business days, including AI customization for your company. HubSpot Professional onboarding typically takes 2–6 weeks and carries a mandatory setup fee.',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    desc: 'Flat monthly rate with no per-seat charges and no onboarding fee. HubSpot pricing scales with contacts and users — the sticker price is just the starting point.',
  },
];

function CellIcon({ value }: { value: string }) {
  if (value === 'yes') return <Check className="text-green-600 dark:text-green-400 mx-auto" size={20} />;
  if (value === 'no') return <X className="text-gray-400 dark:text-gray-600 mx-auto" size={20} />;
  if (value === 'partial') return <Minus className="text-yellow-500 dark:text-yellow-400 mx-auto" size={20} />;
  return <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>;
}

const HubSpotComparison: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>DigitalCraft AI vs HubSpot | Best HubSpot Alternative for Construction & Real Estate</title>
        <meta
          name="description"
          content="Compare DigitalCraft AI and HubSpot side-by-side. See why construction and real estate businesses choose DCA for AI voice calls, industry-specific models, and faster setup."
        />
        <meta property="og:title" content="DigitalCraft AI vs HubSpot | Feature Comparison" />
        <meta
          property="og:description"
          content="Side-by-side comparison of DigitalCraft AI and HubSpot for construction, real estate, and service businesses."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/hubspot" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'DigitalCraft AI vs HubSpot Comparison',
            description:
              'Feature-by-feature comparison of DigitalCraft AI and HubSpot for construction, real estate, and service industry businesses.',
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
            <span className="text-primary">HubSpot</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            HubSpot is a powerful all-in-one marketing platform. DigitalCraft AI is a specialized AI
            automation system built for service-industry businesses. The right choice depends on what
            your business needs most.
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
                    HubSpot
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
                      <CellIcon value={row.hubspot} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * HubSpot pricing shown is list price as of April 2026.
            Starter tier is per seat; Professional requires annual commitment.
            Onboarding fees are mandatory for Professional and Enterprise tiers.
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
            Both platforms have their strengths. Here's where DCA offers capabilities that HubSpot doesn't.
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

      {/* When HubSpot Might Be Better */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            When HubSpot Might Be the Better Fit
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            We believe in recommending the right tool, even when it's not ours.
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'You need a full marketing suite',
                desc: "If your priority is email marketing, blog hosting, landing page builders, and social media scheduling in one platform, HubSpot's Marketing Hub is purpose-built for that.",
              },
              {
                title: 'You want a built-in CRM database',
                desc: "HubSpot's free CRM is excellent for contact management, pipeline tracking, and deal stages. DCA focuses on AI automation and integrates with your existing CRM.",
              },
              {
                title: 'Your team is 50+ people',
                desc: "HubSpot's enterprise features — advanced permissions, partitioning, custom objects — are designed for larger organizations with complex team structures.",
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
            The Best HubSpot Alternative for Construction and Real Estate
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              If you're a construction company, real estate agency, or service business searching for
              a HubSpot alternative, DigitalCraft AI offers a fundamentally different approach.
              Instead of giving you a toolkit to build your own automation, DCA provides pre-built AI
              systems tailored to your industry from day one.
            </p>
            <p>
              Our AI voice negotiation feature — where a trained AI agent makes and receives real
              phone calls on your behalf — has no equivalent in HubSpot. For construction firms that
              rely on phone outreach for estimates and follow-ups, or real estate investors who need
              to make dozens of seller calls per week, this is a game-changer that no general CRM
              can replicate.
            </p>
            <p>
              HubSpot excels as a marketing and CRM platform for teams that want granular control
              over email sequences, content management, and pipeline analytics. DigitalCraft AI
              excels at the operational automation that service businesses need — responding to leads
              in seconds, generating estimates instantly, and handling phone conversations
              autonomously. Many of our clients use both: HubSpot for their marketing funnel and DCA
              for their AI-powered operations.
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
              onClick={() => trackCTAClick('try_live_demos', 'hubspot_comparison_cta')}
            >
              <Zap size={18} />
              Try Live AI Demos
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_a_call', 'hubspot_comparison_cta')}
            >
              <Phone size={18} />
              Book a Free Discovery Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already using HubSpot?{' '}
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={() => trackCTAClick('hubspot_migration', 'hubspot_comparison_cta')}
            >
              Ask about running DCA alongside your existing setup
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

export default HubSpotComparison;

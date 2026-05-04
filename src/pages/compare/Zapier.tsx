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
  Users,
  Cog,
  Brain,
} from 'lucide-react';

interface Row {
  feature: string;
  dca: string;
  zapier: string;
}

const FEATURES: Row[] = [
  { feature: 'Pre-built AI agents (no setup)', dca: 'yes', zapier: 'no' },
  { feature: 'AI Voice calls (inbound + outbound)', dca: 'yes', zapier: 'no' },
  { feature: 'Industry-specific AI personas', dca: 'yes', zapier: 'no' },
  { feature: 'Lead qualification chatbot', dca: 'yes', zapier: 'partial' },
  { feature: 'Smart estimate / quote generation', dca: 'yes', zapier: 'no' },
  { feature: '7,000+ app integrations', dca: 'partial', zapier: 'yes' },
  { feature: 'Visual workflow builder', dca: 'no', zapier: 'yes' },
  { feature: 'You design and maintain workflows', dca: 'no', zapier: 'yes' },
  { feature: 'Setup time', dca: '48 hours', zapier: 'You build it' },
  { feature: 'Live demos personalized to your brand', dca: 'yes', zapier: 'no' },
  { feature: 'Dedicated onboarding', dca: 'yes', zapier: 'no' },
  { feature: 'Entry pricing', dca: '$500/mo', zapier: '$30/mo*' },
  { feature: 'Per-task / per-zap charges', dca: 'No', zapier: 'Yes' },
];

const DIFFERENTIATORS = [
  {
    icon: Brain,
    title: 'AI agents, not workflows',
    desc: 'DCA ships ready-made AI agents with personality, memory, and industry knowledge. Zapier ships connectors — you provide the brain by designing the logic for every step.',
  },
  {
    icon: Mic,
    title: 'Real voice conversations',
    desc: 'DCA handles full phone calls — inbound and outbound — with neural TTS and conversational LLMs. Zapier can trigger calls via Twilio integrations, but it does not have a native AI voice agent that talks to humans.',
  },
  {
    icon: Clock,
    title: 'Live in 48 hours, not 48 days',
    desc: 'DCA is configured for your industry on day one. With Zapier, the timeline depends entirely on how long you (or a consultant) take to design every workflow, test edge cases, and maintain them as your apps update.',
  },
  {
    icon: Cog,
    title: 'You don\'t maintain anything',
    desc: 'Every Zap you build is a workflow you own forever — when an API changes, when your business changes, when an edge case breaks. DCA agents are managed by us; you focus on your business.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is DigitalCraft AI a Zapier alternative?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DigitalCraft AI is not a direct Zapier alternative — Zapier is a workflow connector, DCA is a set of pre-built AI agents. Many of our clients use both: DCA handles the customer-facing AI work (voice calls, lead qualification, estimates) while Zapier connects backend tools.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should small businesses use Zapier or AI agents?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If you have time and patience to design and maintain workflows, Zapier is powerful. If you need AI to take phone calls, qualify leads, and run customer-facing automations on day one, pre-built AI agents like DigitalCraft AI deliver value faster.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Zapier do AI voice calls?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zapier does not have a native AI voice agent. You can trigger phone calls through Twilio or similar integrations, but the conversation logic, voice, and AI personality have to be built separately. DigitalCraft AI ships with a configured voice agent out of the box.',
      },
    },
  ],
};

function CellIcon({ value }: { value: string }) {
  if (value === 'yes') return <Check className="text-green-600 dark:text-green-400 mx-auto" size={20} />;
  if (value === 'no') return <X className="text-gray-400 dark:text-gray-600 mx-auto" size={20} />;
  if (value === 'partial') return <Minus className="text-yellow-500 dark:text-yellow-400 mx-auto" size={20} />;
  return <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>;
}

const ZapierComparison: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>DigitalCraft AI vs Zapier | Ready-Made AI Agents vs DIY Workflow Automation</title>
        <meta
          name="description"
          content="DigitalCraft AI vs Zapier compared. When pre-built AI voice and chat agents beat connector-based workflows for small business owners who don't have time to build automations."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/zapier" />
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Honest Comparison
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            DigitalCraft AI vs <span className="text-primary">Zapier</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            Zapier is the gold standard of workflow automation — a brilliant tool for technical people who want to wire systems together. DigitalCraft AI is a different category: pre-built AI agents that show up to work for your small business on day one.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated April 2026 · Honest comparison, no hidden bias.</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
            Feature-by-Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/2">Feature</th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-primary w-1/4">DigitalCraft AI</th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-gray-500 dark:text-gray-400 w-1/4">Zapier</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/50 dark:bg-gray-900/50'}>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{row.feature}</td>
                    <td className="px-6 py-4 text-center"><CellIcon value={row.dca} /></td>
                    <td className="px-6 py-4 text-center"><CellIcon value={row.zapier} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * Zapier pricing: Starter is $30/mo for 750 tasks. Most small businesses end up on the Pro tier ($73/mo) once volume scales. Per-task overage applies.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Where DigitalCraft AI Wins
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Both tools are great, but they solve different problems. Here's where pre-built AI beats DIY workflows.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            When Zapier Is the Better Fit
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            We use Zapier internally. It's an extraordinary tool for the right job.
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'You need to connect 3+ apps in custom ways',
                desc: 'Zapier shines when your problem is "when X happens in Tool A, do Y in Tool B and Z in Tool C." Their 7,000+ integrations cover almost every SaaS that exists. AI agents are not the right tool for pure data plumbing.',
              },
              {
                title: 'You enjoy building automations (or have a developer who does)',
                desc: "If automation is fun for you, or if you have an ops person who builds Zaps, you'll get more value out of Zapier's flexibility than out of opinionated AI agents.",
              },
              {
                title: 'Your workflow is unique to your business',
                desc: 'Pre-built AI agents are configured for common industry patterns. If your operation is genuinely one-of-a-kind, you may need a custom workflow that only Zapier (or Make, or n8n) can deliver.',
              },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            The Best Zapier Alternative for AI-Driven Small Businesses
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              The honest answer is that DigitalCraft AI isn't really a Zapier alternative — we solve a different problem. Zapier is for connecting tools you already use; we're for replacing the work that those tools haven't been able to automate. The biggest one is the work that requires judgment: qualifying a lead, talking to a customer on the phone, generating a quote, asking for a review at the right moment.
            </p>
            <p>
              If you've been trying to use Zapier to automate customer-facing conversations and finding that "send a templated SMS" isn't enough, that's the gap AI agents fill. Our voice and chat agents bring conversational intelligence — they understand context, handle objections, and adapt to what the customer actually says. Zapier can't do that without a custom OpenAI integration that you build and maintain.
            </p>
            <p>
              Many of our clients run both. DigitalCraft AI handles the customer-facing AI: phone calls, lead chat, estimates, review collection. Zapier handles the back-office plumbing: when DCA captures a lead, push it to HubSpot, ping Slack, and create a calendar block. That stack is faster to deploy and easier to maintain than trying to build the whole thing in either tool alone.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Users size={16} />
            See Pre-Built AI Agents Run
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Try DigitalCraft AI — No Setup, No Workflows to Build
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Enter your website URL and watch AI agents run live demos personalized to your business in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ai-for-small-business"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('see_demos', 'zapier_compare_cta')}
            >
              <Zap size={18} />
              See AI for Small Business
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_a_call', 'zapier_compare_cta')}
            >
              <Phone size={18} />
              Book a Discovery Call
            </a>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default ZapierComparison;

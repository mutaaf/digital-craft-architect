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
  Brain,
  Clock,
  Users,
  Workflow,
} from 'lucide-react';

interface Row {
  feature: string;
  dca: string;
  make: string;
}

const FEATURES: Row[] = [
  { feature: 'Pre-built AI agents (no setup)', dca: 'yes', make: 'no' },
  { feature: 'AI Voice calls (inbound + outbound)', dca: 'yes', make: 'no' },
  { feature: 'Industry-specific AI personas', dca: 'yes', make: 'no' },
  { feature: 'Lead qualification chatbot', dca: 'yes', make: 'partial' },
  { feature: 'Smart estimate generation', dca: 'yes', make: 'partial' },
  { feature: 'Visual scenario builder', dca: 'no', make: 'yes' },
  { feature: '1,500+ app integrations', dca: 'partial', make: 'yes' },
  { feature: 'Branching logic & error handling', dca: 'no', make: 'yes' },
  { feature: 'Setup time', dca: '48 hours', make: 'You build it' },
  { feature: 'Live demos personalized to your brand', dca: 'yes', make: 'no' },
  { feature: 'You design and maintain scenarios', dca: 'no', make: 'yes' },
  { feature: 'Entry pricing', dca: '$500/mo', make: '$10.59/mo*' },
  { feature: 'Per-operation charges', dca: 'No', make: 'Yes' },
];

const DIFFERENTIATORS = [
  {
    icon: Brain,
    title: 'Pre-trained intelligence, not blank logic',
    desc: 'DCA ships AI agents that already understand your industry — what to ask a roofing lead, how to handle a dental cancellation, when to upsell a salon client. Make gives you modules to build all of that yourself.',
  },
  {
    icon: Mic,
    title: 'Native voice AI',
    desc: 'DCA includes a fully built voice agent that takes inbound and outbound phone calls. Make does not have native voice AI — you would need to combine OpenAI, Twilio, and a TTS service in a custom scenario.',
  },
  {
    icon: Clock,
    title: 'Working day one',
    desc: 'A standard DCA deployment is live in 48 hours. With Make, the timeline is determined by how long it takes you (or a consultant) to design, build, test, and debug each scenario.',
  },
  {
    icon: Workflow,
    title: 'Opinionated > flexible (for owners)',
    desc: "Make's flexibility is its strength for engineers and its weakness for owner-operators. Most small businesses want the right answer to ship fast — not infinite optionality.",
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is DigitalCraft AI a Make (Integromat) alternative?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'DigitalCraft AI is not a direct Make alternative — Make is a visual workflow builder, while DCA ships pre-built AI agents. They solve different problems. Many small businesses use DCA for AI-powered customer interactions and Make for back-office data plumbing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Make do AI voice calls?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Make does not have a native AI voice agent. You can build voice flows by chaining together OpenAI, Twilio, and ElevenLabs modules, but the conversation logic and reliability tuning have to be built and maintained by you. DigitalCraft AI ships a configured voice agent out of the box.',
      },
    },
    {
      '@type': 'Question',
      name: 'Make vs Zapier — which is closer to DigitalCraft AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Neither is close. Make and Zapier are workflow connectors; DigitalCraft AI is a set of pre-built AI agents. Make is more powerful and cheaper than Zapier per operation, but both require you to design and maintain every automation. DCA is a managed AI service.',
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

const MakeComparison: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>DigitalCraft AI vs Make (Integromat) | AI Agents vs Visual Workflows</title>
        <meta
          name="description"
          content="DigitalCraft AI vs Make compared — pre-built AI voice and chat agents vs visual workflow automation. See which approach actually wins for small business owners."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/make" />
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
            DigitalCraft AI vs <span className="text-primary">Make</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            Make (formerly Integromat) is one of the most powerful visual automation tools on the market. DigitalCraft AI is a different beast: pre-built AI agents that handle the work workflows can't.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated April 2026 · Built by people who use both.</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">Feature Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/2">Feature</th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-primary w-1/4">DigitalCraft AI</th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-gray-500 dark:text-gray-400 w-1/4">Make</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/50 dark:bg-gray-900/50'}>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{row.feature}</td>
                    <td className="px-6 py-4 text-center"><CellIcon value={row.dca} /></td>
                    <td className="px-6 py-4 text-center"><CellIcon value={row.make} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * Make Core plan is $10.59/mo for 10,000 operations. Real-world small business usage typically lands on the Pro tier ($18.82/mo) or higher with overage charges.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Where DigitalCraft AI Wins</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Different categories, different strengths. Here's where pre-built AI beats visual workflows.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="p-6 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4"><d.icon size={22} /></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{d.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">When Make Is the Better Fit</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">We use Make for our own back-office plumbing. It's a beautifully designed product.</p>
          <div className="space-y-4">
            {[
              { title: 'You need branching, error handling, and complex data shaping', desc: "Make's visual scenario builder is more capable than Zapier — it handles iterators, aggregators, routers, and error recovery natively. If your automation is genuinely complex and conditional, Make is the right tool." },
              { title: 'You\'re technically comfortable and price-sensitive', desc: 'Make is cheaper per operation than Zapier and rewards technical users with a deeper toolkit. If you have time to learn the product, you\'ll get more value than from any pre-built solution.' },
              { title: 'Your needs are too unique for a pre-built agent', desc: 'AI agents are configured for industry-typical patterns. If your business has a workflow that doesn\'t exist anywhere else, you\'ll need to build it — and Make is the best canvas for it.' },
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">The Best Make Alternative for Small Business AI Automation</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              We're often compared to Make by small business owners who tried to use it for AI automation and ran into a wall. The wall is usually the same: Make can call OpenAI, but it can't build the conversation. It can route a message, but it can't qualify a lead. It can hit Twilio, but it can't be your voice agent.
            </p>
            <p>
              The pattern we see most often: an owner spends 40 to 60 hours building a Make scenario that uses OpenAI to draft replies, only to discover that the prompt engineering, error handling, and edge cases never end. Every time the business changes — new service, new pricing, new edge case — the scenario breaks. That's the failure mode pre-built AI agents are designed to prevent.
            </p>
            <p>
              The optimal stack for many of our clients: DigitalCraft AI for customer-facing AI (voice calls, lead qualification, estimates, reviews) plus Make for back-office data flows (CRM updates, reporting, multi-tool sync). DCA owns the conversation; Make moves the data.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Users size={16} />Skip the Build, See the Result
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Try DigitalCraft AI Live</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">No scenarios to design. No modules to learn. Enter your website URL and see AI agents run on your business in 60 seconds.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ai-for-small-business" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('see_demos', 'make_compare_cta')}>
              <Zap size={18} />See AI for Small Business
            </Link>
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('book_a_call', 'make_compare_cta')}>
              <Phone size={18} />Book a Discovery Call
            </a>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default MakeComparison;

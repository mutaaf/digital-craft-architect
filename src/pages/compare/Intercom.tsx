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
  Building2,
  DollarSign,
  Users,
} from 'lucide-react';

interface Row {
  feature: string;
  dca: string;
  intercom: string;
}

const FEATURES: Row[] = [
  { feature: 'AI Voice agent (real phone calls)', dca: 'yes', intercom: 'no' },
  { feature: 'AI Chatbot (Fin / Lead Responder)', dca: 'yes', intercom: 'yes' },
  { feature: 'Industry-specific AI personas', dca: 'yes', intercom: 'no' },
  { feature: 'Smart estimate / quote generation', dca: 'yes', intercom: 'no' },
  { feature: 'Lead qualification flows', dca: 'yes', intercom: 'yes' },
  { feature: 'Customer messaging inbox', dca: 'partial', intercom: 'yes' },
  { feature: 'Help center / knowledge base', dca: 'no', intercom: 'yes' },
  { feature: 'Setup time', dca: '48 hours', intercom: '2–6 weeks' },
  { feature: 'Live demos personalized to your brand', dca: 'yes', intercom: 'no' },
  { feature: 'Dedicated onboarding', dca: 'yes', intercom: 'partial' },
  { feature: 'Entry pricing', dca: '$500/mo', intercom: '$39/seat/mo*' },
  { feature: 'Fin AI charges', dca: 'Included', intercom: '$0.99 per resolution' },
  { feature: 'Per-seat charges', dca: 'No', intercom: 'Yes' },
];

const DIFFERENTIATORS = [
  {
    icon: Mic,
    title: 'Real voice AI, not just chat',
    desc: 'DCA includes an AI voice agent that takes phone calls — inbound and outbound. Intercom is a messaging platform first; phone is not its primary surface and there is no native AI voice agent.',
  },
  {
    icon: Building2,
    title: 'Built for service businesses, not SaaS support',
    desc: 'Intercom is optimized for software companies handling support tickets at scale. DCA is built for service businesses — construction, dental, salon, real estate — that need lead qualification, estimates, and bookings.',
  },
  {
    icon: DollarSign,
    title: 'Predictable flat pricing',
    desc: 'DCA is one monthly rate. Intercom charges per seat plus per-resolution fees on Fin AI ($0.99 each), plus add-ons for proactive support, surveys, and more. Costs scale unpredictably with team size and AI usage.',
  },
  {
    icon: Zap,
    title: '48-hour deployment',
    desc: 'DCA goes live in two business days. Intercom Professional onboarding typically takes 2–6 weeks, especially with Fin AI configuration and content training.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is DigitalCraft AI an Intercom alternative?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For service businesses that need AI voice plus chat, yes — DigitalCraft AI replaces Intercom\'s lead and AI chat functions while adding voice agents Intercom does not offer. For SaaS companies running support at scale, Intercom\'s help-center and ticketing features make it a better fit.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Intercom have AI voice calls?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Intercom\'s Fin AI handles chat conversations but is not a voice agent. There is no native phone-call AI in Intercom — calls have to be routed through third-party telephony tools without AI conversation capability.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does Intercom cost vs DigitalCraft AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Intercom Essential starts at $39 per seat per month with Fin AI charging $0.99 per AI resolution on top. A 5-seat team with 500 AI resolutions per month runs roughly $690/mo before add-ons. DigitalCraft AI is a flat $500/mo for a single AI agent or $1,500/mo for a full multi-agent setup, regardless of team size.',
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

const IntercomComparison: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>DigitalCraft AI vs Intercom | AI Voice + Chat for Small Business</title>
        <meta
          name="description"
          content="DigitalCraft AI vs Intercom — when AI voice plus chat agents for service businesses beat Intercom's customer messaging suite. Side-by-side comparison."
        />
        <link rel="canonical" href="https://digitalcraftai.com/compare/intercom" />
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />Honest Comparison
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            DigitalCraft AI vs <span className="text-primary">Intercom</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
            Intercom is a fantastic customer-messaging platform built for SaaS support teams. DigitalCraft AI is built for service businesses — construction, real estate, healthcare — where most leads still come in by phone.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated April 2026 · Comparison reflects published Intercom pricing.</p>
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
                  <th className="px-6 py-4 text-sm font-semibold text-center text-gray-500 dark:text-gray-400 w-1/4">Intercom</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/50 dark:bg-gray-900/50'}>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{row.feature}</td>
                    <td className="px-6 py-4 text-center"><CellIcon value={row.dca} /></td>
                    <td className="px-6 py-4 text-center"><CellIcon value={row.intercom} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
            * Intercom Essential is $39/seat/mo (annual). Fin AI: $0.99 per resolution. Advanced and Expert tiers add proactive support, custom roles, and SSO at $99–$139/seat/mo.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Where DigitalCraft AI Stands Out</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Both are great products. Here's where DCA outperforms for service businesses.</p>
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">When Intercom Is the Better Fit</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">Different problems need different products. Here's where Intercom is the clear winner.</p>
          <div className="space-y-4">
            {[
              { title: 'You\'re a SaaS company running customer support', desc: 'Intercom is the gold standard for support teams handling tickets, help-center articles, in-app messaging, and proactive engagement. Fin AI is genuinely useful for deflecting common support questions in software products.' },
              { title: 'You have a help center and want AI to use it', desc: 'Fin AI shines when fed a rich knowledge base of articles. Most service businesses don\'t have one. Most SaaS products do — and that\'s where Intercom unlocks the most value.' },
              { title: 'Your team is messaging-first', desc: 'If most of your customer interactions happen through in-app chat or a help widget — and phone calls are rare — Intercom\'s unified inbox and routing are best-in-class.' },
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">The Best Intercom Alternative for Service Businesses</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              Intercom was designed for the world where every business is a SaaS app and every customer interaction happens in-product. That world is real, but it isn't the world of the construction company taking 40 calls a day, the dental office trying to fill cancellations, or the salon owner who just wants the next booking to actually show up.
            </p>
            <p>
              For service businesses, the most valuable AI doesn't live inside an in-app messenger — it lives on the phone. The lead who calls during dinner. The customer who wants to reschedule. The seller deciding whether to take your offer. Intercom doesn't have a native voice agent for any of these moments. DigitalCraft AI is built around them.
            </p>
            <p>
              The other practical issue: Intercom's per-seat plus per-resolution pricing punishes growth. The more leads your AI handles, the higher your bill — exactly the wrong incentive. DigitalCraft AI is a flat monthly rate so the economics get better as your AI does more work.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Users size={16} />See It on Your Business
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Try DigitalCraft AI — Voice + Chat in 60 Seconds</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Enter your website URL and try AI voice and chat agents personalized to your business. No setup. No seats. No per-resolution fees.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ai-for-small-business" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('see_demos', 'intercom_compare_cta')}>
              <Zap size={18} />See AI for Small Business
            </Link>
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('book_a_call', 'intercom_compare_cta')}>
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

export default IntercomComparison;

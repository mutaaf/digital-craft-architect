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
  HardHat,
  Building2,
  PartyPopper,
  Wrench,
  Heart,
  Scale,
  UtensilsCrossed,
  Gamepad2,
  Dumbbell,
  Stethoscope,
  Scissors,
  Car,
  ArrowRight,
  Phone,
  Sparkles,
  Mic,
  Zap,
  Clock,
  MessageSquare,
  Star,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

const INDUSTRIES = [
  { to: '/construction', label: 'Construction', icon: HardHat },
  { to: '/realestate', label: 'Real Estate', icon: Building2 },
  { to: '/homeservices', label: 'Home Services', icon: Wrench },
  { to: '/healthcare', label: 'Healthcare', icon: Heart },
  { to: '/legal', label: 'Law Firms', icon: Scale },
  { to: '/restaurant', label: 'Restaurants', icon: UtensilsCrossed },
  { to: '/dental', label: 'Dental', icon: Stethoscope },
  { to: '/salon', label: 'Salon & Spa', icon: Scissors },
  { to: '/fitness', label: 'Fitness & Gyms', icon: Dumbbell },
  { to: '/autorepair', label: 'Auto Repair', icon: Car },
  { to: '/kidsplay', label: 'Kids Play', icon: Gamepad2 },
  { to: '/events', label: 'Event Planning', icon: PartyPopper },
];

const USE_CASES = [
  {
    icon: MessageSquare,
    title: 'Lead response in under 60 seconds',
    desc: 'AI chat agents qualify website leads instantly — when a prospect submits a form, they get a personalized reply before they close the tab. Studies show response time under 60 seconds doubles close rates.',
  },
  {
    icon: Mic,
    title: 'AI voice agents that make and take calls',
    desc: 'A real AI voice answering missed calls, booking appointments, recovering no-shows, and following up on leads — 24/7. Sounds human, never gets tired, never forgets to call back.',
  },
  {
    icon: Zap,
    title: 'Smart estimates and quotes in seconds',
    desc: 'AI generates accurate quotes for construction projects, dental work, salon services, catering events — using your pricing rules, not generic templates. Customers get answers while they\'re still hot.',
  },
  {
    icon: Star,
    title: 'Automated review collection and replies',
    desc: 'AI texts every happy customer for a Google review at the perfect moment, then replies to feedback in your voice. The fastest way to climb local search rankings.',
  },
  {
    icon: Calendar,
    title: 'Appointment scheduling and reminders',
    desc: 'AI handles the back-and-forth of booking — confirms, reschedules, and sends reminders that cut no-shows by 40 to 60 percent. Works over chat, SMS, and voice.',
  },
  {
    icon: CheckCircle2,
    title: 'Follow-up that actually happens',
    desc: 'Most leads die because nobody follows up. AI runs persistent, polite follow-up sequences across SMS, email, and voice — until the lead either books or opts out.',
  },
];

const FAQS = [
  {
    q: 'What is AI for small business?',
    a: 'AI for small business means using artificial intelligence — like voice agents, chatbots, and automated workflows — to handle the repetitive tasks that consume an owner-operator\'s day: answering inquiries, qualifying leads, scheduling appointments, generating quotes, collecting reviews, and following up. Unlike generic enterprise AI, small business AI is pre-configured for specific industries and runs without requiring a developer or operations team.',
  },
  {
    q: 'How much does AI for small business cost?',
    a: 'DigitalCraft AI plans start at $500/month for a single AI agent (typically lead qualifier or scheduler) and scale to $1,500/month for a full multi-agent setup including AI voice calls, lead response, estimates, and review automation. There is no onboarding fee. By comparison, hiring a full-time front-desk employee costs $35,000 to $55,000 per year before benefits.',
  },
  {
    q: 'How long does it take to set up AI for my business?',
    a: 'A standard DigitalCraft AI deployment goes live within 48 hours. We scrape your website, configure the AI with your services and pricing, and connect it to your existing tools (CRM, calendar, phone). Most clients see their first AI-handled inquiry within the first week.',
  },
  {
    q: 'Will the AI sound like a robot or like a real person?',
    a: 'Modern AI voice agents — including ours — use neural text-to-speech (ElevenLabs Turbo v2.5) and conversational LLMs (GPT-4o) that sound indistinguishable from a human in most calls. They handle interruptions, accents, hold music, and unexpected questions. We have call recordings on the demo pages where you can hear it yourself.',
  },
  {
    q: 'What industries do you support?',
    a: 'Twelve verticals: construction, real estate, home services (HVAC, plumbing, electrical), healthcare, legal, restaurants, dental, salons and spas, fitness, auto repair, kids play and party venues, and event planning. Each vertical comes with industry-specific demos you can try with your own company data — just enter your website URL.',
  },
  {
    q: 'Do I need to know anything technical to use this?',
    a: 'No. DigitalCraft AI is built for owner-operators, not developers. Our SetupClaw service handles deployment, integration, and ongoing maintenance. You get a working AI system, not a toolkit you have to assemble.',
  },
  {
    q: 'How is this different from ChatGPT, Zapier, or HubSpot?',
    a: 'ChatGPT is a general-purpose chatbot you have to prompt yourself — it doesn\'t take phone calls, doesn\'t connect to your booking system, and doesn\'t know your business. Zapier and Make are workflow builders that require you to design and maintain every automation. HubSpot is a marketing and CRM suite. DigitalCraft AI is a ready-made operations layer — pre-built AI agents trained on your industry that work out of the box.',
  },
  {
    q: 'Can I try it before I buy it?',
    a: 'Yes. Every industry page has live demos you can try with your own company data. Enter your website URL, and our AI scrapes your site to personalize the demo to your brand, services, and pricing. No signup, no credit card.',
  },
  {
    q: 'What about data privacy and HIPAA?',
    a: 'For healthcare and dental clients, we deploy under HIPAA-compliant configurations with BAAs in place. For all clients, conversation data is processed via OpenAI and Vapi under their enterprise privacy terms. We do not train models on your data, and you can request deletion at any time.',
  },
  {
    q: 'Will AI replace my staff?',
    a: 'In our experience, AI doesn\'t replace staff — it removes the work that prevents staff from doing the high-value parts of their jobs. Front-desk teams stop drowning in inquiry-and-scheduling chaos and start focusing on high-touch customer experience, complex issues, and revenue-generating work.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Small Business',
      item: 'https://digitalcraftai.com/ai-for-small-business',
    },
  ],
};

const SmallBusiness: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Small Business | Industry-Specific AI Agents That Save 10–20 Hours/Week</title>
        <meta
          name="description"
          content="AI for small business owners: voice agents, lead qualification, smart estimates, and review automation. Pre-built for 12 industries — try live demos free."
        />
        <meta property="og:title" content="AI for Small Business | DigitalCraft AI" />
        <meta
          property="og:description"
          content="Industry-specific AI agents for small businesses across 12 verticals. Save 10–20 hours/week. Try live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-small-business" />
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Built for Owner-Operators, Not Developers
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            AI for Small Business{' '}
            <span className="text-primary">that actually works</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Pre-built AI agents — voice, chat, and automation — for 12 industries.
            Live in 48 hours. No engineers. No prompt-tuning. No "we'll set up the workflow on a call next week."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('take_quiz', 'smb_hero')}
            >
              <Zap size={18} />
              Take the 2-Min AI Readiness Quiz
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'smb_hero')}
            >
              <Phone size={18} />
              Book a Free Discovery Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup · No credit card · Live demos personalized to your company
          </p>
        </div>
      </section>

      {/* Industry Selector */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Pick Your Industry
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Every vertical includes pre-built AI agents and a live demo you can try with your own company data.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {INDUSTRIES.map((industry) => (
              <Link
                key={industry.to}
                to={industry.to}
                className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary hover:shadow-lg transition-all"
                onClick={() => trackCTAClick('industry_card', industry.label.toLowerCase())}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <industry.icon size={24} />
                </div>
                <span className="font-medium text-sm text-gray-900 dark:text-white text-center group-hover:text-primary transition-colors">
                  {industry.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              What AI Actually Does for a Small Business
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The six high-leverage automations that reclaim 10–20 hours of owner-operator time per week.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {USE_CASES.map((u) => (
              <div
                key={u.title}
                className="p-6 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <u.icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{u.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{u.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Long-form SEO content */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            The Honest Guide to AI for Small Business in 2026
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-5">
            <p>
              "AI for small business" became a buzzword sometime in 2023, and ever since, every SaaS company has slapped an AI label on whatever they were already selling. Most of it is noise. The version that actually moves the needle for an owner-operator is narrow: it answers the phone, it qualifies the lead, it sends the quote, it books the appointment, it asks for the review, and it follows up when nobody else does.
            </p>
            <p>
              The reason small businesses haven't adopted AI faster isn't because the technology isn't ready — it's because most AI tools are built for engineers, not for the person running a salon, a roofing company, or a dental practice. You don't have time to sit through a Zapier tutorial. You need something that's already configured for your industry, that turns on, and that starts catching the leads you're losing today.
            </p>
            <p>
              That's the bet DigitalCraft AI is making: instead of giving you a toolkit and wishing you luck, we ship pre-built AI agents trained on the workflows of your specific industry. A construction lead qualifier knows to ask about permits and timeline. A dental intake bot knows to capture insurance and last cleaning date. A salon rebooker knows your typical 4–6 week cycle. The AI is opinionated because the alternative — a blank chatbot you have to teach — is what's been failing small business owners for years.
            </p>
            <p>
              The other thing nobody talks about: the highest-leverage AI for a small business isn't text. It's voice. Most service businesses still get the majority of their inbound through phone calls, and missed calls are the single biggest source of lost revenue. AI voice agents — the ones that actually answer the phone, talk like a human, and book the job — are the closest thing to a hire-without-hiring that exists today.
            </p>
            <p>
              If you want to skip the marketing copy and just see if it works for your business, the fastest path is the <Link to="/quiz" className="text-primary hover:underline">2-minute readiness quiz</Link> — you'll get a tailored recommendation on which AI agents to deploy first based on where you're losing time and money today.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white flex justify-between items-center">
                  {f.q}
                  <ArrowRight
                    size={18}
                    className="text-gray-400 group-open:rotate-90 transition-transform"
                  />
                </summary>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            See it work on your business
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Take the readiness quiz, or book a 30-minute call where we'll deploy a working AI agent against your real website while you watch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('take_quiz', 'smb_bottom')}
            >
              <Zap size={18} />
              Take the AI Readiness Quiz
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'smb_bottom')}
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

export default SmallBusiness;

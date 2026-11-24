import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  Sparkles,
  Plus,
} from 'lucide-react';
import { SeoShell, SeoHero, SeoFaq, SeoClose, Chev } from '@/v3/SeoLanding';
import { DEFAULT_SCRIPT } from '@/v3/PhoneDemo';
import Savings from '@/v3/Savings';
import { openTry } from '@/v3/TrySheet';
import { CALENDLY } from '@/v3/verticals';

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

// What it does, one line each (the old cards' unsourced figures are gone).
const USE_CASES = [
  { title: 'Answers every lead.', desc: 'Website leads get a personal reply before they close the tab.' },
  { title: 'Takes and makes calls.', desc: 'An AI voice answers missed calls, books, and follows up. Day or night.' },
  { title: 'Quotes in seconds.', desc: 'Priced from your rules, not a generic template.' },
  { title: 'Collects reviews.', desc: 'Asks happy customers at the right moment and replies in your voice.' },
  { title: 'Books and reminds.', desc: 'Confirms, reschedules and reminds over chat, text and voice.' },
  { title: 'Follows up. Every time.', desc: 'Polite, persistent follow-up until the lead books or opts out.' },
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

// Keynote layout (src/v3/SeoLanding.tsx blocks): the promise, the industries, what it does, the
// visitor's own numbers, the long-form guide folded away, plain answers (verbatim, = FAQ_SCHEMA), one close.
const SmallBusiness: React.FC = () => {
  const { content } = useContent();
  const buildPrice = Number(content?.mvpPromotion?.price?.replace(/[^0-9.]/g, '')) || 4999;

  return (
    <>
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
      <SeoShell>
        <SeoHero
          icon={Sparkles}
          name="AI for Small Business"
          headline="That actually works."
          lead="Voice, chat and follow-up agents, pre-built for 12 industries. No engineers. No prompt-tuning."
          phone={DEFAULT_SCRIPT}
          actions={<>
            <Link to="/quiz" onClick={() => trackCTAClick('take_quiz', 'smb_hero')} className="k-pill k-pill-brand">Take the 2-minute quiz</Link>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_call', 'smb_hero')} className="k-link">Book a call <Chev /></a>
          </>}
        />

        {/* pick your industry */}
        <section className="mx-auto mt-28 max-w-[1180px] px-5 py-28 md:mt-40 md:py-40">
          <h2 className="k-in k-h2 mb-4 text-center">Pick your industry.</h2>
          <p className="k-in k-lead mx-auto mb-14 max-w-[30ch] text-center md:mb-20">Each one has live demos. Try them with your own website.</p>
          <div className="k-in grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {INDUSTRIES.map((industry) => (
              <Link
                key={industry.to}
                to={industry.to}
                onClick={() => trackCTAClick('industry_card', industry.label.toLowerCase())}
                className="k-tile group flex min-h-[148px] flex-col justify-between rounded-[24px] p-6 transition-colors hover:bg-[#ececf0] md:min-h-[168px] md:p-7"
              >
                <industry.icon size={28} strokeWidth={1.8} className="text-aurora" aria-hidden />
                <span className="flex items-center justify-between gap-2 text-[17px] font-semibold tracking-[-0.01em] md:text-[19px]">
                  {industry.label}
                  <Chev className="shrink-0 text-[#86868b] transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* what it does */}
        <section className="bg-[#f5f5f7] px-5 py-28 md:py-40">
          <div className="mx-auto max-w-[1180px]">
            <h2 className="k-in k-h2 mx-auto mb-14 max-w-[14ch] text-center md:mb-20">Six jobs. Done for you.</h2>
            <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {USE_CASES.map((u, i) => (
                <div key={u.title} className="k-in flex min-h-[220px] flex-col rounded-[28px] bg-white p-9 md:p-10">
                  <span className="v3-num mb-8 text-[15px] font-semibold text-aurora">0{i + 1}</span>
                  <h3 className="mb-3 text-[24px] font-semibold leading-[1.15] tracking-[-0.025em] md:text-[28px]">{u.title}</h3>
                  <p className="text-[17px] leading-snug text-[#6e6e73]">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* what it's worth */}
        <section className="px-5 py-28 md:py-40">
          <div className="mx-auto max-w-[1080px]">
            <h2 className="k-in k-h2 mb-4 text-center">What it&rsquo;s worth to you.</h2>
            <p className="k-in k-lead mx-auto mb-14 max-w-[28ch] text-center md:mb-20">Move the sliders. Your numbers, your answer.</p>
            <div className="k-in rounded-[32px] bg-[#f5f5f7] p-8 md:p-14">
              <Savings buildPrice={buildPrice} onAction={() => { trackCTAClick('v3_try', 'smb_savings'); openTry(); }} actionLabel="See it on your company" />
            </div>
          </div>
        </section>

        {/* the long-form guide, folded */}
        <section className="mx-auto max-w-[880px] px-5 pb-8">
          <details className="group border-y border-[#d2d2d7]">
            <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
              <h2 className="text-[19px] font-semibold tracking-[-0.01em] md:text-[21px]">The honest guide to AI for small business in 2026</h2>
              <Plus size={22} className="shrink-0 text-[#86868b] transition-transform duration-300 group-open:rotate-45" aria-hidden />
            </summary>
            <div className="space-y-5 pb-8 text-[17px] leading-relaxed text-[#6e6e73]">
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
                If you want to skip the marketing copy and just see if it works for your business, the fastest path is the <Link to="/quiz" className="text-aurora hover:underline">2-minute readiness quiz</Link> — you'll get a tailored recommendation on which AI agents to deploy first based on where you're losing time and money today.
              </p>
            </div>
          </details>
        </section>

        <SeoFaq faqs={FAQS} />

        <SeoClose title="See it work on your business." line="Take the quiz, or book 30 minutes and watch us set it up on your real website.">
          <Link to="/quiz" onClick={() => trackCTAClick('take_quiz', 'smb_bottom')} className="k-pill bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]">Take the AI readiness quiz</Link>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_call', 'smb_bottom')} className="k-link !text-[#7BE3C3]">Book a call <Chev /></a>
        </SeoClose>
      </SeoShell>
    </>
  );
};

export default SmallBusiness;

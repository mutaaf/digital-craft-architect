import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import { useContent } from '@/hooks/useContent';
import { useAnalytics, trackCTAClick } from '@/utils/analytics';
import {
  MessageSquare,
  Home,
  Star,
  Phone,
  PhoneOff,
  Clock,
  Search,
  UserX,
  ClipboardCheck,
  Wrench,
  Rocket,
  Check,
  ArrowRight,
  Building2,
  Sparkles,
  TrendingUp,
  Calendar,
  Play,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ───────────────────── Pain Point Card ───────────────────── */
const PainCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => (
  <div
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4 text-red-500">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
  </div>
);

/* ───────────────────── Solution Card ───────────────────── */
const SolutionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  delay: number;
}> = ({ icon, title, description, features, delay }) => (
  <div
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{description}</p>
    <ul className="space-y-2">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  </div>
);

/* ───────────────────── Step Card ───────────────────── */
const StepCard: React.FC<{
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ number, icon, title, description, delay }) => (
  <div className="relative text-center animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
      {icon}
    </div>
    <span className="absolute top-0 right-1/2 translate-x-10 -translate-y-2 bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
      {number}
    </span>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">{description}</p>
  </div>
);

/* ───────────────────── Stat Card ───────────────────── */
const StatCard: React.FC<{ value: string; label: string; delay: number }> = ({
  value,
  label,
  delay,
}) => (
  <div className="text-center animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
    <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{value}</p>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
  </div>
);

/* ───────────────────── Pricing Tier ───────────────────── */
const PricingTier: React.FC<{
  name: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
  delay: number;
}> = ({ name, price, description, features, highlight, delay }) => (
  <div
    className={`rounded-xl p-8 shadow-md border transition-all duration-300 hover:shadow-lg animate-slide-up ${
      highlight
        ? 'bg-primary text-white border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900'
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
    }`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <h3 className={`text-lg font-semibold mb-1 ${highlight ? 'text-white' : ''}`}>{name}</h3>
    <p className={`text-sm mb-4 ${highlight ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
      {description}
    </p>
    <p className="mb-6">
      <span className={`text-4xl font-bold ${highlight ? 'text-white' : ''}`}>{price}</span>
      <span className={`text-sm ${highlight ? 'text-white/80' : 'text-gray-500'}`}>/month</span>
    </p>
    <ul className="space-y-3 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <Check
            size={16}
            className={`mt-0.5 shrink-0 ${highlight ? 'text-white' : 'text-green-500'}`}
          />
          <span className={highlight ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}>
            {f}
          </span>
        </li>
      ))}
    </ul>
    <a
      href="#contact"
      className={`block text-center py-3 rounded-md font-medium transition-colors ${
        highlight
          ? 'bg-white text-primary hover:bg-white/90'
          : 'bg-primary text-white hover:bg-primary/90'
      }`}
    >
      Get Started
    </a>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN REAL ESTATE PAGE
   ═══════════════════════════════════════════════════════════ */
const RealEstate: React.FC = () => {
  const { content } = useContent();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    challenge: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useAnalytics('G-JQ53W917HT');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('https://formspree.io/f/xovekqqk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          _subject: `[Real Estate Lead] ${formData.company}`,
        }),
      });
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', company: '', phone: '', challenge: '' });
      }
    } catch {
      // silent fail
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI Systems for Real Estate Professionals | DigitalCraft AI</title>
        <meta name="description" content="AI-powered deal analysis, voice negotiation, and lead qualification for real estate investors and agents." />
        <meta property="og:title" content="AI Systems for Real Estate Professionals | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered deal analysis, voice negotiation, and lead qualification for real estate investors and agents." />
        <link rel="canonical" href="https://digitalcraftai.com/realestate" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Real Estate Professionals",
          "description": "AI-powered deal analysis, voice negotiation, and lead qualification for real estate investors and agents.",
          "provider": {
            "@type": "Organization",
            "name": "DigitalCraft AI",
            "url": "https://digitalcraftai.com"
          },
          "areaServed": [
            { "@type": "City", "name": "Dallas", "containedInPlace": { "@type": "State", "name": "Texas" } },
            { "@type": "City", "name": "Fort Worth", "containedInPlace": { "@type": "State", "name": "Texas" } },
            { "@type": "City", "name": "Austin", "containedInPlace": { "@type": "State", "name": "Texas" } },
            { "@type": "Country", "name": "United States" }
          ],
          "serviceType": "AI Automation for Real Estate",
          "offers": [
            { "@type": "Offer", "name": "Solo Agent", "price": "1000", "priceCurrency": "USD", "description": "For individual agents building their brand" },
            { "@type": "Offer", "name": "Team", "price": "3000", "priceCurrency": "USD", "description": "For teams with 3-10 agents" },
            { "@type": "Offer", "name": "Brokerage", "price": "10000", "priceCurrency": "USD", "description": "For brokerages and large teams" }
          ]
        })}</script>
      </Helmet>
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Building2 size={16} />
                Built for Real Estate
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AI Systems Built for{' '}
                <span className="text-primary">Real Estate Professionals</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Close more deals, qualify leads instantly, and automate follow-ups — without changing
                how your team works.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <a href="#contact" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                  Get Your Free AI Audit <ArrowRight size={20} />
                </a>
                <Link
                  to="/realestate/demo"
                  className="inline-flex items-center justify-center gap-2 text-lg px-6 py-3 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                >
                  Try Live Demos <Sparkles size={18} />
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 animate-slide-up">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl transform rotate-3" />
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern home with real estate agent"
                  className="rounded-2xl shadow-lg object-cover h-[400px] w-full relative z-10 transform -rotate-2 transition-transform duration-500 hover:rotate-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="container-section">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sound Familiar?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Most agents lose deals to the same problems every day.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PainCard
            icon={<PhoneOff size={24} />}
            title="Missing Hot Leads"
            description="A motivated seller fills out your form at 10pm. By morning, they've already called another agent. You never even knew."
            delay={0}
          />
          <PainCard
            icon={<Clock size={24} />}
            title="Hours on Market Analysis"
            description="Pulling comps, running CMAs, formatting presentations — it eats hours that could be spent closing deals."
            delay={150}
          />
          <PainCard
            icon={<Search size={24} />}
            title="Low Review Count"
            description="You've closed 50 deals but only have 8 reviews. Buyers search Google first, and your competitor with 100+ reviews wins."
            delay={300}
          />
          <PainCard
            icon={<UserX size={24} />}
            title="Manual Follow-Up Fatigue"
            description="Drip campaigns feel robotic. Personal follow-ups take forever. Leads go cold because you can't keep up with everyone."
            delay={450}
          />
        </div>
      </section>

      {/* ─── SOLUTIONS ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Build for You</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Custom AI systems designed for how real estate professionals actually work.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SolutionCard
            icon={<MessageSquare size={24} />}
            title="AI Lead Qualifier"
            description="Respond to every inquiry in under 60 seconds — 24/7, 365 days a year."
            features={[
              'Website chatbot that qualifies buyers & sellers',
              'Captures budget, timeline, neighborhoods, preferences',
              'Auto-books showings on your calendar',
              'Scores leads by urgency and likelihood to close',
            ]}
            delay={0}
          />
          <SolutionCard
            icon={<Home size={24} />}
            title="Automated CMA"
            description="Turn hours of comp analysis into a 2-minute process."
            features={[
              'Paste a listing → get full comparable market analysis',
              'AI-generated negotiation strategy with offer range',
              'Professional branded report for client presentations',
              'ROI projections for investment properties',
            ]}
            delay={150}
          />
          <SolutionCard
            icon={<Star size={24} />}
            title="Review & Reputation Engine"
            description="Go from 8 reviews to 100+ in months, automatically."
            features={[
              'Auto-sends review requests after closing',
              'AI generates professional responses to all reviews',
              'Monitors Google, Zillow, and Realtor.com',
              'Alerts you to negative reviews instantly',
            ]}
            delay={300}
          />
          <SolutionCard
            icon={<TrendingUp size={24} />}
            title="Seller Outreach AI"
            description="Find and contact motivated sellers before your competition."
            features={[
              'Scrapes public records for distressed properties',
              'AI-personalized outreach letters and emails',
              'Tracks response rates and follow-up sequences',
              'Integrates with your CRM for seamless pipeline',
            ]}
            delay={450}
          />
          <SolutionCard
            icon={<Phone size={24} />}
            title="AI Voice Negotiator"
            description="Let AI handle the initial seller conversation while you focus on closings."
            features={[
              'AI calls sellers with your negotiation strategy',
              'Live transcript you can monitor in real time',
              'Full call summary with insights & next steps',
              'Coaching panel to guide the AI mid-call',
            ]}
            delay={600}
          />
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="container-section">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            From first call to live system in as little as 2 weeks.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          <StepCard
            number="1"
            icon={<ClipboardCheck size={28} />}
            title="Free AI Audit"
            description="We analyze your current operations — lead flow, follow-ups, reviews, CMA process — and show you exactly where AI saves you time and closes more deals."
            delay={0}
          />
          <StepCard
            number="2"
            icon={<Wrench size={28} />}
            title="Custom Build"
            description="We build your AI systems in 2 weeks, tailored to your market, your brand, and your workflow. No disruption to your current process."
            delay={200}
          />
          <StepCard
            number="3"
            icon={<Rocket size={28} />}
            title="Launch & Grow"
            description="Go live with ongoing optimization. We monitor performance, make improvements, and scale as your team grows."
            delay={400}
          />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-gray-900 dark:bg-gray-950 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <StatCard
              value="74%"
              label="of sellers list with the first agent who contacts them"
              delay={0}
            />
            <StatCard
              value="3.5x"
              label="more closings with AI-powered lead qualification"
              delay={200}
            />
            <StatCard
              value="12hrs"
              label="saved per week on admin, follow-ups, and market analysis"
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* ─── SEE IT IN ACTION ─── */}
      <section className="container-section">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={16} />
            Interactive Demos
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Try our AI tools live — no signup, no credit card required.
          </p>
          <Link
            to="/realestate/demo"
            className="inline-flex items-center justify-center gap-2 text-lg px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Explore Interactive Demos <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="container-section" id="pricing">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your business. Scale up as you grow.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingTier
            name="Solo Agent"
            price="$1,000"
            description="For individual agents building their brand"
            features={[
              'AI Lead Qualifier chatbot',
              'Review & reputation automation',
              'Automated CMA reports',
              'Monthly performance report',
              'Email support',
            ]}
            delay={0}
          />
          <PricingTier
            name="Team"
            price="$3,000"
            description="For teams with 3-10 agents"
            features={[
              'Everything in Solo Agent',
              'Seller Outreach AI',
              'CRM integration & lead routing',
              'AI Voice Negotiator',
              'Weekly strategy call',
              'Priority support',
            ]}
            highlight
            delay={150}
          />
          <PricingTier
            name="Brokerage"
            price="$10,000"
            description="For brokerages and large teams"
            features={[
              'Everything in Team',
              'Custom AI workflows per agent',
              'Multi-office support',
              'Dedicated account manager',
              'White-label branding',
              'Quarterly business review',
            ]}
            delay={300}
          />
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
          All plans include a 2-week setup period. No long-term contracts — cancel anytime.
        </p>
      </section>

      {/* ─── FAQ ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions?</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="mls" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Does it work with my MLS?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Yes. Our AI systems pull data from public listing sources and can integrate with most
                MLS feeds via IDX/RETS. We'll configure the connection during setup so your CMA reports
                and lead qualifier have access to real-time market data.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="team" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Can my whole team use it?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Absolutely. The Team and Brokerage plans include multi-agent support with individual
                lead routing, separate branded outputs, and performance tracking per agent. Each agent
                gets their own AI assistant configured to their style.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="idx" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Does it integrate with my IDX website?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Yes. The AI chatbot is a lightweight widget that installs on any website — WordPress,
                Squarespace, custom IDX sites, or KVCore. It works alongside your existing site
                without any redesign needed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="results" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How fast will I see results?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Lead response time drops to under 60 seconds from day one. Most agents see a
                measurable increase in qualified appointments within the first month. Review counts
                typically double within 60-90 days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contract" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What's the contract length?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Month-to-month. No long-term contracts. We earn your business every month by
                delivering results. Most clients stay because the ROI is obvious within 30 days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="different" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How is this different from a marketing agency?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                We build actual AI systems — custom software that automates your operations. A marketing
                agency runs your ads. We build the systems that capture, qualify, and convert those leads
                automatically, plus streamline your CMA process, follow-ups, and reputation management.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ─── CONTACT FORM ─── */}
      <section id="contact" className="container-section">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Your Free AI Audit
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We'll analyze your operations and show you exactly where AI can help you close more
              deals and save time.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-10 animate-slide-up">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">We Got It!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We'll review your info and reach out within 24 hours to schedule your free AI
                  audit.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <a
                    href="https://calendly.com/mutaaf"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCTAClick('book_discovery_call', 'realestate_form_success')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    <Calendar size={18} />
                    Book Your Discovery Call Now
                  </a>
                  <Link
                    to="/realestate/demo"
                    onClick={() => trackCTAClick('explore_demos', 'realestate_form_success')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-primary text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg font-medium transition-colors"
                  >
                    <Play size={18} />
                    Explore Our AI Demos
                  </Link>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Join 50+ businesses we've helped automate
                </p>

                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary hover:underline text-sm"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brokerage / Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Keller Williams Metro"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What's your biggest challenge right now?
                  </label>
                  <textarea
                    required
                    value={formData.challenge}
                    onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                    placeholder="e.g., I'm spending too much time on CMAs and not enough time with clients..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 text-lg font-medium"
                >
                  {isSubmitting ? 'Sending...' : 'Request My Free AI Audit'}
                </button>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  No spam, no obligation. We'll reach out to schedule a 15-minute call.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default RealEstate;

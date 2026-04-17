import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import LeadMagnetSection from '@/components/LeadMagnetSection';
import SocialProofBar from '@/components/SocialProofBar';
import ScrollProgress from '@/components/ScrollProgress';
import Testimonials from '@/components/Testimonials';
import { useContent, TestimonialItem } from '@/hooks/useContent';
import { useAnalytics, trackCTAClick, useEngagementTracking } from '@/utils/analytics';
import { getUtmParams } from '@/utils/utmTracker';
import {
  MessageSquare,
  Calculator,
  Star,
  ShieldAlert,
  PhoneOff,
  Clock,
  ClipboardCheck,
  Wrench,
  Rocket,
  Check,
  ArrowRight,
  Car,
  Sparkles,
  Calendar,
  Play,
  Phone,
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
  originalPrice?: string;
  description: string;
  features: string[];
  highlight?: boolean;
  delay: number;
}> = ({ name, price, originalPrice, description, features, highlight, delay }) => (
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
      {originalPrice && (
        <span className={`text-lg line-through mr-2 ${highlight ? 'text-white/50' : 'text-gray-400 dark:text-gray-500'}`}>{originalPrice}</span>
      )}
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
   MAIN AUTO REPAIR PAGE
   ═══════════════════════════════════════════════════════════ */
const autoRepairTestimonials: TestimonialItem[] = [
  {
    quote: "Since adding the AI service advisor, our front desk handles twice the call volume without hiring anyone. Customers love the instant estimates and transparency.",
    author: "Carlos Mendez",
    position: "Owner, Mendez Auto Care",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "We used to lose 40% of declined services forever. Now the AI follows up automatically and we're recovering half of those jobs. It paid for itself in the first month.",
    author: "Jennifer Walsh",
    position: "Service Manager, Walsh Automotive Group",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Our Google reviews went from 28 to over 200 in six months. That alone brought in enough new customers to justify the entire system ten times over.",
    author: "Ray Thompson",
    position: "Owner, Thompson Tire & Brake",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  },
];

const AutoRepair: React.FC = () => {
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
  useEngagementTracking();

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
          ...getUtmParams(),
          _subject: `[Auto Repair Lead] ${formData.company}`,
        }),
      });
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', company: '', phone: '', challenge: '' });
      }
    } catch {
      // silent fail — form still works via Formspree redirect
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI Systems for Auto Repair Shops & Dealerships | DigitalCraft AI</title>
        <meta name="description" content="AI-powered service advisor chatbot, transparent estimate generator, declined-service follow-up, and voice service reminders for auto repair shops and dealership service centers." />
        <meta property="og:title" content="AI Systems for Auto Repair Shops & Dealerships | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered service advisor chatbot, transparent estimate generator, declined-service follow-up, and voice service reminders for auto repair shops and dealership service centers." />
        <link rel="canonical" href="https://digitalcraftai.com/autorepair" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Auto Repair Shops & Dealerships",
          "description": "AI-powered service advisor chatbot, transparent estimates, declined-service follow-up, and voice service reminders for auto shops and dealership service centers.",
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
          "serviceType": "AI Automation for Auto Repair",
          "offers": [
            { "@type": "Offer", "name": "Single Shop", "price": "500", "priceCurrency": "USD", "description": "For independent shops and single-bay operations" },
            { "@type": "Offer", "name": "Multi-Bay", "price": "1500", "priceCurrency": "USD", "description": "For multi-bay shops and growing service centers" },
            { "@type": "Offer", "name": "Dealership", "price": "5000", "priceCurrency": "USD", "description": "For dealership service departments and multi-location groups" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Will my service advisors need to learn new software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The AI works alongside your existing shop management system. Service advisors keep doing what they do — the AI handles after-hours inquiries, follow-ups, and review requests automatically. No training required."
              }
            },
            {
              "@type": "Question",
              "name": "How does the AI estimate compare to my shop rates?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI uses your actual labor rates, parts markup, and service pricing. Estimates are branded to your shop and match what your service advisors would quote. You control the pricing — the AI just delivers it faster."
              }
            },
            {
              "@type": "Question",
              "name": "Can it integrate with my shop management software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We integrate with major shop management systems including Mitchell, ShopWare, Tekmetric, and dealer DMS platforms. Customer data and repair orders sync automatically."
              }
            },
            {
              "@type": "Question",
              "name": "How does the declined-service follow-up work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "When a customer declines a recommended service, the AI sends a personalized follow-up via text at 7, 30, and 60 days with a reminder about the recommended repair, why it matters for safety, and an easy link to schedule. Recovery rates average 2x compared to no follow-up."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering results. Most shops stay because the ROI is obvious within 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "What makes this different from a CRM or marketing tool?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We build actual AI systems — not templates or drip campaigns. The AI understands automotive repair, can answer technical questions, generate accurate estimates, and have natural voice conversations with your customers. It's a service advisor that never sleeps."
              }
            }
          ]
        })}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* ─── HERO ─── */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-gray-50 to-sky-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Wrench size={16} />
                Built for Auto Shops
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AI Systems Built for{' '}
                <span className="text-primary">Auto Shops & Service Centers</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Build trust with transparent estimates, capture every service inquiry, and keep
                customers coming back — automatically.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <a href="#contact" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                  Get Your Free AI Audit <ArrowRight size={20} />
                </a>
                <Link
                  to="/autorepair/demo"
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
                  src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1000&q=80"
                  alt="Auto repair shop with technician working on vehicle"
                  className="rounded-2xl shadow-lg object-cover h-[400px] w-full relative z-10 transform -rotate-2 transition-transform duration-500 hover:rotate-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SocialProofBar />

      {/* ─── PAIN POINTS ─── */}
      <section className="container-section">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Sound Familiar?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Most auto shops lose revenue and trust to the same problems every day.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PainCard
            icon={<ShieldAlert size={24} />}
            title="Estimate Disputes & Distrust"
            description="Customers question every line item. Without transparent breakdowns, they assume you're overcharging — and take their car somewhere else."
            delay={0}
          />
          <PainCard
            icon={<Clock size={24} />}
            title="Service Advisor Bottleneck"
            description="Your phone rings off the hook. Customers wait 20 minutes for a quote. Meanwhile, the bays are full but the front desk can't keep up."
            delay={150}
          />
          <PainCard
            icon={<PhoneOff size={24} />}
            title="Declined Service Follow-Up"
            description="A customer declines a brake job today. Six months later, they get it done at a competitor. You never followed up because nobody had time."
            delay={300}
          />
          <PainCard
            icon={<Star size={24} />}
            title="Online Review Management"
            description="You have 12 Google reviews. The shop down the street has 300. New customers pick them every time — even though your work is better."
            delay={450}
          />
        </div>
      </section>

      {/* ─── SOLUTIONS ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Build for You</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Custom AI systems designed for how auto repair shops actually operate.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <SolutionCard
            icon={<MessageSquare size={24} />}
            title="AI Service Advisor Chatbot"
            description="Answer every inquiry instantly — even at midnight. Your AI knows your services, prices, and scheduling."
            features={[
              'Website chatbot that qualifies service needs automatically',
              'Answers questions about pricing, parts, and turnaround time',
              'Auto-books service appointments on your calendar',
              'Captures vehicle make, model, year, and symptoms',
            ]}
            delay={0}
          />
          <SolutionCard
            icon={<Calculator size={24} />}
            title="Transparent Estimate Generator"
            description="Build customer trust with clear, itemized estimates in seconds."
            features={[
              'Select service type and vehicle → branded estimate instantly',
              'Uses your actual labor rates and parts markup',
              'Itemized breakdown: parts, labor, shop supplies, tax',
              'Tracks which estimates convert to approved repairs',
            ]}
            delay={150}
          />
          <SolutionCard
            icon={<Car size={24} />}
            title="Automated Declined-Service Follow-Up"
            description="Recover revenue from services customers said 'not today' to."
            features={[
              'AI texts customers at 7, 30, and 60 days post-decline',
              'Personalized reminders tied to their specific vehicle and service',
              'Safety-focused messaging that educates, not pressures',
              'One-tap scheduling link to book the repair',
            ]}
            delay={300}
          />
          <SolutionCard
            icon={<Phone size={24} />}
            title="AI Voice Service Reminders"
            description="Keep customers on schedule with natural voice calls they actually answer."
            features={[
              'Automated calls for oil changes, inspections, and scheduled maintenance',
              'Natural voice AI that sounds like your best service advisor',
              'Handles rescheduling and questions in real time',
              'Reduces no-shows and keeps bays consistently full',
            ]}
            delay={450}
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
            description="We analyze your current operations — call volume, estimate workflow, review count, declined-service recovery — and show you exactly where AI saves you time and money."
            delay={0}
          />
          <StepCard
            number="2"
            icon={<Wrench size={28} />}
            title="Custom Build"
            description="We build your AI systems in 2 weeks, calibrated to your labor rates, parts markup, and shop workflow. No disruption to your bays or front desk."
            delay={200}
          />
          <StepCard
            number="3"
            icon={<Rocket size={28} />}
            title="Launch & Grow"
            description="Go live with ongoing optimization. We monitor performance, improve conversion, and scale the system as your shop grows."
            delay={400}
          />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-gray-900 dark:bg-gray-950 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <StatCard
              value="60%"
              label="fewer estimate disputes with transparent AI breakdowns"
              delay={0}
            />
            <StatCard
              value="<30s"
              label="average inquiry response time with AI service advisor"
              delay={200}
            />
            <StatCard
              value="2x"
              label="declined-service recovery rate with automated follow-up"
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
            to="/autorepair/demo"
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
            Choose the plan that fits your shop. Scale up as you grow.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingTier
            name="Single Shop"
            price="$500"
            originalPrice="$800"
            description="For independent shops and single-bay operations"
            features={[
              'AI Service Advisor chatbot',
              'Review & reputation automation',
              'Basic declined-service follow-up',
              'Monthly performance report',
              'Email support',
            ]}
            delay={0}
          />
          <PricingTier
            name="Multi-Bay"
            price="$1,500"
            originalPrice="$2,500"
            description="For multi-bay shops and growing service centers"
            features={[
              'Everything in Single Shop',
              'Transparent Estimate Generator',
              'Advanced declined-service recovery (7/30/60 day)',
              'Shop management system integration',
              'AI voice service reminders',
              'Weekly strategy call',
            ]}
            highlight
            delay={150}
          />
          <PricingTier
            name="Dealership"
            price="$5,000"
            originalPrice="$8,000"
            description="For dealership service departments and multi-location groups"
            features={[
              'Everything in Multi-Bay',
              'DMS integration (CDK, Reynolds, Dealertrack)',
              'Multi-location support',
              'Custom AI workflows',
              'Priority support & dedicated PM',
              'Quarterly business review',
            ]}
            delay={300}
          />
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
          All plans include a 2-week setup period. No long-term contracts — cancel anytime.
        </p>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <Testimonials
        data={autoRepairTestimonials}
        carouselConfig={{ mobile: 1, tablet: 2, desktop: 3 }}
      />

      {/* ─── FAQ ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions?</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="advisors" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Will my service advisors need to learn new software?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                No. The AI works alongside your existing shop management system. Service advisors
                keep doing what they do — the AI handles after-hours inquiries, follow-ups, and
                review requests automatically. No training required.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="estimates" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How does the AI estimate compare to my shop rates?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                The AI uses your actual labor rates, parts markup, and service pricing. Estimates
                are branded to your shop and match what your service advisors would quote. You
                control the pricing — the AI just delivers it faster.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="integration" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Can it integrate with my shop management software?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Yes. We integrate with major shop management systems including Mitchell, ShopWare,
                Tekmetric, and dealer DMS platforms. Customer data and repair orders sync
                automatically.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="declined" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How does the declined-service follow-up work?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                When a customer declines a recommended service, the AI sends a personalized
                follow-up via text at 7, 30, and 60 days with a reminder about the recommended
                repair, why it matters for safety, and an easy link to schedule. Recovery rates
                average 2x compared to no follow-up.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contract" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What's the contract length?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Month-to-month. No long-term contracts. We earn your business every month by
                delivering results. Most shops stay because the ROI is obvious within 30 days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="different" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What makes this different from a CRM or marketing tool?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                We build actual AI systems — not templates or drip campaigns. The AI understands
                automotive repair, can answer technical questions, generate accurate estimates,
                and have natural voice conversations with your customers. It's a service advisor
                that never sleeps.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ─── LEAD MAGNET ─── */}
      <LeadMagnetSection />

      {/* ─── CONTACT FORM ─── */}
      <section id="contact" className="container-section">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Your Free AI Audit
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We'll analyze your shop operations and show you exactly where AI can save you time
              and win you more customers.
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
                    onClick={() => trackCTAClick('book_discovery_call', 'autorepair_form_success')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    <Calendar size={18} />
                    Book Your Discovery Call Now
                  </a>
                  <Link
                    to="/autorepair/demo"
                    onClick={() => trackCTAClick('explore_demos', 'autorepair_form_success')}
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
                    placeholder="John Smith"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shop / Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="ABC Auto Repair"
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
                    What's your biggest operational challenge?
                  </label>
                  <textarea
                    required
                    value={formData.challenge}
                    onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                    placeholder="e.g., I'm losing customers because estimates take too long..."
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
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <Phone size={14} />
            Prefer to talk? Call us at{' '}
            <a href="tel:+19723523293" className="text-primary hover:underline font-medium">(972) 352-3293</a>
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
      <ExitIntentPopup />
    </div>
  );
};

export default AutoRepair;

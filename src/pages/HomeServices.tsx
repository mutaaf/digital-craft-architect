import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import LiveChatBubble from '@/components/LiveChatBubble';
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
  Bell,
  PhoneOff,
  Clock,
  CalendarX,
  ClipboardCheck,
  Wrench,
  Rocket,
  Check,
  ArrowRight,
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
   MAIN HOME SERVICES PAGE
   ═══════════════════════════════════════════════════════════ */
const homeServicesTestimonials: TestimonialItem[] = [
  {
    quote: "We used to lose half our after-hours calls. Now the AI picks up instantly, qualifies the job, and books it on our schedule. Our booked jobs tripled in two months.",
    author: "Marcus Williams",
    position: "Owner, Williams HVAC Solutions",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "The estimate generator alone paid for itself in the first week. Customers get a ballpark number while they're still on the phone — and they book on the spot.",
    author: "Jennifer Torres",
    position: "Operations Manager, TorresPlumb Co.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "No-shows were killing our schedule. The automated reminders cut them in half, and the review requests turned our happy customers into Google reviews on autopilot.",
    author: "Ryan Carter",
    position: "Founder, Carter Electric & Sons",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
];

const HomeServices: React.FC = () => {
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
          _subject: `[Home Services Lead] ${formData.company}`,
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
        <title>AI Systems for Home Service Companies | DigitalCraft AI</title>
        <meta name="description" content="AI-powered call handling, estimates, appointment reminders, and review automation for HVAC, plumbing, electrical, and landscaping companies." />
        <meta property="og:title" content="AI Systems for Home Service Companies | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered call handling, estimates, appointment reminders, and review automation for HVAC, plumbing, electrical, and landscaping companies." />
        <link rel="canonical" href="https://digitalcraftai.com/homeservices" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Home Service Companies",
          "description": "AI-powered call handling, estimate generation, appointment reminders, and review automation for HVAC, plumbing, electrical, landscaping, and roofing companies.",
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
          "serviceType": "AI Automation for Home Services",
          "offers": [
            { "@type": "Offer", "name": "Solo Operator", "price": "500", "priceCurrency": "USD", "description": "For one-truck operations" },
            { "@type": "Offer", "name": "Growing Team", "price": "1500", "priceCurrency": "USD", "description": "For companies with 3-10 technicians" },
            { "@type": "Offer", "name": "Multi-Crew", "price": "5000", "priceCurrency": "USD", "description": "For established companies running multiple crews" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Does this work for HVAC, plumbing, and electrical?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Our AI systems are built for all home service trades including HVAC, plumbing, electrical, landscaping, roofing, and general handyman services. The lead qualifier and estimate tools adapt to your specific trade and pricing."
              }
            },
            {
              "@type": "Question",
              "name": "Will this replace my dispatcher?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The AI handles the initial call qualification, after-hours inquiries, and appointment confirmations. Your dispatcher still manages the schedule and handles complex situations. Think of it as giving your dispatcher a tireless assistant."
              }
            },
            {
              "@type": "Question",
              "name": "How fast does the AI respond to new leads?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Under 60 seconds, 24/7. Whether it's a midnight emergency or a Sunday afternoon AC breakdown, the AI qualifies the call, collects details, and books the appointment instantly."
              }
            },
            {
              "@type": "Question",
              "name": "What if a customer has an emergency?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI detects emergency keywords like 'flooding', 'no heat', or 'gas smell' and escalates immediately — sending you a priority alert and offering the customer your emergency line. It never leaves emergencies in a queue."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering results. Most clients stay because the ROI is obvious within 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "Can my technicians use this in the field?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Everything works from a phone. Techs get appointment details via text, can trigger review requests with one tap after a job, and the system auto-updates your schedule as jobs are completed."
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
                Built for Home Services
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AI Systems Built for{' '}
                <span className="text-primary">Home Service Companies</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Capture every service call, send instant estimates, and keep your trucks busy — without office staff.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <a href="#contact" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                  Get Your Free AI Audit <ArrowRight size={20} />
                </a>
                <Link
                  to="/homeservices/demo"
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
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80"
                  alt="Home service technician at work"
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
            Home service companies lose revenue to the same problems every single day.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PainCard
            icon={<PhoneOff size={24} />}
            title="Missed Service Calls"
            description="A homeowner's AC dies at 10pm. They call three companies — whoever answers first gets the job. If you don't pick up, you don't exist."
            delay={0}
          />
          <PainCard
            icon={<Clock size={24} />}
            title="Slow Estimate Turnaround"
            description="Every quote means driving out, measuring, calculating, and emailing a proposal days later. By then the customer already hired someone else."
            delay={150}
          />
          <PainCard
            icon={<CalendarX size={24} />}
            title="No-Show Appointments"
            description="Customers forget, double-book, or ghost you entirely. Empty truck rolls cost you time, fuel, and revenue every single week."
            delay={300}
          />
          <PainCard
            icon={<Star size={24} />}
            title="Review Management Gaps"
            description="You finish a perfect job but never ask for a review. Meanwhile, the company with 200+ Google reviews gets all the new calls in your area."
            delay={450}
          />
        </div>
      </section>

      {/* ─── SOLUTIONS ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Build for You</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Custom AI systems designed for how home service companies actually operate.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <SolutionCard
            icon={<MessageSquare size={24} />}
            title="AI Service Call Qualifier"
            description="Never lose another call. Your AI qualifies service requests instantly — 24/7, 365."
            features={[
              'Answers calls and web inquiries in under 60 seconds',
              'Identifies service type, urgency, and equipment details',
              'Detects emergencies and escalates with priority alerts',
              'Auto-books appointments on your dispatch calendar',
            ]}
            delay={0}
          />
          <SolutionCard
            icon={<Calculator size={24} />}
            title="Smart Estimate Generator"
            description="Give customers a ballpark number while they're still on the line."
            features={[
              'Input service type + details for branded estimate',
              'Uses your actual labor rates and parts pricing',
              'Professional layout customers trust immediately',
              'Tracks which estimates convert to booked jobs',
            ]}
            delay={150}
          />
          <SolutionCard
            icon={<Bell size={24} />}
            title="Automated Appointment Reminders"
            description="Cut no-shows in half with smart, multi-touch reminders."
            features={[
              'SMS + email reminders at 24h, 2h, and 30min before arrival',
              'One-tap confirm or reschedule for the customer',
              'Auto-fills cancelled slots from your waitlist',
              'Sends tech ETA and arrival notifications',
            ]}
            delay={300}
          />
          <SolutionCard
            icon={<Star size={24} />}
            title="AI Review & Follow-Up System"
            description="Turn every completed job into a 5-star Google review automatically."
            features={[
              'Auto-sends review request after job completion',
              'Day 3 and Day 7 follow-ups for non-responders',
              'AI generates professional responses to all reviews',
              'Monitors Google, Yelp, and Nextdoor in one dashboard',
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
            description="We analyze your call flow, scheduling, estimating, and reviews — then show you exactly where AI saves you time and books more jobs."
            delay={0}
          />
          <StepCard
            number="2"
            icon={<Wrench size={28} />}
            title="Custom Build"
            description="We build your AI systems in 2 weeks, tailored to your pricing, service area, and dispatch workflow. Zero disruption to your techs."
            delay={200}
          />
          <StepCard
            number="3"
            icon={<Rocket size={28} />}
            title="Launch & Grow"
            description="Go live with ongoing optimization. We monitor performance, make improvements, and scale the system as your business grows."
            delay={400}
          />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-gray-900 dark:bg-gray-950 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <StatCard
              value="3x"
              label="more booked jobs with instant AI call response"
              delay={0}
            />
            <StatCard
              value="<60s"
              label="average response time to new service requests"
              delay={200}
            />
            <StatCard
              value="50%"
              label="fewer no-shows with automated appointment reminders"
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
            to="/homeservices/demo"
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
            Choose the plan that fits your operation. Scale up as you grow.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingTier
            name="Solo Operator"
            price="$500"
            originalPrice="$800"
            description="For one-truck operations"
            features={[
              'AI Service Call Qualifier',
              'Review & follow-up automation',
              'Basic appointment reminders (SMS)',
              'Monthly performance report',
              'Email support',
            ]}
            delay={0}
          />
          <PricingTier
            name="Growing Team"
            price="$1,500"
            originalPrice="$2,500"
            description="For companies with 3-10 technicians"
            features={[
              'Everything in Solo Operator',
              'Smart Estimate Generator',
              'Multi-touch appointment reminders',
              'CRM integration & lead scoring',
              'AI voice follow-up calls',
              'Weekly strategy call',
            ]}
            highlight
            delay={150}
          />
          <PricingTier
            name="Multi-Crew"
            price="$5,000"
            originalPrice="$8,000"
            description="For established companies running multiple crews"
            features={[
              'Everything in Growing Team',
              'Multi-location dispatch support',
              'Custom AI workflows per trade',
              'Waitlist management & auto-fill',
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
        data={homeServicesTestimonials}
        carouselConfig={{ mobile: 1, tablet: 2, desktop: 3 }}
      />

      {/* ─── FAQ ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions?</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="trades" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Does this work for HVAC, plumbing, and electrical?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Yes. Our AI systems are built for all home service trades including HVAC, plumbing,
                electrical, landscaping, roofing, and general handyman services. The lead qualifier
                and estimate tools adapt to your specific trade and pricing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dispatcher" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Will this replace my dispatcher?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                No. The AI handles the initial call qualification, after-hours inquiries, and
                appointment confirmations. Your dispatcher still manages the schedule and handles
                complex situations. Think of it as giving your dispatcher a tireless assistant.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="response" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How fast does the AI respond to new leads?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Under 60 seconds, 24/7. Whether it's a midnight emergency or a Sunday afternoon
                AC breakdown, the AI qualifies the call, collects details, and books the appointment
                instantly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="emergency" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What if a customer has an emergency?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                The AI detects emergency keywords like "flooding", "no heat", or "gas smell" and
                escalates immediately — sending you a priority alert and offering the customer your
                emergency line. It never leaves emergencies in a queue.
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

            <AccordionItem value="field" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Can my technicians use this in the field?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Everything works from a phone. Techs get appointment details via text, can trigger
                review requests with one tap after a job, and the system auto-updates your schedule
                as jobs are completed.
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
              We'll analyze your operations and show you exactly where AI can save you time and
              book more jobs.
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
                    onClick={() => trackCTAClick('book_discovery_call', 'homeservices_form_success')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    <Calendar size={18} />
                    Book Your Discovery Call Now
                  </a>
                  <Link
                    to="/homeservices/demo"
                    onClick={() => trackCTAClick('explore_demos', 'homeservices_form_success')}
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
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="ABC Plumbing & HVAC"
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
                    placeholder="e.g., I'm losing after-hours calls and my no-show rate is killing my schedule..."
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
      <LiveChatBubble />
    </div>
  );
};

export default HomeServices;

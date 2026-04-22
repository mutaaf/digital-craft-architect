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
  CalendarX,
  UserX,
  ShoppingBag,
  TrendingDown,
  ClipboardCheck,
  Wrench,
  Rocket,
  Check,
  ArrowRight,
  Scissors,
  Sparkles,
  Calendar,
  Play,
  Phone,
  Bell,
  Mic,
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
   MAIN SALON PAGE
   ═══════════════════════════════════════════════════════════ */
const salonTestimonials: TestimonialItem[] = [
  {
    quote: "No-shows were killing our revenue. Since adding the AI rebooking system, cancellations are down by half and our chairs stay full. It basically pays for itself in the first week.",
    author: "Jasmine Torres",
    position: "Owner, Glow Beauty Studio",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Our front desk used to spend hours on the phone confirming appointments and chasing rebookings. Now the AI handles all of it and our team can focus on the client experience.",
    author: "Marcus Chen",
    position: "Managing Director, Luxe Salon Group",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Retail product sales jumped 30% after we started using the AI service estimator. It suggests add-ons at the perfect moment and clients love the personalized recommendations.",
    author: "Priya Sharma",
    position: "Spa Director, Serenity Wellness Spa",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
];

const Salon: React.FC = () => {
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
          _subject: `[Salon Lead] ${formData.company}`,
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
        <title>AI Systems for Salons & Spas | DigitalCraft AI</title>
        <meta name="description" content="AI-powered booking, rebooking, service estimating, and voice outreach for salons and spas. Fill your chairs and reduce no-shows automatically." />
        <meta property="og:title" content="AI Systems for Salons & Spas | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered booking, rebooking, service estimating, and voice outreach for salons and spas. Fill your chairs and reduce no-shows automatically." />
        <link rel="canonical" href="https://digitalcraftai.com/salon" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Salons & Spas",
          "description": "AI-powered booking qualification, service estimating, rebooking automation, and voice client outreach for salons and spas.",
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
          "serviceType": "AI Automation for Salons & Spas",
          "offers": [
            { "@type": "Offer", "name": "Solo Stylist", "price": "300", "priceCurrency": "USD", "description": "For independent stylists and solo chairs" },
            { "@type": "Offer", "name": "Salon", "price": "1000", "priceCurrency": "USD", "description": "For salons with 3-10 stylists" },
            { "@type": "Offer", "name": "Multi-Location", "price": "3500", "priceCurrency": "USD", "description": "For salon groups and franchise locations" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Will my stylists need to learn new software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The AI works behind the scenes with your existing booking system. Stylists keep doing what they do best — the AI handles appointment reminders, rebooking, and client follow-ups automatically."
              }
            },
            {
              "@type": "Question",
              "name": "How quickly will I see fewer no-shows?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most salons see a measurable drop in no-shows within the first two weeks. The AI sends smart reminders, offers easy rescheduling, and fills cancelled slots from the waitlist automatically."
              }
            },
            {
              "@type": "Question",
              "name": "Does it work with my booking system?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We integrate with all major salon booking platforms including Vagaro, Fresha, Booker, Boulevard, and Square Appointments. If you use a different system, we can usually build a custom integration."
              }
            },
            {
              "@type": "Question",
              "name": "Can the AI recommend services and products?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. The AI analyzes each client's service history and preferences to suggest relevant add-ons, treatments, and retail products at the perfect moment — during booking, after their appointment, or via follow-up messages."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by keeping your chairs full and your revenue growing. Most salons stay because the ROI is obvious within 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "How is this different from my booking platform's built-in reminders?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Built-in reminders send generic messages. Our AI personalizes every touchpoint — it knows which clients tend to cancel, which ones haven't rebooked, and what services to recommend. It also handles voice outreach, not just text, and actively fills gaps in your schedule."
              }
            }
          ]
        })}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* ─── HERO ─── */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-gray-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Scissors size={16} />
                Built for Salons & Spas
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AI Systems Built for{' '}
                <span className="text-primary">Salons & Spas</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Fill your chairs, reduce no-shows, and rebook every client — without extra front desk work.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <a href="#contact" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                  Get Your Free AI Audit <ArrowRight size={20} />
                </a>
                <Link
                  to="/salon/demo"
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
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern salon interior with styling chairs"
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
            Most salons and spas lose revenue to the same problems every day.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PainCard
            icon={<CalendarX size={24} />}
            title="Last-Minute Cancellations"
            description="A client cancels 30 minutes before their appointment. The chair sits empty for an hour. You lose $150+ and have no way to fill the slot."
            delay={0}
          />
          <PainCard
            icon={<UserX size={24} />}
            title="Missed Rebooking Opportunities"
            description="Clients walk out after a great service and never rebook. Three months later, they've found a new stylist. You never even followed up."
            delay={150}
          />
          <PainCard
            icon={<ShoppingBag size={24} />}
            title="Retail Upsell Gaps"
            description="Your shelves are stocked with premium products, but stylists forget to recommend them. Retail revenue sits at a fraction of what it could be."
            delay={300}
          />
          <PainCard
            icon={<TrendingDown size={24} />}
            title="Client Retention Drops"
            description="You're spending on ads to attract new clients while existing ones quietly lapse. Nobody notices until the chair traffic drops and it's too late."
            delay={450}
          />
        </div>
      </section>

      {/* ─── SOLUTIONS ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Build for You</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Custom AI systems designed for how salons and spas actually work.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <SolutionCard
            icon={<MessageSquare size={24} />}
            title="AI Booking Assistant"
            description="Qualify new clients, answer service questions, and book appointments 24/7 — no front desk needed."
            features={[
              'Website chatbot that captures client preferences instantly',
              'Automated appointment confirmations and reminders',
              'Smart waitlist that fills cancelled slots in minutes',
              'Captures hair type, service history, and scheduling preferences',
            ]}
            delay={0}
          />
          <SolutionCard
            icon={<Calculator size={24} />}
            title="Smart Service & Package Estimator"
            description="Clients see personalized pricing for services, add-ons, and packages before they even walk in."
            features={[
              'Interactive service menu with real-time pricing',
              'Package builder with automatic discounts',
              'Suggests add-ons based on selected services',
              'Branded output clients can share with friends',
            ]}
            delay={150}
          />
          <SolutionCard
            icon={<Bell size={24} />}
            title="Automated Rebooking Reminders"
            description="Never lose a client to forgetfulness again. Smart follow-ups that bring them back on schedule."
            features={[
              'Personalized rebooking messages based on service cycle',
              'Day 7 and Day 21 follow-up sequences',
              'One-tap rebooking links in every message',
              'Tracks lapsed clients and triggers win-back campaigns',
            ]}
            delay={300}
          />
          <SolutionCard
            icon={<Mic size={24} />}
            title="AI Voice Client Outreach"
            description="The AI calls lapsed clients with a friendly, natural voice to bring them back into the chair."
            features={[
              'Natural voice calls to inactive clients',
              'Personalized scripts based on past services',
              'Books appointments directly during the call',
              'Full call transcripts and rebooking analytics',
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
            description="We analyze your booking flow, rebooking rate, no-show patterns, and retail gaps — then show you exactly where AI fills the revenue leaks."
            delay={0}
          />
          <StepCard
            number="2"
            icon={<Wrench size={28} />}
            title="Custom Build"
            description="We build your AI systems in 2 weeks, tailored to your service menu, pricing, and brand. Zero disruption to your stylists or front desk."
            delay={200}
          />
          <StepCard
            number="3"
            icon={<Rocket size={28} />}
            title="Launch & Grow"
            description="Go live with ongoing optimization. We monitor no-show rates, rebooking metrics, and revenue impact — then scale what's working."
            delay={400}
          />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-gray-900 dark:bg-gray-950 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <StatCard
              value="50%"
              label="fewer no-shows with AI reminders and smart waitlist"
              delay={0}
            />
            <StatCard
              value="2x"
              label="rebooking rate with personalized follow-up sequences"
              delay={200}
            />
            <StatCard
              value="30%"
              label="more retail revenue from AI-powered product recommendations"
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
            to="/salon/demo"
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
            Choose the plan that fits your salon. Scale up as you grow.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingTier
            name="Solo Stylist"
            price="$300"
            originalPrice="$500"
            description="For independent stylists and solo chairs"
            features={[
              'AI Booking Assistant chatbot',
              'Automated rebooking reminders',
              'No-show reduction system',
              'Monthly performance report',
              'Email support',
            ]}
            delay={0}
          />
          <PricingTier
            name="Salon"
            price="$1,000"
            originalPrice="$1,700"
            description="For salons with 3-10 stylists"
            features={[
              'Everything in Solo Stylist',
              'Smart Service & Package Estimator',
              'Retail product recommendation engine',
              'Client retention scoring & alerts',
              'AI voice outreach for lapsed clients',
              'Weekly strategy call',
            ]}
            highlight
            delay={150}
          />
          <PricingTier
            name="Multi-Location"
            price="$3,500"
            originalPrice="$5,500"
            description="For salon groups and franchise locations"
            features={[
              'Everything in Salon',
              'Multi-location dashboard & reporting',
              'Custom AI workflows per location',
              'Centralized client database',
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
        data={salonTestimonials}
        carouselConfig={{ mobile: 1, tablet: 2, desktop: 3 }}
      />

      {/* ─── FAQ ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions?</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="stylists" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Will my stylists need to learn new software?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                No. The AI works behind the scenes with your existing booking system. Stylists keep
                doing what they do best — the AI handles appointment reminders, rebooking, and client
                follow-ups automatically.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="noshows" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How quickly will I see fewer no-shows?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Most salons see a measurable drop in no-shows within the first two weeks. The AI sends
                smart reminders, offers easy rescheduling, and fills cancelled slots from the waitlist
                automatically.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="booking" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Does it work with my booking system?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Yes. We integrate with all major salon booking platforms including Vagaro, Fresha,
                Booker, Boulevard, and Square Appointments. If you use a different system, we can
                usually build a custom integration.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="upsell" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Can the AI recommend services and products?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Absolutely. The AI analyzes each client's service history and preferences to suggest
                relevant add-ons, treatments, and retail products at the perfect moment — during
                booking, after their appointment, or via follow-up messages.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contract" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What's the contract length?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Month-to-month. No long-term contracts. We earn your business every month by keeping
                your chairs full and your revenue growing. Most salons stay because the ROI is obvious
                within 30 days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="different" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How is this different from my booking platform's built-in reminders?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Built-in reminders send generic messages. Our AI personalizes every touchpoint — it
                knows which clients tend to cancel, which ones haven't rebooked, and what services to
                recommend. It also handles voice outreach, not just text, and actively fills gaps in
                your schedule.
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
              We'll analyze your booking flow, no-show rate, and retention gaps — then show you
              exactly where AI fills the revenue leaks.
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
                    onClick={() => trackCTAClick('book_discovery_call', 'salon_form_success')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    <Calendar size={18} />
                    Book Your Discovery Call Now
                  </a>
                  <Link
                    to="/salon/demo"
                    onClick={() => trackCTAClick('explore_demos', 'salon_form_success')}
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
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Salon / Spa Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Glow Beauty Studio"
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
                    placeholder="e.g., Too many no-shows and I can't keep chairs full..."
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

export default Salon;

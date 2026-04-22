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
  PhoneOff,
  Clock,
  TrendingUp,
  CalendarX,
  ClipboardCheck,
  Wrench,
  Rocket,
  Check,
  ArrowRight,
  PartyPopper,
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
   MAIN KIDS PLAY PAGE
   ═══════════════════════════════════════════════════════════ */
const kidsPlayTestimonials: TestimonialItem[] = [
  {
    quote: "We went from losing half our party inquiries to booking 3x more birthday parties per month. The AI handles everything while my staff focuses on making kids smile.",
    author: "Jessica Torres",
    position: "Owner, FunZone Indoor Playground",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Parents used to call and get voicemail during our busiest hours. Now the AI qualifies every inquiry instantly and sends them a package breakdown before we even pick up the phone.",
    author: "Marcus Chen",
    position: "GM, JumpStart Family Fun Center",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "No-shows were killing us. The automated reminders and follow-ups cut our no-show rate by 35% in the first month. That's thousands of dollars back in our pocket.",
    author: "Amanda Reyes",
    position: "Director, Little Explorers Play Cafe",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
];

const KidsPlay: React.FC = () => {
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
          _subject: `[Kids Play Lead] ${formData.company}`,
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
        <title>AI Systems for Kids Play Places & Family Entertainment | DigitalCraft AI</title>
        <meta name="description" content="AI-powered party booking, parent inquiry response, and venue automation for kids play places, indoor playgrounds, and family entertainment centers." />
        <meta property="og:title" content="AI Systems for Kids Play Places & Family Entertainment | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered party booking, parent inquiry response, and venue automation for kids play places, indoor playgrounds, and family entertainment centers." />
        <link rel="canonical" href="https://digitalcraftai.com/kidsplay" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Kids Play Places & Family Entertainment",
          "description": "AI-powered party booking qualification, package estimation, parent follow-up, and voice booking for kids play places, indoor playgrounds, trampoline parks, and family entertainment centers.",
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
          "serviceType": "AI Automation for Family Entertainment",
          "offers": [
            { "@type": "Offer", "name": "Single Venue", "price": "400", "priceCurrency": "USD", "description": "For single-location play places" },
            { "@type": "Offer", "name": "Multi-Venue", "price": "1200", "priceCurrency": "USD", "description": "For operators with 2-5 locations" },
            { "@type": "Offer", "name": "Franchise", "price": "4000", "priceCurrency": "USD", "description": "For franchise networks and large chains" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Will parents be talking to a robot?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI is designed to feel natural and helpful, not robotic. It answers questions about party packages, pricing, and availability the same way your best front desk staff would — just faster and available 24/7. Parents can always reach a human if they prefer."
              }
            },
            {
              "@type": "Question",
              "name": "How does the AI handle party bookings?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI qualifies each inquiry by asking about party size, child's age, preferred date, and package preferences. It provides instant pricing, checks availability, and either books directly or hands off to your staff with all the details pre-filled."
              }
            },
            {
              "@type": "Question",
              "name": "Can the AI handle our seasonal busy periods?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Unlike human staff, the AI scales instantly. Whether you get 5 inquiries or 500 on a Saturday morning, every parent gets an immediate, personalized response. No hold times, no missed calls."
              }
            },
            {
              "@type": "Question",
              "name": "What if we already have a booking system?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We integrate with your existing booking system. The AI chatbot sits on top of your current website and feeds qualified leads directly into your calendar or POS system. We don't replace what's working — we make it smarter."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering results. Most venues stay because the ROI is obvious within the first 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "How quickly can we get started?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most venues are fully set up within 2 weeks. We configure the AI with your party packages, pricing, availability, and branding. Your staff doesn't need to learn anything new — the AI works behind the scenes."
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
                <PartyPopper size={16} />
                Built for Family Entertainment
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AI Systems Built for{' '}
                <span className="text-primary">Kids Play Places & Family Entertainment</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Automate party bookings, respond to every parent's inquiry, and fill your venue — without extra front desk staff.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <a href="#contact" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                  Get Your Free AI Audit <ArrowRight size={20} />
                </a>
                <Link
                  to="/kidsplay/demo"
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
                  src="https://images.unsplash.com/photo-1566140967404-b8b3932483f5?auto=format&fit=crop&w=1000&q=80"
                  alt="Kids playing at an indoor family entertainment center"
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
            Most kids play places lose bookings and revenue to the same problems every week.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PainCard
            icon={<CalendarX size={24} />}
            title="Birthday Party Booking Chaos"
            description="Parents call to book a party, get voicemail, and book somewhere else. Your front desk is too busy with walk-ins to answer every call."
            delay={0}
          />
          <PainCard
            icon={<PhoneOff size={24} />}
            title="Missed Parent Inquiries"
            description="A parent fills out your contact form at 10pm. No one responds until Monday. By then, they've already booked with a competitor."
            delay={150}
          />
          <PainCard
            icon={<TrendingUp size={24} />}
            title="Seasonal Demand Spikes"
            description="Summer and school breaks flood you with inquiries. Your staff can't keep up, and you lose bookings you should have won."
            delay={300}
          />
          <PainCard
            icon={<Clock size={24} />}
            title="Walk-in vs. Pre-book Confusion"
            description="Parents show up expecting availability. Party rooms are booked. Walk-in pricing isn't clear. Everyone's frustrated and your staff is scrambling."
            delay={450}
          />
        </div>
      </section>

      {/* ─── SOLUTIONS ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Build for You</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Custom AI systems designed for how family entertainment venues actually operate.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          <SolutionCard
            icon={<MessageSquare size={24} />}
            title="AI Party Booking Qualifier"
            description="Never lose another party inquiry. Your AI assistant responds instantly to every parent — 24/7, 365."
            features={[
              'Qualifies party size, age group, date, and package preference',
              'Sends instant pricing and availability to parents',
              'Auto-books parties or hands off to staff with full details',
              'Handles follow-up questions about add-ons and upgrades',
            ]}
            delay={0}
          />
          <SolutionCard
            icon={<Calculator size={24} />}
            title="Smart Package & Pricing Estimator"
            description="Parents see exactly what they'll pay before they even call."
            features={[
              'Interactive package builder with real-time pricing',
              'Add-ons like face painting, characters, food packages',
              'Branded PDF quotes sent automatically',
              'Tracks which packages convert best',
            ]}
            delay={150}
          />
          <SolutionCard
            icon={<MessageSquare size={24} />}
            title="Automated Parent Follow-Up"
            description="Turn every inquiry into a confirmed booking with smart follow-ups."
            features={[
              'Automatic reminder texts before party date',
              'Follow-up with parents who inquired but didn\'t book',
              'Post-party review and feedback requests',
              'Re-engagement campaigns for repeat bookings',
            ]}
            delay={300}
          />
          <SolutionCard
            icon={<Phone size={24} />}
            title="AI Voice Booking Agent"
            description="Let parents call and book parties by speaking naturally to your AI."
            features={[
              'Handles inbound calls when staff is busy',
              'Answers questions about packages, pricing, and availability',
              'Books parties and sends confirmation texts',
              'Escalates complex requests to your team',
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
            title="Free Venue Audit"
            description="We analyze your booking flow, inquiry response times, and party packages to show you exactly where AI saves you time and fills more slots."
            delay={0}
          />
          <StepCard
            number="2"
            icon={<Wrench size={28} />}
            title="Custom Build"
            description="We configure your AI with your packages, pricing, availability, and branding in 2 weeks. No disruption to your daily operations."
            delay={200}
          />
          <StepCard
            number="3"
            icon={<Rocket size={28} />}
            title="Launch & Grow"
            description="Go live with ongoing optimization. We monitor booking conversions, improve response quality, and scale the system as your venue grows."
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
              label="more party bookings with instant AI response"
              delay={0}
            />
            <StatCard
              value="<60s"
              label="average inquiry response time"
              delay={200}
            />
            <StatCard
              value="35%"
              label="fewer no-shows with automated reminders"
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
            to="/kidsplay/demo"
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
            Choose the plan that fits your venue. Scale up as you grow.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingTier
            name="Single Venue"
            price="$400"
            originalPrice="$650"
            description="For single-location play places"
            features={[
              'AI Party Booking Qualifier chatbot',
              'Automated parent follow-up sequences',
              'Smart package pricing widget',
              'Monthly performance report',
              'Email support',
            ]}
            delay={0}
          />
          <PricingTier
            name="Multi-Venue"
            price="$1,200"
            originalPrice="$2,000"
            description="For operators with 2-5 locations"
            features={[
              'Everything in Single Venue',
              'Smart Party Package Estimator',
              'AI Voice Booking Agent',
              'Multi-location booking management',
              'Review & reputation automation',
              'Weekly strategy call',
            ]}
            highlight
            delay={150}
          />
          <PricingTier
            name="Franchise"
            price="$4,000"
            originalPrice="$6,500"
            description="For franchise networks and large chains"
            features={[
              'Everything in Multi-Venue',
              'Custom AI workflows per location',
              'Centralized analytics dashboard',
              'Priority support & dedicated PM',
              'CRM integration & lead scoring',
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
        data={kidsPlayTestimonials}
        carouselConfig={{ mobile: 1, tablet: 2, desktop: 3 }}
      />

      {/* ─── FAQ ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions?</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="robot" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Will parents be talking to a robot?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                The AI is designed to feel natural and helpful, not robotic. It answers questions
                about party packages, pricing, and availability the same way your best front desk
                staff would — just faster and available 24/7. Parents can always reach a human if
                they prefer.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bookings" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How does the AI handle party bookings?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                The AI qualifies each inquiry by asking about party size, child's age, preferred
                date, and package preferences. It provides instant pricing, checks availability,
                and either books directly or hands off to your staff with all the details
                pre-filled.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="seasonal" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Can the AI handle our seasonal busy periods?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Absolutely. Unlike human staff, the AI scales instantly. Whether you get 5
                inquiries or 500 on a Saturday morning, every parent gets an immediate,
                personalized response. No hold times, no missed calls.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="existing" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What if we already have a booking system?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                We integrate with your existing booking system. The AI chatbot sits on top of
                your current website and feeds qualified leads directly into your calendar or
                POS system. We don't replace what's working — we make it smarter.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contract" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What's the contract length?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Month-to-month. No long-term contracts. We earn your business every month by
                delivering results. Most venues stay because the ROI is obvious within the first
                30 days.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="setup" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How quickly can we get started?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Most venues are fully set up within 2 weeks. We configure the AI with your
                party packages, pricing, availability, and branding. Your staff doesn't need
                to learn anything new — the AI works behind the scenes.
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
              We'll analyze your booking flow and show you exactly where AI can fill more
              party slots and win you more families.
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
                    onClick={() => trackCTAClick('book_discovery_call', 'kidsplay_form_success')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    <Calendar size={18} />
                    Book Your Discovery Call Now
                  </a>
                  <Link
                    to="/kidsplay/demo"
                    onClick={() => trackCTAClick('explore_demos', 'kidsplay_form_success')}
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
                    placeholder="Sarah Johnson"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="FunZone Indoor Playground"
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
                    placeholder="e.g., We're losing party bookings because we can't respond fast enough..."
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

export default KidsPlay;

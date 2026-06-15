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
import { submitLead } from '@/utils/submitLead';
import {
  MessageSquare,
  Calculator,
  Star,
  UtensilsCrossed,
  CalendarX,
  PhoneOff,
  Clock,
  ClipboardCheck,
  Wrench,
  Rocket,
  Check,
  ArrowRight,
  Sparkles,
  Calendar,
  Play,
  Phone,
  Bot,
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
   MAIN RESTAURANT PAGE
   ═══════════════════════════════════════════════════════════ */
const restaurantTestimonials: TestimonialItem[] = [
  {
    quote: "We cut no-shows by almost half after the AI started sending reservation confirmations and reminders. The ROI paid for itself in the first month.",
    author: "Maria Gonzalez",
    position: "Owner, La Mesa Kitchen",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Catering inquiries used to sit in our inbox for days. Now the AI responds instantly with a personalized quote. We've doubled our event bookings this quarter.",
    author: "James Chen",
    position: "GM, Jade Garden Restaurant Group",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Our Google rating jumped from 3.8 to 4.6 in three months. The review automation is hands-down the best investment we've made outside the kitchen.",
    author: "Rachel Kim",
    position: "Owner, Seoul Bowl",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
];

const Restaurant: React.FC = () => {
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
      const response = await submitLead({
        ...formData,
        ...getUtmParams(),
        _subject: `[Restaurant Lead] ${formData.company}`,
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
        <title>AI Systems for Restaurants | DigitalCraft AI</title>
        <meta name="description" content="AI-powered reservation management, catering estimates, review automation, and voice ordering for restaurants and food service businesses." />
        <meta property="og:title" content="AI Systems for Restaurants | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered reservation management, catering estimates, review automation, and voice ordering for restaurants and food service businesses." />
        <link rel="canonical" href="https://digitalcraftai.com/restaurant" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Restaurants & Food Service",
          "description": "AI-powered reservation management, catering estimates, review automation, and voice ordering for restaurants and food service businesses.",
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
          "serviceType": "AI Automation for Restaurants",
          "offers": [
            { "@type": "Offer", "name": "Single Location", "price": "500", "priceCurrency": "USD", "description": "For independent restaurants and cafes" },
            { "@type": "Offer", "name": "Multi-Location", "price": "1500", "priceCurrency": "USD", "description": "For restaurant groups with 2-10 locations" },
            { "@type": "Offer", "name": "Franchise", "price": "5000", "priceCurrency": "USD", "description": "For franchise operations and large chains" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Will the AI work with my existing POS and reservation system?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We integrate with all major POS systems (Toast, Square, Clover) and reservation platforms (OpenTable, Resy, Yelp Reservations). The AI works alongside your current tools — no rip-and-replace required."
              }
            },
            {
              "@type": "Question",
              "name": "How does the AI reduce no-shows?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI sends automated confirmation texts when a reservation is made, a reminder 24 hours before, and a same-day nudge 2 hours before the reservation. It also offers easy rescheduling links, which converts cancellations into rebookings instead of empty tables."
              }
            },
            {
              "@type": "Question",
              "name": "Can the AI handle catering quotes accurately?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. The Smart Catering Estimator uses your actual menu pricing, per-head costs, and add-on options to generate branded estimates in under 60 seconds. You control the pricing tiers and the AI does the math and formatting."
              }
            },
            {
              "@type": "Question",
              "name": "What happens if a customer asks something the AI can't answer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI gracefully hands off to your staff. It collects the customer's contact info, summarizes their question, and sends an alert so your team can follow up personally. No customer ever hits a dead end."
              }
            },
            {
              "@type": "Question",
              "name": "How long does setup take?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most restaurants are live within 2 weeks. We handle the technical setup, train the AI on your menu and policies, and test everything before launch. Your staff doesn't need to learn any new software."
              }
            },
            {
              "@type": "Question",
              "name": "Is there a long-term contract?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. All plans are month-to-month. We earn your business every month by delivering measurable results. Most clients stay because the ROI is obvious within the first 30 days."
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
                <UtensilsCrossed size={16} />
                Built for Restaurants
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AI Systems Built for{' '}
                <span className="text-primary">Restaurants & Food Service</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Automate reservations, respond to every inquiry, and manage your reputation — without
                adding staff.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <a href="#contact" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                  Get Your Free AI Audit <ArrowRight size={20} />
                </a>
                <Link
                  to="/restaurant/demo"
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
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"
                  alt="Elegant restaurant interior with warm lighting"
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
            Most restaurants lose revenue to the same problems every single day.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PainCard
            icon={<CalendarX size={24} />}
            title="Reservation No-Shows"
            description="A table sits empty because someone booked and never showed. No confirmation, no reminder, no way to fill the spot. Revenue gone."
            delay={0}
          />
          <PainCard
            icon={<Star size={24} />}
            title="Slow Review Responses"
            description="A one-star review sits unanswered for weeks. Potential diners see it and go somewhere else. Your online reputation suffers silently."
            delay={150}
          />
          <PainCard
            icon={<PhoneOff size={24} />}
            title="Missed Catering Inquiries"
            description="A corporate client emails about a 200-person lunch. You're slammed during service and don't reply for 3 days. They've already booked someone else."
            delay={300}
          />
          <PainCard
            icon={<Clock size={24} />}
            title="Online Order Chaos"
            description="Phone rings nonstop during rush. Staff juggle dine-in, takeout, and delivery orders. Mistakes pile up and customers get frustrated."
            delay={450}
          />
        </div>
      </section>

      {/* ─── SOLUTIONS ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Build for You</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Custom AI systems designed for how restaurants actually operate.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SolutionCard
            icon={<MessageSquare size={24} />}
            title="AI Reservation & Inquiry Handler"
            description="Never miss a reservation or inquiry again. Your AI responds instantly — 24/7, 365."
            features={[
              'Website chatbot that books tables and answers menu questions',
              'Automated confirmation + reminder texts to cut no-shows',
              'Handles dietary restriction and special occasion requests',
              'Routes catering and private event inquiries to your team',
            ]}
            delay={0}
          />
          <SolutionCard
            icon={<Calculator size={24} />}
            title="Smart Catering Estimator"
            description="Turn catering inquiries into instant, branded quotes."
            features={[
              'Select event type + guest count for instant estimate',
              'Uses your actual menu pricing and per-head costs',
              'Professional PDF proposals your clients will love',
              'Tracks which quotes convert to booked events',
            ]}
            delay={150}
          />
          <SolutionCard
            icon={<Star size={24} />}
            title="AI Review Manager"
            description="Go from ignored reviews to a 4.5+ rating, automatically."
            features={[
              'Auto-sends review requests after each visit',
              'AI generates thoughtful responses to every review',
              'Monitors Google, Yelp, and TripAdvisor in one place',
              'Alerts you to negative reviews for immediate action',
            ]}
            delay={300}
          />
          <SolutionCard
            icon={<Mic size={24} />}
            title="AI Voice Ordering Agent"
            description="Let AI handle phone orders so your staff can focus on guests."
            features={[
              'Natural voice AI takes takeout and delivery orders by phone',
              'Upsells appetizers, desserts, and drinks automatically',
              'Integrates with your POS for seamless order flow',
              'Handles peak-hour call volume without hold times',
            ]}
            delay={450}
          />
          <SolutionCard
            icon={<Bot size={24} />}
            title="Guest Communication Bot"
            description="Keep guests informed and coming back with zero extra work."
            features={[
              'Automated post-visit thank-you messages',
              'Birthday and anniversary reminders with special offers',
              'Waitlist management with real-time text updates',
              'Reduces front-of-house phone interruptions by 70%',
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
            title="Enter Your Website"
            description="We scrape your restaurant's site to learn your menu, hours, location, and brand voice. The AI personalizes everything to your business automatically."
            delay={0}
          />
          <StepCard
            number="2"
            icon={<Wrench size={28} />}
            title="AI Personalizes Your Tools"
            description="Within minutes, your AI reservation handler, catering estimator, and review manager are configured with your actual data — no manual setup required."
            delay={200}
          />
          <StepCard
            number="3"
            icon={<Rocket size={28} />}
            title="Go Live & Grow"
            description="Launch your AI systems with ongoing optimization. We monitor performance, make improvements, and scale as your business grows."
            delay={400}
          />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-gray-900 dark:bg-gray-950 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <StatCard
              value="40%"
              label="fewer no-shows with automated confirmations and reminders"
              delay={0}
            />
            <StatCard
              value="<30s"
              label="average response time to guest inquiries and reservation requests"
              delay={200}
            />
            <StatCard
              value="2x"
              label="more catering bookings with instant AI-generated quotes"
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
            to="/restaurant/demo"
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
            Choose the plan that fits your restaurant. Scale up as you grow.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingTier
            name="Single Location"
            price="$500"
            originalPrice="$800"
            description="For independent restaurants and cafes"
            features={[
              'AI Reservation & Inquiry Handler',
              'Review & reputation automation',
              'Automated confirmation & reminder texts',
              'Monthly performance report',
              'Email support',
            ]}
            delay={0}
          />
          <PricingTier
            name="Multi-Location"
            price="$1,500"
            originalPrice="$2,500"
            description="For restaurant groups with 2-10 locations"
            features={[
              'Everything in Single Location',
              'Smart Catering Estimator',
              'AI Voice Ordering Agent',
              'Cross-location analytics dashboard',
              'CRM integration & guest profiles',
              'Weekly strategy call',
            ]}
            highlight
            delay={150}
          />
          <PricingTier
            name="Franchise"
            price="$5,000"
            originalPrice="$8,000"
            description="For franchise operations and large chains"
            features={[
              'Everything in Multi-Location',
              'Guest Communication Bot',
              'Custom AI workflows per location',
              'Unlimited locations',
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
        data={restaurantTestimonials}
        carouselConfig={{ mobile: 1, tablet: 2, desktop: 3 }}
      />

      {/* ─── FAQ ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions?</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="pos" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Will the AI work with my existing POS and reservation system?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Yes. We integrate with all major POS systems (Toast, Square, Clover) and reservation
                platforms (OpenTable, Resy, Yelp Reservations). The AI works alongside your current
                tools — no rip-and-replace required.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="noshows" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How does the AI reduce no-shows?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                The AI sends automated confirmation texts when a reservation is made, a reminder 24
                hours before, and a same-day nudge 2 hours before the reservation. It also offers easy
                rescheduling links, which converts cancellations into rebookings instead of empty tables.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="catering" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Can the AI handle catering quotes accurately?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Absolutely. The Smart Catering Estimator uses your actual menu pricing, per-head
                costs, and add-on options to generate branded estimates in under 60 seconds. You
                control the pricing tiers and the AI does the math and formatting.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="handoff" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What happens if a customer asks something the AI can't answer?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                The AI gracefully hands off to your staff. It collects the customer's contact info,
                summarizes their question, and sends an alert so your team can follow up personally.
                No customer ever hits a dead end.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="setup" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How long does setup take?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Most restaurants are live within 2 weeks. We handle the technical setup, train the AI
                on your menu and policies, and test everything before launch. Your staff doesn't need
                to learn any new software.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contract" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Is there a long-term contract?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                No. All plans are month-to-month. We earn your business every month by delivering
                measurable results. Most clients stay because the ROI is obvious within the first 30
                days.
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
              fill more seats.
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
                    onClick={() => trackCTAClick('book_discovery_call', 'restaurant_form_success')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    <Calendar size={18} />
                    Book Your Discovery Call Now
                  </a>
                  <Link
                    to="/restaurant/demo"
                    onClick={() => trackCTAClick('explore_demos', 'restaurant_form_success')}
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
                    placeholder="Maria Gonzalez"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="La Mesa Kitchen"
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
                    placeholder="e.g., We're losing revenue from no-shows and can't keep up with catering requests..."
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

export default Restaurant;

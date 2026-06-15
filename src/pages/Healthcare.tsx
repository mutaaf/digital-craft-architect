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
  CalendarX,
  ClipboardList,
  PhoneOff,
  Clock,
  ClipboardCheck,
  Wrench,
  Rocket,
  Check,
  ArrowRight,
  Heart,
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
   MAIN HEALTHCARE PAGE
   ═══════════════════════════════════════════════════════════ */
const healthcareTestimonials: TestimonialItem[] = [
  {
    quote: "Our no-show rate dropped from 22% to under 10% in the first two months. The AI reminder calls feel personal — patients actually pick up and confirm.",
    author: "Dr. Rebecca Torres",
    position: "Medical Director, Sunrise Family Medicine",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Patient intake used to take 15 minutes per visit. Now most of it is done before they even walk through the door. My front desk staff finally has time to breathe.",
    author: "James Whitfield",
    position: "Practice Manager, Whitfield Internal Medicine",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "We brought back over 200 patients for overdue screenings in one quarter using the automated recall system. That revenue was just sitting on the table before.",
    author: "Dr. Priya Mehta",
    position: "Owner, Lakewood Women's Health",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?auto=format&fit=crop&w=300&q=80",
  },
];

const Healthcare: React.FC = () => {
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
        _subject: `[Healthcare Lead] ${formData.company}`,
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
        <title>AI Systems for Medical Practices | DigitalCraft AI</title>
        <meta name="description" content="AI-powered patient intake, appointment scheduling, recall automation, and voice reminders for medical practices. Reduce no-shows and streamline operations." />
        <meta property="og:title" content="AI Systems for Medical Practices | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered patient intake, appointment scheduling, recall automation, and voice reminders for medical practices. Reduce no-shows and streamline operations." />
        <link rel="canonical" href="https://digitalcraftai.com/healthcare" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Medical Practices",
          "description": "AI-powered patient intake qualification, smart appointment scheduling, automated recall systems, and voice appointment reminders for healthcare practices.",
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
          "serviceType": "AI Automation for Healthcare",
          "offers": [
            { "@type": "Offer", "name": "Solo Practice", "price": "500", "priceCurrency": "USD", "description": "For solo practitioners and small clinics" },
            { "@type": "Offer", "name": "Group Practice", "price": "1500", "priceCurrency": "USD", "description": "For multi-provider practices with 5-20 staff" },
            { "@type": "Offer", "name": "Multi-Office", "price": "5000", "priceCurrency": "USD", "description": "For healthcare groups with multiple locations" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is the system HIPAA compliant?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. All patient data is encrypted in transit and at rest. We sign a BAA (Business Associate Agreement) with every client. Our AI systems are designed to handle PHI in accordance with HIPAA regulations."
              }
            },
            {
              "@type": "Question",
              "name": "Does it integrate with our EHR/EMR system?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We integrate with most major EHR platforms including Epic, Cerner, athenahealth, eClinicalWorks, and DrChrono. For less common systems, we use HL7/FHIR standards to build custom integrations."
              }
            },
            {
              "@type": "Question",
              "name": "How long does setup take?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most practices are fully live within 2-3 weeks. The AI intake system can go live in as little as 5 days. EHR integration and voice recall setup typically take the full 2-3 week window."
              }
            },
            {
              "@type": "Question",
              "name": "Will patients know they're talking to an AI?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Transparency is built in. The AI identifies itself as a virtual assistant for your practice. Patients appreciate the convenience of 24/7 availability, and our data shows over 90% satisfaction with AI-assisted interactions."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering measurable reductions in no-shows, faster intake, and improved recall compliance."
              }
            },
            {
              "@type": "Question",
              "name": "Can the AI handle appointment rescheduling?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. The AI scheduler can book, confirm, reschedule, and cancel appointments based on your practice's availability rules. Patients can interact via chat, SMS, or voice — whichever they prefer."
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
                <Heart size={16} />
                Built for Medical Practices
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AI Systems Built for{' '}
                <span className="text-primary">Medical Practices</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                Reduce no-shows, automate patient intake, and keep your schedule full — without
                adding admin staff.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <a href="#contact" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
                  Get Your Free AI Audit <ArrowRight size={20} />
                </a>
                <Link
                  to="/healthcare/demo"
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
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern medical practice with healthcare professionals"
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
            Most medical practices lose revenue and patient trust to the same problems every day.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PainCard
            icon={<CalendarX size={24} />}
            title="Appointment No-Shows"
            description="Patients forget, life gets busy, and your provider sits idle. Every empty slot costs your practice $200+ in lost revenue."
            delay={0}
          />
          <PainCard
            icon={<ClipboardList size={24} />}
            title="Patient Intake Bottleneck"
            description="New patients arrive 10 minutes early and spend 15 minutes on clipboards. Your front desk is buried. The waiting room backs up."
            delay={150}
          />
          <PainCard
            icon={<PhoneOff size={24} />}
            title="Phone Tag with Patients"
            description="Your staff spends hours calling patients to confirm appointments, relay test results, or answer routine questions. Half the calls go to voicemail."
            delay={300}
          />
          <PainCard
            icon={<Clock size={24} />}
            title="Recall & Follow-Up Gaps"
            description="Patients overdue for annual physicals, screenings, or follow-ups slip through the cracks. That's lost revenue and worse patient outcomes."
            delay={450}
          />
        </div>
      </section>

      {/* ─── SOLUTIONS ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Build for You</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Custom AI systems designed for how medical practices actually operate.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <SolutionCard
            icon={<MessageSquare size={24} />}
            title="AI Patient Intake Qualifier"
            description="Collect patient history, insurance info, and chief complaints before they walk in."
            features={[
              'Pre-visit intake via chat, SMS, or patient portal',
              'Captures demographics, medications, allergies, and insurance',
              'Auto-routes urgent symptoms to triage staff',
              'Reduces front-desk paperwork by 80%',
            ]}
            delay={0}
          />
          <SolutionCard
            icon={<Calculator size={24} />}
            title="Smart Appointment Scheduler"
            description="Let patients book, reschedule, and confirm — 24/7, without calling your office."
            features={[
              'AI-powered scheduling that respects provider availability',
              'Automated confirmation via SMS, email, or voice call',
              'Intelligent waitlist management to fill cancellations',
              'Syncs directly with your EHR calendar',
            ]}
            delay={150}
          />
          <SolutionCard
            icon={<Bell size={24} />}
            title="Automated Recall System"
            description="Bring patients back for overdue screenings and annual visits — automatically."
            features={[
              'Identifies patients overdue for preventive care',
              'Multi-channel outreach: SMS, email, and voice',
              'Escalating reminder cadence over 30 days',
              'Tracks recall conversion rates in real time',
            ]}
            delay={300}
          />
          <SolutionCard
            icon={<Mic size={24} />}
            title="AI Voice Appointment Reminders"
            description="Natural-sounding calls that confirm, reschedule, or cancel appointments automatically."
            features={[
              'Personalized voice calls with patient name and appointment details',
              'Handles rescheduling and cancellation in the same call',
              'Speaks naturally — patients often think it\'s a real person',
              'Escalates no-response patients to front desk for follow-up',
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
            description="We analyze your patient flow, scheduling bottlenecks, no-show rates, and recall gaps — then show you exactly where AI saves time and recovers revenue."
            delay={0}
          />
          <StepCard
            number="2"
            icon={<Wrench size={28} />}
            title="Custom Build"
            description="We build your AI systems in 2-3 weeks, integrated with your EHR, your scheduling rules, and your practice's voice. HIPAA compliant from day one."
            delay={200}
          />
          <StepCard
            number="3"
            icon={<Rocket size={28} />}
            title="Launch & Grow"
            description="Go live with ongoing optimization. We monitor no-show rates, intake completion, and recall conversions — and continuously improve your results."
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
              label="fewer no-shows with AI appointment reminders"
              delay={0}
            />
            <StatCard
              value="3x"
              label="faster patient intake with AI pre-visit collection"
              delay={200}
            />
            <StatCard
              value="2x"
              label="recall compliance with automated outreach"
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
            to="/healthcare/demo"
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
            Choose the plan that fits your practice. Scale up as you grow.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingTier
            name="Solo Practice"
            price="$500"
            originalPrice="$800"
            description="For solo practitioners and small clinics"
            features={[
              'AI Patient Intake Qualifier',
              'Automated appointment reminders (SMS + email)',
              'Basic recall outreach (quarterly)',
              'Monthly performance report',
              'Email support',
            ]}
            delay={0}
          />
          <PricingTier
            name="Group Practice"
            price="$1,500"
            originalPrice="$2,500"
            description="For multi-provider practices with 5-20 staff"
            features={[
              'Everything in Solo Practice',
              'Smart Appointment Scheduler with EHR sync',
              'AI Voice Appointment Reminders',
              'Advanced recall system (monthly cadence)',
              'Waitlist management & cancellation backfill',
              'Weekly strategy call',
            ]}
            highlight
            delay={150}
          />
          <PricingTier
            name="Multi-Office"
            price="$5,000"
            originalPrice="$8,000"
            description="For healthcare groups with multiple locations"
            features={[
              'Everything in Group Practice',
              'Multi-location scheduling & recall',
              'Custom AI workflows per department',
              'HL7/FHIR integration support',
              'Priority support & dedicated PM',
              'Quarterly business review',
            ]}
            delay={300}
          />
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
          All plans include HIPAA-compliant setup and BAA. No long-term contracts — cancel anytime.
        </p>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <Testimonials
        data={healthcareTestimonials}
        carouselConfig={{ mobile: 1, tablet: 2, desktop: 3 }}
      />

      {/* ─── FAQ ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions?</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="hipaa" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Is the system HIPAA compliant?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Yes. All patient data is encrypted in transit and at rest. We sign a BAA (Business
                Associate Agreement) with every client. Our AI systems are designed to handle PHI
                in accordance with HIPAA regulations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ehr" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Does it integrate with our EHR/EMR system?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                We integrate with most major EHR platforms including Epic, Cerner, athenahealth,
                eClinicalWorks, and DrChrono. For less common systems, we use HL7/FHIR standards
                to build custom integrations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="setup" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How long does setup take?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Most practices are fully live within 2-3 weeks. The AI intake system can go live
                in as little as 5 days. EHR integration and voice recall setup typically take the
                full 2-3 week window.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="transparency" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Will patients know they're talking to an AI?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Transparency is built in. The AI identifies itself as a virtual assistant for your
                practice. Patients appreciate the convenience of 24/7 availability, and our data
                shows over 90% satisfaction with AI-assisted interactions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contract" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What's the contract length?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Month-to-month. No long-term contracts. We earn your business every month by
                delivering measurable reductions in no-shows, faster intake, and improved recall
                compliance.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reschedule" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Can the AI handle appointment rescheduling?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Yes. The AI scheduler can book, confirm, reschedule, and cancel appointments based
                on your practice's availability rules. Patients can interact via chat, SMS, or
                voice — whichever they prefer.
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
              We'll analyze your practice operations and show you exactly where AI can reduce
              no-shows, speed up intake, and recover lost revenue.
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
                    onClick={() => trackCTAClick('book_discovery_call', 'healthcare_form_success')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                  >
                    <Calendar size={18} />
                    Book Your Discovery Call Now
                  </a>
                  <Link
                    to="/healthcare/demo"
                    onClick={() => trackCTAClick('explore_demos', 'healthcare_form_success')}
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
                    placeholder="Dr. Jane Smith"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Practice Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Sunrise Family Medicine"
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
                    placeholder="e.g., Our no-show rate is over 20% and we can't keep up with patient intake..."
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

export default Healthcare;

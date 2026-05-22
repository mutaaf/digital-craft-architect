import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import EmailCourseOptin from '@/components/EmailCourseOptin';
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
} from 'lucide-react';

const INDUSTRIES = [
  {
    to: '/construction',
    label: 'Construction',
    icon: HardHat,
    tagline: 'AI-powered estimates, lead response, and voice negotiation for contractors and builders.',
  },
  {
    to: '/realestate',
    label: 'Real Estate',
    icon: Building2,
    tagline: 'Deal analysis, property comps, and AI voice outreach for agents and investors.',
  },
  {
    to: '/events',
    label: 'Event Planning',
    icon: PartyPopper,
    tagline: 'Inquiry qualification, automated proposals, and voice booking for event vendors.',
  },
  {
    to: '/homeservices',
    label: 'Home Services',
    icon: Wrench,
    tagline: 'Lead qualification, smart estimates, and follow-up calls for HVAC, plumbing, and more.',
  },
  {
    to: '/healthcare',
    label: 'Healthcare',
    icon: Heart,
    tagline: 'Patient intake, appointment scheduling, and automated follow-up for medical practices.',
  },
  {
    to: '/legal',
    label: 'Law Firms',
    icon: Scale,
    tagline: 'Client intake, consultation scheduling, and follow-up automation for legal practices.',
  },
  {
    to: '/restaurant',
    label: 'Restaurants',
    icon: UtensilsCrossed,
    tagline: 'Reservation handling, catering estimates, and review management for food service.',
  },
  {
    to: '/kidsplay',
    label: 'Kids Play & Entertainment',
    icon: Gamepad2,
    tagline: 'Party booking, package estimation, and voice scheduling for family entertainment centers.',
  },
  {
    to: '/fitness',
    label: 'Fitness & Gyms',
    icon: Dumbbell,
    tagline: 'Membership qualification, class packages, and retention calls for studios and gyms.',
  },
  {
    to: '/dental',
    label: 'Dental Practices',
    icon: Stethoscope,
    tagline: 'Patient intake, treatment estimates, and hygiene recall automation for dentists.',
  },
  {
    to: '/salon',
    label: 'Salons & Spas',
    icon: Scissors,
    tagline: 'Booking assistance, service estimates, and rebooking reminders for beauty businesses.',
  },
  {
    to: '/autorepair',
    label: 'Auto Repair',
    icon: Car,
    tagline: 'Service advisor chatbot, repair estimates, and maintenance reminders for auto shops.',
  },
];

const Industries: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Industries We Serve | AI Automation by Industry | DigitalCraft AI</title>
        <meta
          name="description"
          content="Explore AI automation solutions for 12+ industries including construction, real estate, healthcare, restaurants, fitness, dental, and more. Try live demos personalized to your business."
        />
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            AI Automation by Industry
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            AI Solutions Built for{' '}
            <span className="text-primary">Your Industry</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            We build custom AI systems for small and mid-sized businesses across 12 industries.
            Every solution includes live demos you can try with your own company data — no commitment required.
          </p>
        </div>
      </section>

      {/* Email course opt-in (below the hero) */}
      <EmailCourseOptin location="industries_below_hero" />

      {/* Industry Grid */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {INDUSTRIES.map((industry) => (
              <Link
                key={industry.to}
                to={industry.to}
                className="group flex flex-col p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                onClick={() => trackCTAClick('industry_card', industry.label.toLowerCase())}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <industry.icon size={22} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {industry.label}
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                  {industry.tagline}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  Explore solutions
                  <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            AI Automation for Small Business — Every Industry
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4">
            <p>
              DigitalCraft AI builds intelligent automation systems tailored to the unique workflows
              of each industry. Whether you run a construction company, dental practice, restaurant,
              or fitness studio, our AI handles the repetitive tasks that slow your business down —
              lead qualification, appointment scheduling, estimate generation, follow-up calls, and
              review management.
            </p>
            <p>
              Every industry solution includes interactive demos you can try with your own company
              data. Enter your website URL and our AI scrapes and analyzes your business, then runs
              personalized demos branded to your company. No signup required, no credit card, no
              sales pitch — just hands-on experience with AI tools built for your industry.
            </p>
            <p>
              From AI voice calls that negotiate deals and follow up with leads, to smart estimators
              that generate accurate quotes in seconds, our systems are designed to save you time
              and close more business. Join the 50+ companies already using DigitalCraft AI to
              automate their operations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Don't See Your Industry?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            We're adding new verticals every month. Book a call and we'll show you how AI
            can work for your specific business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_a_call', 'industries_cta')}
            >
              <Phone size={18} />
              Book a Free Discovery Call
            </a>
            <Link
              to="/construction/demo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demos', 'industries_cta')}
            >
              Try Live Demos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Industries;

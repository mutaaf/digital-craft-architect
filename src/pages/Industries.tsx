import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  ChevronRight,
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
    <div className="min-h-screen overflow-x-clip bg-white text-[#1d1d1f]">
      <Helmet>
        <title>Industries We Serve | AI Automation by Industry | DigitalCraft AI</title>
        <meta
          name="description"
          content="Explore AI automation solutions for 12+ industries including construction, real estate, healthcare, restaurants, fitness, dental, and more. Try live demos personalized to your business."
        />
      </Helmet>
      <Navbar />

      {/* keynote pass (2026-11-12): one promise, twelve tiles, the long copy kept below for search */}
      <section className="px-5 pb-16 pt-28 text-center md:pb-24 md:pt-40">
        <div className="v3-rise mb-4 text-[17px] font-semibold text-aurora md:text-[21px]" style={{ '--i': 0 } as React.CSSProperties}>{INDUSTRIES.length} industries</div>
        <h1 className="v3-rise k-hero mx-auto mb-6 max-w-[11ch]" style={{ '--i': 1 } as React.CSSProperties}>Pick your industry.</h1>
        <p className="v3-rise k-lead mx-auto max-w-[32ch]" style={{ '--i': 2 } as React.CSSProperties}>Each one has live demos you can run on your own company. No signup.</p>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pb-28 md:pb-40">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {INDUSTRIES.map((industry, i) => (
            <Link
              key={industry.to}
              to={industry.to}
              className="v3-rise k-tile group flex min-h-[250px] flex-col p-8 transition-colors hover:bg-[#ececf0] md:p-9"
              style={{ '--i': 3 + Math.min(i, 8) } as React.CSSProperties}
              onClick={() => trackCTAClick('industry_card', industry.label.toLowerCase())}
            >
              <span className="mb-8 grid h-14 w-14 place-items-center rounded-2xl bg-white text-aurora shadow-[0_6px_18px_-10px_rgba(0,0,0,0.25)]"><industry.icon size={26} strokeWidth={1.9} /></span>
              <h2 className="mb-2 text-[24px] font-semibold leading-[1.15] tracking-[-0.025em]">{industry.label}</h2>
              <p className="mb-6 text-[16px] leading-relaxed text-[#6e6e73]">{industry.tagline}</p>
              <span className="k-link mt-auto">Explore <ChevronRight size={18} strokeWidth={2.2} className="mt-px transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#f5f5f7] px-5 py-28 md:py-36">
        <div className="mx-auto max-w-[760px]">
          <h2 className="k-h2 mb-10 text-center">One system. Every trade.</h2>
          <div className="space-y-5 text-[17px] leading-relaxed text-[#6e6e73] md:text-[19px]">
            <p>
              DigitalCraft AI builds intelligent automation systems tailored to the unique workflows
              of each industry. Whether you run a construction company, dental practice, restaurant,
              or fitness studio, our AI handles the repetitive tasks that slow your business down:
              lead qualification, appointment scheduling, estimate generation, follow-up calls, and
              review management.
            </p>
            <p>
              Every industry solution includes interactive demos you can try with your own company
              data. Enter your website URL and our AI analyzes your business, then runs
              personalized demos branded to your company. No signup, no credit card, no
              sales pitch.
            </p>
          </div>
        </div>
      </section>

      <EmailCourseOptin location="industries_below_hero" />

      <section className="px-5 py-28 text-center md:py-40">
        <h2 className="k-h2 mx-auto mb-5 max-w-[14ch]">Don&rsquo;t see yours?</h2>
        <p className="k-lead mx-auto mb-10 max-w-[30ch]">We add a new industry every month. Tell us about yours.</p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" className="k-pill k-pill-dark" onClick={() => trackCTAClick('book_a_call', 'industries_cta')}>Book a call</a>
          <Link to="/demos" className="k-link" onClick={() => trackCTAClick('try_demos', 'industries_cta')}>See every demo <ChevronRight size={18} strokeWidth={2.2} className="mt-px" /></Link>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Industries;

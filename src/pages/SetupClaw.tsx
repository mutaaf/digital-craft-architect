import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import { useAnalytics } from '@/utils/analytics';
import {
  Check,
  Shield,
  Server,
  Wrench,
  MonitorSmartphone,
  Zap,
  Clock,
  ArrowRight,
  MapPin,
  Phone,
  Wifi,
  Lock,
  RefreshCw,
  Users,
  ChevronRight,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ───────────────────── Pricing Card ───────────────────── */
const PricingCard: React.FC<{
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  highlight?: boolean;
  delay: number;
}> = ({ title, price, subtitle, features, highlight, delay }) => (
  <div
    className={`rounded-xl p-8 shadow-md border transition-all duration-300 hover:shadow-lg animate-slide-up ${
      highlight
        ? 'bg-gray-900 text-white border-gray-700 ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-950'
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
    }`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <h3 className={`text-xl font-semibold mb-1 ${highlight ? 'text-white' : ''}`}>{title}</h3>
    <p className={`text-sm mb-4 ${highlight ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
      {subtitle}
    </p>
    <p className="mb-6">
      <span className={`text-4xl font-bold ${highlight ? 'text-white' : ''}`}>{price}</span>
      <span className={`text-sm ${highlight ? 'text-gray-400' : 'text-gray-500'}`}> one-time</span>
    </p>
    <ul className="space-y-3 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <Check
            size={16}
            className={`mt-0.5 shrink-0 ${highlight ? 'text-red-400' : 'text-green-500'}`}
          />
          <span className={highlight ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}>
            {f}
          </span>
        </li>
      ))}
    </ul>
    <a
      href="#signup"
      className={`block text-center py-3 rounded-md font-medium transition-colors ${
        highlight
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
      }`}
    >
      Get Started
    </a>
  </div>
);

/* ───────────────────── Feature Card ───────────────────── */
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => (
  <div
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4 text-red-500">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   SETUPCLAW PAGE
   ═══════════════════════════════════════════════════════════ */
const SetupClaw: React.FC = () => {
  const { content } = useContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    teamSize: '',
    location: 'remote',
    message: '',
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
          _subject: `[SetupClaw Lead] ${formData.company || formData.name} — ${formData.location}`,
        }),
      });
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', company: '', teamSize: '', location: 'remote', message: '' });
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
        <title>SetupClaw — White-Glove OpenClaw AI Assistant Setup | Dallas, Austin, Remote</title>
        <meta
          name="description"
          content="SetupClaw deploys and maintains your team's AI assistant on a Mac Mini — remotely or on-site in Dallas-Fort Worth and Austin, Texas. White-glove OpenClaw setup for 4-50+ employee teams. No technical knowledge required."
        />
        <meta
          name="keywords"
          content="SetupClaw, OpenClaw setup, AI assistant deployment, Mac Mini AI server, white-glove AI setup, Dallas AI setup, Austin AI setup, DFW AI assistant, Texas AI deployment, OpenClaw installation, AI for small business, AI assistant Dallas Texas, AI assistant Austin Texas, managed AI deployment"
        />
        <meta name="author" content="DigitalCraft AI" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://digitalcraft.ai/setupclaw" />
        <meta property="og:title" content="SetupClaw — White-Glove AI Assistant Deployment | Dallas, Austin & Remote" />
        <meta property="og:description" content="We deploy and maintain your team's AI assistant on a Mac Mini. Remote worldwide, or on-site in DFW and Austin. No technical knowledge required." />
        <meta property="og:image" content="/api/og-image?page=setupclaw" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="SetupClaw — White-Glove AI Assistant Deployment" />
        <meta property="twitter:description" content="We deploy and maintain your team's AI assistant on a Mac Mini. Remote worldwide, or on-site in DFW and Austin, TX." />
        <meta property="twitter:image" content="/api/og-image?page=setupclaw" />

        <link rel="canonical" href="https://digitalcraft.ai/setupclaw" />

        {/* Local Business structured data for SEO/GEO */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "SetupClaw — OpenClaw AI Assistant Deployment",
          "description": "White-glove OpenClaw deployment for founders and exec teams. We handle the install, hardening, integrations, and ongoing care on a Mac Mini.",
          "provider": {
            "@type": "Organization",
            "name": "DigitalCraft AI",
            "url": "https://digitalcraft.ai"
          },
          "areaServed": [
            { "@type": "City", "name": "Dallas", "containedInPlace": { "@type": "State", "name": "Texas" } },
            { "@type": "City", "name": "Fort Worth", "containedInPlace": { "@type": "State", "name": "Texas" } },
            { "@type": "City", "name": "Austin", "containedInPlace": { "@type": "State", "name": "Texas" } },
            { "@type": "Country", "name": "United States" }
          ],
          "serviceType": "AI Assistant Deployment",
          "offers": [
            {
              "@type": "Offer",
              "name": "Mac Mini Remote Setup",
              "price": "5000",
              "priceCurrency": "USD",
              "description": "Remote OpenClaw deployment with iMessage integration and local hardware"
            },
            {
              "@type": "Offer",
              "name": "Mac Mini In-Person Setup",
              "price": "6000",
              "priceCurrency": "USD",
              "description": "On-site OpenClaw deployment in DFW or Austin, Texas",
              "areaServed": ["Dallas-Fort Worth", "Austin"]
            }
          ]
        })}</script>
      </Helmet>

      <Navbar darkHero />

      {/* ─── HERO ─── */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            {/* Logo + brand */}
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/25">
                <Server size={24} className="text-white" />
              </div>
              <span className="text-3xl md:text-4xl font-bold text-white">SetupClaw</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
              We deploy and maintain your team's AI assistant
              <span className="text-red-400"> — remotely, worldwide, secured from day one.</span>
            </h1>

            <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
              White-glove{' '}
              <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-200 px-2 py-0.5 rounded text-base font-medium border border-gray-700">
                OpenClaw
              </span>{' '}
              deployment for founders and exec teams. No technical knowledge required — we
              handle the install, hardening, integrations, and ongoing care so you can focus on
              running your business.
            </p>

            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Built for <strong className="text-white">4–50+ employee</strong> teams where the
              CEO/CFO/Head of Sales needs leverage without creating new security risk.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <a
                href="#signup"
                className="inline-flex items-center justify-center gap-2 text-lg px-8 py-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg font-medium"
              >
                Get Started <ArrowRight size={20} />
              </a>
              <a
                href="https://calendly.com/mutaaf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-lg px-8 py-4 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Book a Call <ChevronRight size={20} />
              </a>
            </div>

            {/* Location badges */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-300 px-3 py-1.5 rounded-full text-sm border border-gray-700">
                <Wifi size={14} className="text-green-400" /> Remote — Worldwide
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-300 px-3 py-1.5 rounded-full text-sm border border-gray-700">
                <MapPin size={14} className="text-red-400" /> Dallas–Fort Worth, TX
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-800 text-gray-300 px-3 py-1.5 rounded-full text-sm border border-gray-700">
                <MapPin size={14} className="text-red-400" /> Austin, TX
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── QUOTE ─── */}
      <section className="bg-gray-900 border-t border-b border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <blockquote className="max-w-2xl mx-auto text-center">
            <div className="border-l-4 border-gray-600 pl-6 text-left">
              <p className="text-lg text-gray-300 italic mb-3">
                "Genuinely the most incredible sci-fi takeoff-adjacent thing I have seen recently."
              </p>
              <footer className="text-sm text-gray-500">
                —{' '}
                <a
                  href="https://x.com/karpathy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-300 underline"
                >
                  Andrej Karpathy
                </a>
                , former Director of AI at Tesla
              </footer>
            </div>
          </blockquote>
        </div>
      </section>

      {/* ─── WHAT'S INCLUDED ─── */}
      <section className="container-section">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Get</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A fully deployed, hardened, and maintained AI assistant — ready to work for your team on day one.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Server size={24} />}
            title="Mac Mini Hardware Setup"
            description="Dedicated Mac Mini configured as your private AI server. Runs locally on your network — your data never leaves your office."
            delay={0}
          />
          <FeatureCard
            icon={<MonitorSmartphone size={24} />}
            title="iMessage Integration"
            description="Your AI assistant responds via iMessage — the app your team already uses. No new software to learn, no logins to remember."
            delay={100}
          />
          <FeatureCard
            icon={<Shield size={24} />}
            title="Security Hardening"
            description="Enterprise-grade security from the start: encrypted storage, firewall rules, access controls, and audit logging configured out of the box."
            delay={200}
          />
          <FeatureCard
            icon={<Zap size={24} />}
            title="Custom Integrations"
            description="Connected to the tools you already use — CRM, calendar, email, Slack, Google Workspace, and more. We wire it all together."
            delay={300}
          />
          <FeatureCard
            icon={<Lock size={24} />}
            title="Access Controls"
            description="Role-based permissions so the right people have the right access. Admin, manager, and user tiers configured for your org chart."
            delay={400}
          />
          <FeatureCard
            icon={<RefreshCw size={24} />}
            title="Ongoing Maintenance"
            description="We monitor, update, and maintain your system. If something breaks at 2am, we fix it — not you. Includes 30 days of post-setup support."
            delay={500}
          />
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900" id="pricing">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            One-time setup. No subscriptions, no hidden fees.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <PricingCard
            title="Mac Mini Setup"
            price="$5,000"
            subtitle="Remote — iMessage integration + local hardware"
            features={[
              'Mac Mini configured & shipped to you',
              'OpenClaw installed and hardened',
              'iMessage AI assistant activated',
              'Up to 3 tool integrations (CRM, calendar, etc.)',
              'Security audit & firewall configuration',
              'Remote onboarding call for your team',
              '30 days post-setup support',
            ]}
            delay={0}
          />
          <PricingCard
            title="Mac Mini In-Person"
            price="$6,000"
            subtitle="DFW or Austin, TX — on-site setup + iMessage"
            features={[
              'Everything in Remote, plus:',
              'On-site installation in Dallas–Fort Worth or Austin',
              'Network assessment & optimal placement',
              'In-person team training session',
              'Up to 5 tool integrations',
              'Same-day hardware troubleshooting',
              '60 days post-setup support',
            ]}
            highlight
            delay={150}
          />
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
          Hardware cost (Mac Mini) included in price. Additional integrations available at $500 each.
        </p>
      </section>

      {/* ─── WHO IT'S FOR ─── */}
      <section className="container-section">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Teams Like Yours</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            SetupClaw is designed for small-to-mid-size businesses that want AI leverage without the complexity.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: <Users size={24} />, title: '4–50+ Employees', desc: 'Right-sized for growing teams that need more output without more headcount.' },
            { icon: <Shield size={24} />, title: 'Security-Conscious', desc: 'Your data stays on your hardware. No cloud AI reading your client files.' },
            { icon: <Clock size={24} />, title: 'Time-Strapped Leaders', desc: 'CEOs, CFOs, and sales leaders who need leverage now — not in 6 months.' },
            { icon: <Wrench size={24} />, title: 'Non-Technical Teams', desc: "If you can use iMessage, you can use OpenClaw. We handle all the tech." },
          ].map((item, i) => (
            <div
              key={i}
              className="text-center animate-slide-up p-6"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            From signup to a fully working AI assistant — typically 5–7 business days.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { num: '1', icon: <Phone size={28} />, title: 'Discovery Call', desc: 'We learn your team structure, tools, and goals. 15 minutes.' },
            { num: '2', icon: <Wrench size={28} />, title: 'Build & Configure', desc: 'We set up your Mac Mini with OpenClaw, integrations, and security.' },
            { num: '3', icon: <Server size={28} />, title: 'Deploy', desc: 'Shipped to you (remote) or installed on-site (DFW/Austin). Same week.' },
            { num: '4', icon: <Zap size={28} />, title: 'Go Live', desc: 'Team onboarding, iMessage activated, and your AI assistant is working.' },
          ].map((step, i) => (
            <div key={i} className="relative text-center animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                {step.icon}
              </div>
              <span className="absolute top-0 right-1/2 translate-x-10 -translate-y-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {step.num}
              </span>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SERVICE AREAS ─── */}
      <section className="container-section">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Service Areas</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Remote setup available worldwide. In-person deployment in Texas.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-100 dark:border-gray-700 text-center animate-slide-up">
            <Wifi size={32} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">Remote Setup</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              We configure your Mac Mini remotely and ship it to your door. Available anywhere in the US.
            </p>
            <span className="text-primary font-medium text-sm">$5,000</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-100 dark:border-gray-700 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
            <MapPin size={32} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold mb-2">Dallas–Fort Worth</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              On-site installation across the DFW metroplex. Dallas, Fort Worth, Plano, Frisco, Arlington, and surrounding areas.
            </p>
            <span className="text-primary font-medium text-sm">$6,000</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-100 dark:border-gray-700 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <MapPin size={32} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold mb-2">Austin</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              On-site installation across greater Austin. Downtown, Round Rock, Cedar Park, Georgetown, and surrounding areas.
            </p>
            <span className="text-primary font-medium text-sm">$6,000</span>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="container-section bg-gray-50 dark:bg-gray-900">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="what-is-openclaw" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What is OpenClaw?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                OpenClaw is an open-source AI assistant platform that runs locally on a Mac Mini. It gives your team a private, secure AI assistant that can read documents, answer questions, draft emails, analyze data, and integrate with your existing tools — all without sending your data to the cloud.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="technical" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Do I need any technical knowledge?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                No. That's the entire point of SetupClaw. We handle every technical detail — hardware configuration, software installation, security hardening, integrations, and ongoing maintenance. Your team just uses iMessage to talk to the AI.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-privacy" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                Is my data safe?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Yes. OpenClaw runs on a Mac Mini physically located in your office (or shipped to you). Your conversations and documents stay on that machine. Nothing is sent to cloud AI providers. We also configure encryption, firewall rules, and access controls during setup.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="remote-vs-inperson" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What's the difference between remote and in-person?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Remote: we configure your Mac Mini, ship it to you with plug-and-play instructions, and onboard your team via video call. In-person (DFW/Austin only): we come to your office, assess your network, install the hardware, and train your team face-to-face. In-person also includes extra integrations and a longer support window.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="timeline" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                How long does setup take?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Typically 5–7 business days from signup to a fully working system. The discovery call happens within 24 hours, hardware configuration takes 2–3 days, and deployment (shipping or on-site visit) fills the remainder. Your team can start using the AI assistant the same day it arrives.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="support" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6">
              <AccordionTrigger className="text-left font-medium">
                What happens after setup?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                Remote plans include 30 days of post-setup support. In-person plans include 60 days. During this period, we handle any issues, additional configuration, and fine-tuning. After the support window, we offer optional ongoing maintenance plans starting at $200/month.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ─── SIGNUP FORM ─── */}
      <section id="signup" className="container-section">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Your AI Assistant Set Up
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Fill out the form and we'll schedule your discovery call within 24 hours.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-10 animate-slide-up">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">You're In!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We'll reach out within 24 hours to schedule your discovery call and get started on your SetupClaw deployment.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-red-500 hover:underline"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acme Inc."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team Size
                    </label>
                    <select
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select team size</option>
                      <option value="1-4">1–4 employees</option>
                      <option value="5-10">5–10 employees</option>
                      <option value="11-25">11–25 employees</option>
                      <option value="26-50">26–50 employees</option>
                      <option value="50+">50+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Setup Type *
                    </label>
                    <select
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    >
                      <option value="remote">Remote ($5,000)</option>
                      <option value="dfw">In-Person — DFW ($6,000)</option>
                      <option value="austin">In-Person — Austin ($6,000)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Anything we should know?
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="e.g., We use Salesforce and Google Workspace, team is mostly non-technical..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg text-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Request Setup — Get Started Today'}
                </button>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  No spam, no obligation. We'll schedule a 15-minute discovery call to get started.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default SetupClaw;

import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import CompanySetupForm from '@/components/construction/CompanySetupForm';
import { useDemoContext } from '@/contexts/DemoContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Calculator,
  ArrowRight,
  Sparkles,
  Phone,
} from 'lucide-react';
import { trackDemoClick, trackCTAClick } from '@/utils/analytics';
import StickyCTA from '@/components/StickyCTA';
import DemoVideoCards from '@/components/DemoVideoCards';

const SalonDemoHub = () => {
  const { company, isCustomized, loadFromUrl, isLoading } = useDemoContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-load from ?site= param
  useEffect(() => {
    const site = searchParams.get('site');
    if (site && !isCustomized && !isLoading) {
      loadFromUrl(site);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL when company loads
  useEffect(() => {
    if (isCustomized && company?.website) {
      const domain = company.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (searchParams.get('site') !== domain) {
        setSearchParams({ site: domain }, { replace: true });
      }
    }
  }, [isCustomized, company, searchParams, setSearchParams]);

  const name = company?.companyName || 'DigitalCraft AI';
  const possessive = company?.companyName ? `${company.companyName}'s` : "DigitalCraft AI's";

  const demos = [
    {
      to: '/salon/demo/booking',
      icon: <MessageSquare size={28} />,
      title: 'AI Booking Qualifier',
      description: `Chat with ${possessive} AI as a potential client. Watch it qualify service needs, recommend treatments, and book appointments — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      to: '/salon/demo/services',
      icon: <Calculator size={28} />,
      title: 'Smart Service Estimator',
      description: `Pick a service category, customize add-ons, and get a branded service estimate using ${possessive} pricing in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      to: '/salon/demo/voice-rebook',
      icon: <Phone size={28} />,
      title: 'AI Voice Rebooking Agent',
      description:
        'Listen to the AI place a friendly rebooking call to a lapsed client. It uses natural speech, personalized scripts, and books follow-up appointments live.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Salons & Spas | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Booking Qualifier, Smart Service Estimator, and Voice Rebooking Agent. See the future of your salon.`
    : 'Three working AI proof-of-concepts for salons and spas: AI Booking Qualifier, Smart Service Estimator, and Voice Rebooking Agent.';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> Built for {name}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Salon & Spa AI Automation Demos</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Three working proof-of-concepts showing exactly how AI will transform {possessive}{' '}
            booking, service estimating, and client retention.
          </p>
        </div>

        <CompanySetupForm />

        {/* SEO intro section */}
        <section className="mb-10 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            AI for Salons & Spas: Interactive Automation Demos
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            <p>
              If you own or manage a salon or spa, you already know the daily revenue killers:
              last-minute cancellations that leave chairs empty, clients who walk out without
              rebooking, retail products gathering dust on shelves, and a front desk team stretched
              too thin to follow up with everyone. These three salon automation demos let you
              experience, hands-on, how AI solves each of those problems — personalized to your
              own business, not a generic pitch deck.
            </p>
            <p>
              Start with the <strong>AI Booking Qualifier</strong> to see how a GPT-4o chatbot
              handles new client inquiries in real time. It asks about hair type, service preferences,
              and scheduling needs, then recommends the right stylist and books the appointment —
              all without your front desk lifting a finger. Whether it is 2 AM or the middle of a
              Saturday rush, the AI never misses a potential booking.
            </p>
            <p>
              Next, try the <strong>Smart Service Estimator</strong>. Select from haircuts, color
              treatments, spa services, or bridal packages — add optional upgrades like deep
              conditioning, scalp treatments, or premium product lines — and get a branded price
              estimate in seconds. Clients can browse your full menu, build their own package, and
              see transparent pricing before they ever sit in the chair. It is the kind of
              experience that builds trust and drives higher average ticket values.
            </p>
            <p>
              Finally, the <strong>AI Voice Rebooking Agent</strong> demonstrates how voice AI
              brings lapsed clients back. The system identifies clients who are overdue for their
              next appointment, places a natural-sounding phone call with personalized talking points
              based on their service history, and books a follow-up appointment live on the call.
              You get a full transcript, rebooking confirmation, and analytics on every outreach
              attempt.
            </p>
            <p>
              Every demo runs on the same production AI stack we deploy for clients — no mock data,
              no smoke and mirrors. Enter your salon or spa website above to see each demo branded
              to your business, or jump straight in with the default configuration. Whether you are
              evaluating AI for salon operations, looking to reduce no-shows, boost retail revenue,
              or simply curious what modern automation looks like in the beauty industry, these
              demos give you a clear, no-commitment preview of the results.
            </p>
          </div>
        </section>

        <DemoVideoCards vertical="Salons & Spas" />

        <div className="grid gap-6">
          {demos.map((d, i) => (
            <Link key={d.to} to={d.to} onClick={() => trackDemoClick(d.title, 'salon')} className="group animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
              <Card className="p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-5 transition-all hover:shadow-lg hover:border-primary/30">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${d.color}`}>
                  {d.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                    {d.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {d.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {d.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 self-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={20} />
                </Button>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-400 mb-4">
            Ready to see these systems live in your salon?
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'salon_demo_hub')}>
              Book a Call with DigitalCraft AI <ArrowRight size={18} />
            </a>
          </Button>
        </div>
      </div>
      <StickyCTA />
    </div>
  );
};

export default SalonDemoHub;

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
  Home,
  Phone,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const RealEstateDemoHub = () => {
  const { company, isCustomized, loadFromUrl, isLoading } = useDemoContext();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const site = searchParams.get('site');
    if (site && !isCustomized && !isLoading) {
      loadFromUrl(site);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      to: '/realestate/demo/property-negotiator',
      icon: <Home size={28} />,
      title: 'AI Deal Analyzer',
      description: `Paste a listing URL or enter property details and get a full negotiation playbook — offer price, comparable sales analysis, strategy, and ROI projection tailored for ${possessive} market.`,
      tags: ['GPT-4o Vision', 'CMA Analysis'],
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    },
    {
      to: '/realestate/demo/voice-negotiator',
      icon: <Phone size={28} />,
      title: 'AI Voice Negotiator',
      description:
        'Set your bid range and let the AI call the seller to negotiate on your behalf. Watch the live transcript and receive a full call summary with insights and recommended next steps.',
      tags: ['Vapi Voice AI', 'Live Transcription'],
      color: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    },
    {
      to: '/realestate/demo/lead-responder',
      icon: <MessageSquare size={28} />,
      title: 'AI Lead Qualifier',
      description: `Chat with ${possessive} AI as a potential buyer or seller. Watch it qualify leads, capture property preferences, and schedule showings — all automatically, 24/7.`,
      tags: ['GPT-4o Streaming', 'Lead Scoring'],
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Real Estate | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Deal Analyzer, Voice Negotiator, and Lead Qualifier. See the future of your real estate business.`
    : 'Three working AI proof-of-concepts for real estate professionals: Deal Analyzer, Voice Negotiator, and Lead Qualifier.';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> Built for {name}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Real Estate AI Demos</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Three working proof-of-concepts showing how AI will transform {possessive}{' '}
            deal analysis, seller outreach, and lead qualification.
          </p>
        </div>

        <CompanySetupForm />

        <div className="grid gap-6">
          {demos.map((d, i) => (
            <Link key={d.to} to={d.to} className="group animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
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
            Ready to see these systems live in your brokerage?
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer">
              Book a Call with DigitalCraft AI <ArrowRight size={18} />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealEstateDemoHub;

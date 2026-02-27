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
  Star,
  ArrowRight,
  Sparkles,
  Home,
} from 'lucide-react';

const DemoHub = () => {
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

  const name = company?.companyName || '448 Developments';
  const possessive = company?.companyName ? `${company.companyName}'s` : "448's";

  const demos = [
    {
      to: '/construction/demo/lead-responder',
      icon: <MessageSquare size={28} />,
      title: 'AI Lead Responder',
      description: `Chat with ${possessive} AI as a homeowner. Watch it qualify leads, extract project details, and book consultations — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      to: '/construction/demo/estimate',
      icon: <Calculator size={28} />,
      title: 'Smart Estimate Generator',
      description: `Pick a project type, enter your square footage, and get a branded ballpark estimate using ${possessive} pricing in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      to: '/construction/demo/reviews',
      icon: <Star size={28} />,
      title: 'Review Request System',
      description:
        'Experience the automated SMS flow that turns completed projects into 5-star Google reviews — with Day 3 and Day 7 follow-ups.',
      tags: ['SMS Simulation', 'Analytics Dashboard'],
      color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600',
    },
    {
      to: '/construction/demo/property-negotiator',
      icon: <Home size={28} />,
      title: 'AI Deal Analyzer',
      description:
        'Paste a listing URL, upload a screenshot, or enter property details — get a full negotiation playbook with offer price, strategy, and ROI projection in under 60 seconds.',
      tags: ['GPT-4o Vision', 'Negotiation Playbook'],
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Construction | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Lead Responder, Smart Estimates, Review Automation, and Deal Analyzer. See the future of your business.`
    : 'Four working AI proof-of-concepts for construction businesses: Lead Responder, Smart Estimate Generator, Review Request System, and AI Deal Analyzer.';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/lovable-uploads/c148eb9a-a8da-4557-8a7a-7001477fa8d0.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content="/lovable-uploads/c148eb9a-a8da-4557-8a7a-7001477fa8d0.png" />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> Built for {name}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Interactive POC Demos</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Four working proof-of-concepts showing exactly how AI will transform {possessive}{' '}
            lead capture, estimating, reputation management, and deal analysis.
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
            Ready to see these systems live in your business?
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

export default DemoHub;

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
} from 'lucide-react';
import { trackDemoClick, trackCTAClick } from '@/utils/analytics';
import StickyCTA from '@/components/StickyCTA';

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

  const name = company?.companyName || 'DigitalCraft AI';
  const possessive = company?.companyName ? `${company.companyName}'s` : "DigitalCraft AI's";

  const demos = [
    {
      to: '/restaurant/demo/reservations',
      icon: <MessageSquare size={28} />,
      title: 'AI Reservation & Inquiry Handler',
      description: `Chat with ${possessive} AI as a hungry diner. Watch it handle reservations, answer menu questions, and route catering inquiries — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      to: '/restaurant/demo/catering',
      icon: <Calculator size={28} />,
      title: 'Smart Catering Estimator',
      description: `Pick an event type, enter your guest count, and get a branded catering estimate using ${possessive} pricing in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      to: '/restaurant/demo/reviews',
      icon: <Star size={28} />,
      title: 'AI Review Manager',
      description:
        'Experience the automated SMS flow that turns happy diners into 5-star Google reviews — with follow-ups and a live analytics dashboard.',
      tags: ['SMS Simulation', 'Analytics Dashboard'],
      color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Restaurants | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Reservation Handler, Catering Estimator, and Review Manager. See the future of your restaurant.`
    : 'Three working AI proof-of-concepts for restaurants: Reservation & Inquiry Handler, Smart Catering Estimator, and AI Review Manager.';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/og-construction.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content="/og-construction.png" />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> Built for {name}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Restaurant AI Automation Demos</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Three working proof-of-concepts showing exactly how AI will transform {possessive}{' '}
            reservations, catering sales, and reputation management.
          </p>
        </div>

        <CompanySetupForm />

        {/* SEO intro section */}
        <section className="mb-10 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            AI for Restaurants: Interactive Automation Demos
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            <p>
              If you run a restaurant, you already know the bottlenecks: reservations that turn into
              no-shows, catering inquiries that sit unanswered during the dinner rush, and five-star
              dining experiences that never translate into five-star online reviews. These three
              restaurant automation demos let you experience, hands-on, how AI solves each of those
              problems — personalized to your own restaurant, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Reservation & Inquiry Handler</strong> to see how a GPT-4o
              chatbot manages table bookings, answers menu questions, handles dietary restriction
              requests, and routes catering inquiries in real time. The AI qualifies every inquiry
              instantly — no guest waits for a callback, no lead slips through the cracks during
              service hours.
            </p>
            <p>
              Next, try the <strong>Smart Catering Estimator</strong> — select an event type, enter
              your guest count, choose a service tier, and receive a branded catering proposal in
              under 60 seconds. Whether it is a corporate lunch for 50 or a wedding reception for
              200, the estimator uses your actual menu pricing to generate professional quotes that
              close deals faster than any spreadsheet ever could.
            </p>
            <p>
              The <strong>AI Review Manager</strong> simulates the automated SMS flow that turns
              satisfied diners into Google reviewers. It sends a thank-you text after the meal,
              follows up at Day 3 and Day 7, and includes a live analytics dashboard so you can
              track response rates and rating trends. Restaurants using this system typically see
              their review count double within 60 to 90 days.
            </p>
            <p>
              Enter your restaurant website above to see each demo branded to your business, or
              jump straight in with the default configuration. Whether you are evaluating AI for
              restaurant operations, looking for a smarter way to handle catering sales, or simply
              curious what modern automation looks like in food service, these demos give you a
              clear, no-commitment preview of the results.
            </p>
          </div>
        </section>

        <div className="grid gap-6">
          {demos.map((d, i) => (
            <Link key={d.to} to={d.to} onClick={() => trackDemoClick(d.title, 'restaurant')} className="group animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
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
            Ready to see these systems live in your restaurant?
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'restaurant_demo_hub')}>
              Book a Call with DigitalCraft AI <ArrowRight size={18} />
            </a>
          </Button>
        </div>
      </div>
      <StickyCTA />
    </div>
  );
};

export default DemoHub;

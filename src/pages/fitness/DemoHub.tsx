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
      to: '/fitness/demo/lead-qualifier',
      icon: <MessageSquare size={28} />,
      title: 'AI Membership Qualifier',
      description: `Chat with ${possessive} AI as a potential gym member. Watch it qualify leads, understand fitness goals, recommend membership tiers, and book trial classes — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      to: '/fitness/demo/membership',
      icon: <Calculator size={28} />,
      title: 'Smart Membership Estimator',
      description: `Select your fitness goals, preferred class types, and visit frequency — get a personalized membership recommendation using ${possessive} pricing in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      to: '/fitness/demo/voice-retention',
      icon: <Phone size={28} />,
      title: 'AI Voice Retention Agent',
      description:
        'Experience a live AI voice call that reaches out to at-risk members, fills empty class slots from the waitlist, and re-engages lapsed trial members — with real-time transcription and a post-call summary.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Fitness & Gyms | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Membership Qualifier, Smart Estimator, and Voice Retention Agent. See the future of your fitness business.`
    : 'Three working AI proof-of-concepts for gyms and fitness studios: Membership Qualifier, Smart Membership Estimator, and AI Voice Retention Agent.';

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
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Fitness AI Automation Demos</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Three working proof-of-concepts showing exactly how AI will transform {possessive}{' '}
            lead capture, membership sales, and member retention.
          </p>
        </div>

        <CompanySetupForm />

        {/* SEO intro section */}
        <section className="mb-10 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            AI for Gyms & Fitness Studios: Interactive Automation Demos
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            <p>
              If you run a gym or fitness studio, you already know the bottlenecks: website visitors
              who inquire at midnight and never hear back, trial members who visit once and vanish,
              classes that run half-empty because cancellations happen last minute, and long-time
              members who quietly stop showing up until they cancel. These three fitness automation
              demos let you experience, hands-on, how AI solves each of those problems —
              personalized to your own business, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Membership Qualifier</strong> to see how a GPT-4o chatbot
              handles incoming inquiries in real time — understanding fitness goals, recommending the
              right membership tier, answering questions about class schedules and pricing, and
              booking a trial visit on your behalf. This isn't a simple FAQ bot; it has a real
              conversation, qualifies the lead, and captures everything your sales team needs to
              close.
            </p>
            <p>
              Next, try the <strong>Smart Membership Estimator</strong>. Prospects select their
              fitness goals, preferred class types, and how often they plan to visit. The AI
              recommends the best membership tier, shows transparent pricing with optional add-ons
              like personal training packages and class bundles, and generates a branded summary they
              can take home — the kind of instant clarity that converts browsers into members before
              they even walk through the door.
            </p>
            <p>
              Finally, the <strong>AI Voice Retention Agent</strong> demonstrates the most powerful
              tool in your arsenal: proactive outreach. When a member's attendance drops, the AI
              places a natural voice call to check in, offer a complimentary session, or suggest a
              schedule change. When a class has a last-minute cancellation, it calls the next person
              on the waitlist. When a trial member hasn't booked their second visit, it follows up
              with a personalized invitation. Every call is transcribed in real time with a
              post-call summary and recommended next steps.
            </p>
            <p>
              Enter your gym or studio website above to see each demo branded to your business, or
              jump straight in with the default configuration. Whether you're evaluating AI for
              fitness operations, looking for a smarter way to convert trials into members, or
              curious what modern member retention automation looks like, these demos give you a
              clear, no-commitment preview of the results.
            </p>
          </div>
        </section>

        <DemoVideoCards vertical="Fitness" />

        <div className="grid gap-6">
          {demos.map((d, i) => (
            <Link key={d.to} to={d.to} onClick={() => trackDemoClick(d.title, 'fitness')} className="group animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
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
            Ready to see these systems live in your gym?
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'fitness_demo_hub')}>
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

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
      to: '/autorepair/demo/advisor',
      icon: <MessageSquare size={28} />,
      title: 'AI Service Advisor',
      description: `Chat with ${possessive} AI as a vehicle owner. Watch it diagnose symptoms, recommend services, quote pricing, and book appointments — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      to: '/autorepair/demo/estimate',
      icon: <Calculator size={28} />,
      title: 'Smart Repair Estimator',
      description: `Pick a repair category, select your vehicle details, and get a branded transparent estimate using ${possessive} labor rates in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      to: '/autorepair/demo/voice-reminder',
      icon: <Phone size={28} />,
      title: 'AI Voice Service Reminder',
      description:
        'Experience how AI calls customers to remind them about upcoming maintenance, handles rescheduling in real time, and keeps your bays full with natural voice conversations.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Auto Repair | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Service Advisor, Smart Repair Estimator, and Voice Service Reminders. See the future of your shop.`
    : 'Three working AI proof-of-concepts for auto repair businesses: AI Service Advisor, Smart Repair Estimator, and AI Voice Service Reminders.';

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
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Auto Repair AI Automation Demos</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Three working proof-of-concepts showing exactly how AI will transform {possessive}{' '}
            service advising, estimating, and customer retention.
          </p>
        </div>

        <CompanySetupForm />

        {/* SEO intro section */}
        <section className="mb-10 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            AI for Auto Repair: Interactive Automation Demos
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            <p>
              If you run an auto repair shop or dealership service center, you already know the
              bottlenecks: service calls that go unanswered after hours, estimates that take too
              long and breed distrust, declined repairs that never get followed up on, and
              maintenance customers who drift to competitors because no one reminded them to come
              back. These three auto repair automation demos let you experience, hands-on, how AI
              solves each of those problems — personalized to your own shop, not a generic pitch
              deck.
            </p>
            <p>
              Start with the <strong>AI Service Advisor</strong> to see how a GPT-4o chatbot
              handles vehicle owner inquiries in real time — diagnosing symptoms, recommending
              services, quoting transparent pricing, and booking appointments automatically. It
              answers the questions your front desk gets a hundred times a day, but instantly and
              around the clock. Whether a customer is asking about brake noise at 11 PM or wants
              to know if their check engine light is urgent, the AI gives confident, accurate
              answers based on your shop's services and pricing.
            </p>
            <p>
              Next, try the <strong>Smart Repair Estimator</strong>. Select a repair category,
              choose economy, OEM, or premium parts, and watch a branded, itemized estimate
              appear in seconds. The transparency builds trust — customers see exactly what
              they're paying for: parts cost, labor hours, shop supplies, and tax. No more
              estimate disputes. No more customers calling three other shops because your quote
              felt like a black box. This is the kind of speed and clarity that wins approvals
              on the spot.
            </p>
            <p>
              Finally, the <strong>AI Voice Service Reminder</strong> demonstrates how natural
              voice AI keeps your bays full. The system calls customers when their next oil
              change, tire rotation, or scheduled maintenance is due — using conversational speech
              that handles rescheduling, answers questions, and books the appointment in real
              time. It's the follow-up system your service advisors wish they had time for, running
              automatically in the background.
            </p>
            <p>
              Enter your shop website above to see each auto repair automation demo branded to
              your business, or jump straight in with the default configuration. Whether you are
              evaluating AI for your shop operations, looking for a smarter repair estimate tool,
              or simply curious what modern automation looks like in the automotive service
              industry, these demos give you a clear, no-commitment preview of the results.
            </p>
          </div>
        </section>

        <DemoVideoCards vertical="Auto Repair" />

        <div className="grid gap-6">
          {demos.map((d, i) => (
            <Link key={d.to} to={d.to} onClick={() => trackDemoClick(d.title, 'autorepair')} className="group animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
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
            Ready to see these systems live in your shop?
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'autorepair_demo_hub')}>
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

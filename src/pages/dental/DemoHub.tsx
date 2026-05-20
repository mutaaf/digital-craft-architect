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

const DentalDemoHub = () => {
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
      to: '/dental/demo/intake',
      icon: <MessageSquare size={28} />,
      title: 'AI Patient Intake Qualifier',
      description: `Chat with ${possessive} AI as a new patient. Watch it collect medical history, insurance info, and chief complaint — qualifying and routing the patient in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      to: '/dental/demo/estimate',
      icon: <Calculator size={28} />,
      title: 'Smart Treatment Estimator',
      description: `Select a procedure, enter patient details, and get a branded treatment estimate using ${possessive} fee schedule in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      to: '/dental/demo/voice-recall',
      icon: <Phone size={28} />,
      title: 'AI Voice Recall Agent',
      description:
        'Experience the AI voice agent that calls overdue patients to schedule their next cleaning, confirm appointments, or fill last-minute cancellations — with natural conversation and real-time transcription.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Dental Practices | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Patient Intake Qualifier, Smart Treatment Estimator, and AI Voice Recall Agent. See the future of your practice.`
    : 'Three working AI proof-of-concepts for dental practices: Patient Intake Qualifier, Smart Treatment Estimator, and AI Voice Recall Agent.';

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
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Dental AI Automation Demos</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Three working proof-of-concepts showing exactly how AI will transform {possessive}{' '}
            patient intake, treatment estimating, and recall outreach.
          </p>
        </div>

        <CompanySetupForm />

        {/* SEO intro section */}
        <section className="mb-10 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            AI for Dental Practices: Interactive Automation Demos
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            <p>
              If you run a dental practice, you already know the bottlenecks: new patients
              waiting on hold, intake forms that eat up front-desk time, hygiene recall lists
              gathering dust, and last-minute cancellations that leave chairs empty. These
              three dental automation demos let you experience, hands-on, how AI solves each
              of those problems — personalized to your own practice, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Patient Intake Qualifier</strong> to see how a GPT-4o
              chatbot collects medical history, insurance information, and chief complaint from
              new patients in real time — before they even walk through your door. The AI
              qualifies the patient, flags medical alerts, and routes urgent cases so your team
              can focus on clinical care instead of clipboard management.
            </p>
            <p>
              Next, try the <strong>Smart Treatment Estimator</strong> — select a procedure
              category, enter the specifics, and receive a branded cost estimate in under 60
              seconds. Patients see a clear breakdown of fees, expected insurance coverage, and
              their out-of-pocket responsibility. The speed and transparency drives case
              acceptance because patients trust what they can see and understand immediately.
            </p>
            <p>
              Finally, the <strong>AI Voice Recall Agent</strong> demonstrates how a natural-
              sounding AI phone call can reactivate overdue patients, confirm upcoming
              appointments, and fill last-minute cancellations from your waitlist — all with
              live transcription and a post-call summary your team can review. Practices using
              voice recall automation see no-show rates drop by up to 45% and hygiene
              utilization climb significantly within the first quarter.
            </p>
            <p>
              Enter your practice website above to see each dental automation demo branded to
              your business, or jump straight in with the default configuration. Whether you
              are a solo practitioner evaluating AI for patient communication, a group practice
              looking for smarter scheduling, or a DSO exploring enterprise-scale automation,
              these demos give you a clear, no-commitment preview of the results. Every demo
              runs on the same production AI stack we deploy for clients — no mock data, no
              smoke and mirrors.
            </p>
          </div>
        </section>

        <DemoVideoCards vertical="Dental" />

        <div className="grid gap-6">
          {demos.map((d, i) => (
            <Link key={d.to} to={d.to} onClick={() => trackDemoClick(d.title, 'dental')} className="group animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
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
            Ready to see these systems live in your practice?
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'dental_demo_hub')}>
              Book a Call with DigitalCraft AI <ArrowRight size={18} />
            </a>
          </Button>
        </div>
      </div>
      <StickyCTA />
    </div>
  );
};

export default DentalDemoHub;

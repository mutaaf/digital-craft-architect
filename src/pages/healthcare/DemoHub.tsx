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
      to: '/healthcare/demo/intake',
      icon: <MessageSquare size={28} />,
      title: 'AI Patient Intake',
      description: `Chat with ${possessive} AI as a new patient. Watch it collect demographics, insurance details, medical history, and chief complaints — all before you arrive at the office.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      to: '/healthcare/demo/scheduler',
      icon: <Calculator size={28} />,
      title: 'Smart Appointment Scheduler',
      description: `Select a visit type, pick a provider, and watch ${possessive} AI scheduler find the best available slot, confirm the appointment, and send reminders — in under 60 seconds.`,
      tags: ['EHR Integration', 'Real-Time Availability'],
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      to: '/healthcare/demo/voice-followup',
      icon: <Phone size={28} />,
      title: 'AI Voice Recall Agent',
      description:
        'Experience a live AI voice call that contacts patients overdue for preventive screenings, annual physicals, or follow-up visits — with natural conversation, real-time transcription, and automatic rescheduling.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Healthcare | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Patient Intake, Smart Scheduling, and Voice Recall. See the future of your practice.`
    : 'Three working AI proof-of-concepts for medical practices: Patient Intake Qualifier, Smart Appointment Scheduler, and AI Voice Recall Agent.';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/og-default.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content="/og-default.png" />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> Built for {name}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Healthcare AI Automation Demos</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Three working proof-of-concepts showing exactly how AI will transform {possessive}{' '}
            patient intake, scheduling, and recall outreach.
          </p>
        </div>

        <CompanySetupForm />

        {/* SEO intro section */}
        <section className="mb-10 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            AI for Healthcare: Interactive Automation Demos
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            <p>
              If you run a medical practice, you already know the bottlenecks: new patients
              arriving with incomplete paperwork, appointment no-shows that leave providers
              idle, phone lines jammed with routine scheduling calls, and patients overdue for
              preventive care who silently drift away. These three healthcare automation demos
              let you experience, hands-on, how AI solves each of those problems — personalized
              to your own practice, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Patient Intake</strong> to see how a GPT-4o chatbot
              collects demographics, insurance information, medical history, medications,
              allergies, and chief complaints before the patient even walks through the door.
              The AI asks follow-up questions when answers are incomplete, flags urgent symptoms
              for triage, and delivers a structured intake summary your clinical staff can
              review in seconds rather than minutes.
            </p>
            <p>
              Next, try the <strong>Smart Appointment Scheduler</strong> — select a visit type,
              choose a provider, and watch the AI find the best available slot based on your
              practice's scheduling rules. It handles new patient visits, follow-ups, annual
              physicals, and specialist referrals. The scheduler sends automated confirmation
              messages and manages a dynamic waitlist that fills cancellations before they
              become empty slots on your calendar.
            </p>
            <p>
              Finally, the <strong>AI Voice Recall Agent</strong> takes patient outreach to the
              next level. It places natural-sounding voice calls to patients overdue for
              screenings, annual physicals, or follow-up appointments. The AI confirms interest,
              offers available times, and books directly into your schedule — all with real-time
              transcription so your staff can monitor every conversation. Patients who don't
              answer receive a follow-up SMS, and those who decline are flagged for manual
              review.
            </p>
            <p>
              Every demo runs on the same production AI stack we deploy for clients — no mock
              data, no smoke and mirrors. Enter your practice website above to see each
              healthcare automation demo branded to your business, or jump straight in with the
              default configuration. Whether you are evaluating AI for medical practice
              operations, looking to reduce no-shows, or exploring how automation can improve
              patient recall compliance, these demos give you a clear, no-commitment preview
              of the results.
            </p>
          </div>
        </section>

        <DemoVideoCards vertical="Healthcare" />

        <div className="grid gap-6">
          {demos.map((d, i) => (
            <Link key={d.to} to={d.to} onClick={() => trackDemoClick(d.title, 'healthcare')} className="group animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
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
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'healthcare_demo_hub')}>
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

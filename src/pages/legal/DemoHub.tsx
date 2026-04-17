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
      to: '/legal/demo/intake',
      icon: <MessageSquare size={28} />,
      title: 'AI Client Intake',
      description: `Chat with ${possessive} AI as a prospective client. Watch it screen case type, check for conflicts, gather key details, and book a consultation — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      to: '/legal/demo/consultation',
      icon: <Calculator size={28} />,
      title: 'Smart Consultation Scheduler',
      description: `Select a practice area, describe your situation, and get a branded consultation booking with estimated case evaluation — using ${possessive} calendar in under 60 seconds.`,
      tags: ['Real-Time Scheduling', 'Branded Output'],
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      to: '/legal/demo/voice-followup',
      icon: <Phone size={28} />,
      title: 'AI Voice Follow-Up',
      description:
        'Experience an AI voice agent that calls back missed consultation requests, reschedules no-shows, and qualifies prospects by phone — with live transcription and a full call summary.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Law Firms | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Client Intake Qualifier, Consultation Scheduler, and Voice Follow-Up. See the future of your practice.`
    : 'Three working AI proof-of-concepts for law firms: Client Intake Qualifier, Smart Consultation Scheduler, and AI Voice Follow-Up Agent.';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/og-legal.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content="/og-legal.png" />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> Built for {name}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Legal AI Automation Demos</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Three working proof-of-concepts showing exactly how AI will transform {possessive}{' '}
            client intake, consultation scheduling, and prospect follow-up.
          </p>
        </div>

        <CompanySetupForm />

        {/* SEO intro section */}
        <section className="mb-10 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            AI for Law Firms: Interactive Automation Demos
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            <p>
              If you run a law firm, you know the bottlenecks intimately: prospective clients who
              call while your attorneys are in court, intake forms that sit unreviewed for hours,
              consultation no-shows that never get rescheduled, and qualified leads that slip away
              because no one followed up fast enough. These three legal AI automation demos let you
              experience, hands-on, how artificial intelligence solves each of those problems —
              personalized to your own firm, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Client Intake</strong> demo to see how a GPT-4o-powered
              chatbot screens prospective clients in real time, collecting case type, opposing party
              details, and timeline information while checking for conflicts of interest and booking
              a consultation on your calendar. The system qualifies every inquiry instantly — even
              at 11pm on a Saturday — so you never lose another viable case to a slower competitor.
            </p>
            <p>
              Next, try the <strong>Smart Consultation Scheduler</strong>. Select a practice area,
              describe the situation, and watch the AI generate a branded consultation booking
              complete with estimated case evaluation. It syncs with your calendar, sends
              confirmation reminders, and automatically reschedules no-shows — reducing the
              administrative burden on your front desk by hours every week.
            </p>
            <p>
              Finally, the <strong>AI Voice Follow-Up</strong> takes it one step further. After a
              missed call or a consultation no-show, the AI places a natural-sounding voice call to
              the prospect within minutes, re-qualifies them, and reschedules the meeting. You get
              a live transcript during the call and a detailed summary with recommended next steps
              when it ends. Every demo runs on the same production AI stack we deploy for clients —
              no mock data, no smoke and mirrors.
            </p>
            <p>
              Enter your firm's website above to see each legal AI demo branded to your practice,
              or jump straight in with the default configuration. Whether you are evaluating AI for
              legal operations, looking for a smarter client intake system, or simply curious what
              modern automation looks like in the legal profession, these demos give you a clear,
              no-commitment preview of the results. All interactions respect attorney-client
              confidentiality guidelines — no conversation data is stored beyond the active session.
            </p>
          </div>
        </section>

        <div className="grid gap-6">
          {demos.map((d, i) => (
            <Link key={d.to} to={d.to} onClick={() => trackDemoClick(d.title, 'legal')} className="group animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
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
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'legal_demo_hub')}>
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

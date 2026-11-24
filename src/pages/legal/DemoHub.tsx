import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDemoContext } from '@/contexts/DemoContext';
import {
  MessageSquare,
  Calculator,
  Phone,
} from 'lucide-react';
import DemoHubKeynote from '@/v3/DemoHubKeynote';

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
    },
    {
      to: '/legal/demo/consultation',
      icon: <Calculator size={28} />,
      title: 'Smart Consultation Scheduler',
      description: `Select a practice area, describe your situation, and get a branded consultation booking with estimated case evaluation — using ${possessive} calendar in under 60 seconds.`,
      tags: ['Real-Time Scheduling', 'Branded Output'],
    },
    {
      to: '/legal/demo/voice-followup',
      icon: <Phone size={28} />,
      title: 'AI Voice Follow-Up',
      description:
        'Experience an AI voice agent that calls back missed consultation requests, reschedules no-shows, and qualifies prospects by phone — with live transcription and a full call summary.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Law Firms | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Client Intake Qualifier, Consultation Scheduler, and Voice Follow-Up. See the future of your practice.`
    : 'Three working AI proof-of-concepts for law firms: Client Intake Qualifier, Smart Consultation Scheduler, and AI Voice Follow-Up Agent.';

  return (
    <>
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
      <DemoHubKeynote
        industry="Legal"
        analyticsKey="legal"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Legal"
        seoIntro={
          <>
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
          </>
        }
      />
    </>
  );
};

export default DemoHub;

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
      to: '/healthcare/demo/intake',
      icon: <MessageSquare size={28} />,
      title: 'AI Patient Intake',
      description: `Chat with ${possessive} AI as a new patient. Watch it collect demographics, insurance details, medical history, and chief complaints — all before you arrive at the office.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
    },
    {
      to: '/healthcare/demo/scheduler',
      icon: <Calculator size={28} />,
      title: 'Smart Appointment Scheduler',
      description: `Select a visit type, pick a provider, and watch ${possessive} AI scheduler find the best available slot, confirm the appointment, and send reminders — in under 60 seconds.`,
      tags: ['EHR Integration', 'Real-Time Availability'],
    },
    {
      to: '/healthcare/demo/voice-followup',
      icon: <Phone size={28} />,
      title: 'AI Voice Recall Agent',
      description:
        'Experience a live AI voice call that contacts patients overdue for preventive screenings, annual physicals, or follow-up visits — with natural conversation, real-time transcription, and automatic rescheduling.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Healthcare | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Patient Intake, Smart Scheduling, and Voice Recall. See the future of your practice.`
    : 'Three working AI proof-of-concepts for medical practices: Patient Intake Qualifier, Smart Appointment Scheduler, and AI Voice Recall Agent.';

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
        industry="Healthcare"
        analyticsKey="healthcare"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Healthcare"
        seoIntro={
          <>
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
          </>
        }
      />
    </>
  );
};

export default DemoHub;

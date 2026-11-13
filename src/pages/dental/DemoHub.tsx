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
    },
    {
      to: '/dental/demo/estimate',
      icon: <Calculator size={28} />,
      title: 'Smart Treatment Estimator',
      description: `Select a procedure, enter patient details, and get a branded treatment estimate using ${possessive} fee schedule in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
    },
    {
      to: '/dental/demo/voice-recall',
      icon: <Phone size={28} />,
      title: 'AI Voice Recall Agent',
      description:
        'Experience the AI voice agent that calls overdue patients to schedule their next cleaning, confirm appointments, or fill last-minute cancellations — with natural conversation and real-time transcription.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Dental Practices | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Patient Intake Qualifier, Smart Treatment Estimator, and AI Voice Recall Agent. See the future of your practice.`
    : 'Three working AI proof-of-concepts for dental practices: Patient Intake Qualifier, Smart Treatment Estimator, and AI Voice Recall Agent.';

  return (
    <>
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
      <DemoHubKeynote
        industry="Dental"
        analyticsKey="dental"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Dental"
        seoIntro={
          <>
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
          </>
        }
      />
    </>
  );
};

export default DentalDemoHub;

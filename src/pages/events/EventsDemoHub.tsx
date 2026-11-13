import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDemoContext } from '@/contexts/DemoContext';
import {
  MessageSquare,
  FileText,
  Phone,
} from 'lucide-react';
import DemoHubKeynote from '@/v3/DemoHubKeynote';

const EventsDemoHub = () => {
  const { company, isCustomized, loadFromUrl, isLoading } = useDemoContext();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const site = searchParams.get('site');
    if (site && !isCustomized && !isLoading) {
      loadFromUrl(site);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      to: '/events/demo/inquiry',
      icon: <MessageSquare size={28} />,
      title: 'AI Inquiry Qualifier',
      description: `Chat with ${possessive} AI as someone planning an event. Watch it qualify leads by event type, date, guest count, budget, and style — then auto-book a consultation.`,
      tags: ['GPT-4o Streaming', 'Lead Scoring'],
    },
    {
      to: '/events/demo/proposal',
      icon: <FileText size={28} />,
      title: 'Smart Proposal Generator',
      description: `Select a service type, enter guest count, pick a package tier, and get a branded proposal in 60 seconds — powered by ${possessive} real pricing.`,
      tags: ['Real Pricing', 'Branded Output'],
    },
    {
      to: '/events/demo/voice-booking',
      icon: <Phone size={28} />,
      title: 'AI Voice Booking Agent',
      description:
        'Enter lead details and let the AI call to confirm interest, discuss packages for their event type, and schedule a consultation. Watch the live transcript and summary.',
      tags: ['Vapi Voice AI', 'Live Transcription'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Event Vendors | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Inquiry Qualifier, Proposal Generator, and Voice Booking Agent. See the future of your event business.`
    : 'Three working AI proof-of-concepts for event vendors: Inquiry Qualifier, Proposal Generator, and Voice Booking Agent.';

  return (
    <>
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
      </Helmet>
      <DemoHubKeynote
        industry="Event"
        analyticsKey="events"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Event Planning"
        videoPoster="/og-events.png"
        seoIntro={
          <>
            <p>
              Running an event planning business means juggling dozens of inquiries at once —
              couples asking about wedding packages, corporate clients requesting proposals for
              galas, and last-minute party planners who need answers now. Most event vendors lose
              bookings simply because they cannot respond fast enough, especially during peak
              season when every hour counts. These three event automation demos show you exactly
              how AI handles the heavy lifting, personalized to your own brand, so you can see
              real results instead of reading about them.
            </p>
            <p>
              Start with the <strong>AI Inquiry Qualifier</strong> to watch a GPT-4o-powered
              chatbot engage prospective clients in real time. It asks about event type, date,
              guest count, budget, and style preferences, then scores the lead and books a
              consultation — all without your team lifting a finger. This is the kind of
              AI for event planning that turns after-hours website visits into confirmed
              appointments by morning.
            </p>
            <p>
              Next, try the <strong>AI Proposal Generator</strong>. Select a service category,
              enter the guest count, choose a package tier, and receive a polished, branded
              proposal in under 60 seconds. No more spending hours in Word or Canva assembling
              quotes — the AI proposal generator pulls from your real pricing to deliver
              professional documents that clients can review immediately, giving you a
              competitive edge when speed matters most.
            </p>
            <p>
              Finally, experience the <strong>AI Voice Booking Agent</strong>. Enter a lead's
              details and let the AI place an outbound call to confirm interest, discuss
              available packages, and schedule a consultation — all with natural speech and
              live transcription. After the call, you receive a full summary with key
              takeaways and recommended next steps. This is event automation at its most
              advanced: a voice agent that follows up with leads so your team can focus on
              executing unforgettable events.
            </p>
            <p>
              Enter your company website above to see each demo branded to your business, or
              explore with the default configuration. Whether you are a wedding planner
              evaluating AI for event planning, a catering company looking for a faster
              AI proposal generator, or a venue owner curious about event automation, these
              interactive demos give you a no-commitment preview of how AI transforms
              the way event professionals win and manage clients.
            </p>
          </>
        }
      />
    </>
  );
};

export default EventsDemoHub;

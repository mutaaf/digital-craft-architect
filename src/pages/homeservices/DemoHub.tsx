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
      to: '/homeservices/demo/lead-responder',
      icon: <MessageSquare size={28} />,
      title: 'AI Lead Qualifier',
      description: `Chat with ${possessive} AI as a homeowner requesting service. Watch it identify the issue, assess urgency, collect details, and book a technician visit — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
    },
    {
      to: '/homeservices/demo/estimate',
      icon: <Calculator size={28} />,
      title: 'Smart Estimate Generator',
      description: `Pick a service category, describe the job, and get a branded ballpark estimate using ${possessive} pricing in under 60 seconds — before your competitor even calls back.`,
      tags: ['Real Pricing', 'Branded Output'],
    },
    {
      to: '/homeservices/demo/voice-followup',
      icon: <Phone size={28} />,
      title: 'AI Voice Follow-Up',
      description:
        'Experience an AI voice agent that follows up with leads, confirms appointments, and requests reviews after completed jobs — using natural speech with real-time transcription.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Home Services | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Lead Qualifier, Smart Estimates, and AI Voice Follow-Up. See the future of your home service business.`
    : 'Three working AI proof-of-concepts for home service businesses: Lead Qualifier, Smart Estimate Generator, and AI Voice Follow-Up System.';

  return (
    <>
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
      <DemoHubKeynote
        industry="Home Services"
        analyticsKey="homeservices"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Home Services"
        seoIntro={
          <>
            <p>
              If you run an HVAC company, plumbing business, electrical shop, or landscaping crew,
              you already know the bottlenecks: service calls that go unanswered after hours,
              estimates that take days to put together, no-show appointments that leave your trucks
              sitting idle, and five-star jobs that never turn into five-star reviews. These three
              home services automation demos let you experience, hands-on, how AI solves each of
              those problems — personalized to your own company, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Lead Qualifier</strong> to see how a GPT-4o-powered chatbot
              handles incoming service requests in real time. It identifies whether the caller needs
              HVAC repair, a plumbing emergency, electrical work, or landscaping — then collects
              the property details, assesses urgency, and books a technician visit on your calendar
              before the homeowner hangs up. For businesses that lose 40% or more of their leads to
              slow response times, this single tool can triple your booked jobs overnight.
            </p>
            <p>
              Next, try the <strong>Smart Estimate Generator</strong>. Select a service category —
              HVAC install, water heater replacement, panel upgrade, landscape design, roof repair —
              enter the basic job parameters, and receive a branded ballpark estimate in under 60
              seconds. Customers get a number while they are still on the phone, which means they
              book with you instead of calling three more companies. The estimates use your actual
              labor rates and parts pricing, so the numbers are real, not generic.
            </p>
            <p>
              Finally, experience the <strong>AI Voice Follow-Up</strong> system. This voice AI
              agent places outbound calls to confirm upcoming appointments, follow up with leads
              who haven't booked yet, and request Google reviews after completed jobs. You will
              hear the natural-sounding conversation in real time, see a live transcript, and get
              a post-call summary with recommended next steps. Every demo runs on the same
              production AI stack we deploy for clients — no mock data, no smoke and mirrors.
            </p>
            <p>
              Enter your company website above to see each home services automation demo branded to
              your business, or jump straight in with the default configuration. Whether you are
              evaluating AI for your HVAC operations, looking for a smarter way to handle plumbing
              leads, or simply curious what modern automation looks like in the trades, these demos
              give you a clear, no-commitment preview of the results.
            </p>
          </>
        }
      />
    </>
  );
};

export default DemoHub;

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

const SalonDemoHub = () => {
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
      to: '/salon/demo/booking',
      icon: <MessageSquare size={28} />,
      title: 'AI Booking Qualifier',
      description: `Chat with ${possessive} AI as a potential client. Watch it qualify service needs, recommend treatments, and book appointments — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
    },
    {
      to: '/salon/demo/services',
      icon: <Calculator size={28} />,
      title: 'Smart Service Estimator',
      description: `Pick a service category, customize add-ons, and get a branded service estimate using ${possessive} pricing in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
    },
    {
      to: '/salon/demo/voice-rebook',
      icon: <Phone size={28} />,
      title: 'AI Voice Rebooking Agent',
      description:
        'Listen to the AI place a friendly rebooking call to a lapsed client. It uses natural speech, personalized scripts, and books follow-up appointments live.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Salons & Spas | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Booking Qualifier, Smart Service Estimator, and Voice Rebooking Agent. See the future of your salon.`
    : 'Three working AI proof-of-concepts for salons and spas: AI Booking Qualifier, Smart Service Estimator, and Voice Rebooking Agent.';

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
        industry="Salon & spa"
        analyticsKey="salon"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Salons & Spas"
        seoIntro={
          <>
            <p>
              If you own or manage a salon or spa, you already know the daily revenue killers:
              last-minute cancellations that leave chairs empty, clients who walk out without
              rebooking, retail products gathering dust on shelves, and a front desk team stretched
              too thin to follow up with everyone. These three salon automation demos let you
              experience, hands-on, how AI solves each of those problems — personalized to your
              own business, not a generic pitch deck.
            </p>
            <p>
              Start with the <strong>AI Booking Qualifier</strong> to see how a GPT-4o chatbot
              handles new client inquiries in real time. It asks about hair type, service preferences,
              and scheduling needs, then recommends the right stylist and books the appointment —
              all without your front desk lifting a finger. Whether it is 2 AM or the middle of a
              Saturday rush, the AI never misses a potential booking.
            </p>
            <p>
              Next, try the <strong>Smart Service Estimator</strong>. Select from haircuts, color
              treatments, spa services, or bridal packages — add optional upgrades like deep
              conditioning, scalp treatments, or premium product lines — and get a branded price
              estimate in seconds. Clients can browse your full menu, build their own package, and
              see transparent pricing before they ever sit in the chair. It is the kind of
              experience that builds trust and drives higher average ticket values.
            </p>
            <p>
              Finally, the <strong>AI Voice Rebooking Agent</strong> demonstrates how voice AI
              brings lapsed clients back. The system identifies clients who are overdue for their
              next appointment, places a natural-sounding phone call with personalized talking points
              based on their service history, and books a follow-up appointment live on the call.
              You get a full transcript, rebooking confirmation, and analytics on every outreach
              attempt.
            </p>
            <p>
              Every demo runs on the same production AI stack we deploy for clients — no mock data,
              no smoke and mirrors. Enter your salon or spa website above to see each demo branded
              to your business, or jump straight in with the default configuration. Whether you are
              evaluating AI for salon operations, looking to reduce no-shows, boost retail revenue,
              or simply curious what modern automation looks like in the beauty industry, these
              demos give you a clear, no-commitment preview of the results.
            </p>
          </>
        }
      />
    </>
  );
};

export default SalonDemoHub;

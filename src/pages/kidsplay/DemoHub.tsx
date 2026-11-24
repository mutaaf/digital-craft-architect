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
      to: '/kidsplay/demo/party-booker',
      icon: <MessageSquare size={28} />,
      title: 'AI Party Booking Qualifier',
      description: `Chat with ${possessive} AI as a parent looking to book a birthday party. Watch it qualify the inquiry, recommend packages, and handle booking — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
    },
    {
      to: '/kidsplay/demo/packages',
      icon: <Calculator size={28} />,
      title: 'Smart Party Package Estimator',
      description: `Pick a party type, choose your add-ons, and get a branded package quote using ${possessive} pricing in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
    },
    {
      to: '/kidsplay/demo/voice-booking',
      icon: <Phone size={28} />,
      title: 'AI Voice Booking Agent',
      description:
        'Call the AI and book a party by voice. Experience natural conversation about packages, availability, and pricing — with live transcription and a full call summary.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Kids Play & Family Entertainment | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Party Booking Qualifier, Smart Package Estimator, and Voice Booking Agent. See the future of your venue.`
    : 'Three working AI proof-of-concepts for kids play places and family entertainment centers: Party Booking Qualifier, Smart Package Estimator, and AI Voice Booking Agent.';

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
        industry="Kids Play"
        analyticsKey="kidsplay"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Kids Play"
        seoIntro={
          <>
            <p>
              If you run a kids play place, indoor playground, trampoline park, or family
              entertainment center, you already know the bottlenecks: parents calling about
              birthday parties during your busiest hours, inquiries that sit unanswered until
              the next morning, seasonal spikes that overwhelm your front desk, and walk-in
              confusion that frustrates families and staff alike. These three kids play
              automation demos let you experience, hands-on, how AI solves each of those
              problems — personalized to your own venue, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Party Booking Qualifier</strong> to see how a GPT-4o
              chatbot handles parent inquiries in real time, qualifying party size, child age,
              preferred date, and package preferences while booking on your behalf. The AI
              responds to every inquiry in under 60 seconds — even at 10pm on a Saturday —
              so you never lose a booking to a competitor who answered faster.
            </p>
            <p>
              Next, try the <strong>Smart Party Package Estimator</strong>. Parents select a
              party type, choose their guest count, and add extras like face painting, character
              appearances, food packages, or photo booths. The tool generates a branded price
              breakdown instantly, giving parents the transparency they want and saving your
              staff from answering the same pricing questions dozens of times a day.
            </p>
            <p>
              Finally, the <strong>AI Voice Booking Agent</strong> takes it one step further:
              parents can call your venue and speak naturally to the AI, which answers
              questions about availability, walks them through package options, and books their
              party — all with live transcription and a post-call summary. This is the same
              production AI stack we deploy for clients, running on real voice AI technology
              with natural speech recognition and response.
            </p>
            <p>
              Enter your venue website above to see each demo branded to your business, or
              jump straight in with the default configuration. Whether you are evaluating AI
              for your play place, looking for a smarter party booking system, or simply curious
              what modern automation looks like in family entertainment, these demos give you a
              clear, no-commitment preview of the results.
            </p>
          </>
        }
      />
    </>
  );
};

export default DemoHub;

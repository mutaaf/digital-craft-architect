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
      to: '/fitness/demo/lead-qualifier',
      icon: <MessageSquare size={28} />,
      title: 'AI Membership Qualifier',
      description: `Chat with ${possessive} AI as a potential gym member. Watch it qualify leads, understand fitness goals, recommend membership tiers, and book trial classes — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
    },
    {
      to: '/fitness/demo/membership',
      icon: <Calculator size={28} />,
      title: 'Smart Membership Estimator',
      description: `Select your fitness goals, preferred class types, and visit frequency — get a personalized membership recommendation using ${possessive} pricing in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
    },
    {
      to: '/fitness/demo/voice-retention',
      icon: <Phone size={28} />,
      title: 'AI Voice Retention Agent',
      description:
        'Experience a live AI voice call that reaches out to at-risk members, fills empty class slots from the waitlist, and re-engages lapsed trial members — with real-time transcription and a post-call summary.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Fitness & Gyms | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Membership Qualifier, Smart Estimator, and Voice Retention Agent. See the future of your fitness business.`
    : 'Three working AI proof-of-concepts for gyms and fitness studios: Membership Qualifier, Smart Membership Estimator, and AI Voice Retention Agent.';

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
        industry="Fitness"
        analyticsKey="fitness"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Fitness"
        seoIntro={
          <>
            <p>
              If you run a gym or fitness studio, you already know the bottlenecks: website visitors
              who inquire at midnight and never hear back, trial members who visit once and vanish,
              classes that run half-empty because cancellations happen last minute, and long-time
              members who quietly stop showing up until they cancel. These three fitness automation
              demos let you experience, hands-on, how AI solves each of those problems —
              personalized to your own business, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Membership Qualifier</strong> to see how a GPT-4o chatbot
              handles incoming inquiries in real time — understanding fitness goals, recommending the
              right membership tier, answering questions about class schedules and pricing, and
              booking a trial visit on your behalf. This isn't a simple FAQ bot; it has a real
              conversation, qualifies the lead, and captures everything your sales team needs to
              close.
            </p>
            <p>
              Next, try the <strong>Smart Membership Estimator</strong>. Prospects select their
              fitness goals, preferred class types, and how often they plan to visit. The AI
              recommends the best membership tier, shows transparent pricing with optional add-ons
              like personal training packages and class bundles, and generates a branded summary they
              can take home — the kind of instant clarity that converts browsers into members before
              they even walk through the door.
            </p>
            <p>
              Finally, the <strong>AI Voice Retention Agent</strong> demonstrates the most powerful
              tool in your arsenal: proactive outreach. When a member's attendance drops, the AI
              places a natural voice call to check in, offer a complimentary session, or suggest a
              schedule change. When a class has a last-minute cancellation, it calls the next person
              on the waitlist. When a trial member hasn't booked their second visit, it follows up
              with a personalized invitation. Every call is transcribed in real time with a
              post-call summary and recommended next steps.
            </p>
            <p>
              Enter your gym or studio website above to see each demo branded to your business, or
              jump straight in with the default configuration. Whether you're evaluating AI for
              fitness operations, looking for a smarter way to convert trials into members, or
              curious what modern member retention automation looks like, these demos give you a
              clear, no-commitment preview of the results.
            </p>
          </>
        }
      />
    </>
  );
};

export default DemoHub;

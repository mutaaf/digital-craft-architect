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
      to: '/autorepair/demo/advisor',
      icon: <MessageSquare size={28} />,
      title: 'AI Service Advisor',
      description: `Chat with ${possessive} AI as a vehicle owner. Watch it diagnose symptoms, recommend services, quote pricing, and book appointments — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
    },
    {
      to: '/autorepair/demo/estimate',
      icon: <Calculator size={28} />,
      title: 'Smart Repair Estimator',
      description: `Pick a repair category, select your vehicle details, and get a branded transparent estimate using ${possessive} labor rates in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
    },
    {
      to: '/autorepair/demo/voice-reminder',
      icon: <Phone size={28} />,
      title: 'AI Voice Service Reminder',
      description:
        'Experience how AI calls customers to remind them about upcoming maintenance, handles rescheduling in real time, and keeps your bays full with natural voice conversations.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Auto Repair | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Service Advisor, Smart Repair Estimator, and Voice Service Reminders. See the future of your shop.`
    : 'Three working AI proof-of-concepts for auto repair businesses: AI Service Advisor, Smart Repair Estimator, and AI Voice Service Reminders.';

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
        industry="Auto Repair"
        analyticsKey="autorepair"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Auto Repair"
        seoIntro={
          <>
            <p>
              If you run an auto repair shop or dealership service center, you already know the
              bottlenecks: service calls that go unanswered after hours, estimates that take too
              long and breed distrust, declined repairs that never get followed up on, and
              maintenance customers who drift to competitors because no one reminded them to come
              back. These three auto repair automation demos let you experience, hands-on, how AI
              solves each of those problems — personalized to your own shop, not a generic pitch
              deck.
            </p>
            <p>
              Start with the <strong>AI Service Advisor</strong> to see how a GPT-4o chatbot
              handles vehicle owner inquiries in real time — diagnosing symptoms, recommending
              services, quoting transparent pricing, and booking appointments automatically. It
              answers the questions your front desk gets a hundred times a day, but instantly and
              around the clock. Whether a customer is asking about brake noise at 11 PM or wants
              to know if their check engine light is urgent, the AI gives confident, accurate
              answers based on your shop's services and pricing.
            </p>
            <p>
              Next, try the <strong>Smart Repair Estimator</strong>. Select a repair category,
              choose economy, OEM, or premium parts, and watch a branded, itemized estimate
              appear in seconds. The transparency builds trust — customers see exactly what
              they're paying for: parts cost, labor hours, shop supplies, and tax. No more
              estimate disputes. No more customers calling three other shops because your quote
              felt like a black box. This is the kind of speed and clarity that wins approvals
              on the spot.
            </p>
            <p>
              Finally, the <strong>AI Voice Service Reminder</strong> demonstrates how natural
              voice AI keeps your bays full. The system calls customers when their next oil
              change, tire rotation, or scheduled maintenance is due — using conversational speech
              that handles rescheduling, answers questions, and books the appointment in real
              time. It's the follow-up system your service advisors wish they had time for, running
              automatically in the background.
            </p>
            <p>
              Enter your shop website above to see each auto repair automation demo branded to
              your business, or jump straight in with the default configuration. Whether you are
              evaluating AI for your shop operations, looking for a smarter repair estimate tool,
              or simply curious what modern automation looks like in the automotive service
              industry, these demos give you a clear, no-commitment preview of the results.
            </p>
          </>
        }
      />
    </>
  );
};

export default DemoHub;

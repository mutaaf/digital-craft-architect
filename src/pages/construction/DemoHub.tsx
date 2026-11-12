import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDemoContext } from '@/contexts/DemoContext';
import {
  MessageSquare,
  Calculator,
  Star,
  Home,
  Phone,
  FileText,
  MessageCircle,
  Gauge,
} from 'lucide-react';
import ResumeDemoPrompt from '@/components/ResumeDemoPrompt';
import DemoBreadcrumbs from '@/components/DemoBreadcrumbs';
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
      to: '/construction/demo/lead-responder',
      icon: <MessageSquare size={28} />,
      title: 'AI Lead Responder',
      description: `Chat with ${possessive} AI as a homeowner. Watch it qualify leads, extract project details, and book consultations — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
    },
    {
      to: '/construction/demo/estimate',
      icon: <Calculator size={28} />,
      title: 'Smart Estimate Generator',
      description: `Pick a project type, enter your square footage, and get a branded ballpark estimate using ${possessive} pricing in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
    },
    {
      to: '/construction/demo/invoice',
      icon: <FileText size={28} />,
      title: 'Invoice Generator',
      description: `Create a professional, branded invoice in seconds. Add client details, line items, and tax — get a polished PDF-ready invoice for ${possessive} projects.`,
      tags: ['Instant Output', 'Branded'],
    },
    {
      to: '/construction/demo/reviews',
      icon: <Star size={28} />,
      title: 'Review Request System',
      description:
        'Experience the automated SMS flow that turns completed projects into 5-star Google reviews — with Day 3 and Day 7 follow-ups.',
      tags: ['SMS Simulation', 'Analytics Dashboard'],
    },
    {
      to: '/construction/demo/sms-sequence',
      icon: <MessageCircle size={28} />,
      title: 'SMS Nurture Sequence',
      description: `Enter a lead's name and project type — get a 5-message SMS drip sequence with timing, personalized for ${possessive} business.`,
      tags: ['GPT-4o', 'Lead Nurture'],
    },
    {
      to: '/construction/demo/lead-scoring',
      icon: <Gauge size={28} />,
      title: 'AI Lead Scoring',
      description: `Paste a lead from a form or voicemail and get an instant 1 to 100 priority score with reasoning on budget fit, urgency, and decision-maker status, so ${possessive} team calls the hottest leads first.`,
      tags: ['GPT-4o', 'Lead Prioritization'],
    },
    {
      to: '/construction/demo/property-negotiator',
      icon: <Home size={28} />,
      title: 'AI Deal Analyzer',
      description:
        'Paste a listing URL, upload a screenshot, or enter property details — get a full negotiation playbook with offer price, strategy, and ROI projection in under 60 seconds.',
      tags: ['GPT-4o Vision', 'Negotiation Playbook'],
    },
    {
      to: '/construction/demo/voice-negotiator',
      icon: <Phone size={28} />,
      title: 'AI Voice Negotiator',
      description:
        'Analyze a property, set your bid range, and let the AI negotiate with the seller by phone. Watch the live transcript and get a full call summary with insights and next steps.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Construction | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Lead Responder, Smart Estimates, Review Automation, Deal Analyzer, and Voice Negotiator. See the future of your business.`
    : 'Five working AI proof-of-concepts for construction businesses: Lead Responder, Smart Estimate Generator, Review Request System, AI Deal Analyzer, and Voice Negotiator.';

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
        industry="Construction"
        analyticsKey="construction"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Construction"
        videoPoster="/og-construction.png"
        lead={<div className="mb-6 empty:hidden"><ResumeDemoPrompt /></div>}
        crumbs={<DemoBreadcrumbs />}
        seoIntro={
          <>
            <p>
              If you run a construction company, you already know the bottlenecks: leads that go
              unanswered after hours, estimates that take days to put together, five-star jobs that
              never turn into five-star reviews, and off-market deals that slip through because nobody
              had time to analyze the numbers. These five construction automation demos let you
              experience, hands-on, how AI solves each of those problems — personalized to your
              own company, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Lead Responder</strong> to see how a GPT-4o chatbot qualifies
              homeowner inquiries in real time, extracting project scope, budget, and timeline
              while booking a consultation on your behalf. Next, try the{' '}
              <strong>AI Estimate Generator</strong> — select a project type, enter square footage,
              and receive a branded ballpark estimate in under 60 seconds, the kind of speed that
              wins jobs before competitors even return the call.
            </p>
            <p>
              The <strong>Review Request System</strong> simulates the automated SMS drip that turns
              completed projects into Google reviews, complete with Day 3 and Day 7 follow-ups
              and a live analytics dashboard. For investors and flippers, the{' '}
              <strong>AI Deal Analyzer</strong> uses GPT-4o vision to extract property data from
              listings or screenshots, generate comparable sales, and produce a full negotiation
              playbook with offer price, strategy, and ROI projections.
            </p>
            <p>
              Finally, the <strong>AI Voice Negotiator</strong> takes it one step further: after
              analyzing a property, it places a live voice call to negotiate with the seller
              using natural speech, real-time transcription, and a post-call summary with
              recommended next steps. Every demo runs on the same production AI stack we deploy
              for clients — no mock data, no smoke and mirrors.
            </p>
            <p>
              Enter your company website above to see each construction automation demo branded to
              your business, or jump straight in with the default configuration. Whether you are
              evaluating AI for construction operations, looking for a smarter AI estimate
              generator, or simply curious what modern automation looks like in the trades, these
              demos give you a clear, no-commitment preview of the results.
            </p>
          </>
        }
      />
    </>
  );
};

export default DemoHub;

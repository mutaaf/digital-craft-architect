import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDemoContext } from '@/contexts/DemoContext';
import {
  Home,
  Phone,
  MessageSquare,
  FileText,
  BarChart3,
} from 'lucide-react';
import ResumeDemoPrompt from '@/components/ResumeDemoPrompt';
import DemoBreadcrumbs from '@/components/DemoBreadcrumbs';
import DemoHubKeynote from '@/v3/DemoHubKeynote';

const RealEstateDemoHub = () => {
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
      to: '/realestate/demo/property-negotiator',
      icon: <Home size={28} />,
      title: 'AI Deal Analyzer',
      description: `Paste a listing URL or enter property details and get a full negotiation playbook — offer price, comparable sales analysis, strategy, and ROI projection tailored for ${possessive} market.`,
      tags: ['GPT-4o Vision', 'CMA Analysis'],
    },
    {
      to: '/realestate/demo/voice-negotiator',
      icon: <Phone size={28} />,
      title: 'AI Voice Negotiator',
      description:
        'Set your bid range and let the AI call the seller to negotiate on your behalf. Watch the live transcript and receive a full call summary with insights and recommended next steps.',
      tags: ['Vapi Voice AI', 'Live Transcription'],
    },
    {
      to: '/realestate/demo/contract',
      icon: <FileText size={28} />,
      title: 'AI Contract Drafter',
      description: `Enter deal terms — buyer, seller, price, contingencies — and get a professional purchase agreement draft in seconds. Powered by GPT-4o.`,
      tags: ['GPT-4o', 'Instant Draft'],
    },
    {
      to: '/realestate/demo/lead-responder',
      icon: <MessageSquare size={28} />,
      title: 'AI Lead Qualifier',
      description: `Chat with ${possessive} AI as a potential buyer or seller. Watch it qualify leads, capture property preferences, and schedule showings — all automatically, 24/7.`,
      tags: ['GPT-4o Streaming', 'Lead Scoring'],
    },
    {
      to: '/realestate/demo/market-analysis',
      icon: <BarChart3 size={28} />,
      title: 'AI Market Analyzer',
      description: `Enter any zip code and get an instant market snapshot — median prices, days on market, rent-to-price ratios, and investment outlook for ${possessive} target markets.`,
      tags: ['GPT-4o', 'Market Data'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Real Estate | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Deal Analyzer, Voice Negotiator, and Lead Qualifier. See the future of your real estate business.`
    : 'Three working AI proof-of-concepts for real estate professionals: Deal Analyzer, Voice Negotiator, and Lead Qualifier.';

  return (
    <>
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/og-realestate.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content="/og-realestate.png" />
      </Helmet>
      <DemoHubKeynote
        industry="Real Estate"
        analyticsKey="realestate"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Real Estate"
        videoPoster="/og-realestate.png"
        lead={<div className="mb-6 empty:hidden"><ResumeDemoPrompt /></div>}
        crumbs={<DemoBreadcrumbs />}
        seoIntro={
          <>
            <p>
              Real estate moves fast, and the agents and investors who win are the ones who
              respond first, analyze deals faster, and follow up relentlessly. These three
              real estate AI tools let you experience exactly what that looks like — not in
              a pitch deck, but with live, working demos personalized to your brokerage or
              investment firm. Enter your website above and every demo adapts to your brand,
              your market, and your business.
            </p>
            <p>
              Start with the <strong>AI Deal Analyzer</strong>, the most comprehensive
              AI deal analysis demo available online. Paste any listing URL, upload a
              screenshot from Zillow or the MLS, or type in property details manually.
              Within seconds GPT-4o extracts the data, pulls comparable sales, calculates
              your maximum allowable offer, projects ROI, and drafts seller outreach
              messages — the full negotiation playbook that used to take an analyst hours
              to assemble.
            </p>
            <p>
              Next, take the analysis a step further with the <strong>AI Voice
              Negotiator</strong>. After the deal analyzer builds your playbook, set a
              bid range and let the AI place a live voice call to the seller. You will
              hear the conversation in real time, watch the transcript update word by
              word, and receive a post-call summary with sentiment analysis, key
              concessions, and recommended next steps. It is the same voice AI stack used
              by top-performing wholesalers and acquisition teams, running on Vapi with
              ElevenLabs natural speech and Deepgram transcription.
            </p>
            <p>
              Finally, the <strong>AI Lead Qualifier</strong> shows how a GPT-4o chatbot
              handles inbound buyer and seller inquiries around the clock. It asks the
              right qualifying questions — budget, timeline, neighborhoods, property type,
              pre-approval status — scores the lead, and schedules a showing or
              consultation automatically. No more missed leads at 11 PM or over the
              weekend.
            </p>
            <p>
              Every demo runs on production-grade AI, the same systems we deploy for
              real estate clients across the country. Whether you are exploring AI for
              real estate operations, evaluating real estate AI tools for your team, or
              simply curious how an AI deal analysis demo compares to your current
              workflow, these interactive demos give you a clear, no-commitment preview.
              Try them now, or enter your company URL to see them branded to your business.
            </p>
          </>
        }
      />
    </>
  );
};

export default RealEstateDemoHub;

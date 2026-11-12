import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import ClientLogoMarquee from '@/components/ClientLogoMarquee';
import PricingFAQ from '@/components/PricingFAQ';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

// The RealEstate landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const RealEstate: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Real Estate Professionals | DigitalCraft AI</title>
        <meta name="description" content="AI-powered deal analysis, voice negotiation, and lead qualification for real estate investors and agents." />
        <meta property="og:title" content="AI Systems for Real Estate Professionals | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered deal analysis, voice negotiation, and lead qualification for real estate investors and agents." />
        <link rel="canonical" href="https://digitalcraftai.com/realestate" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Real Estate Professionals",
          "description": "AI-powered deal analysis, voice negotiation, and lead qualification for real estate investors and agents.",
          "provider": {
            "@type": "Organization",
            "name": "DigitalCraft AI",
            "url": "https://digitalcraftai.com"
          },
          "areaServed": [
            { "@type": "City", "name": "Dallas", "containedInPlace": { "@type": "State", "name": "Texas" } },
            { "@type": "City", "name": "Fort Worth", "containedInPlace": { "@type": "State", "name": "Texas" } },
            { "@type": "City", "name": "Austin", "containedInPlace": { "@type": "State", "name": "Texas" } },
            { "@type": "Country", "name": "United States" }
          ],
          "serviceType": "AI Automation for Real Estate",
          "offers": [
            { "@type": "Offer", "name": "Solo Agent", "price": "1000", "priceCurrency": "USD", "description": "For individual agents building their brand" },
            { "@type": "Offer", "name": "Team", "price": "3000", "priceCurrency": "USD", "description": "For teams with 3-10 agents" },
            { "@type": "Offer", "name": "Brokerage", "price": "10000", "priceCurrency": "USD", "description": "For brokerages and large teams" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Does it work with my MLS?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Our AI systems pull data from public listing sources and can integrate with most MLS feeds via IDX/RETS. We'll configure the connection during setup so your CMA reports and lead qualifier have access to real-time market data."
              }
            },
            {
              "@type": "Question",
              "name": "Can my whole team use it?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. The Team and Brokerage plans include multi-agent support with individual lead routing, separate branded outputs, and performance tracking per agent. Each agent gets their own AI assistant configured to their style."
              }
            },
            {
              "@type": "Question",
              "name": "Does it integrate with my IDX website?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. The AI chatbot is a lightweight widget that installs on any website — WordPress, Squarespace, custom IDX sites, or KVCore. It works alongside your existing site without any redesign needed."
              }
            },
            {
              "@type": "Question",
              "name": "How fast will I see results?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Lead response time drops to under 60 seconds from day one. Most agents see a measurable increase in qualified appointments within the first month. Review counts typically double within 60-90 days."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering results. Most clients stay because the ROI is obvious within 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "How is this different from a marketing agency?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We build actual AI systems — custom software that automates your operations. A marketing agency runs your ads. We build the systems that capture, qualify, and convert those leads automatically, plus streamline your CMA process, follow-ups, and reputation management."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.realestate} belowHero={<ClientLogoMarquee />} afterPlans={<PricingFAQ />} />
    </>
  );
};

export default RealEstate;

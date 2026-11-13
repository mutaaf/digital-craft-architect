import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import ClientLogoMarquee from '@/components/ClientLogoMarquee';
import PricingFAQ from '@/components/PricingFAQ';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

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
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.realestate.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.realestate} belowHero={<ClientLogoMarquee />} afterPlans={<PricingFAQ />} />
    </>
  );
};

export default RealEstate;

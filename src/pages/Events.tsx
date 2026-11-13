import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

// The Events landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Events: React.FC = () => {
  useAnalytics('G-JQ53W917HT');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Event Planners | DigitalCraft AI</title>
        <meta name="description" content="AI-powered booking, proposal generation, and client management for event planning businesses." />
        <meta property="og:title" content="AI Systems for Event Planners | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered booking, proposal generation, and client management for event planning businesses." />
        <link rel="canonical" href="https://digitalcraftai.com/events" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Event Planners",
          "description": "AI-powered booking, proposal generation, and client management for event planning businesses.",
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
          "serviceType": "AI Automation for Event Planning",
          "offers": [
            { "@type": "Offer", "name": "Solo Vendor", "price": "500", "priceCurrency": "USD", "description": "For individual DJs, photographers, and caterers" },
            { "@type": "Offer", "name": "Growing Team", "price": "1000", "priceCurrency": "USD", "description": "For event companies with a growing team" },
            { "@type": "Offer", "name": "Agency / Multi-Vendor", "price": "2000", "priceCurrency": "USD", "description": "For agencies and multi-vendor operations" }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.events} />
    </>
  );
};

export default Events;

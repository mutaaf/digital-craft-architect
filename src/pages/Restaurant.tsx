import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

// The Restaurant landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Restaurant: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Restaurants | DigitalCraft AI</title>
        <meta name="description" content="AI-powered reservation management, catering estimates, review automation, and voice ordering for restaurants and food service businesses." />
        <meta property="og:title" content="AI Systems for Restaurants | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered reservation management, catering estimates, review automation, and voice ordering for restaurants and food service businesses." />
        <link rel="canonical" href="https://digitalcraftai.com/restaurant" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Restaurants & Food Service",
          "description": "AI-powered reservation management, catering estimates, review automation, and voice ordering for restaurants and food service businesses.",
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
          "serviceType": "AI Automation for Restaurants",
          "offers": [
            { "@type": "Offer", "name": "Single Location", "price": "500", "priceCurrency": "USD", "description": "For independent restaurants and cafes" },
            { "@type": "Offer", "name": "Multi-Location", "price": "1500", "priceCurrency": "USD", "description": "For restaurant groups with 2-10 locations" },
            { "@type": "Offer", "name": "Franchise", "price": "5000", "priceCurrency": "USD", "description": "For franchise operations and large chains" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.restaurant.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.restaurant} />
    </>
  );
};

export default Restaurant;

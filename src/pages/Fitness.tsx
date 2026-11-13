import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

// The Fitness landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Fitness: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Gyms & Fitness Studios | DigitalCraft AI</title>
        <meta name="description" content="AI-powered membership qualification, class scheduling, member retention, and voice outreach for gyms and fitness studios." />
        <meta property="og:title" content="AI Systems for Gyms & Fitness Studios | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered membership qualification, class scheduling, member retention, and voice outreach for gyms and fitness studios." />
        <link rel="canonical" href="https://digitalcraftai.com/fitness" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Gyms & Fitness Studios",
          "description": "AI-powered lead qualification, membership estimation, member retention, and voice outreach for gyms and fitness studios.",
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
          "serviceType": "AI Automation for Fitness & Wellness",
          "offers": [
            { "@type": "Offer", "name": "Single Studio", "price": "500", "priceCurrency": "USD", "description": "For single-location gyms and boutique studios" },
            { "@type": "Offer", "name": "Multi-Location", "price": "1500", "priceCurrency": "USD", "description": "For gym chains with 2-10 locations" },
            { "@type": "Offer", "name": "Franchise", "price": "5000", "priceCurrency": "USD", "description": "For franchise networks and large fitness brands" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.fitness.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.fitness} />
    </>
  );
};

export default Fitness;

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

// The AutoRepair landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const AutoRepair: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Auto Repair Shops & Dealerships | DigitalCraft AI</title>
        <meta name="description" content="AI-powered service advisor chatbot, transparent estimate generator, declined-service follow-up, and voice service reminders for auto repair shops and dealership service centers." />
        <meta property="og:title" content="AI Systems for Auto Repair Shops & Dealerships | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered service advisor chatbot, transparent estimate generator, declined-service follow-up, and voice service reminders for auto repair shops and dealership service centers." />
        <link rel="canonical" href="https://digitalcraftai.com/autorepair" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Auto Repair Shops & Dealerships",
          "description": "AI-powered service advisor chatbot, transparent estimates, declined-service follow-up, and voice service reminders for auto shops and dealership service centers.",
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
          "serviceType": "AI Automation for Auto Repair",
          "offers": [
            { "@type": "Offer", "name": "Single Shop", "price": "500", "priceCurrency": "USD", "description": "For independent shops and single-bay operations" },
            { "@type": "Offer", "name": "Multi-Bay", "price": "1500", "priceCurrency": "USD", "description": "For multi-bay shops and growing service centers" },
            { "@type": "Offer", "name": "Dealership", "price": "5000", "priceCurrency": "USD", "description": "For dealership service departments and multi-location groups" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.autorepair.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.autorepair} />
    </>
  );
};

export default AutoRepair;

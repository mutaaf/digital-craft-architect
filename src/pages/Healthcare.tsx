import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

// The Healthcare landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Healthcare: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Medical Practices | DigitalCraft AI</title>
        <meta name="description" content="AI-powered patient intake, appointment scheduling, recall automation, and voice reminders for medical practices. Reduce no-shows and streamline operations." />
        <meta property="og:title" content="AI Systems for Medical Practices | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered patient intake, appointment scheduling, recall automation, and voice reminders for medical practices. Reduce no-shows and streamline operations." />
        <link rel="canonical" href="https://digitalcraftai.com/healthcare" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Medical Practices",
          "description": "AI-powered patient intake qualification, smart appointment scheduling, automated recall systems, and voice appointment reminders for healthcare practices.",
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
          "serviceType": "AI Automation for Healthcare",
          "offers": [
            { "@type": "Offer", "name": "Solo Practice", "price": "500", "priceCurrency": "USD", "description": "For solo practitioners and small clinics" },
            { "@type": "Offer", "name": "Group Practice", "price": "1500", "priceCurrency": "USD", "description": "For multi-provider practices with 5-20 staff" },
            { "@type": "Offer", "name": "Multi-Office", "price": "5000", "priceCurrency": "USD", "description": "For healthcare groups with multiple locations" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.healthcare.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.healthcare} />
    </>
  );
};

export default Healthcare;

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

// The Dental landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Dental: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Dental Practices | DigitalCraft AI</title>
        <meta name="description" content="AI-powered patient intake, treatment estimates, recall automation, and voice appointment reminders for dental and orthodontic practices." />
        <meta property="og:title" content="AI Systems for Dental Practices | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered patient intake, treatment estimates, recall automation, and voice appointment reminders for dental and orthodontic practices." />
        <link rel="canonical" href="https://digitalcraftai.com/dental" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Dental Practices",
          "description": "AI-powered patient intake qualification, treatment estimate generation, recall automation, and voice appointment reminders for dental and orthodontic practices.",
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
          "serviceType": "AI Automation for Dental Practices",
          "offers": [
            { "@type": "Offer", "name": "Solo Practice", "price": "500", "priceCurrency": "USD", "description": "For single-location dental practices" },
            { "@type": "Offer", "name": "Group Practice", "price": "1500", "priceCurrency": "USD", "description": "For multi-provider practices with 5-15 operatories" },
            { "@type": "Offer", "name": "DSO / Multi-Office", "price": "5000", "priceCurrency": "USD", "description": "For dental service organizations and multi-location groups" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.dental.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.dental} />
    </>
  );
};

export default Dental;

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

// The HomeServices landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const HomeServices: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Home Service Companies | DigitalCraft AI</title>
        <meta name="description" content="AI-powered call handling, estimates, appointment reminders, and review automation for HVAC, plumbing, electrical, and landscaping companies." />
        <meta property="og:title" content="AI Systems for Home Service Companies | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered call handling, estimates, appointment reminders, and review automation for HVAC, plumbing, electrical, and landscaping companies." />
        <link rel="canonical" href="https://digitalcraftai.com/homeservices" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Home Service Companies",
          "description": "AI-powered call handling, estimate generation, appointment reminders, and review automation for HVAC, plumbing, electrical, landscaping, and roofing companies.",
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
          "serviceType": "AI Automation for Home Services",
          "offers": [
            { "@type": "Offer", "name": "Solo Operator", "price": "500", "priceCurrency": "USD", "description": "For one-truck operations" },
            { "@type": "Offer", "name": "Growing Team", "price": "1500", "priceCurrency": "USD", "description": "For companies with 3-10 technicians" },
            { "@type": "Offer", "name": "Multi-Crew", "price": "5000", "priceCurrency": "USD", "description": "For established companies running multiple crews" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.homeservices.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.homeservices} />
    </>
  );
};

export default HomeServices;

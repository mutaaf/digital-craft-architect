import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

// The Legal landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Legal: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Law Firms | DigitalCraft AI</title>
        <meta name="description" content="AI-powered client intake, consultation scheduling, automated follow-ups, and voice outreach for law firms. Try interactive demos." />
        <meta property="og:title" content="AI Systems for Law Firms | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered client intake, consultation scheduling, automated follow-ups, and voice outreach for law firms. Try interactive demos." />
        <link rel="canonical" href="https://digitalcraftai.com/legal" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Law Firms",
          "description": "AI-powered client intake qualification, consultation scheduling, automated follow-ups, and voice outreach for law firms and legal practices.",
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
          "serviceType": "AI Automation for Law Firms",
          "offers": [
            { "@type": "Offer", "name": "Solo Attorney", "price": "500", "priceCurrency": "USD", "description": "For solo practitioners and small offices" },
            { "@type": "Offer", "name": "Small Firm", "price": "1500", "priceCurrency": "USD", "description": "For firms with 2-10 attorneys" },
            { "@type": "Offer", "name": "Multi-Practice", "price": "5000", "priceCurrency": "USD", "description": "For large firms and multi-practice groups" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.legal.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.legal} />
    </>
  );
};

export default Legal;

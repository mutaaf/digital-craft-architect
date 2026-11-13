import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

// The Salon landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Salon: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Salons & Spas | DigitalCraft AI</title>
        <meta name="description" content="AI-powered booking, rebooking, service estimating, and voice outreach for salons and spas. Fill your chairs and reduce no-shows automatically." />
        <meta property="og:title" content="AI Systems for Salons & Spas | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered booking, rebooking, service estimating, and voice outreach for salons and spas. Fill your chairs and reduce no-shows automatically." />
        <link rel="canonical" href="https://digitalcraftai.com/salon" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Salons & Spas",
          "description": "AI-powered booking qualification, service estimating, rebooking automation, and voice client outreach for salons and spas.",
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
          "serviceType": "AI Automation for Salons & Spas",
          "offers": [
            { "@type": "Offer", "name": "Solo Stylist", "price": "300", "priceCurrency": "USD", "description": "For independent stylists and solo chairs" },
            { "@type": "Offer", "name": "Salon", "price": "1000", "priceCurrency": "USD", "description": "For salons with 3-10 stylists" },
            { "@type": "Offer", "name": "Multi-Location", "price": "3500", "priceCurrency": "USD", "description": "For salon groups and franchise locations" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.salon.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.salon} />
    </>
  );
};

export default Salon;

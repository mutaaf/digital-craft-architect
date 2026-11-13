import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

// The KidsPlay landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const KidsPlay: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Kids Play Places & Family Entertainment | DigitalCraft AI</title>
        <meta name="description" content="AI-powered party booking, parent inquiry response, and venue automation for kids play places, indoor playgrounds, and family entertainment centers." />
        <meta property="og:title" content="AI Systems for Kids Play Places & Family Entertainment | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered party booking, parent inquiry response, and venue automation for kids play places, indoor playgrounds, and family entertainment centers." />
        <link rel="canonical" href="https://digitalcraftai.com/kidsplay" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Kids Play Places & Family Entertainment",
          "description": "AI-powered party booking qualification, package estimation, parent follow-up, and voice booking for kids play places, indoor playgrounds, trampoline parks, and family entertainment centers.",
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
          "serviceType": "AI Automation for Family Entertainment",
          "offers": [
            { "@type": "Offer", "name": "Single Venue", "price": "400", "priceCurrency": "USD", "description": "For single-location play places" },
            { "@type": "Offer", "name": "Multi-Venue", "price": "1200", "priceCurrency": "USD", "description": "For operators with 2-5 locations" },
            { "@type": "Offer", "name": "Franchise", "price": "4000", "priceCurrency": "USD", "description": "For franchise networks and large chains" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.kidsplay.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.kidsplay} />
    </>
  );
};

export default KidsPlay;

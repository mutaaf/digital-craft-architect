import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import ClientLogoMarquee from '@/components/ClientLogoMarquee';
import PricingFAQ from '@/components/PricingFAQ';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE, faqSchema } from '@/data/industryKeynote';

// The Construction landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Construction: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Construction Businesses | DigitalCraft AI</title>
        <meta name="description" content="Interactive AI demos for construction: Lead Responder, Smart Estimates, Review Automation, Deal Analyzer, and Voice Negotiator." />
        <meta property="og:title" content="AI Systems for Construction Businesses | DigitalCraft AI" />
        <meta property="og:description" content="Interactive AI demos for construction: Lead Responder, Smart Estimates, Review Automation, Deal Analyzer, and Voice Negotiator." />
        <link rel="canonical" href="https://digitalcraftai.com/construction" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Construction Businesses",
          "description": "AI-powered lead qualification, estimate generation, review automation, deal analysis, and voice negotiation for construction companies.",
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
          "serviceType": "AI Automation for Construction",
          "offers": [
            { "@type": "Offer", "name": "Starter", "price": "500", "priceCurrency": "USD", "description": "For solo contractors and small crews" },
            { "@type": "Offer", "name": "Growth", "price": "1500", "priceCurrency": "USD", "description": "For growing firms with 5-20 employees" },
            { "@type": "Offer", "name": "Scale", "price": "5000", "priceCurrency": "USD", "description": "For established builders and GCs" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema(INDUSTRY_KEYNOTE.construction.faqs))}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.construction} belowHero={<ClientLogoMarquee />} afterPlans={<PricingFAQ />} />
    </>
  );
};

export default Construction;

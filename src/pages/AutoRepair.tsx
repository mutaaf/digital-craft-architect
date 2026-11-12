import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Will my service advisors need to learn new software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The AI works alongside your existing shop management system. Service advisors keep doing what they do — the AI handles after-hours inquiries, follow-ups, and review requests automatically. No training required."
              }
            },
            {
              "@type": "Question",
              "name": "How does the AI estimate compare to my shop rates?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI uses your actual labor rates, parts markup, and service pricing. Estimates are branded to your shop and match what your service advisors would quote. You control the pricing — the AI just delivers it faster."
              }
            },
            {
              "@type": "Question",
              "name": "Can it integrate with my shop management software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We integrate with major shop management systems including Mitchell, ShopWare, Tekmetric, and dealer DMS platforms. Customer data and repair orders sync automatically."
              }
            },
            {
              "@type": "Question",
              "name": "How does the declined-service follow-up work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "When a customer declines a recommended service, the AI sends a personalized follow-up via text at 7, 30, and 60 days with a reminder about the recommended repair, why it matters for safety, and an easy link to schedule. Recovery rates average 2x compared to no follow-up."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering results. Most shops stay because the ROI is obvious within 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "What makes this different from a CRM or marketing tool?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We build actual AI systems — not templates or drip campaigns. The AI understands automotive repair, can answer technical questions, generate accurate estimates, and have natural voice conversations with your customers. It's a service advisor that never sleeps."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.autorepair} />
    </>
  );
};

export default AutoRepair;

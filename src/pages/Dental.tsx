import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is your system HIPAA-compliant?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. All patient data is encrypted in transit and at rest. We sign a Business Associate Agreement (BAA) with every practice. Our AI never stores PHI beyond the active session unless explicitly configured with your consent."
              }
            },
            {
              "@type": "Question",
              "name": "Does it integrate with my practice management software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We integrate with Dentrix, Eaglesoft, Open Dental, and most cloud-based PMS platforms via API or HL7 feeds. If you use a less common system, we'll evaluate compatibility during your free audit."
              }
            },
            {
              "@type": "Question",
              "name": "How long does setup take?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most practices are live within 2 weeks. The AI intake qualifier and treatment estimator can be operational in as little as 5 business days. Voice recall setup takes slightly longer due to phone system integration."
              }
            },
            {
              "@type": "Question",
              "name": "Will patients know they're talking to AI?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Transparency is built in. The AI identifies itself as a digital assistant for your practice. Patients appreciate the instant response and can always request to speak with a team member."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering results. Most practices stay because the ROI is obvious within 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "Can the AI handle insurance verification questions?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI collects insurance information from patients during intake and can answer common coverage questions based on your fee schedule. For real-time eligibility checks, we integrate with insurance verification APIs to give patients instant coverage estimates."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.dental} />
    </>
  );
};

export default Dental;

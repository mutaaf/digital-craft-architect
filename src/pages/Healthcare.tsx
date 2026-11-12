import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is the system HIPAA compliant?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. All patient data is encrypted in transit and at rest. We sign a BAA (Business Associate Agreement) with every client. Our AI systems are designed to handle PHI in accordance with HIPAA regulations."
              }
            },
            {
              "@type": "Question",
              "name": "Does it integrate with our EHR/EMR system?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We integrate with most major EHR platforms including Epic, Cerner, athenahealth, eClinicalWorks, and DrChrono. For less common systems, we use HL7/FHIR standards to build custom integrations."
              }
            },
            {
              "@type": "Question",
              "name": "How long does setup take?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most practices are fully live within 2-3 weeks. The AI intake system can go live in as little as 5 days. EHR integration and voice recall setup typically take the full 2-3 week window."
              }
            },
            {
              "@type": "Question",
              "name": "Will patients know they're talking to an AI?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Transparency is built in. The AI identifies itself as a virtual assistant for your practice. Patients appreciate the convenience of 24/7 availability, and our data shows over 90% satisfaction with AI-assisted interactions."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering measurable reductions in no-shows, faster intake, and improved recall compliance."
              }
            },
            {
              "@type": "Question",
              "name": "Can the AI handle appointment rescheduling?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. The AI scheduler can book, confirm, reschedule, and cancel appointments based on your practice's availability rules. Patients can interact via chat, SMS, or voice — whichever they prefer."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.healthcare} />
    </>
  );
};

export default Healthcare;

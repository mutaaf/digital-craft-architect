import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Does this work for HVAC, plumbing, and electrical?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Our AI systems are built for all home service trades including HVAC, plumbing, electrical, landscaping, roofing, and general handyman services. The lead qualifier and estimate tools adapt to your specific trade and pricing."
              }
            },
            {
              "@type": "Question",
              "name": "Will this replace my dispatcher?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The AI handles the initial call qualification, after-hours inquiries, and appointment confirmations. Your dispatcher still manages the schedule and handles complex situations. Think of it as giving your dispatcher a tireless assistant."
              }
            },
            {
              "@type": "Question",
              "name": "How fast does the AI respond to new leads?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Under 60 seconds, 24/7. Whether it's a midnight emergency or a Sunday afternoon AC breakdown, the AI qualifies the call, collects details, and books the appointment instantly."
              }
            },
            {
              "@type": "Question",
              "name": "What if a customer has an emergency?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI detects emergency keywords like 'flooding', 'no heat', or 'gas smell' and escalates immediately — sending you a priority alert and offering the customer your emergency line. It never leaves emergencies in a queue."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering results. Most clients stay because the ROI is obvious within 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "Can my technicians use this in the field?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Everything works from a phone. Techs get appointment details via text, can trigger review requests with one tap after a job, and the system auto-updates your schedule as jobs are completed."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.homeservices} />
    </>
  );
};

export default HomeServices;

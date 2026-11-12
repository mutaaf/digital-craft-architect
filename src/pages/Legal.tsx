import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is the AI compliant with attorney-client privilege and confidentiality rules?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. All data is encrypted in transit and at rest. The AI does not store conversation content beyond the active session. We follow ABA Model Rule 1.6 guidelines for technology competence and confidentiality, and we sign a BAA or NDA upon request."
              }
            },
            {
              "@type": "Question",
              "name": "Does the AI give legal advice to potential clients?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The AI is explicitly configured to qualify and screen inquiries — not to provide legal advice. It gathers case details, checks for basic conflicts, and books consultations. All legal guidance comes from you."
              }
            },
            {
              "@type": "Question",
              "name": "How does the AI handle conflict checks?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The intake qualifier collects opposing party names and cross-references them against your existing client list (via CRM integration). Potential conflicts are flagged before you ever speak with the prospect."
              }
            },
            {
              "@type": "Question",
              "name": "Will this work with my existing case management software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We integrate with Clio, MyCase, PracticePanther, Smokeball, and most popular legal CRMs. New intake records are automatically created in your system."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering results. Most firms stay because the ROI is clear within the first 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "Is this compliant with state bar advertising rules?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We design all client-facing AI interactions to comply with state bar advertising and solicitation rules. The AI identifies itself as an automated assistant, never claims to be an attorney, and includes required disclaimers. We review configurations with your compliance team before launch."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.legal} />
    </>
  );
};

export default Legal;

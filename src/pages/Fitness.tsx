import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

// The Fitness landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Fitness: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Gyms & Fitness Studios | DigitalCraft AI</title>
        <meta name="description" content="AI-powered membership qualification, class scheduling, member retention, and voice outreach for gyms and fitness studios." />
        <meta property="og:title" content="AI Systems for Gyms & Fitness Studios | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered membership qualification, class scheduling, member retention, and voice outreach for gyms and fitness studios." />
        <link rel="canonical" href="https://digitalcraftai.com/fitness" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Gyms & Fitness Studios",
          "description": "AI-powered lead qualification, membership estimation, member retention, and voice outreach for gyms and fitness studios.",
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
          "serviceType": "AI Automation for Fitness & Wellness",
          "offers": [
            { "@type": "Offer", "name": "Single Studio", "price": "500", "priceCurrency": "USD", "description": "For single-location gyms and boutique studios" },
            { "@type": "Offer", "name": "Multi-Location", "price": "1500", "priceCurrency": "USD", "description": "For gym chains with 2-10 locations" },
            { "@type": "Offer", "name": "Franchise", "price": "5000", "priceCurrency": "USD", "description": "For franchise networks and large fitness brands" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Will my front desk staff need to learn new software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The AI works alongside your existing systems. Your front desk keeps doing what they do — the AI handles after-hours inquiries, follow-ups, and retention outreach automatically. Staff only see a simple dashboard with leads and insights."
              }
            },
            {
              "@type": "Question",
              "name": "How quickly will I see more trial-to-member conversions?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most gyms see measurable improvements within the first month. Lead response time drops to under 30 seconds from day one. Trial-to-member conversion typically improves within 60-90 days as the AI follow-up sequences take effect."
              }
            },
            {
              "@type": "Question",
              "name": "Does this integrate with my gym management software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We integrate with popular platforms like Mindbody, Zen Planner, Glofox, and ClubReady. The AI reads your class schedules, member data, and billing info to personalize every interaction."
              }
            },
            {
              "@type": "Question",
              "name": "Can the AI handle class bookings and cancellations?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. The AI can book members into classes, manage waitlists, and automatically fill cancellation slots by reaching out to waitlisted members via text or voice call — all without staff intervention."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering results. Most studios stay because the ROI is obvious within 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "How is this different from my CRM's built-in automation?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Your CRM sends generic templates. Our AI has real conversations — it qualifies leads, answers specific questions about your classes and pricing, handles objections, and books trials. It also makes outbound voice calls to retain at-risk members, something no CRM can do."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.fitness} />
    </>
  );
};

export default Fitness;

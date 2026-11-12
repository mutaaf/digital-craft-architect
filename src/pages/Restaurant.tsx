import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

// The Restaurant landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Restaurant: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Restaurants | DigitalCraft AI</title>
        <meta name="description" content="AI-powered reservation management, catering estimates, review automation, and voice ordering for restaurants and food service businesses." />
        <meta property="og:title" content="AI Systems for Restaurants | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered reservation management, catering estimates, review automation, and voice ordering for restaurants and food service businesses." />
        <link rel="canonical" href="https://digitalcraftai.com/restaurant" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Restaurants & Food Service",
          "description": "AI-powered reservation management, catering estimates, review automation, and voice ordering for restaurants and food service businesses.",
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
          "serviceType": "AI Automation for Restaurants",
          "offers": [
            { "@type": "Offer", "name": "Single Location", "price": "500", "priceCurrency": "USD", "description": "For independent restaurants and cafes" },
            { "@type": "Offer", "name": "Multi-Location", "price": "1500", "priceCurrency": "USD", "description": "For restaurant groups with 2-10 locations" },
            { "@type": "Offer", "name": "Franchise", "price": "5000", "priceCurrency": "USD", "description": "For franchise operations and large chains" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Will the AI work with my existing POS and reservation system?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We integrate with all major POS systems (Toast, Square, Clover) and reservation platforms (OpenTable, Resy, Yelp Reservations). The AI works alongside your current tools — no rip-and-replace required."
              }
            },
            {
              "@type": "Question",
              "name": "How does the AI reduce no-shows?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI sends automated confirmation texts when a reservation is made, a reminder 24 hours before, and a same-day nudge 2 hours before the reservation. It also offers easy rescheduling links, which converts cancellations into rebookings instead of empty tables."
              }
            },
            {
              "@type": "Question",
              "name": "Can the AI handle catering quotes accurately?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. The Smart Catering Estimator uses your actual menu pricing, per-head costs, and add-on options to generate branded estimates in under 60 seconds. You control the pricing tiers and the AI does the math and formatting."
              }
            },
            {
              "@type": "Question",
              "name": "What happens if a customer asks something the AI can't answer?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI gracefully hands off to your staff. It collects the customer's contact info, summarizes their question, and sends an alert so your team can follow up personally. No customer ever hits a dead end."
              }
            },
            {
              "@type": "Question",
              "name": "How long does setup take?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most restaurants are live within 2 weeks. We handle the technical setup, train the AI on your menu and policies, and test everything before launch. Your staff doesn't need to learn any new software."
              }
            },
            {
              "@type": "Question",
              "name": "Is there a long-term contract?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. All plans are month-to-month. We earn your business every month by delivering measurable results. Most clients stay because the ROI is obvious within the first 30 days."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.restaurant} />
    </>
  );
};

export default Restaurant;

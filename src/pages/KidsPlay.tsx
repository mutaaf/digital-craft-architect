import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Will parents be talking to a robot?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI is designed to feel natural and helpful, not robotic. It answers questions about party packages, pricing, and availability the same way your best front desk staff would — just faster and available 24/7. Parents can always reach a human if they prefer."
              }
            },
            {
              "@type": "Question",
              "name": "How does the AI handle party bookings?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The AI qualifies each inquiry by asking about party size, child's age, preferred date, and package preferences. It provides instant pricing, checks availability, and either books directly or hands off to your staff with all the details pre-filled."
              }
            },
            {
              "@type": "Question",
              "name": "Can the AI handle our seasonal busy periods?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Unlike human staff, the AI scales instantly. Whether you get 5 inquiries or 500 on a Saturday morning, every parent gets an immediate, personalized response. No hold times, no missed calls."
              }
            },
            {
              "@type": "Question",
              "name": "What if we already have a booking system?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We integrate with your existing booking system. The AI chatbot sits on top of your current website and feeds qualified leads directly into your calendar or POS system. We don't replace what's working — we make it smarter."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by delivering results. Most venues stay because the ROI is obvious within the first 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "How quickly can we get started?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most venues are fully set up within 2 weeks. We configure the AI with your party packages, pricing, availability, and branding. Your staff doesn't need to learn anything new — the AI works behind the scenes."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.kidsplay} />
    </>
  );
};

export default KidsPlay;

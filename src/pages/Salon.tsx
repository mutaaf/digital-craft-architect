import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

// The Salon landing on the keynote template (src/v3/IndustryLanding.tsx). The page keeps its own SEO
// and structured data; the words live in src/data/industryKeynote.ts.
const Salon: React.FC = () => {
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Systems for Salons & Spas | DigitalCraft AI</title>
        <meta name="description" content="AI-powered booking, rebooking, service estimating, and voice outreach for salons and spas. Fill your chairs and reduce no-shows automatically." />
        <meta property="og:title" content="AI Systems for Salons & Spas | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered booking, rebooking, service estimating, and voice outreach for salons and spas. Fill your chairs and reduce no-shows automatically." />
        <link rel="canonical" href="https://digitalcraftai.com/salon" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI Systems for Salons & Spas",
          "description": "AI-powered booking qualification, service estimating, rebooking automation, and voice client outreach for salons and spas.",
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
          "serviceType": "AI Automation for Salons & Spas",
          "offers": [
            { "@type": "Offer", "name": "Solo Stylist", "price": "300", "priceCurrency": "USD", "description": "For independent stylists and solo chairs" },
            { "@type": "Offer", "name": "Salon", "price": "1000", "priceCurrency": "USD", "description": "For salons with 3-10 stylists" },
            { "@type": "Offer", "name": "Multi-Location", "price": "3500", "priceCurrency": "USD", "description": "For salon groups and franchise locations" }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Will my stylists need to learn new software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The AI works behind the scenes with your existing booking system. Stylists keep doing what they do best — the AI handles appointment reminders, rebooking, and client follow-ups automatically."
              }
            },
            {
              "@type": "Question",
              "name": "How quickly will I see fewer no-shows?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most salons see a measurable drop in no-shows within the first two weeks. The AI sends smart reminders, offers easy rescheduling, and fills cancelled slots from the waitlist automatically."
              }
            },
            {
              "@type": "Question",
              "name": "Does it work with my booking system?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We integrate with all major salon booking platforms including Vagaro, Fresha, Booker, Boulevard, and Square Appointments. If you use a different system, we can usually build a custom integration."
              }
            },
            {
              "@type": "Question",
              "name": "Can the AI recommend services and products?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. The AI analyzes each client's service history and preferences to suggest relevant add-ons, treatments, and retail products at the perfect moment — during booking, after their appointment, or via follow-up messages."
              }
            },
            {
              "@type": "Question",
              "name": "What's the contract length?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Month-to-month. No long-term contracts. We earn your business every month by keeping your chairs full and your revenue growing. Most salons stay because the ROI is obvious within 30 days."
              }
            },
            {
              "@type": "Question",
              "name": "How is this different from my booking platform's built-in reminders?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Built-in reminders send generic messages. Our AI personalizes every touchpoint — it knows which clients tend to cancel, which ones haven't rebooked, and what services to recommend. It also handles voice outreach, not just text, and actively fills gaps in your schedule."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.salon} />
    </>
  );
};

export default Salon;

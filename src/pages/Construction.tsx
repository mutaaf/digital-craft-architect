import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAnalytics, useEngagementTracking } from '@/utils/analytics';
import ClientLogoMarquee from '@/components/ClientLogoMarquee';
import PricingFAQ from '@/components/PricingFAQ';
import IndustryLanding from '@/v3/IndustryLanding';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';

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
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Will my crew need to learn new software?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. The AI systems work behind the scenes. Your crew keeps doing what they do — the AI handles the admin, lead capture, and communication automatically. If a foreman needs to submit a project update, it's as simple as sending a text message."
              }
            },
            {
              "@type": "Question",
              "name": "How long until I see results?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Most clients see measurable improvements within the first month. Lead response time drops to under 60 seconds from day one. Review counts typically double within 60-90 days. Estimate generation time drops immediately."
              }
            },
            {
              "@type": "Question",
              "name": "What if I already have a website?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Perfect — we integrate with your existing website. The AI chatbot is a simple widget that gets added to your current site. We don't rebuild what's already working."
              }
            },
            {
              "@type": "Question",
              "name": "Do you work with subcontractors too?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Whether you're a GC, a specialty sub, or a remodeling company, the AI tools adapt to your business. The lead responder and estimate tools are especially valuable for subs who need to quote fast and win jobs."
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
              "name": "What makes you different from a marketing agency?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We're engineers, not marketers. We build actual AI systems — custom software that automates your operations. A marketing agency runs your ads. We build the systems that capture, qualify, and convert those leads automatically, plus streamline your back-office operations."
              }
            }
          ]
        })}</script>
      </Helmet>
      <IndustryLanding data={INDUSTRY_KEYNOTE.construction} belowHero={<ClientLogoMarquee />} afterPlans={<PricingFAQ />} />
    </>
  );
};

export default Construction;

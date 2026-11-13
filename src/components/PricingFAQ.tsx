import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ_ITEMS = [
  {
    q: 'Is there a setup fee?',
    a: 'No. Every plan includes a 2-week onboarding period at no extra cost. We configure the AI for your business, load your branding, and get you live - all included in the monthly price.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. All plans are month-to-month with no long-term contracts. If you decide DCA isn\'t a fit, cancel before your next billing cycle - no penalties, no questions asked.',
  },
  {
    q: 'What\'s included in the monthly price?',
    a: 'Everything listed in your plan tier - AI tools, hosting, ongoing model updates, and support. There are no per-lead fees, per-call surcharges, or hidden usage caps on the core features.',
  },
  {
    q: 'Do you offer custom plans?',
    a: 'Yes. If your business needs a combination of features across tiers, or you have unique requirements (multi-location, custom integrations, higher volume), book a call and we\'ll build a plan that fits.',
  },
  {
    q: 'How long until I see ROI?',
    a: 'Most clients see measurable results within 30 days - faster lead response times, more booked appointments, and reduced manual follow-up. The AI starts working the day it goes live.',
  },
  {
    q: 'Is training included?',
    a: 'Yes. Every plan includes a live onboarding walkthrough plus documentation. Growth and Scale plans include ongoing strategy calls to help you get the most from the platform.',
  },
];

// FAQPage structured data built from the same FAQ_ITEMS the accordion renders,
// so the schema mirrors the visible content and can never drift. Emitted as one
// inline application/ld+json block (same pattern as src/pages/Construction.tsx).
const faqPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

// Keynote pass (2026-11-12): the same hairline rows as the page's "Questions, answered." list, sitting
// under the plans it explains. Radix accordion kept (tests open each item and read its answer).
const PricingFAQ: React.FC = () => (
  <div className="mx-auto -mt-6 max-w-[920px] px-5 pb-28 md:-mt-16 md:pb-40">
    <script type="application/ld+json">{JSON.stringify(faqPageJsonLd)}</script>
    <h3 className="mb-6 text-center text-[24px] font-semibold tracking-[-0.025em] text-[#1d1d1f] md:mb-8 md:text-[28px]">
      Pricing Questions
    </h3>
    <Accordion type="single" collapsible className="border-t border-[#d2d2d7]">
      {FAQ_ITEMS.map((item, i) => (
        <AccordionItem
          key={i}
          value={`pricing-faq-${i}`}
          className="border-b border-[#d2d2d7]"
        >
          <AccordionTrigger className="min-h-[64px] gap-6 py-4 text-left text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f] hover:no-underline md:text-[19px] [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-[#86868b]">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-6 pr-10 text-[15px] leading-relaxed text-[#6e6e73] md:text-[17px]">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default PricingFAQ;

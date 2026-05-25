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

const PricingFAQ: React.FC = () => (
  <div className="max-w-3xl mx-auto mt-12">
    <script type="application/ld+json">{JSON.stringify(faqPageJsonLd)}</script>
    <h3 className="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
      Pricing Questions
    </h3>
    <Accordion type="single" collapsible className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <AccordionItem
          key={i}
          value={`pricing-faq-${i}`}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-5"
        >
          <AccordionTrigger className="text-left text-sm font-medium py-4">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 pb-4">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default PricingFAQ;

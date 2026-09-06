import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ClipboardList, ArrowRight, Phone, Printer } from 'lucide-react';
import { VENDOR_QUESTIONS, type VendorQuestion } from '@/data/vendorQuestions';

// Ticket 0061 - Public /questions-to-ask-an-ai-vendor buyer-side artifact.
// Mirrors the Playbook.tsx (ticket 0059) page-shell pattern: Navbar, Footer,
// ScrollProgress, Helmet, sectioned content with anchor links, two JSON-LD
// blocks (FAQPage + BreadcrumbList). Per the 2026-05-25 mirror-source rule
// visible rendering AND FAQPage mainEntity[] both derive from VENDOR_QUESTIONS;
// Helmet meta + page H1 share single constants. Per the 2026-05-30
// second-@type lesson, the pre-write grep confirmed every existing FAQPage
// predicate is URL-scoped (the pricing-faq spec's findComponentFaqPage filter
// narrows by mainEntity question-set, the spec only navigates to /construction
// and /realestate) and every BreadcrumbList predicate is URL-scoped to its
// own page, so a new /questions-to-ask-an-ai-vendor-scoped pair does not
// collide. Grep recorded in the ticket's Implementation log.

const META_DESCRIPTION =
  'A buyer-side checklist of 11 specific questions to ask any AI services vendor before signing, covering data handling, model and provider transparency, pricing, deployment process, what breaks when the AI is wrong, exit terms, and how to compare honest vendors against the rest.';

const PAGE_H1 = 'Questions to Ask Any AI Services Vendor Before You Sign';

// VENDOR_QUESTIONS + VendorQuestion type live in src/data/vendorQuestions.ts
// (ticket 0067, mechanical extraction per the 2026-05-25 mirror-source rule).
// Values are byte-identical to the original inline declaration; both this
// checklist page and the /questions-to-ask-an-ai-vendor/scorecard printable
// grid consume the same array so a future copy edit updates every surface
// AND the FAQPage schema below in one place. A copy edit belongs in its own
// content ticket, not in the extraction move. The VendorQuestion type is
// re-exported here as a type-only reference so lint's `no-unused-imports`
// stays happy without leaking the type into JSX.
export type { VendorQuestion };

// FAQPage mainEntity[] derived from VENDOR_QUESTIONS via .map so a future
// change to a question or its whyItMatters text updates the visible
// rendering AND the schema in one place per the 2026-05-25 mirror-source
// rule. The acceptedAnswer text is the plain-text whyItMatters explainer,
// NOT a marketing answer (the page is buyer-side; the FAQPage block must
// read as a buyer artifact too).
const FAQPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  name: PAGE_H1,
  description: META_DESCRIPTION,
  mainEntity: VENDOR_QUESTIONS.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.whyItMatters,
    },
  })),
};

// Sibling BreadcrumbList (Home -> Questions to Ask an AI Vendor), matching
// the pattern used by src/pages/Playbook.tsx and src/pages/Trust.tsx.
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Questions to Ask an AI Vendor',
      item: 'https://digitalcraftai.com/questions-to-ask-an-ai-vendor',
    },
  ],
};

const QuestionsToAskAnAiVendor: React.FC = () => {
  const { content } = useContent();

  // Deep-link scroll for /questions-to-ask-an-ai-vendor#q-N. Mirrors the
  // Playbook.tsx pattern: guards against missing window and missing target
  // id, uses requestAnimationFrame so the scroll fires after the blocks
  // mount.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    const id = hash.slice(1);
    const raf = window.requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{`${PAGE_H1} | DigitalCraft AI`}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link
          rel="canonical"
          href="https://digitalcraftai.com/questions-to-ask-an-ai-vendor"
        />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQPAGE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <ClipboardList size={16} />
            Buyer Checklist
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A buyer-side checklist you can bring into any AI vendor call. Each question is one
            you should be able to ask anyone selling you AI services, including us. Where the
            answer lives on a canonical page on this site, the row links to it so you can audit
            our answer before the call.
          </p>
          <p className="mt-6 text-sm">
            <Link
              to="/questions-to-ask-an-ai-vendor/scorecard"
              data-testid="vendor-questions-scorecard-link"
              onClick={() =>
                trackCTAClick('vendor_questions_scorecard_link', 'vendor_questions')
              }
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 dark:hover:text-primary/80 font-medium"
            >
              <Printer size={14} />
              Print the scoring sheet
            </Link>
          </p>
        </div>
      </section>

      {/* Jump nav */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {VENDOR_QUESTIONS.map((q, idx) => (
              <a
                key={q.id}
                href={`#q-${idx + 1}`}
                onClick={() =>
                  trackCTAClick(`vendor_questions_q${idx + 1}`, 'vendor_questions')
                }
                className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              >
                {`Q${idx + 1}`}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Question blocks */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-10">
            {VENDOR_QUESTIONS.map((q, idx) => (
              <article
                key={q.id}
                id={`q-${idx + 1}`}
                data-testid="vendor-question"
                className="scroll-mt-28 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6 md:p-8"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-full bg-primary text-white font-semibold text-sm">
                    {`Q${idx + 1}`}
                  </span>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                    {q.question}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-700 dark:text-gray-200">
                    Why this matters:
                  </strong>{' '}
                  {q.whyItMatters}
                </p>
                {q.ourAnswerHref && q.ourAnswerLabel ? (
                  <p className="mt-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      How Digital Craft answers this:
                    </span>{' '}
                    <Link
                      to={q.ourAnswerHref}
                      data-testid="vendor-question-answer-link"
                      onClick={() =>
                        trackCTAClick(
                          `vendor_questions_answer_${q.id}`,
                          'vendor_questions',
                        )
                      }
                      className="text-primary hover:text-primary/80 dark:hover:text-primary/80 font-medium inline-flex items-center gap-1"
                    >
                      {q.ourAnswerLabel}
                      <ArrowRight size={14} />
                    </Link>
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to put us through the same checklist?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Bring this page into a 30-minute discovery call. We will answer every row honestly,
            including the ones where we are not the right fit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() =>
                trackCTAClick('vendor_questions_strategy_call', 'vendor_questions')
              }
            >
              <Phone size={18} />
              Book the Discovery Call
            </a>
            <Link
              to="/playbook"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() =>
                trackCTAClick('vendor_questions_view_playbook', 'vendor_questions')
              }
            >
              Read our Playbook
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default QuestionsToAskAnAiVendor;

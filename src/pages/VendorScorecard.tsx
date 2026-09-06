import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ClipboardCheck, ArrowRight, Phone, Printer } from 'lucide-react';
import { VENDOR_QUESTIONS } from '@/data/vendorQuestions';

// Ticket 0067 - /questions-to-ask-an-ai-vendor/scorecard printable AI vendor
// scoring template. Sibling to ticket 0061's QuestionsToAskAnAiVendor.tsx
// (mirrored page-shell). Renders VENDOR_QUESTIONS as a printable grid with
// three blank vendor columns, a 1-to-5 score control per cell, and a notes
// row so the buyer walks into three vendor calls with one clipboard. Emits
// ONE JSON-LD block (BreadcrumbList, three items); the sibling page owns
// the FAQPage schema for the same questions - duplicating it here would risk
// a Google structured-data duplicate-content flag. Per the 2026-05-07
// em-dash Hard NO, every rendered string uses hyphens (Self-Review greps
// the diff for U+2014). Per the 2026-05-25 mirror-source rule the
// META_DESCRIPTION and PAGE_H1 are each single module-level constants.

const META_DESCRIPTION =
  'A blank one-page printable scoring sheet for evaluating AI services vendors, mirroring the 11-question buyer checklist. Print once, walk into three back-to-back vendor calls with one clipboard, mark scores in real time, and leave the week with a real side-by-side artifact.';

const PAGE_H1 = 'AI Vendor Scoring Sheet';

// BreadcrumbList (Home -> Questions to Ask an AI Vendor -> Scorecard).
// Deliberately three items - the sibling page's own BreadcrumbList is
// two-item (Home -> Questions), so the scorecard block cannot collide.
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
    {
      '@type': 'ListItem',
      position: 3,
      name: PAGE_H1,
      item: 'https://digitalcraftai.com/questions-to-ask-an-ai-vendor/scorecard',
    },
  ],
};

// Inline @media print stylesheet. Hides Navbar, Footer, ScrollProgress, the
// site's non-print controls, and the strategy-call CTA at print time via
// display:none !important (Tailwind utility classes carry higher specificity
// so !important is required to beat them). Forces the scorecard <table> to
// render black-on-white full-width regardless of on-screen theme so ink
// usage is predictable, and adds thin 1px cell borders so the sheet reads
// as a grid on paper.
const PRINT_CSS = `
  @media print {
    nav, footer, .scorecard-no-print { display: none !important; }
    body { background: #fff !important; color: #000 !important; }
    .scorecard-print-area { padding: 0 !important; margin: 0 !important; }
    table[data-testid="vendor-scorecard-table"] {
      width: 100% !important;
      color: #000 !important;
      background: #fff !important;
      border-collapse: collapse !important;
    }
    table[data-testid="vendor-scorecard-table"] th,
    table[data-testid="vendor-scorecard-table"] td {
      border: 1px solid #000 !important;
      color: #000 !important;
      background: #fff !important;
      padding: 8px !important;
      vertical-align: top !important;
    }
    table[data-testid="vendor-scorecard-table"] [data-testid="score-cell"] {
      color: #000 !important;
      background: #fff !important;
    }
  }
`;

// The 1-to-5 score control the buyer circles on paper.
const VENDOR_COLUMNS = ['a', 'b', 'c'] as const;
const SCORE_LADDER = '1 2 3 4 5';

const VendorScorecard: React.FC = () => {
  const { content } = useContent();
  const viewFiredRef = React.useRef<boolean>(false);

  // Ticket 0060 / 0062 pattern: one telemetry beacon per mount, debounced via
  // a useRef bool guard so a StrictMode double-mount does not double-count.
  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('vendor_scorecard_view', 'vendor_scorecard');
  }, []);

  // Analytics fire order matters: the print dialog blocks the event loop so
  // any beacon fired AFTER window.print() may not flush. Fire the beacon
  // FIRST (synchronously), then call print. Spec case 9 asserts this order.
  const handlePrintClick = React.useCallback(() => {
    trackCTAClick('vendor_scorecard_print', 'vendor_scorecard');
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 scorecard-print-area">
      <Helmet>
        <title>{`${PAGE_H1} | DigitalCraft AI`}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link
          rel="canonical"
          href="https://digitalcraftai.com/questions-to-ask-an-ai-vendor/scorecard"
        />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <style type="text/css" media="print">{PRINT_CSS}</style>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 scorecard-no-print">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <ClipboardCheck size={16} />
            Printable Buyer Template
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fill in the three vendor names at the top of the sheet, score each question 1 to 5
            as the vendor answers, jot a note in the row below, and tally the totals per column
            at the end of the call. Print once, use across three back-to-back demos, leave the
            week with one side-by-side artifact.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handlePrintClick}
              data-testid="scorecard-print"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              <Printer size={18} />
              Print scoring sheet
            </button>
            <Link
              to="/questions-to-ask-an-ai-vendor"
              onClick={() =>
                trackCTAClick('vendor_scorecard_back_to_checklist', 'vendor_scorecard')
              }
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
            >
              Read the checklist
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Scoring grid */}
      <section className="py-8 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
            <table
              data-testid="vendor-scorecard-table"
              className="w-full text-sm text-left text-gray-700 dark:text-gray-300"
            >
              <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3 w-1/3">Question</th>
                  <th scope="col" className="px-4 py-3">Vendor A</th>
                  <th scope="col" className="px-4 py-3">Vendor B</th>
                  <th scope="col" className="px-4 py-3">Vendor C</th>
                  <th scope="col" className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {VENDOR_QUESTIONS.map((q, idx) => (
                  <tr key={q.id} data-testid="scorecard-row" className={idx % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/60 dark:bg-gray-900/40'}>
                    <th scope="row" className="px-4 py-4 align-top font-medium text-gray-900 dark:text-white">
                      <span className="block text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Q{idx + 1}</span>
                      <span className="block leading-snug">{q.question}</span>
                      {q.ourAnswerHref && q.ourAnswerLabel ? (
                        <span className="mt-2 block text-xs text-gray-500 dark:text-gray-400">
                          How Digital Craft answers:{' '}
                          <Link to={q.ourAnswerHref} data-testid="scorecard-answer-link" onClick={() => trackCTAClick(`vendor_scorecard_answer_${q.id}`, 'vendor_scorecard')} className="text-primary hover:text-primary/80 dark:hover:text-primary/80 font-medium">
                            {q.ourAnswerLabel}
                          </Link>
                        </span>
                      ) : null}
                    </th>
                    {VENDOR_COLUMNS.map((vendor) => (
                      <td key={vendor} className="px-4 py-4 align-top">
                        <div data-testid="score-cell" className="font-mono text-base tracking-widest text-gray-800 dark:text-gray-200" aria-label={`Score for vendor ${vendor.toUpperCase()} on question ${idx + 1}`}>
                          {SCORE_LADDER}
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-4 align-top">
                      <div data-testid="notes-cell" className="min-h-16 border-b border-dashed border-gray-400 dark:border-gray-600" aria-label={`Notes for question ${idx + 1}`} />
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 dark:bg-gray-900">
                  <th scope="row" className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">Totals</th>
                  {VENDOR_COLUMNS.map((vendor) => (
                    <td key={`total-${vendor}`} data-testid="scorecard-total-cell" className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      <span className="inline-block min-w-16 border-b border-gray-500 dark:border-gray-500">&nbsp;</span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">Add up each column</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Circle one score per vendor per row. Nothing on this sheet is stored on any server; the artifact is the printed page.
          </p>
        </div>
      </section>

      {/* Strategy call CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 scorecard-no-print">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Want to walk us through your scored sheet?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Bring the filled-in scorecard into a 30-minute discovery call. We will read every
            row honestly, including the ones where a competitor was the right answer.
          </p>
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            onClick={() =>
              trackCTAClick('vendor_scorecard_strategy_call', 'vendor_scorecard')
            }
          >
            <Phone size={18} />
            Book the Discovery Call
          </a>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default VendorScorecard;

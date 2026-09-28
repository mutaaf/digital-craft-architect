import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import {
  composeStrategyCallMailto,
  type StrategyCallMailto,
} from '@/utils/composeStrategyCallMailto';

// Ticket 0101 - Pre-filled "Book a strategy call" CTA rendered above the
// retention cluster on /my. The composed mailto: href reads the four
// persisted stores through their shipped getters (parse-safe, allow-list
// validated) and drops the composed body into the mail client's compose
// window on click.
//
// Reads composeStrategyCallMailto() once on mount into local state so a
// downstream re-render (an unrelated keystroke elsewhere on the page)
// does not re-encode on every render.
//
// Dark-mode variants mirror the ticket 0093 saved-ROI card conventions
// (rounded-2xl border + gray-200/gray-800 border, white/gray-900 bg,
// primary accent button). Layout stacks on 375px viewports and inlines
// from 768px+ per acceptance box 2.
//
// On click trackCTAClick fires FIRST (mirroring the ticket 0023 beacon-
// before-navigate pattern) so the analytics event lands even if the OS
// mail-client hand-off tears down the tab.

const BookStrategyCallCTA: React.FC = () => {
  const [mailto, setMailto] = useState<StrategyCallMailto | null>(null);

  useEffect(() => {
    try {
      setMailto(composeStrategyCallMailto());
    } catch {
      /* composer failure - non-fatal; CTA falls back to the loading state */
    }
  }, []);

  const handleClick = () => {
    // Fire the beacon before the browser hands the mailto off to the OS
    // mail client. trackCTAClick synchronously enqueues onto
    // window.dataLayer via gtag; even a same-tick navigation flushes the
    // queued call.
    trackCTAClick('my_book_strategy_call', 'my_dashboard');
  };

  // Render an empty placeholder anchor while composing so the CTA
  // occupies its layout slot (avoids a cumulative layout shift when the
  // href swaps in). The mailto: is intentionally left off until state
  // resolves so a click before compose finishes never opens an empty
  // draft.
  const href = mailto?.href ?? '';

  return (
    <section
      data-testid="book-strategy-call-cta"
      aria-labelledby="book-strategy-call-heading"
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2
            id="book-strategy-call-heading"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Book a strategy call
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Send us your saved context in one tap.
          </p>
        </div>
        <a
          href={href}
          onClick={handleClick}
          data-testid="book-strategy-call-anchor"
          className="inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-5 py-3 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white dark:bg-primary dark:hover:bg-primary/90 dark:text-white transition-colors"
        >
          <Calendar size={16} />
          Book a strategy call
          <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
};

export default BookStrategyCallCTA;

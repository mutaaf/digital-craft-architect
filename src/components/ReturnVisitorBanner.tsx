import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';

const VISIT_COUNT_KEY = 'dca_visit_count';
const SESSION_COUNTED_KEY = 'dca_visit_counted';
const DISMISSED_KEY = 'dca_return_banner_dismissed';

/**
 * Soft welcome-back strip for repeat visitors. Counts browser sessions in
 * localStorage (`dca_visit_count`, incremented once per session via the
 * `dca_visit_counted` session flag) and only renders from the 2nd visit on.
 * Dismissal is remembered for the session. Rendered in-flow so it never
 * collides with the fixed Navbar / CountdownBanner / StickyCTA.
 */
const ReturnVisitorBanner: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      /* storage unavailable - non-fatal */
    }
    if (dismissed) return;

    let count = 0;
    try {
      count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10) || 0;
      if (sessionStorage.getItem(SESSION_COUNTED_KEY) !== '1') {
        count += 1;
        localStorage.setItem(VISIT_COUNT_KEY, String(count));
        sessionStorage.setItem(SESSION_COUNTED_KEY, '1');
      }
    } catch {
      /* storage unavailable - non-fatal */
    }

    if (count >= 2) {
      setShow(true);
      trackCTAClick('return_visitor_banner_impression', 'return_visitor_banner');
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* noop */
    }
  };

  if (!show) return null;

  return (
    <section
      aria-label="Welcome back"
      className="bg-primary/5 dark:bg-primary/10 border-y border-primary/10 dark:border-primary/20"
    >
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 relative">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center">
          <span className="font-semibold text-gray-900 dark:text-white">Welcome back!</span>{' '}
          Ready to go deeper?
        </p>
        <a
          href="https://calendly.com/mutaaf"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackCTAClick('book_a_call', 'return_visitor_banner')}
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0"
        >
          Book a free strategy call <ArrowRight size={16} />
        </a>
        <button
          onClick={dismiss}
          aria-label="Dismiss welcome back banner"
          className="absolute right-2 top-2 sm:right-3 sm:top-1/2 sm:-translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </section>
  );
};

export default ReturnVisitorBanner;

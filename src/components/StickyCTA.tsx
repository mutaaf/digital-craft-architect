import React, { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { trackCTAClick } from '@/utils/analytics';

interface CtaCopy {
  prompt: string;
  button: string;
}

const DEFAULT_COPY: CtaCopy = {
  prompt: 'Ready to automate? Book a free call.',
  button: 'See Pricing',
};

// Leading route segment -> vertical-specific CTA copy. Keep button labels short
// so the bar stays on one line on mobile; default applies to unknown routes.
const ROUTE_COPY: Record<string, CtaCopy> = {
  construction: { prompt: 'Ready to automate your bids? Book a free call.', button: 'See Construction Pricing' },
  realestate: { prompt: 'Ready to close more deals? Book a free call.', button: 'See Real Estate Pricing' },
  events: { prompt: 'Ready to book more events? Book a free call.', button: 'See Events Pricing' },
  homeservices: { prompt: 'Ready to win more jobs? Book a free call.', button: 'See Home Services Pricing' },
  healthcare: { prompt: 'Ready to fill your schedule? Book a free call.', button: 'See Healthcare Pricing' },
  legal: { prompt: 'Ready to convert more clients? Book a free call.', button: 'See Legal Pricing' },
  restaurant: { prompt: 'Ready to fill more tables? Book a free call.', button: 'See Restaurant Pricing' },
  kidsplay: { prompt: 'Ready to book more parties? Book a free call.', button: 'See Pricing' },
  fitness: { prompt: 'Ready to grow your membership? Book a free call.', button: 'See Fitness Pricing' },
  dental: { prompt: 'Ready to fill your chairs? Book a free call.', button: 'See Dental Pricing' },
  salon: { prompt: 'Ready to keep your chairs booked? Book a free call.', button: 'See Salon Pricing' },
  autorepair: { prompt: 'Ready to book more bays? Book a free call.', button: 'See Auto Repair Pricing' },
};

const copyForPath = (pathname: string): CtaCopy => {
  const segment = pathname.split('/').filter(Boolean)[0]?.toLowerCase() ?? '';
  return ROUTE_COPY[segment] ?? DEFAULT_COPY;
};

const StickyCTA: React.FC = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('dca_sticky_cta_dismissed') === '1'; } catch { return false; }
  });

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem('dca_sticky_cta_dismissed', '1'); } catch { /* noop */ }
  };

  if (dismissed || !visible) return null;

  const copy = copyForPath(location.pathname);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-gray-700 dark:border-gray-800 py-3 px-4 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-white dark:text-gray-100 text-sm sm:text-base font-medium">
          {copy.prompt}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick('book_a_call', 'sticky_cta')}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white dark:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {copy.button} <ArrowRight size={16} />
          </a>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-100 transition-colors p-1"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyCTA;

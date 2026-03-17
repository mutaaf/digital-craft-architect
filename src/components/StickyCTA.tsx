import React, { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';

const StickyCTA: React.FC = () => {
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 py-3 px-4 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <p className="text-white text-sm sm:text-base font-medium">
          Ready to automate? Book a free call.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick('book_a_call', 'sticky_cta')}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Book a Call <ArrowRight size={16} />
          </a>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-white transition-colors p-1"
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

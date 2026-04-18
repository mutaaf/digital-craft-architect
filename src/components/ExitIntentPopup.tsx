import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, FileText } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import { getUtmParams } from '@/utils/utmTracker';

const SESSION_KEY = 'dca_exit_intent_shown';
const MIN_TIME_ON_PAGE_MS = 30_000; // 30 seconds
const MOBILE_IDLE_MS = 45_000; // 45 seconds

const ExitIntentPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showPopup = useCallback(() => {
    // Guard: only show once per session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }

    setOpen(true);

    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // sessionStorage unavailable
    }

    trackCTAClick('exit_intent_shown', 'exit_popup');
  }, []);

  useEffect(() => {
    const pageLoadTime = Date.now();

    // Already shown this session — bail out entirely
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }

    // Helper: has user been on page long enough?
    const hasMinTime = () => Date.now() - pageLoadTime >= MIN_TIME_ON_PAGE_MS;

    // ── Desktop: mouse leaves viewport top ──
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && hasMinTime()) {
        showPopup();
      }
    };

    // ── Mobile: idle timeout (no touch/scroll for 45s) ──
    let mobileTimer: ReturnType<typeof setTimeout> | null = null;

    const resetMobileTimer = () => {
      if (mobileTimer) clearTimeout(mobileTimer);
      mobileTimer = setTimeout(() => {
        if (hasMinTime()) showPopup();
      }, MOBILE_IDLE_MS);
    };

    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    document.addEventListener('mouseleave', handleMouseLeave);

    if (isMobile) {
      resetMobileTimer();
      window.addEventListener('touchstart', resetMobileTimer, { passive: true });
      window.addEventListener('scroll', resetMobileTimer, { passive: true });
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (mobileTimer) clearTimeout(mobileTimer);
      if (isMobile) {
        window.removeEventListener('touchstart', resetMobileTimer);
        window.removeEventListener('scroll', resetMobileTimer);
      }
    };
  }, [showPopup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('https://formspree.io/f/xovekqqk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ...getUtmParams(),
          _subject: '[Lead Magnet] AI Readiness Checklist',
        }),
      });
      if (response.ok) {
        setSubmitted(true);
        trackCTAClick('exit_intent_submit', 'exit_popup');
      }
    } catch {
      // silent fail
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 sm:max-w-md">
        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-900 dark:text-white">
                Check Your Inbox!
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                We'll send the AI Readiness Checklist to your email shortly.
              </DialogDescription>
            </DialogHeader>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <DialogTitle className="text-xl text-gray-900 dark:text-white">
                Before You Go...
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                Get our free AI Readiness Checklist — 10 key areas where AI
                delivers the fastest ROI for your business.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-2 space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address for AI readiness checklist"
                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Sending...' : 'Send Me the Checklist'}
              </Button>
              <p className="text-xs text-center text-gray-500 dark:text-gray-500">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;

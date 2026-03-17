import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { trackFormSubmission } from '@/utils/analytics';

const ExitIntent: React.FC = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const alreadyShown = useCallback(() => {
    try { return sessionStorage.getItem('dca_exit_intent_shown') === '1'; } catch { return false; }
  }, []);

  const markShown = useCallback(() => {
    try { sessionStorage.setItem('dca_exit_intent_shown', '1'); } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (alreadyShown()) return;

    // Desktop: mouse leaves viewport
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
        markShown();
      }
    };

    // Mobile: idle timer (60s)
    const idleTimer = setTimeout(() => {
      if (!alreadyShown()) {
        setShow(true);
        markShown();
      }
    }, 60000);

    document.addEventListener('mouseout', onMouseLeave);
    return () => {
      document.removeEventListener('mouseout', onMouseLeave);
      clearTimeout(idleTimer);
    };
  }, [alreadyShown, markShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/xovekqqk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          _subject: '[Exit Intent] AI Audit Request',
          source: 'exit_intent',
        }),
      });
      if (res.ok) {
        trackFormSubmission('exit_intent');
        setSubmitted(true);
      }
    } catch { /* silent */ } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <h3 className="text-xl font-bold mb-2">You're on the list!</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              We'll send your free AI audit within 24 hours.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-2">Before you go...</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get a free AI audit for your business. We'll analyze your website and send you a personalized report on how AI can automate your workflows.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-lg font-medium transition-colors text-sm whitespace-nowrap disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Get Audit'}
              </button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              No spam. Just one email with your personalized AI audit.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ExitIntent;

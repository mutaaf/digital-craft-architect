import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, FileText } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import { getUtmParams } from '@/utils/utmTracker';
import { submitLead } from '@/utils/submitLead';

const LeadMagnetSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await submitLead({
        email,
        ...getUtmParams(),
        _subject: '[Lead Magnet] AI Readiness Checklist',
      });
      if (response.ok) {
        setSubmitted(true);
        trackCTAClick('lead_magnet_submit', 'lead_magnet_section');
      }
    } catch {
      // silent fail — Formspree handles retries
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container-section bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40">
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Free Download: AI Readiness Checklist
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
          Find out if your business is ready for AI automation. Our checklist covers the 10 key
          areas where AI delivers the fastest ROI.
        </p>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Check Your Inbox!
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              We'll send the AI Readiness Checklist to your email shortly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address for AI readiness checklist"
              className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            >
              {isSubmitting ? 'Sending...' : 'Send Me the Checklist'}
            </Button>
          </form>
        )}

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default LeadMagnetSection;

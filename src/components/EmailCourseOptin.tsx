import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Mail, Send } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import { getUtmParams } from '@/utils/utmTracker';

type OptinStatus = 'idle' | 'submitting' | 'success' | 'error';

interface EmailCourseOptinProps {
  /** `section` renders a full-width card (page body); `footer` renders a compact inline row. */
  variant?: 'section' | 'footer';
  /** Analytics location label so each placement is attributable. */
  location?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailCourseOptin: React.FC<EmailCourseOptinProps> = ({
  variant = 'section',
  location = 'email_course_optin',
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<OptinStatus>('idle');
  const [invalid, setInvalid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setStatus('submitting');
    trackCTAClick('email_course_optin_submit', location);
    try {
      const res = await fetch('https://formspree.io/f/xovekqqk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          ...getUtmParams(),
          _subject: '[Email Course] 5-day AI Implementation course signup',
        }),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setStatus('error');
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (invalid) setInvalid(false);
    if (status === 'error') setStatus('idle');
  };

  /* ---- Footer variant: compact inline row matching the footer palette ---- */
  if (variant === 'footer') {
    return (
      <div className="border-t border-gray-800 pt-8 pb-8">
        {status === 'success' ? (
          <p className="text-center text-green-400 text-sm">
            You're in. Watch your inbox for day 1 of the AI Implementation course.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <p className="text-gray-300 text-sm text-center sm:text-left whitespace-nowrap">
              Get the free 5-day AI Implementation email course
            </p>
            <div className="flex w-full sm:w-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={onChange}
                placeholder="your@email.com"
                aria-label="Email address for the 5-day AI implementation course"
                aria-invalid={invalid}
                className="flex-1 sm:w-64 px-3 py-2 rounded-md bg-gray-800 dark:bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-skyblue focus:border-transparent"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-skyblue hover:bg-skyblue/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                {status === 'submitting' ? 'Sending...' : 'Get the course'}
              </button>
            </div>
          </form>
        )}
        {invalid && (
          <p className="mt-2 text-center text-red-400 text-xs">
            Please enter a valid email address.
          </p>
        )}
        {status === 'error' && (
          <p className="mt-2 text-center text-red-400 text-xs">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    );
  }

  /* ---- Section variant: full-width card for the page body ---------------- */
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40">
            <Mail className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            Get the Free 5-Day AI Implementation Email Course
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
            One short, practical email a day for five days. Learn exactly how small
            businesses put AI to work, from first pilot to live automation. No call required.
          </p>

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                You're in. Check your inbox.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Day 1 of the AI Implementation course is on its way.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={onChange}
                aria-label="Email address for the 5-day AI implementation course"
                aria-invalid={invalid}
                className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <Button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Me the Course'}
              </Button>
            </form>
          )}

          {invalid && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              Please enter a valid email address.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              Something went wrong. Please try again.
            </p>
          )}

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmailCourseOptin;

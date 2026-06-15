import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Mail, Send } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import { getUtmParams } from '@/utils/utmTracker';
import { submitLead } from '@/utils/submitLead';

type CaptureStatus = 'idle' | 'submitting' | 'success' | 'error';

interface EmailEstimateCaptureProps {
  /** Builds the same-origin 0009 share link that rehydrates this estimate. */
  buildShareUrl: () => string;
  /** Analytics location label so the placement is attributable. */
  location?: string;
}

// Same validation pattern as EmailCourseOptin.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Ticket 0015 - "Email me this estimate" lead capture under the estimate result.
 * Reuses the EmailCourseOptin submit pattern: same Formspree endpoint, same UTM
 * enrichment, a distinct subject, and the 0009 share link in the message body.
 * No new hostname, no /api/ call; only the typed email + share link + UTM leave
 * the browser.
 */
const EmailEstimateCapture = ({
  buildShareUrl,
  location = 'estimate_result',
}: EmailEstimateCaptureProps) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<CaptureStatus>('idle');
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
    trackCTAClick('email_estimate_submit', location);
    const shareLink = buildShareUrl();
    try {
      const res = await submitLead({
        email: value,
        estimate_link: shareLink,
        message: `Estimate share link: ${shareLink}`,
        ...getUtmParams(),
        _subject: '[Estimate] Demo estimate email request',
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

  return (
    <div
      data-testid="email-estimate-capture"
      className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 print:hidden"
    >
      {status === 'success' ? (
        <div
          data-testid="email-estimate-success"
          className="flex items-center justify-center gap-2 py-1 text-green-600 dark:text-green-400"
        >
          <CheckCircle size={18} />
          <span className="text-sm font-medium">Sent. Check your inbox.</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-200">
            <Mail size={16} className="text-primary" />
            <span className="text-sm font-medium">Email me this estimate</span>
          </div>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col sm:flex-row gap-2"
          >
            <Input
              data-testid="email-estimate-input"
              type="email"
              value={email}
              onChange={onChange}
              placeholder="your@email.com"
              aria-label="Email address to send this estimate to"
              aria-invalid={invalid}
              className="flex-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <Button
              data-testid="email-estimate-submit"
              type="submit"
              disabled={status === 'submitting'}
              className="gap-2 whitespace-nowrap"
            >
              <Send size={14} />
              {status === 'submitting' ? 'Sending...' : 'Email it to me'}
            </Button>
          </form>
        </>
      )}

      {invalid && (
        <p
          data-testid="email-estimate-invalid"
          className="mt-2 text-xs text-red-600 dark:text-red-400"
        >
          Please enter a valid email address.
        </p>
      )}
      {status === 'error' && (
        <p
          data-testid="email-estimate-error"
          className="mt-2 text-xs text-red-600 dark:text-red-400"
        >
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
};

export default EmailEstimateCapture;

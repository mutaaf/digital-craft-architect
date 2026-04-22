import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackCTAClick } from '@/utils/analytics';
import { getUtmParams } from '@/utils/utmTracker';

const STORAGE_KEY = 'dca_chat_bubble_dismissed';
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

const QUESTIONS = [
  { key: 'name', label: "What's your name?", placeholder: 'Your name', type: 'text' },
  { key: 'business_type', label: 'What type of business do you run?', placeholder: 'e.g. Construction, Real Estate, Dental...', type: 'text' },
  { key: 'challenge', label: "What's your biggest operational challenge right now?", placeholder: 'e.g. Slow lead follow-up, missed calls...', type: 'text' },
  { key: 'team_size', label: 'How large is your team?', placeholder: 'e.g. 1-5, 6-20, 20+', type: 'text' },
  { key: 'email', label: "Great -- what's the best email to reach you?", placeholder: 'you@company.com', type: 'email' },
] as const;

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (isNaN(ts)) return false;
    return Date.now() - ts < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function setDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable
  }
}

const LiveChatBubble: React.FC = () => {
  const [suppressed, setSuppressed] = useState(() => isDismissed());
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentValue, setCurrentValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, step]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step, isOpen]);

  if (suppressed) return null;

  const handleOpen = () => {
    setIsOpen(true);
    trackCTAClick('chat_bubble_open', 'chat_bubble');
  };

  const handleClose = () => {
    setIsOpen(false);
    setDismissed();
    setSuppressed(true);
    trackCTAClick('chat_bubble_dismissed', 'chat_bubble');
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentValue.trim()) return;

    const question = QUESTIONS[step];
    const updated = { ...answers, [question.key]: currentValue.trim() };
    setAnswers(updated);
    setCurrentValue('');

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://formspree.io/f/xovekqqk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updated,
          ...getUtmParams(),
          _subject: '[Chat Lead] ' + (updated.name || 'Website Visitor'),
        }),
      });
      if (response.ok) {
        setSubmitted(true);
        trackCTAClick('chat_lead_submit', 'chat_bubble');
      }
    } catch {
      // silent fail
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-white" />
              <span className="text-white font-medium text-sm">DigitalCraft AI</span>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors p-0.5"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 min-h-[200px]">
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg rounded-tl-none px-3 py-2 text-sm max-w-[85%]">
                Hi there! I'd love to learn a bit about your business so we can point you in the right direction.
              </div>
            </div>

            {QUESTIONS.slice(0, step + 1).map((q, i) => (
              <React.Fragment key={q.key}>
                {i > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg rounded-tl-none px-3 py-2 text-sm max-w-[85%]">
                      {q.label}
                    </div>
                  </div>
                )}
                {answers[q.key] && (
                  <div className="flex justify-end">
                    <div className="bg-primary text-white rounded-lg rounded-tr-none px-3 py-2 text-sm max-w-[85%]">
                      {answers[q.key]}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}

            {!submitted && step === 0 && !answers[QUESTIONS[0].key] && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg rounded-tl-none px-3 py-2 text-sm max-w-[85%]">
                  {QUESTIONS[0].label}
                </div>
              </div>
            )}

            {submitted && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg rounded-tl-none px-3 py-2 text-sm max-w-[85%] flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  Thanks{answers.name ? `, ${answers.name}` : ''}! We'll be in touch soon.
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {!submitted && (
            <form onSubmit={handleSubmitAnswer} className="flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 p-3">
              <Input
                ref={inputRef}
                type={QUESTIONS[step]?.type || 'text'}
                placeholder={QUESTIONS[step]?.placeholder || ''}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                disabled={isSubmitting}
                required
                aria-label={QUESTIONS[step]?.label || 'Your answer'}
                className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isSubmitting || !currentValue.trim()}
                className="shrink-0 bg-primary hover:bg-primary/90 text-white h-9 w-9"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default LiveChatBubble;

import { useState } from 'react';
import { History, ArrowRight, X } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';

/**
 * "Continue your [Company] demo" prompt (ticket 0010).
 *
 * Shown on a demo hub when DemoContext already holds a persisted company profile
 * for the current vertical (the profile now lives in localStorage, so it survives
 * a new session). Offers two actions:
 *   - Resume     keep the persisted profile active and collapse the prompt.
 *   - Start fresh call the existing reset (clears the profile, the setup form returns).
 *
 * Dismissal is remembered for the session via a per-vertical dca_*_dismissed key,
 * matching the existing dismissal convention, so it does not reappear that session.
 * Reusable across hubs - no per-hub markup duplication.
 */
const ResumeDemoPrompt = () => {
  const { company, isCustomized, reset, vertical } = useDemoContext();
  const dismissKey = `dca_resume_demo_dismissed_${vertical}`;

  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(dismissKey) === '1';
    } catch {
      return false;
    }
  });
  // Local flag so "Resume" can collapse the prompt without clearing the profile.
  const [resumed, setResumed] = useState(false);

  if (!isCustomized || !company || dismissed || resumed) return null;

  const name = company.companyName;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(dismissKey, '1');
    } catch {
      /* storage unavailable - non-fatal */
    }
  };

  return (
    <div
      data-testid="resume-demo-prompt"
      className="relative mb-8 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 sm:p-6 animate-fade-in"
    >
      <button
        type="button"
        data-testid="resume-demo-dismiss"
        onClick={dismiss}
        aria-label="Dismiss continue demo prompt"
        className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <History size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
              Continue your {name} demo
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              We saved your setup. Pick up where you left off.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto shrink-0">
          <Button
            data-testid="resume-demo-resume"
            size="sm"
            onClick={() => setResumed(true)}
            className="gap-1.5"
          >
            Resume <ArrowRight size={14} />
          </Button>
          <Button
            data-testid="resume-demo-start-fresh"
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-gray-500 dark:text-gray-400"
          >
            Start fresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumeDemoPrompt;

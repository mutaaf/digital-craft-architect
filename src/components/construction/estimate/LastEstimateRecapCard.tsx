import { RotateCcw, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PROJECT_TYPES,
  FINISH_LEVELS,
  EXTRAS,
  calculateEstimate,
} from '@/data/estimatePricing';
import type { EstimateShareState } from '@/pages/construction/estimateShareParams';

/**
 * "Reopen your last estimate" recap card (ticket 0014).
 *
 * Shown on the estimate wizard's step-1 screen when a parse-safe completed
 * estimate is stored for the current vertical (localStorage, versioned key). It
 * names the project type and a ballpark total, and offers:
 *   - Reopen             rehydrate straight to the result view.
 *   - Start a new estimate clear the stored estimate, keep the normal wizard.
 *   - Dismiss (X)        hide it for the session (remembered by the caller).
 *
 * Computed total reuses the shared pricing source of truth (calculateEstimate)
 * so the figure matches the result card exactly. Reusable across verticals; no
 * per-page markup duplication. Ships dark: variants. No em-dash in any copy.
 */
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

interface LastEstimateRecapCardProps {
  estimate: EstimateShareState;
  onReopen: () => void;
  onStartNew: () => void;
  onDismiss: () => void;
}

const LastEstimateRecapCard = ({
  estimate,
  onReopen,
  onStartNew,
  onDismiss,
}: LastEstimateRecapCardProps) => {
  const projectType = PROJECT_TYPES.find((t) => t.id === estimate.selectedTypeId);
  const finish = FINISH_LEVELS.find((f) => f.id === estimate.selectedFinishId);
  if (!projectType || !finish) return null;

  const selectedExtras = EXTRAS.filter((e) => estimate.selectedExtraIds.includes(e.id));
  const breakdown = calculateEstimate(projectType, estimate.sqft, finish, selectedExtras);

  return (
    <div
      data-testid="last-estimate-recap"
      className="relative mb-6 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 sm:p-6 animate-fade-in"
    >
      <button
        type="button"
        data-testid="last-estimate-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss last estimate recap"
        className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <RotateCcw size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Reopen your last estimate
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {projectType.label} ballpark {fmt(breakdown.totalLow)} to {fmt(breakdown.totalHigh)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto shrink-0">
          <Button
            data-testid="last-estimate-reopen"
            size="sm"
            onClick={onReopen}
            className="gap-1.5"
          >
            Reopen <ArrowRight size={14} />
          </Button>
          <Button
            data-testid="last-estimate-start-new"
            variant="ghost"
            size="sm"
            onClick={onStartNew}
            className="text-gray-500 dark:text-gray-400"
          >
            Start a new estimate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LastEstimateRecapCard;

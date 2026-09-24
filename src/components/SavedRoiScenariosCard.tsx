// Ticket 0093 - "Saved ROI scenarios" card on /my dashboard.
//
// Renders BELOW the existing ticket 0062 last-ROI card when the visitor has
// at least one saved scenario. Card owns its own hydration (mirroring the
// ticket 0091 RecentBlogPostsCard and ticket 0076 QuizHistoryCard pattern)
// so the parent dashboard does not need a new hydration branch; the card
// returns null when the store is empty.
//
// Every color class carries a dark: variant (2026-05-22 AGENTS.md dark-mode
// Hard NO). Every string is hyphen-only per the 2026-05-07 em-dash Hard NO.

import React, { useEffect, useState } from 'react';
import { LineChart, ArrowRight, Trash2 } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import {
  computeRoi,
  encodeRoiParams,
} from '@/pages/roiCalculatorParams';
import {
  getRoiScenarios,
  deleteRoiScenario,
  type RoiScenario,
} from '@/utils/roiScenariosStore';

const CARD =
  'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm';
const ICON =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary';

function fmtDollars(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

function fmtHours(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function reopenHref(scenario: RoiScenario): string {
  try {
    return `/roi?${encodeRoiParams(scenario.inputs).toString()}`;
  } catch {
    return '/roi';
  }
}

const SavedRoiScenariosCard: React.FC = () => {
  const [scenarios, setScenarios] = useState<RoiScenario[] | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    try {
      setScenarios(getRoiScenarios());
    } catch {
      setScenarios([]);
    }
  }, []);

  if (!scenarios || scenarios.length === 0) return null;

  const handleDelete = (id: string) => {
    const next = deleteRoiScenario(id);
    setScenarios(next);
    if (next.length < 2) setCompareOpen(false);
  };

  const handleCompareToggle = () => {
    if (scenarios.length < 2) return;
    if (!compareOpen) trackCTAClick('my_roi_scenario_compare', 'my_dashboard');
    setCompareOpen((v) => !v);
  };

  const compareCandidates = scenarios.slice(0, 2);

  return (
    <article data-testid="saved-roi-scenarios-card" className={CARD}>
      <div className="flex items-start gap-4 mb-4">
        <div className={ICON}>
          <LineChart size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Saved ROI scenarios
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Reopen a saved scenario or stack your top two side by side.
          </p>
        </div>
      </div>
      <ul className="space-y-2">
        {scenarios.map((entry) => {
          const outputs = computeRoi(entry.inputs);
          return (
            <li
              key={entry.id}
              data-testid="roi-scenario-row"
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {entry.name}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {`${fmtDollars(outputs.annualSavings)} per year, ${fmtHours(outputs.monthlyHoursSaved)} hrs/mo`}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={reopenHref(entry)}
                  data-testid="roi-scenario-reopen"
                  onClick={() => trackCTAClick('my_roi_scenario_reopen', 'my_dashboard')}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Reopen
                  <ArrowRight size={14} />
                </a>
                <button
                  type="button"
                  data-testid="roi-scenario-delete"
                  aria-label={`Delete scenario ${entry.name}`}
                  onClick={() => handleDelete(entry.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-400 hover:text-red-500 dark:hover:border-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          data-testid="roi-compare-chip"
          onClick={handleCompareToggle}
          disabled={scenarios.length < 2}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-primary hover:border-primary dark:hover:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700"
        >
          {compareOpen ? 'Hide comparison' : 'Compare selected'}
        </button>
        <span className="text-gray-500 dark:text-gray-400">
          {scenarios.length < 2
            ? 'Save at least two scenarios to compare them.'
            : 'Stacks the top two scenarios side by side.'}
        </span>
      </div>

      {compareOpen && compareCandidates.length === 2 && (
        <div
          data-testid="roi-compare-panel"
          className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {compareCandidates.map((entry) => {
            const outputs = computeRoi(entry.inputs);
            return (
              <div
                key={entry.id}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                  Scenario
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {entry.name}
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Annual savings
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmtDollars(outputs.annualSavings)}
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Monthly hours saved
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {`${fmtHours(outputs.monthlyHoursSaved)} hrs/mo`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
};

export default SavedRoiScenariosCard;

// Ticket 0076 - Persist every AI Readiness Quiz completion and surface a
// "Your readiness trend" sparkline card on /my dashboard. Rendered BELOW
// the existing readiness card (ticket 0045) and ABOVE the strategy-call
// CTA / empty-state block on /my. Reads dca_quiz_history_v1 through
// src/utils/quizHistoryStore.ts; when the store returns zero entries the
// component returns null so a first-time visitor sees nothing.
//
// The sparkline is hand-drawn inline SVG (no chart library, per the ticket
// out-of-scope rule and the Hard NO on new deps). Colors use currentColor
// so the light/dark theme inherits correctly - same pattern as the
// ticket 0060 streak badge SVG.

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import {
  getQuizHistory,
  KNOWN_PERSONAS,
  type QuizHistoryEntry,
  type QuizPersonaLabel,
} from '@/utils/quizHistoryStore';

// Tier numeric values for the sparkline y-axis. Order mirrors the natural
// readiness ranking and matches the KNOWN_PERSONAS index (ticket 0076
// mirror-source with src/utils/quizHistoryStore.ts).
const TIER_VALUE: Record<QuizPersonaLabel, number> = {
  'Getting Started': 1,
  'Ready for AI': 2,
  'Advanced - Ready to Scale': 3,
};

function tierValue(persona: QuizPersonaLabel): number {
  return TIER_VALUE[persona] ?? 1;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

// SVG geometry constants. viewBox 0 0 220 40 per the ticket acceptance
// box. The polyline y-coord is `40 - ((tierValue - 1) * 20)` so Tier 1
// sits at y=40 (bottom) and Tier 3 sits at y=0 (top).
const SPARK_W = 220;
const SPARK_H = 40;
const SPARK_STEP_Y = 20;

function buildPoints(entries: QuizHistoryEntry[]): string {
  if (entries.length < 2) return '';
  const step = SPARK_W / (entries.length - 1);
  return entries
    .map((entry, i) => {
      const x = i * step;
      const y = SPARK_H - (tierValue(entry.persona) - 1) * SPARK_STEP_Y;
      return `${x},${y}`;
    })
    .join(' ');
}

const CARD =
  'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm';
const ICON =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary';

const QuizHistoryCard: React.FC = () => {
  const [history, setHistory] = useState<QuizHistoryEntry[] | null>(null);
  const quizHistoryViewTracked = useRef<boolean>(false);

  useEffect(() => {
    try {
      setHistory(getQuizHistory());
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (!history || history.length < 1) return;
    if (quizHistoryViewTracked.current) return;
    quizHistoryViewTracked.current = true;
    trackCTAClick('quiz_history_view', 'my_dashboard');
  }, [history]);

  if (!history || history.length < 1) return null;

  const points = buildPoints(history);
  const N = history.length;
  const ariaLabel = `Your AI readiness tier trajectory across ${N} ${N === 1 ? 'completion' : 'completions'}`;

  return (
    <article data-testid="quiz-history-card" className={CARD}>
      <div className="flex items-start gap-4 mb-4">
        <div className={ICON}>
          <TrendingUp size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your AI readiness trend
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Every completed quiz stays in your browser so you can watch your tier climb.
          </p>
        </div>
      </div>

      {history.length >= 2 ? (
        <div className="mb-4 text-primary">
          <svg
            data-testid="quiz-history-sparkline"
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            width="100%"
            height={SPARK_H}
            role="img"
            aria-label={ariaLabel}
            className="text-primary"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points}
            />
            {history.map((entry, i) => {
              const step = SPARK_W / (history.length - 1);
              const x = i * step;
              const y = SPARK_H - (tierValue(entry.persona) - 1) * SPARK_STEP_Y;
              return <circle key={`${entry.completedAt}-${i}`} cx={x} cy={y} r={3} fill="currentColor" />;
            })}
          </svg>
        </div>
      ) : (
        <p
          data-testid="quiz-history-fallback"
          className="mb-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
        >
          Take the quiz again to see your trend.
        </p>
      )}

      <ol
        data-testid="quiz-history-list"
        className="space-y-2 text-sm text-gray-800 dark:text-gray-200"
      >
        {history.map((entry, i) => (
          <li
            key={`${entry.completedAt}-${i}`}
            data-testid="quiz-history-row"
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-2"
          >
            <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
              {formatDate(entry.completedAt)}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {entry.persona}
            </span>
          </li>
        ))}
      </ol>

      <Link
        to="/quiz"
        data-testid="quiz-history-retake"
        onClick={() => trackCTAClick('my_quiz_history_retake', 'my_dashboard')}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        Re-take the quiz
        <ArrowRight size={16} />
      </Link>
    </article>
  );
};

// Ensure the KNOWN_PERSONAS export stays used (defense-in-depth against a
// future TypeScript lint pruning the type-only import). This is a
// zero-cost identity so tsc/lint see the reference at build time.
const _kp: readonly QuizPersonaLabel[] = KNOWN_PERSONAS;
void _kp;

export default QuizHistoryCard;

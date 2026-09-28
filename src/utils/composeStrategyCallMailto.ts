// Ticket 0101 - Pure composer for the "Book a strategy call" mailto: link
// on /my. Reads the four persisted stores through their shipped getters
// (not raw localStorage) per the 2026-09-10 raw-vs-sliced lesson, then
// renders a plain-text body under 900 URL-encoded characters. When every
// store is empty the body degrades to the single-line fallback so the CTA
// is still useful on a first visit.
//
// The composer never touches raw storage: every read goes through
// loadLastEstimate() (ticket 0014), getRoiScenarios() (ticket 0093),
// getQuizHistory() (ticket 0076), and getRecentVerticals() (ticket 0100)
// so the parse-safe + allow-list invariants those getters enforce stay
// intact.

import { loadLastEstimate } from '@/pages/construction/lastEstimateStore';
import type { EstimateShareState } from '@/pages/construction/estimateShareParams';
import { PROJECT_TYPES, FINISH_LEVELS, EXTRAS, calculateEstimate } from '@/data/estimatePricing';
import { getRoiScenarios, type RoiScenario } from '@/utils/roiScenariosStore';
import { computeRoi } from '@/pages/roiCalculatorParams';
import { getQuizHistory, type QuizHistoryEntry } from '@/utils/quizHistoryStore';
import { getRecentVerticals, type RecentVertical } from '@/utils/recentVerticalsStore';
import {
  STRATEGY_CALL_RECIPIENT,
  STRATEGY_CALL_SUBJECT,
  STRATEGY_CALL_BODY_HEADER,
  STRATEGY_CALL_FALLBACK_BODY,
  STRATEGY_CALL_SECTION_HEADERS,
  STRATEGY_CALL_BEST_TIME_LINE,
  STRATEGY_CALL_SIGNATURE_LINE,
} from '@/data/strategyCallCopy';

// Majority of mail clients (Gmail web, iOS Mail, Outlook desktop) accept
// mailto: query strings well past 900 URL-encoded characters; 900 is the
// conservative floor the ticket names to keep the primitive portable.
const MAX_ENCODED_BODY_LENGTH = 900;

const MAX_VERTICAL_LABELS = 5;

export interface StrategyCallMailto {
  href: string;
  bodyPreview: string;
}

function estimateLine(estimate: EstimateShareState | null): string | null {
  if (!estimate) return null;
  const project = PROJECT_TYPES.find((p) => p.id === estimate.selectedTypeId);
  const finish = FINISH_LEVELS.find((f) => f.id === estimate.selectedFinishId);
  if (!project || !finish) return null;
  const extras = EXTRAS.filter((e) => estimate.selectedExtraIds.includes(e.id));
  const breakdown = calculateEstimate(project, estimate.sqft, finish, extras);
  const mid = Math.round((breakdown.totalLow + breakdown.totalHigh) / 2);
  const sqft = estimate.sqft.toLocaleString('en-US');
  const dollars = mid.toLocaleString('en-US');
  return `${STRATEGY_CALL_SECTION_HEADERS.estimate} ${project.label} at ${sqft} sq ft, ${finish.label} finish, midpoint $${dollars}`;
}

function topRoiScenario(scenarios: RoiScenario[]): RoiScenario | null {
  if (scenarios.length === 0) return null;
  let best = scenarios[0];
  let bestSavings = computeRoi(best.inputs).annualSavings;
  for (let i = 1; i < scenarios.length; i += 1) {
    const savings = computeRoi(scenarios[i].inputs).annualSavings;
    if (savings > bestSavings) {
      best = scenarios[i];
      bestSavings = savings;
    }
  }
  return best;
}

function roiLine(scenarios: RoiScenario[]): string | null {
  const best = topRoiScenario(scenarios);
  if (!best) return null;
  const savings = computeRoi(best.inputs).annualSavings.toLocaleString('en-US');
  return `${STRATEGY_CALL_SECTION_HEADERS.roi} ${best.name} at $${savings} per year`;
}

function quizLine(history: QuizHistoryEntry[]): string | null {
  if (history.length === 0) return null;
  const latest = history[history.length - 1];
  return `${STRATEGY_CALL_SECTION_HEADERS.quiz} ${latest.persona}`;
}

function verticalsLine(verticals: RecentVertical[]): string | null {
  if (verticals.length === 0) return null;
  const labels = verticals
    .slice(0, MAX_VERTICAL_LABELS)
    .map((v) => v.label)
    .join(', ');
  return `${STRATEGY_CALL_SECTION_HEADERS.verticals} ${labels}`;
}

// Ordered list of section renderers. The composer's truncation strategy
// drops sections from the END of this list first so the estimate line
// (usually the most concrete signal a construction visitor left) is the
// last to fall out under the length cap.
const SECTION_RENDERERS: readonly ((deps: {
  estimate: EstimateShareState | null;
  scenarios: RoiScenario[];
  quiz: QuizHistoryEntry[];
  verticals: RecentVertical[];
}) => string | null)[] = [
  ({ estimate }) => estimateLine(estimate),
  ({ scenarios }) => roiLine(scenarios),
  ({ quiz }) => quizLine(quiz),
  ({ verticals }) => verticalsLine(verticals),
];

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function assembleBody(sections: string[]): string {
  if (sections.length === 0) return STRATEGY_CALL_FALLBACK_BODY;
  const lines: string[] = [
    STRATEGY_CALL_BODY_HEADER,
    '',
    STRATEGY_CALL_BEST_TIME_LINE,
    '',
    ...sections,
    '',
    STRATEGY_CALL_SIGNATURE_LINE,
  ];
  return lines.join('\n');
}

function encodedLength(body: string): number {
  return encodeURIComponent(body).length;
}

/**
 * Pure composer. Reads every store through its shipped getter, renders the
 * enabled sections in order, and truncates section-by-section from the
 * bottom so the URL-encoded body stays under MAX_ENCODED_BODY_LENGTH.
 * Returns both the href (ready to render as `<a href>`) and a plain-text
 * bodyPreview the CTA component or a caller test can inspect without
 * re-decoding the URL.
 */
export function composeStrategyCallMailto(): StrategyCallMailto {
  const estimate = safe(() => loadLastEstimate('construction'), null);
  const scenarios = safe(() => getRoiScenarios(), [] as RoiScenario[]);
  const quiz = safe(() => getQuizHistory(), [] as QuizHistoryEntry[]);
  const verticals = safe(() => getRecentVerticals(), [] as RecentVertical[]);

  const rendered = SECTION_RENDERERS
    .map((r) => r({ estimate, scenarios, quiz, verticals }))
    .filter((line): line is string => line !== null);

  // Truncate section-by-section from the bottom until the encoded body
  // fits under the cap. The header, best-time line, and signature always
  // stay because the fallback (empty sections) is already short.
  let sections = rendered.slice();
  let body = assembleBody(sections);
  while (sections.length > 0 && encodedLength(body) > MAX_ENCODED_BODY_LENGTH) {
    sections = sections.slice(0, -1);
    body = assembleBody(sections);
  }
  // Belt-and-suspenders: if even the header + best-time + signature
  // exceeds the cap, degrade to the fallback body.
  if (encodedLength(body) > MAX_ENCODED_BODY_LENGTH) {
    body = STRATEGY_CALL_FALLBACK_BODY;
  }

  const params = new URLSearchParams();
  params.set('subject', STRATEGY_CALL_SUBJECT);
  params.set('body', body);
  const href = `mailto:${STRATEGY_CALL_RECIPIENT}?${params.toString()}`;
  return { href, bodyPreview: body };
}

export const STRATEGY_CALL_MAILTO_CONSTANTS = {
  MAX_ENCODED_BODY_LENGTH,
  MAX_VERTICAL_LABELS,
} as const;

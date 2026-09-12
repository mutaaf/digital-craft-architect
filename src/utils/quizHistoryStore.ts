// Ticket 0076 - Persist every AI Readiness Quiz completion and surface a
// "Your readiness trend" sparkline card on /my dashboard.
//
// Sibling of src/utils/quizPersonaStore.ts (ticket 0045). Where that store
// captures the LATEST single completion snapshot, this store accretes an
// eight-entry bounded history so /my can plot a tier trajectory as a
// sparkline plus a dated list of the last eight completions. The two
// stores are additive and independent: the existing readiness card on /my
// still reads dca_quiz_persona_v1, and the new trend card reads
// dca_quiz_history_v1. Ticket 0045's byte-identical guarantee applies:
// the LATEST entry in the history array is written from the same
// (persona, completedAt) tuple the persona store receives, so a spec
// asserting equality across the two stores holds by construction.
//
// Mirrors the parse-safe pattern of src/utils/recentDemosStore.ts (ticket
// 0026): every localStorage read/write is wrapped in try/catch, a malformed
// stored value resolves to [], and a quota-exceeded write is silently
// tolerated. The KNOWN_PERSONAS allow-list is the mirror-source lock
// against `src/pages/AIReadinessQuiz.tsx` TIERS.label (2026-05-25
// mirror-source rule). The ticket prose named placeholder persona strings
// ('Just Starting' / 'Getting Smart' / 'AI-Ready') that do not exist in
// the code; the real TIERS labels the quiz emits are the byte-identical
// values already written to dca_quiz_persona_v1 for the LATEST snapshot,
// so KNOWN_PERSONAS mirrors those.
//
// KEEP IN SYNC WITH src/pages/AIReadinessQuiz.tsx TIERS labels.

export type QuizPersonaLabel = 'Getting Started' | 'Ready for AI' | 'Advanced - Ready to Scale';

export interface QuizHistoryEntry {
  persona: QuizPersonaLabel;
  completedAt: number;
}

const STORAGE_KEY = 'dca_quiz_history_v1';
const MAX_ENTRIES = 8;
const DEDUP_WINDOW_MS = 60_000;

export const KNOWN_PERSONAS: readonly QuizPersonaLabel[] = [
  'Getting Started',
  'Ready for AI',
  'Advanced - Ready to Scale',
] as const;

function isKnownPersona(value: unknown): value is QuizPersonaLabel {
  return typeof value === 'string' && (KNOWN_PERSONAS as readonly string[]).includes(value);
}

function isQuizHistoryEntry(value: unknown): value is QuizHistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isKnownPersona(v.persona) &&
    typeof v.completedAt === 'number' &&
    Number.isFinite(v.completedAt)
  );
}

/**
 * Read the quiz-history list, parse-safe and allow-list-validated.
 * A malformed stored value, a quota-exceeded environment, or an absent
 * storage backend all resolve to []. Entries whose persona is not in
 * KNOWN_PERSONAS are filtered out at read time so a stale or hand-edited
 * localStorage value cannot render an unknown label on the card.
 * Consecutive entries within DEDUP_WINDOW_MS are collapsed at read time
 * so a stale value carrying a double-click residue still surfaces the
 * dedup guarantee the write path enforces. Result is bounded to
 * MAX_ENTRIES and returned in chronological (most-recent-LAST) order so
 * the sparkline can plot by array index.
 */
export function getQuizHistory(): QuizHistoryEntry[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return []; /* storage unavailable - non-fatal */
  }
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const validated = parsed.filter(isQuizHistoryEntry);
  const deduped: QuizHistoryEntry[] = [];
  for (const entry of validated) {
    const last = deduped[deduped.length - 1];
    if (last && Math.abs(entry.completedAt - last.completedAt) < DEDUP_WINDOW_MS) {
      continue;
    }
    deduped.push(entry);
  }
  return deduped.slice(-MAX_ENTRIES);
}

/**
 * Append one quiz completion to the history array. A completion whose
 * persona is not in KNOWN_PERSONAS is a no-op (allow-list guard against
 * a caller passing an untrusted label). A completion whose completedAt
 * falls within DEDUP_WINDOW_MS of the LAST stored entry is a no-op
 * (dedup guard against a double-click on the completion screen). The
 * write is bounded to MAX_ENTRIES by popping the oldest entry when the
 * length would exceed the cap. A storage failure is silently tolerated.
 */
export function appendQuizHistory(entry: QuizHistoryEntry): void {
  if (!isKnownPersona(entry.persona)) return;
  if (!Number.isFinite(entry.completedAt)) return;

  try {
    const existing = getQuizHistory();
    const last = existing[existing.length - 1];
    if (last && Math.abs(entry.completedAt - last.completedAt) < DEDUP_WINDOW_MS) {
      return;
    }
    const next: QuizHistoryEntry[] = [...existing, entry].slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable - non-fatal */
  }
}

/**
 * Drop every recorded quiz completion. Exported for a future "clear
 * history" UI surface; this ticket renders the card without a visible
 * clear control per the ticket 0026 / 0074 pattern.
 */
export function clearQuizHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable - non-fatal */
  }
}

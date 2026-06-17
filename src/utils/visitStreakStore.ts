// Ticket 0060 - Return-visit streak badge on /my dashboard.
//
// Client-side store of the visitor's distinct visit-days over a trailing
// 14-day rolling window, surfaced as a small badge card on the /my
// dashboard so a returning visitor sees a low-key engagement signal
// without any push notification, email capture, or guilt-trip messaging.
//
// Mirrors the parse-safe pattern of src/utils/quizPersonaStore.ts: every
// localStorage read/write is wrapped in try/catch, a malformed stored
// value resolves to the empty default and silently overwrites, and a
// quota-exceeded write is silently tolerated. Captures distinct
// YYYY-MM-DD date strings ONLY (no per-page timestamps, no per-route
// counts) so the /trust data-handling disclosure stays narrow.
//
// Date-format choice: UTC via new Date().toISOString().slice(0, 10)
// rather than local-time via toLocaleDateString('en-CA'). UTC is
// predictable across browsers and avoids local-time midnight edge cases
// where a visitor opening the page right before midnight on Tuesday and
// right after midnight on Wednesday could see the count tick twice in a
// minute. The trade-off is that the badge ticks over at UTC midnight,
// not local midnight; for a marketing dashboard this is acceptable
// because the badge is a passive on-page signal, not a daily-reminder
// surface.

const STORAGE_KEY = 'dca_visit_days_v1';
const WINDOW_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface VisitStreak {
  daysInLast14: number;
  latestDay: string | null;
}

function todayUtcString(): string {
  return new Date().toISOString().slice(0, 10);
}

// True when ymd is a YYYY-MM-DD string within the trailing WINDOW_DAYS
// from today (inclusive of today and the boundary day 14 days back).
function isWithinWindow(ymd: string, todayMs: number): boolean {
  if (typeof ymd !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const t = Date.parse(`${ymd}T00:00:00Z`);
  if (!Number.isFinite(t)) return false;
  const ageDays = (todayMs - t) / MS_PER_DAY;
  return ageDays >= 0 && ageDays < WINDOW_DAYS;
}

function safeRead(): string[] {
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
    return []; /* corrupted entry - silently reset */
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((v): v is string => typeof v === 'string');
}

function safeWrite(days: readonly string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  } catch {
    /* storage unavailable - non-fatal */
  }
}

/**
 * Record today's visit. If today's UTC YYYY-MM-DD is not yet in the
 * stored array, add it and prune any entry older than 14 days. A
 * malformed stored value, a quota-exceeded environment, or an absent
 * storage backend are all silently tolerated.
 */
export function recordVisitToday(): void {
  const today = todayUtcString();
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  const existing = safeRead();
  const pruned = existing.filter((d) => isWithinWindow(d, todayMs));
  if (pruned.includes(today)) {
    if (pruned.length !== existing.length) safeWrite(pruned.sort());
    return;
  }
  const next = [...pruned, today].sort();
  safeWrite(next);
}

/**
 * Read the visit-day list, prune anything older than 14 days, and
 * return the count plus the most recent day. A malformed stored value
 * or an absent storage backend resolves to the empty default.
 */
export function getVisitStreak(): VisitStreak {
  const todayMs = Date.parse(`${todayUtcString()}T00:00:00Z`);
  const pruned = safeRead()
    .filter((d) => isWithinWindow(d, todayMs))
    .sort();
  return {
    daysInLast14: pruned.length,
    latestDay: pruned.length > 0 ? pruned[pruned.length - 1] : null,
  };
}

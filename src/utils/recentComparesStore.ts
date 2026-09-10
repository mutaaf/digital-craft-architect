// Ticket 0074 - Persist the visitor's viewed /compare/<tool> pages and
// surface them as a "Comparisons you're weighing" card on /my dashboard.
//
// Mirrors the parse-safe, allow-list-validated pattern of
// src/utils/recentDemosStore.ts (ticket 0026): every localStorage read/write
// is wrapped in try/catch, malformed values resolve to []/no-op, and a
// quota-exceeded write is silently tolerated. The store records path, tool,
// and a timestamp only - all already public catalog metadata from
// src/data/compareEntries.ts, no PII - and stays in the existing dca_*
// localStorage namespace. The `dca_recent_compares_v1` key is disclosed on
// /trust in the same PR per the ticket 0018 / 0033 / 0045 / 0060 / 0062
// honesty rule.
//
// The allow-list is derived at module load from COMPARE_ENTRIES so appending
// a fifteenth comparison widens the allow-list automatically. Entries whose
// path is no longer in the allow-list are filtered at read time so a renamed
// or removed comparison cannot strand a dead recap link (mirroring the
// ticket 0026 KNOWN_PATHS invariant applied to compare pages).

import { COMPARE_ENTRIES, type CompareEntry } from '@/data/compareEntries';

export interface RecentCompare {
  path: string;
  tool: string;
  viewedAt: number;
}

const STORAGE_KEY = 'dca_recent_compares_v1';
const MAX_ENTRIES = 5;

// The union of every COMPARE_ENTRIES[i].path. Recording a visit to a path
// outside this set is a no-op so a stale or stray entry cannot produce a
// dead link. The 2026-05-25 mirror-source lesson applies: this set is the
// single allow-list both the store writer and the read-back validator
// consult.
const KNOWN_PATHS: ReadonlySet<string> = new Set<string>(
  COMPARE_ENTRIES.map((e) => e.path),
);

function isRecentCompare(value: unknown): value is RecentCompare {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.path === 'string' &&
    typeof v.tool === 'string' &&
    typeof v.viewedAt === 'number' &&
    Number.isFinite(v.viewedAt)
  );
}

/**
 * Read every parse-safe, allow-list-validated entry currently in storage
 * WITHOUT the display-limit slice. Used by `suggestNextCompare` so the
 * unvisited-entry search considers every stored visit, not just the top
 * MAX_ENTRIES that surface on the dashboard.
 */
function readAllVisited(): RecentCompare[] {
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

  return parsed
    .filter(isRecentCompare)
    .filter((entry) => KNOWN_PATHS.has(entry.path));
}

/**
 * Read the recent-compares list, parse-safe and path-validated. A malformed
 * stored value, a quota-exceeded environment, or an absent storage backend
 * all resolve to []. Entries whose path is no longer in the compare
 * allow-list are filtered out at read time so a stale list cannot render a
 * dead link. Capped at MAX_ENTRIES for the dashboard display.
 */
export function getRecentCompares(): RecentCompare[] {
  return readAllVisited().slice(0, MAX_ENTRIES);
}

/**
 * Record a compare-page visit at the front of the list. A re-visit of an
 * already-stored path moves the entry to the front rather than duplicating
 * it. A path not in the compare allow-list is rejected (no write), so a
 * removed compare route cannot strand a dead link. A storage failure is
 * silently tolerated.
 */
export function recordCompareVisit(path: string, tool: string): void {
  if (!KNOWN_PATHS.has(path)) return;

  try {
    const existing = getRecentCompares();
    const filtered = existing.filter((entry) => entry.path !== path);
    const next: RecentCompare[] = [
      { path, tool, viewedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable - non-fatal */
  }
}

/**
 * Return the first COMPARE_ENTRIES entry (in array order) whose path is NOT
 * present in the current recent-compares list. Returns null when every
 * entry has been viewed OR when the visitor has no history yet (the
 * suggest chip is only shown to visitors who have already tapped at least
 * one comparison). Pure and deterministic per the ticket 0026
 * getRecentDemos shape.
 */
export function suggestNextCompare(): CompareEntry | null {
  const visited = readAllVisited();
  if (visited.length === 0) return null;
  const visitedPaths = new Set(visited.map((r) => r.path));
  for (const entry of COMPARE_ENTRIES) {
    if (!visitedPaths.has(entry.path)) return entry;
  }
  return null;
}

/**
 * Drop every recorded compare visit. Exported for a future "clear history"
 * UI surface; this ticket renders the card without a visible clear control
 * (mirroring the ticket 0026 pattern of reserving the clear function for a
 * later general-clear UI ticket).
 */
export function clearRecentCompares(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable - non-fatal */
  }
}

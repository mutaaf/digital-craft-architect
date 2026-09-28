// Ticket 0100 - Persist the visitor's visited /ai-for-<vertical> landing
// pages and surface them as a "Verticals you're evaluating" card on /my
// dashboard.
//
// Mirrors the parse-safe, allow-list-validated pattern of
// src/utils/recentComparesStore.ts (ticket 0074) and
// src/utils/recentBlogPostsStore.ts (ticket 0091): every localStorage
// read/write is wrapped in try/catch, malformed values resolve to []/no-op,
// and a quota-exceeded write is silently tolerated. The store records
// path, label, and a timestamp only - all already public catalog metadata
// from src/data/verticalLabels.ts, no PII - and stays in the existing
// dca_* localStorage namespace. The `dca_recent_verticals_v1` key is
// disclosed on /trust in the same PR per the ticket 0018 / 0033 / 0074 /
// 0091 / 0093 honesty rule.
//
// The allow-list is the intersection of ROUTES (from src/data/routes.ts)
// AND the `/ai-for-` prefix. An entry whose path is not in ROUTES OR does
// not start with `/ai-for-` is dropped at write time and filtered at read
// time so a renamed vertical page or a stray forged path can never render
// a dead reopen link.
//
// Per the 2026-09-10 raw-vs-sliced lesson the module keeps a private
// `readAllVerticals()` helper that returns the full validated list; the
// public `getRecentVerticals()` is `readAllVerticals().slice(0, MAX)` so
// any future dossier or suggest surface can read the raw list without
// the display cap.

import { ROUTES } from '@/data/routes';

export interface RecentVertical {
  path: string;
  label: string;
  lastVisitedAt: number;
}

const STORAGE_KEY = 'dca_recent_verticals_v1';
export const MAX_RECENT_VERTICALS = 5;

// Every route in ROUTES that starts with `/ai-for-`. Recording a visit to
// a path outside this set is a no-op so a stale or stray entry cannot
// produce a dead link. The 2026-05-25 mirror-source lesson applies: this
// set is the single allow-list both the store writer and the read-back
// validator consult, and it derives from src/data/routes.ts so adding a
// new AI-for-* route widens the allow-list automatically.
const KNOWN_VERTICAL_PATHS: ReadonlySet<string> = new Set<string>(
  ROUTES.filter((r) => r.startsWith('/ai-for-')),
);

function isRecentVertical(value: unknown): value is RecentVertical {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.path === 'string' &&
    typeof v.label === 'string' &&
    typeof v.lastVisitedAt === 'number' &&
    Number.isFinite(v.lastVisitedAt)
  );
}

function isAllowedVerticalPath(path: string): boolean {
  return path.startsWith('/ai-for-') && KNOWN_VERTICAL_PATHS.has(path);
}

/**
 * Read every parse-safe, allow-list-validated entry currently in storage
 * WITHOUT the display-limit slice. Kept private per the 2026-09-10
 * raw-vs-sliced lesson: any future suggest or dossier surface reads the
 * raw list, and the display getter is derived from it.
 */
function readAllVerticals(): RecentVertical[] {
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
    .filter(isRecentVertical)
    .filter((entry) => isAllowedVerticalPath(entry.path));
}

/**
 * Read the recent-verticals list, parse-safe and path-validated. A
 * malformed stored value, a quota-exceeded environment, or an absent
 * storage backend all resolve to []. Entries whose path is no longer in
 * the vertical allow-list are filtered out at read time so a stale list
 * cannot render a dead link. Capped at MAX_RECENT_VERTICALS for the
 * dashboard display.
 */
export function getRecentVerticals(): RecentVertical[] {
  return readAllVerticals().slice(0, MAX_RECENT_VERTICALS);
}

/**
 * Record a vertical-page visit at the front of the list. A re-visit of an
 * already-stored path moves the entry to the front and updates
 * `lastVisitedAt` in place rather than duplicating it. A path not in the
 * vertical allow-list (or one that does not start with `/ai-for-`) is
 * rejected (no write). A storage failure is silently tolerated.
 */
export function recordVerticalVisit(path: string, label: string): void {
  if (!isAllowedVerticalPath(path)) return;
  if (typeof label !== 'string' || label.length === 0) return;

  try {
    const existing = readAllVerticals();
    const filtered = existing.filter((entry) => entry.path !== path);
    const next: RecentVertical[] = [
      { path, label, lastVisitedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT_VERTICALS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable or quota exceeded - non-fatal */
  }
}

/**
 * Drop every recorded vertical visit. Exported for a future "clear
 * history" UI surface; this ticket renders the card without a visible
 * clear control (mirroring the ticket 0074 / 0091 pattern of reserving
 * the clear function for a later general-clear UI ticket).
 */
export function clearRecentVerticals(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable - non-fatal */
  }
}

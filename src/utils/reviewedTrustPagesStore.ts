// Ticket 0104 - Persist the visitor's visited trust-family pages and
// surface them as a "Compliance you've reviewed" card on /my dashboard.
//
// Mirrors the parse-safe, allow-list-validated pattern of
// src/utils/recentVerticalsStore.ts (ticket 0100), the direct peer for
// a mount-effect-written retention store: every localStorage read/write
// is wrapped in try/catch, malformed values resolve to []/no-op, and a
// quota-exceeded write is silently tolerated. The store records path,
// label, and a timestamp only - all already public catalog metadata
// from src/data/trustPageLabels.ts, no PII - and stays in the existing
// dca_* localStorage namespace. The `dca_reviewed_trust_pages_v1` key
// is disclosed on /trust in the same PR per the ticket 0018 / 0033 /
// 0074 / 0091 / 0093 / 0100 honesty rule.
//
// The allow-list is `TRUST_ROUTES` from src/data/trustPageLabels.ts (a
// closed set of the eleven shipped trust-family routes). An entry
// whose path is not in the allow-list is dropped at write time and
// filtered at read time so a renamed trust page or a stray forged path
// can never render a dead reopen link.
//
// Per the 2026-09-10 raw-vs-sliced lesson the module keeps a private
// `readAllReviewed()` helper that returns the full validated list; the
// public `getReviewedTrustPages()` is `readAllReviewed().slice(0, MAX)`
// so any future dossier or suggest surface can read the raw list
// without the display cap. The cap is 6 (not 5 like the ticket 0100
// verticals store) per the ticket 0104 rationale: the trust family
// ships eleven artifacts vs the vertical family's ~18, but a compliance
// buyer typically reviews more distinct artifacts before onboarding, so
// the ticket documents the deliberate deviation.

import { TRUST_ROUTES } from '@/data/trustPageLabels';

export interface ReviewedTrustPage {
  path: string;
  label: string;
  lastVisitedAt: number;
}

const STORAGE_KEY = 'dca_reviewed_trust_pages_v1';
export const MAX_REVIEWED_TRUST_PAGES = 6;

// Every trust-family route in TRUST_ROUTES. Recording a visit to a
// path outside this set is a no-op so a stale or stray entry cannot
// produce a dead link. The 2026-05-25 mirror-source lesson applies:
// this set is the single allow-list both the store writer and the
// read-back validator consult, and it derives from
// src/data/trustPageLabels.ts so adding a new trust route widens the
// allow-list automatically.
const KNOWN_TRUST_PATHS: ReadonlySet<string> = new Set<string>(TRUST_ROUTES);

function isReviewedTrustPage(value: unknown): value is ReviewedTrustPage {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.path === 'string' &&
    typeof v.label === 'string' &&
    typeof v.lastVisitedAt === 'number' &&
    Number.isFinite(v.lastVisitedAt)
  );
}

function isAllowedTrustPath(path: string): boolean {
  return KNOWN_TRUST_PATHS.has(path);
}

/**
 * Read every parse-safe, allow-list-validated entry currently in
 * storage WITHOUT the display-limit slice. Kept private per the
 * 2026-09-10 raw-vs-sliced lesson: any future suggest or dossier
 * surface reads the raw list, and the display getter is derived from
 * it.
 */
function readAllReviewed(): ReviewedTrustPage[] {
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
    .filter(isReviewedTrustPage)
    .filter((entry) => isAllowedTrustPath(entry.path));
}

/**
 * Read the reviewed-trust-pages list, parse-safe and path-validated.
 * A malformed stored value, a quota-exceeded environment, or an
 * absent storage backend all resolve to []. Entries whose path is no
 * longer in the trust allow-list are filtered out at read time so a
 * stale list cannot render a dead link. Capped at
 * MAX_REVIEWED_TRUST_PAGES for the dashboard display.
 */
export function getReviewedTrustPages(): ReviewedTrustPage[] {
  return readAllReviewed().slice(0, MAX_REVIEWED_TRUST_PAGES);
}

/**
 * Record a trust-page visit at the front of the list. A re-visit of
 * an already-stored path moves the entry to the front and updates
 * `lastVisitedAt` in place rather than duplicating it. A path not in
 * the trust allow-list is rejected (no write). A storage failure is
 * silently tolerated.
 */
export function recordTrustPageVisit(path: string, label: string): void {
  if (!isAllowedTrustPath(path)) return;
  if (typeof label !== 'string' || label.length === 0) return;

  try {
    const existing = readAllReviewed();
    const filtered = existing.filter((entry) => entry.path !== path);
    const next: ReviewedTrustPage[] = [
      { path, label, lastVisitedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_REVIEWED_TRUST_PAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable or quota exceeded - non-fatal */
  }
}

/**
 * Drop every recorded trust-page visit. Exported for a future "clear
 * history" UI surface; this ticket renders the card without a visible
 * clear control (mirroring the ticket 0074 / 0091 / 0100 pattern of
 * reserving the clear function for a later general-clear UI ticket).
 */
export function clearReviewedTrustPages(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable - non-fatal */
  }
}

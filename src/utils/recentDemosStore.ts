// Ticket 0026 - Recently viewed demos recap strip on /demos.
//
// Client-side store of the visitor's recent demo visits, surfaced as a small
// recap strip at the top of the /demos hub so a returning visitor can re-enter
// the demo they liked without scrolling 12 verticals and 30+ demo cards.
//
// Mirrors the parse-safe pattern of src/pages/construction/lastEstimateStore.ts:
// every localStorage read/write is wrapped in try/catch, malformed values
// resolve to []/no-op, and a quota-exceeded write is silently tolerated. The
// store records path, title, vertical, and a timestamp only - all already public
// catalog metadata, no PII - and stays in the existing dca_* localStorage
// namespace already generically described on /trust (ticket 0018), so no new
// privacy disclosure is required.
//
// KNOWN_PATHS is a static set in this file. The e2e spec asserts every entry
// resolves to a real route under /demos so a renamed-or-removed demo cannot
// strand a dead recap link. Keep this list in sync with the DEMO_GROUPS
// catalog in src/pages/Demos.tsx whenever a demo is added or removed.

export interface RecentDemo {
  path: string;
  title: string;
  vertical: string;
  viewedAt: number;
}

const STORAGE_KEY = 'dca_recent_demos_v1';
const MAX_ENTRIES = 5;

// The union of every demo.path in src/pages/Demos.tsx DEMO_GROUPS. Recording
// a visit to a path outside this set is a no-op so a stale or stray entry
// cannot produce a dead link in the recap. The 2026-05-25 mirror-source
// lesson applies: this set is the single allow-list both the store writer
// and the read-back validator consult.
export const KNOWN_PATHS: ReadonlySet<string> = new Set<string>([
  // Construction
  '/construction/demo/lead-responder',
  '/construction/demo/estimate',
  '/construction/demo/invoice',
  '/construction/demo/sms-sequence',
  '/construction/demo/lead-scoring',
  '/construction/demo/reviews',
  '/construction/demo/property-negotiator',
  '/construction/demo/voice-negotiator',
  // Real Estate
  '/realestate/demo/lead-responder',
  '/realestate/demo/property-negotiator',
  '/realestate/demo/contract',
  '/realestate/demo/market-analysis',
  '/realestate/demo/voice-negotiator',
  // Events
  '/events/demo/inquiry',
  '/events/demo/proposal',
  '/events/demo/voice-booking',
  // Home Services
  '/homeservices/demo/lead-responder',
  '/homeservices/demo/estimate',
  '/homeservices/demo/voice-followup',
  // Healthcare
  '/healthcare/demo/intake',
  '/healthcare/demo/scheduler',
  '/healthcare/demo/voice-followup',
  // Legal
  '/legal/demo/intake',
  '/legal/demo/consultation',
  '/legal/demo/voice-followup',
  // Restaurant
  '/restaurant/demo/reservations',
  '/restaurant/demo/catering',
  '/restaurant/demo/reviews',
  // Kids Play
  '/kidsplay/demo/party-booker',
  '/kidsplay/demo/packages',
  '/kidsplay/demo/voice-booking',
  // Fitness
  '/fitness/demo/lead-qualifier',
  '/fitness/demo/membership',
  '/fitness/demo/voice-retention',
  // Dental
  '/dental/demo/intake',
  '/dental/demo/estimate',
  '/dental/demo/voice-recall',
  // Salon
  '/salon/demo/booking',
  '/salon/demo/services',
  '/salon/demo/voice-rebook',
  // Auto Repair
  '/autorepair/demo/advisor',
  '/autorepair/demo/estimate',
  '/autorepair/demo/voice-reminder',
]);

function isRecentDemo(value: unknown): value is RecentDemo {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.path === 'string' &&
    typeof v.title === 'string' &&
    typeof v.vertical === 'string' &&
    typeof v.viewedAt === 'number' &&
    Number.isFinite(v.viewedAt)
  );
}

/**
 * Read the recent-demos list, parse-safe and path-validated. A malformed
 * stored value, a quota-exceeded environment, or an absent storage backend
 * all resolve to []. Entries whose path is no longer in KNOWN_PATHS are
 * filtered out at read time so a stale list cannot render a dead link.
 */
export function getRecentDemos(): RecentDemo[] {
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
    .filter(isRecentDemo)
    .filter((entry) => KNOWN_PATHS.has(entry.path))
    .slice(0, MAX_ENTRIES);
}

/**
 * Record a demo visit at the front of the recap list. A re-visit of an
 * already-stored path moves the entry to the front rather than duplicating
 * it. A path not in KNOWN_PATHS is rejected (no write), so a removed demo
 * route cannot strand a dead link. A storage failure is silently tolerated.
 */
export function recordDemoVisit(path: string, title: string, vertical: string): void {
  if (!KNOWN_PATHS.has(path)) return;

  try {
    const existing = getRecentDemos();
    const filtered = existing.filter((entry) => entry.path !== path);
    const next: RecentDemo[] = [
      { path, title, vertical, viewedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable - non-fatal */
  }
}

/**
 * Drop every recorded recent demo. Exported for a future "clear history"
 * UI surface; this ticket renders the recap without a visible clear control.
 */
export function clearRecentDemos(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable - non-fatal */
  }
}

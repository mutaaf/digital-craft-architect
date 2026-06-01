// Ticket 0027 - "More like this" cross-vertical recommendations under each demo.
//
// Pure-function recommender that surfaces up to three sibling demos for a
// visitor sitting on a demo result page: first the same tool in other
// verticals (e.g. Lead Responder in Real Estate when the visitor is on the
// Construction Lead Responder), then the next unvisited demo in the same
// vertical, then a same-vertical fallback when no history exists. The output
// is deterministic and ordered so React renders stay stable across mounts.
//
// Per the 2026-05-25 mirror-source lesson, DEMO_CATALOG mirrors the catalog
// in src/pages/Demos.tsx DEMO_GROUPS 1:1 and is validated at module load
// against KNOWN_PATHS from src/utils/recentDemosStore.ts in both directions
// (catalog -> KNOWN_PATHS and KNOWN_PATHS -> catalog). A drift in either
// direction throws on module load so npm run dev / npm run typecheck loudly
// fails before a stale recommendation can ship.

import { KNOWN_PATHS, getRecentDemos } from './recentDemosStore';

export interface RelatedDemo {
  path: string;
  title: string;
  vertical: string;
  reason: 'same-tool' | 'same-vertical';
}

interface CatalogEntry {
  path: string;
  title: string;
  vertical: string;
}

// 1:1 mirror of DEMO_GROUPS in src/pages/Demos.tsx. The module-load
// assertion below guarantees this stays in sync with KNOWN_PATHS; a
// renamed or removed demo route will fail the dev gate immediately.
const DEMO_CATALOG: ReadonlyArray<CatalogEntry> = [
  // Construction
  { path: '/construction/demo/lead-responder', title: 'AI Lead Responder', vertical: 'Construction' },
  { path: '/construction/demo/estimate', title: 'Smart Estimate Generator', vertical: 'Construction' },
  { path: '/construction/demo/invoice', title: 'Invoice Generator', vertical: 'Construction' },
  { path: '/construction/demo/sms-sequence', title: 'SMS Follow-Up Sequence', vertical: 'Construction' },
  { path: '/construction/demo/lead-scoring', title: 'Lead Scoring', vertical: 'Construction' },
  { path: '/construction/demo/reviews', title: 'Review System', vertical: 'Construction' },
  { path: '/construction/demo/property-negotiator', title: 'Deal Analyzer', vertical: 'Construction' },
  { path: '/construction/demo/voice-negotiator', title: 'Voice Negotiator', vertical: 'Construction' },
  // Real Estate
  { path: '/realestate/demo/lead-responder', title: 'AI Lead Responder', vertical: 'Real Estate' },
  { path: '/realestate/demo/property-negotiator', title: 'Deal Analyzer', vertical: 'Real Estate' },
  { path: '/realestate/demo/contract', title: 'Contract Drafter', vertical: 'Real Estate' },
  { path: '/realestate/demo/market-analysis', title: 'Market Analyzer', vertical: 'Real Estate' },
  { path: '/realestate/demo/voice-negotiator', title: 'Voice Negotiator', vertical: 'Real Estate' },
  // Events
  { path: '/events/demo/inquiry', title: 'Inquiry Qualifier', vertical: 'Events' },
  { path: '/events/demo/proposal', title: 'Proposal Generator', vertical: 'Events' },
  { path: '/events/demo/voice-booking', title: 'Voice Booking Agent', vertical: 'Events' },
  // Home Services
  { path: '/homeservices/demo/lead-responder', title: 'AI Lead Responder', vertical: 'Home Services' },
  { path: '/homeservices/demo/estimate', title: 'Estimate Generator', vertical: 'Home Services' },
  { path: '/homeservices/demo/voice-followup', title: 'Voice Follow-Up', vertical: 'Home Services' },
  // Healthcare
  { path: '/healthcare/demo/intake', title: 'Patient Intake', vertical: 'Healthcare' },
  { path: '/healthcare/demo/scheduler', title: 'Scheduler', vertical: 'Healthcare' },
  { path: '/healthcare/demo/voice-followup', title: 'Voice Follow-Up', vertical: 'Healthcare' },
  // Legal
  { path: '/legal/demo/intake', title: 'Client Intake', vertical: 'Legal' },
  { path: '/legal/demo/consultation', title: 'Consultation Scheduler', vertical: 'Legal' },
  { path: '/legal/demo/voice-followup', title: 'Voice Follow-Up', vertical: 'Legal' },
  // Restaurant
  { path: '/restaurant/demo/reservations', title: 'Reservations Assistant', vertical: 'Restaurant' },
  { path: '/restaurant/demo/catering', title: 'Catering Estimator', vertical: 'Restaurant' },
  { path: '/restaurant/demo/reviews', title: 'Review System', vertical: 'Restaurant' },
  // Kids Play
  { path: '/kidsplay/demo/party-booker', title: 'Party Booker', vertical: 'Kids Play' },
  { path: '/kidsplay/demo/packages', title: 'Package Estimator', vertical: 'Kids Play' },
  { path: '/kidsplay/demo/voice-booking', title: 'Voice Booking Agent', vertical: 'Kids Play' },
  // Fitness
  { path: '/fitness/demo/lead-qualifier', title: 'Lead Qualifier', vertical: 'Fitness' },
  { path: '/fitness/demo/membership', title: 'Membership Estimator', vertical: 'Fitness' },
  { path: '/fitness/demo/voice-retention', title: 'Voice Retention', vertical: 'Fitness' },
  // Dental
  { path: '/dental/demo/intake', title: 'Patient Intake', vertical: 'Dental' },
  { path: '/dental/demo/estimate', title: 'Treatment Estimator', vertical: 'Dental' },
  { path: '/dental/demo/voice-recall', title: 'Voice Recall', vertical: 'Dental' },
  // Salon
  { path: '/salon/demo/booking', title: 'Booking Assistant', vertical: 'Salon' },
  { path: '/salon/demo/services', title: 'Service Estimator', vertical: 'Salon' },
  { path: '/salon/demo/voice-rebook', title: 'Voice Rebook', vertical: 'Salon' },
  // Auto Repair
  { path: '/autorepair/demo/advisor', title: 'Service Advisor', vertical: 'Auto Repair' },
  { path: '/autorepair/demo/estimate', title: 'Repair Estimator', vertical: 'Auto Repair' },
  { path: '/autorepair/demo/voice-reminder', title: 'Voice Reminder', vertical: 'Auto Repair' },
];

// Module-load assertion: every catalog path is in KNOWN_PATHS and every
// KNOWN_PATHS entry has a catalog row. Throws a clear dev-time error if
// either set drifts, so the next DEMO_GROUPS edit cannot silently produce
// a dead recommendation link.
(function assertCatalogMirrorsKnownPaths(): void {
  const catalogPaths = new Set(DEMO_CATALOG.map((d) => d.path));
  for (const entry of DEMO_CATALOG) {
    if (!KNOWN_PATHS.has(entry.path)) {
      throw new Error(
        `[relatedDemos] DEMO_CATALOG path "${entry.path}" is not in KNOWN_PATHS; update src/utils/recentDemosStore.ts or remove the catalog row.`,
      );
    }
  }
  for (const known of KNOWN_PATHS) {
    if (!catalogPaths.has(known)) {
      throw new Error(
        `[relatedDemos] KNOWN_PATHS contains "${known}" but DEMO_CATALOG has no matching row; mirror the new entry in src/utils/relatedDemos.ts.`,
      );
    }
  }
})();

const DEFAULT_LIMIT = 3;

/**
 * Return up to `limit` recommended demos for a visitor on `currentPath`.
 *
 * Ranking (stable, ties broken by DEMO_CATALOG order):
 *   1. Same-tool siblings: a demo whose `title` exactly matches the
 *      current demo's title in a DIFFERENT vertical.
 *   2. Same-vertical, not-yet-visited: any other demo in the current
 *      demo's vertical whose path is NOT in `getRecentDemos()`.
 *   3. Same-vertical fallback: any other demo in the current vertical
 *      (used when history is empty so the strip never empty-states).
 *
 * Never returns `currentPath`. An unknown `currentPath` returns []. The
 * function is deterministic: same input -> same output, no Date.now(),
 * no Math.random(), no side effects.
 */
export function getRelatedDemos(currentPath: string, limit: number = DEFAULT_LIMIT): RelatedDemo[] {
  const current = DEMO_CATALOG.find((d) => d.path === currentPath);
  if (!current) return [];
  if (limit <= 0) return [];

  // Snapshot recent visits once so the function stays pure for the call.
  // getRecentDemos already parse-safes a malformed store to [], so this is
  // safe to call in SSR-free browser contexts; in a non-browser context
  // localStorage is absent and getRecentDemos returns []. Either way the
  // recommender degrades to the no-history ranking.
  const visitedPaths = new Set<string>();
  try {
    for (const entry of getRecentDemos()) visitedPaths.add(entry.path);
  } catch {
    /* non-fatal - treat as empty history */
  }

  const out: RelatedDemo[] = [];
  const seen = new Set<string>([currentPath]);

  // Tier 1: same tool, different vertical.
  for (const entry of DEMO_CATALOG) {
    if (out.length >= limit) break;
    if (seen.has(entry.path)) continue;
    if (entry.title === current.title && entry.vertical !== current.vertical) {
      out.push({ ...entry, reason: 'same-tool' });
      seen.add(entry.path);
    }
  }

  // Tier 2: same vertical, not yet visited.
  for (const entry of DEMO_CATALOG) {
    if (out.length >= limit) break;
    if (seen.has(entry.path)) continue;
    if (entry.vertical !== current.vertical) continue;
    if (visitedPaths.has(entry.path)) continue;
    out.push({ ...entry, reason: 'same-vertical' });
    seen.add(entry.path);
  }

  // Tier 3: same vertical fallback (admits already-visited rows so the
  // strip stays full when history covers the whole vertical).
  for (const entry of DEMO_CATALOG) {
    if (out.length >= limit) break;
    if (seen.has(entry.path)) continue;
    if (entry.vertical !== current.vertical) continue;
    out.push({ ...entry, reason: 'same-vertical' });
    seen.add(entry.path);
  }

  return out;
}

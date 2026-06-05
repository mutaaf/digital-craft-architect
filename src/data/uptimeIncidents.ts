// Ticket 0036 - hand-curated, append-only incident log rendered by /uptime.
//
// HUMAN EDITING WORKFLOW
// ----------------------
// 1. After a real degradation, open a post-mortem PR that appends a new
//    Incident object to INCIDENTS below. Use ISO-8601 timestamps in UTC.
// 2. Use the smallest accurate `severity` (minor / major / critical) and a
//    plain-language `summary` of one to three sentences. No marketing copy,
//    no blame language, no em-dash characters (brand-voice Hard NO).
// 3. Set `endedAt` to null while the incident is ongoing; flip it to the
//    UTC timestamp the surface returned to normal once resolved.
// 4. The `surfaceId` MUST match an entry in UPTIME_SURFACES; the module-load
//    assertion below throws on drift so a renamed surface cannot strand a
//    dead reference. Run `node scripts/check-backlog.mjs && npm run typecheck`
//    before pushing.

import { UPTIME_SURFACES } from './uptimeSurfaces';

export type IncidentSeverity = 'minor' | 'major' | 'critical';

export interface Incident {
  id: string;
  surfaceId: string;
  startedAt: string;
  endedAt: string | null;
  severity: IncidentSeverity;
  summary: string;
}

export const INCIDENTS: readonly Incident[] = [] as const;

// Module-load assertion: every incident's surfaceId resolves to a real entry
// in UPTIME_SURFACES. A renamed or removed surface should be caught here
// rather than rendering a chip with no parent on the /uptime page.
const KNOWN_SURFACE_IDS = new Set(UPTIME_SURFACES.map((s) => s.id));
for (const incident of INCIDENTS) {
  if (!KNOWN_SURFACE_IDS.has(incident.surfaceId)) {
    throw new Error(
      `[uptimeIncidents] incident "${incident.id}" references unknown surfaceId "${incident.surfaceId}"`,
    );
  }
}

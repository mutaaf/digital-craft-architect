import { useEffect, useState } from 'react';
import type { UptimeStatus, UptimeSurface } from '@/data/uptimeSurfaces';

// Ticket 0036 - ephemeral probe hook for /uptime. Fires one fetch per surface
// in parallel with a 3s AbortController timeout, classifies the response, and
// returns a Record<surfaceId, UptimeStatus>. NEVER persists to any storage
// backend (sessionStorage, localStorage, cookies); the probe is intentionally
// volatile so a visitor sees the live state on every page open.
//
// Classification rubric (from the ticket acceptance criteria):
//   - 2xx response                            -> 'green'
//   - 4xx response (route exists, method or  -> 'green' ("got a response at
//     auth wrong but the surface is up)         all" counts as reachable)
//   - 5xx response with no error body         -> 'yellow'
//   - network error / abort / timeout / CORS  -> 'red'
//   - probe not yet completed                 -> 'unknown'

const PROBE_TIMEOUT_MS = 3000;
const REPROBE_INTERVAL_MS = 60_000;

function classifyStatus(httpStatus: number): UptimeStatus {
  if (httpStatus >= 200 && httpStatus < 500) return 'green';
  if (httpStatus >= 500) return 'yellow';
  return 'red';
}

async function probeOne(surface: UptimeSurface): Promise<UptimeStatus> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const response = await fetch(surface.probePath, {
      method: surface.method,
      signal: controller.signal,
      // No credentials, no cache - the probe must never piggy-back auth or
      // accidentally invoke an upstream provider via a hot cache entry.
      credentials: 'omit',
      cache: 'no-store',
    });
    return classifyStatus(response.status);
  } catch {
    return 'red';
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function useUptimeProbe(
  surfaces: readonly UptimeSurface[],
): Record<string, UptimeStatus> {
  const [statuses, setStatuses] = useState<Record<string, UptimeStatus>>(() => {
    const initial: Record<string, UptimeStatus> = {};
    for (const s of surfaces) initial[s.id] = 'unknown';
    return initial;
  });

  useEffect(() => {
    let cancelled = false;

    const runAll = async () => {
      const results = await Promise.allSettled(surfaces.map((s) => probeOne(s)));
      if (cancelled) return;
      const next: Record<string, UptimeStatus> = {};
      surfaces.forEach((s, i) => {
        const r = results[i];
        next[s.id] = r.status === 'fulfilled' ? r.value : 'red';
      });
      setStatuses(next);
    };

    runAll();
    const intervalId = window.setInterval(runAll, REPROBE_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [surfaces]);

  return statuses;
}

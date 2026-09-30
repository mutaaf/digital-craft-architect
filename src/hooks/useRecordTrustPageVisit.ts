// Ticket 0104 - Shared "record this trust-page visit" hook.
//
// Each of the eleven shipped trust-family page components calls
// `useRecordTrustPageVisit({ path, label })` once at the top of the
// component body. The hook fires exactly one `recordTrustPageVisit`
// write on mount via `useEffect(..., [])` so a re-render never
// re-writes the entry mid-view.
//
// Per the 2026-09-10 mount-signal lesson the hook does NOT rely on
// any router-side signal (react-router `useLocation`, an outer route
// wrapper, or a URL-derived hash). The caller passes the literal
// path and label constants so a lazy chunk mount is the only signal
// the effect ever depends on. The label is imported by the caller
// from `src/data/trustPageLabels.ts` per the 2026-05-25 mirror-source
// rule.
//
// Every string is hyphen-only per the 2026-05-07 em-dash Hard NO.

import { useEffect } from 'react';
import { recordTrustPageVisit } from '@/utils/reviewedTrustPagesStore';

export interface UseRecordTrustPageVisitArgs {
  path: string;
  label: string;
}

export function useRecordTrustPageVisit({ path, label }: UseRecordTrustPageVisitArgs): void {
  useEffect(() => {
    try {
      recordTrustPageVisit(path, label);
    } catch {
      /* store guard already swallows storage errors; this catch is belt-and-suspenders */
    }
    // Intentionally empty deps: the path/label pair is a module-level
    // constant per call site, so we only ever want one write per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

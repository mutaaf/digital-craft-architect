// Ticket 0100 - Shared "record this vertical visit" hook.
//
// Each of the 17 shipped `/ai-for-<vertical>` landing pages plus the
// `/ai-for-hospitality` hub calls `useRecordVerticalVisit({ path, label })`
// once at the top of the component body. The hook fires exactly one
// `recordVerticalVisit` write on mount via `useEffect(..., [])` so a
// re-render never re-writes the entry mid-view.
//
// Per the 2026-09-10 mount-signal lesson the hook does NOT rely on any
// router-side signal (react-router `useLocation`, an outer route wrapper,
// or a URL-derived hash). The caller passes the literal path and label
// constants so a lazy chunk mount is the only signal the effect ever
// depends on. The label is imported by the caller from
// `src/data/verticalLabels.ts` per the 2026-05-25 mirror-source rule.
//
// Every string is hyphen-only per the 2026-05-07 em-dash Hard NO.

import { useEffect } from 'react';
import { recordVerticalVisit } from '@/utils/recentVerticalsStore';

export interface UseRecordVerticalVisitArgs {
  path: string;
  label: string;
}

export function useRecordVerticalVisit({ path, label }: UseRecordVerticalVisitArgs): void {
  useEffect(() => {
    try {
      recordVerticalVisit(path, label);
    } catch {
      /* store guard already swallows storage errors; this catch is a belt-and-suspenders */
    }
    // Intentionally empty deps: the path/label pair is a module-level
    // constant per call site, so we only ever want one write per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

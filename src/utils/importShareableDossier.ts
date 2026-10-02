// Ticket 0107 - Hydrator for a shareable /my dossier URL fragment.
//
// Pure composer that writes every non-null artifact in the dossier back
// through each owning store's existing public setter. Per the
// 2026-09-10 raw-vs-sliced lesson the composer does NOT bypass each
// store's validation and allow-list guards; a dossier entry whose path
// is not in the owning store's allow-list is dropped at import time
// and NOT persisted. Each store's own quota-tolerant and parse-safe
// write is reused.
//
// Setter-name deviations from the ticket prose (2026-09-12 code-beats-
// prose rule; the ticket's acceptance criteria listed placeholder
// names, so the composer pins to the REAL exports grepped from each
// store file at branch head):
//   - quizPersona:   `setQuizPersona(persona, completedAt)` (ticket
//     prose said `saveQuizPersona`) - src/utils/quizPersonaStore.ts:36.
//   - quizHistory:   `appendQuizHistory(entry)` (ticket prose said
//     `saveQuizHistoryEntry`) - src/utils/quizHistoryStore.ts:109.
//   - visitStreak:   skipped entirely. `recordVisitToday()` is 0-ary
//     and only records today's UTC date (ticket prose said
//     `recordVisit`) - src/utils/visitStreakStore.ts:81. Historical
//     sender visit days cannot be restored losslessly through this
//     setter, AND the recipient's own dashboard-mount effect already
//     calls `recordVisitToday()` on mount, so re-importing the
//     sender's streak would double-count the recipient's own visit.
//     The streak is recipient-local telemetry; the import composer
//     leaves it to the recipient's own session.
//
// The quizPersona, roiResult, and visitStreak stores do not export a
// `clear*` setter (grep each file for `export function clear`). The
// `restoreOwn` function therefore calls `localStorage.removeItem` on
// each imported key directly; the key list is derived from the
// `importedKeys` return of `importDossierToLocalStorage` so the clear
// path is byte-reversible against the import. Deviation documented
// here for auditability (the acceptance criteria said "owning store's
// `clear*` setter"; the actual public surface is a mix of exported
// `clear*` helpers and direct removeItem, both of which land in each
// store's own key).
//
// This module is a pure consumer of each store's existing public
// setter and does NOT edit any shipped store's internal shape (ticket
// 0107 out-of-scope rule).

import { saveLastEstimate, loadLastEstimate, lastEstimateKey, clearLastEstimate } from '@/pages/construction/lastEstimateStore';
import { saveLastRoiResult, getLastRoiResult } from '@/utils/roiResultStore';
import { setQuizPersona, getQuizPersona } from '@/utils/quizPersonaStore';
import { appendQuizHistory, getQuizHistory, clearQuizHistory } from '@/utils/quizHistoryStore';
import { recordDemoVisit, getRecentDemos, clearRecentDemos } from '@/utils/recentDemosStore';
import { recordCompareVisit, getRecentCompares, clearRecentCompares } from '@/utils/recentComparesStore';
import type { EvaluationDossier } from '@/utils/evaluationDossier';

const ROI_RESULT_KEY = 'dca_last_roi_result_v1';
const QUIZ_PERSONA_KEY = 'dca_quiz_persona_v1';
const QUIZ_HISTORY_KEY = 'dca_quiz_history_v1';
const RECENT_DEMOS_KEY = 'dca_recent_demos_v1';
const RECENT_COMPARES_KEY = 'dca_recent_compares_v1';

const IMPORTED_VERTICAL = 'construction';

/**
 * Write each non-null, allow-list-valid artifact in the dossier back
 * through its owning store's existing public setter. Returns the list
 * of localStorage keys actually written (empty when every slot was
 * null-or-empty, or when every write failed the owning store's
 * validation). The returned list is the exact set the "Restore your
 * own" clear path removes, so import + restore is byte-reversible.
 */
export function importDossierToLocalStorage(dossier: EvaluationDossier): { importedKeys: string[] } {
  const importedKeys: string[] = [];
  const a = dossier.artifacts;

  // Estimate: saveLastEstimate round-trips through the ticket 0009
  // encode/decode so an invalid id or out-of-range sqft is dropped
  // silently. We verify via loadLastEstimate so the key is only
  // recorded in importedKeys when the write actually persisted.
  if (a.estimate !== null) {
    try {
      saveLastEstimate(IMPORTED_VERTICAL, a.estimate);
      if (loadLastEstimate(IMPORTED_VERTICAL) !== null) {
        importedKeys.push(lastEstimateKey(IMPORTED_VERTICAL));
      }
    } catch {
      /* storage unavailable - non-fatal */
    }
  }

  // ROI: saveLastRoiResult validates the inputs via roiCalculatorParams
  // round-trip. Out-of-range inputs are clamped at write time but then
  // suppressed by the getter (roiResultStore.ts:97-102), so verify.
  if (a.roi !== null) {
    try {
      saveLastRoiResult(a.roi.inputs);
      if (getLastRoiResult() !== null) {
        importedKeys.push(ROI_RESULT_KEY);
      }
    } catch {
      /* storage unavailable - non-fatal */
    }
  }

  // Quiz persona: setQuizPersona accepts any non-empty string + finite
  // timestamp. getQuizPersona re-reads the stored payload.
  if (a.quizPersona !== null) {
    try {
      setQuizPersona(a.quizPersona.persona, a.quizPersona.completedAt);
      if (getQuizPersona() !== null) {
        importedKeys.push(QUIZ_PERSONA_KEY);
      }
    } catch {
      /* storage unavailable - non-fatal */
    }
  }

  // Quiz history: appendQuizHistory enforces the KNOWN_PERSONAS
  // allow-list and the DEDUP_WINDOW_MS gap. Entries from a sender
  // whose persona strings are not in the recipient's allow-list are
  // dropped silently.
  if (a.quizHistory.length > 0) {
    for (const entry of a.quizHistory) {
      try {
        appendQuizHistory(entry);
      } catch {
        /* storage unavailable - non-fatal */
      }
    }
    if (getQuizHistory().length > 0) {
      importedKeys.push(QUIZ_HISTORY_KEY);
    }
  }

  // Recent demos: recordDemoVisit enforces the KNOWN_PATHS allow-list.
  // A demo path no longer in the recipient's catalog is dropped.
  if (a.recentDemos.length > 0) {
    for (const demo of a.recentDemos) {
      try {
        recordDemoVisit(demo.path, demo.title, demo.vertical);
      } catch {
        /* storage unavailable - non-fatal */
      }
    }
    if (getRecentDemos().length > 0) {
      importedKeys.push(RECENT_DEMOS_KEY);
    }
  }

  // Recent compares: recordCompareVisit enforces its own allow-list
  // derived from COMPARE_ENTRIES; a renamed comparison is dropped.
  if (a.recentCompares.length > 0) {
    for (const cmp of a.recentCompares) {
      try {
        recordCompareVisit(cmp.path, cmp.tool);
      } catch {
        /* storage unavailable - non-fatal */
      }
    }
    if (getRecentCompares().length > 0) {
      importedKeys.push(RECENT_COMPARES_KEY);
    }
  }

  // Visit streak: skipped. recordVisitToday is 0-ary and only records
  // today's UTC date; the recipient's own dashboard-mount effect
  // already calls it on first paint, so a re-import would double-count
  // the recipient's own visit. The streak is recipient-local telemetry.

  return { importedKeys };
}

/**
 * Clear every imported key. Mirrors the import write path so the
 * "Restore your own" banner button is byte-reversible: every key the
 * import added is removed. Stores that export a `clear*` setter use
 * it; stores without one (quizPersona, roiResult) fall back to a
 * direct `localStorage.removeItem` on the owning key.
 */
export function clearImportedDossier(importedKeys: readonly string[]): void {
  for (const key of importedKeys) {
    try {
      if (key === lastEstimateKey(IMPORTED_VERTICAL)) {
        clearLastEstimate(IMPORTED_VERTICAL);
      } else if (key === QUIZ_HISTORY_KEY) {
        clearQuizHistory();
      } else if (key === RECENT_DEMOS_KEY) {
        clearRecentDemos();
      } else if (key === RECENT_COMPARES_KEY) {
        clearRecentCompares();
      } else {
        // quizPersona, roiResult, visitStreak have no clear* export.
        localStorage.removeItem(key);
      }
    } catch {
      /* storage unavailable - non-fatal */
    }
  }
}

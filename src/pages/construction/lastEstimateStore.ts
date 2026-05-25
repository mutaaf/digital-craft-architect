// Ticket 0014 - Persist and re-offer the visitor's last completed estimate.
//
// Browser-local persistence of the single most recent completed estimate per
// vertical. The stored bundle is exactly the 0009 EstimateShareState shape
// ({ selectedTypeId, sqft, selectedFinishId, selectedExtraIds }); reading it back
// reuses the 0009 encode/decode helper so validation against the pricing source of
// truth (PROJECT_TYPES / FINISH_LEVELS / EXTRAS) is shared, not duplicated. A
// stored estimate whose ids no longer exist is treated as absent (parse-safe).
//
// Client-side only: localStorage, no network, no new hostnames, no PII beyond the
// inputs the visitor already typed into the wizard. All access is guarded so
// storage being unavailable (private mode, quota) is non-fatal, matching
// DemoContext's pattern.

import type { Vertical } from '@/contexts/DemoContext';
import {
  decodeEstimateParams,
  encodeEstimateParams,
  type EstimateShareState,
} from './estimateShareParams';

// Versioned, vertical-scoped key. The generator is reused across verticals via the
// route table, so each vertical keeps its own most-recent estimate.
export function lastEstimateKey(vertical: Vertical): string {
  return `dca_last_estimate_v1_${vertical}`;
}

// Session-scoped dismissal flag, following the existing dca_*_dismissed convention.
export function lastEstimateDismissKey(vertical: Vertical): string {
  return `dca_last_estimate_dismissed_${vertical}`;
}

/**
 * Persist the completed estimate inputs for a vertical. Round-trips the bundle
 * through the 0009 encode helper so we store only the validated, canonical fields
 * and nothing else.
 */
export function saveLastEstimate(vertical: Vertical, state: EstimateShareState): void {
  try {
    const params = encodeEstimateParams(state);
    const validated = decodeEstimateParams(params);
    if (!validated) return; // never persist an invalid estimate
    localStorage.setItem(lastEstimateKey(vertical), JSON.stringify(validated));
  } catch {
    /* storage unavailable - non-fatal */
  }
}

/**
 * Read back the stored estimate for a vertical, parse-safe. Returns a fully
 * validated EstimateShareState only when the stored ids still exist in the pricing
 * source of truth; anything malformed, stale, or out of range returns null so the
 * caller falls back to the normal wizard. Validation is delegated to the 0009
 * decode helper by re-encoding the stored object into URLSearchParams.
 */
export function loadLastEstimate(vertical: Vertical): EstimateShareState | null {
  let parsed: unknown;
  try {
    const raw = localStorage.getItem(lastEstimateKey(vertical));
    if (!raw) return null;
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;
  const obj = parsed as Record<string, unknown>;
  const typeId = obj.selectedTypeId;
  const finishId = obj.selectedFinishId;
  const sqft = obj.sqft;
  const extraIds = obj.selectedExtraIds;
  if (typeof typeId !== 'string' || typeof finishId !== 'string') return null;
  if (typeof sqft !== 'number' || !Number.isFinite(sqft)) return null;

  const candidate: EstimateShareState = {
    selectedTypeId: typeId,
    sqft,
    selectedFinishId: finishId,
    selectedExtraIds: Array.isArray(extraIds)
      ? extraIds.filter((id): id is string => typeof id === 'string')
      : [],
  };

  // Reuse the 0009 parse-safe validation against PROJECT_TYPES/FINISH_LEVELS/EXTRAS.
  return decodeEstimateParams(encodeEstimateParams(candidate));
}

/** Clear the stored estimate for a vertical (used by "Start a new estimate"). */
export function clearLastEstimate(vertical: Vertical): void {
  try {
    localStorage.removeItem(lastEstimateKey(vertical));
  } catch {
    /* storage unavailable - non-fatal */
  }
}

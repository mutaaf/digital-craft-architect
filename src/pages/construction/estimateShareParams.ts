// Ticket 0009 - Shareable branded estimate result link.
//
// Typed, parse-safe encode/decode between the estimate wizard state and the URL
// query string. Decoding is validated against the pricing source of truth
// (PROJECT_TYPES / FINISH_LEVELS / EXTRAS) so a malformed, absent, or
// out-of-range link falls back to the wizard rather than rendering a broken
// card. Client-side only: no network, no new hostnames, same route.

import {
  PROJECT_TYPES,
  FINISH_LEVELS,
  EXTRAS,
} from '@/data/estimatePricing';

export interface EstimateShareState {
  selectedTypeId: string;
  sqft: number;
  selectedFinishId: string;
  selectedExtraIds: string[];
}

// Query param keys, kept short and stable so links stay tidy.
const PARAM = {
  type: 'pt',
  sqft: 'sqft',
  finish: 'fin',
  extras: 'extras',
} as const;

/**
 * Serialize wizard state into URLSearchParams. Extras are joined by comma in a
 * stable, validated order (the EXTRAS catalog order) so identical selections
 * always produce identical links.
 */
export function encodeEstimateParams(state: EstimateShareState): URLSearchParams {
  const params = new URLSearchParams();
  params.set(PARAM.type, state.selectedTypeId);
  params.set(PARAM.sqft, String(state.sqft));
  params.set(PARAM.finish, state.selectedFinishId);
  const selected = new Set(state.selectedExtraIds);
  const orderedExtras = EXTRAS.filter((e) => selected.has(e.id)).map((e) => e.id);
  if (orderedExtras.length > 0) {
    params.set(PARAM.extras, orderedExtras.join(','));
  }
  return params;
}

/**
 * Parse-safe decode. Returns a fully-validated EstimateShareState only when the
 * URL carries a known project type, an in-range sqft, and a known finish level.
 * Unknown extras are dropped silently (still a valid estimate). Any other
 * problem returns null so the caller can fall back to the wizard.
 */
export function decodeEstimateParams(
  params: URLSearchParams
): EstimateShareState | null {
  const typeId = params.get(PARAM.type);
  const projectType = PROJECT_TYPES.find((t) => t.id === typeId);
  if (!projectType) return null;

  const rawSqft = params.get(PARAM.sqft);
  if (rawSqft === null || rawSqft.trim() === '') return null;
  const sqft = Number(rawSqft);
  if (!Number.isFinite(sqft) || !Number.isInteger(sqft)) return null;
  if (sqft < projectType.minSqft || sqft > projectType.maxSqft) return null;

  const finishId = params.get(PARAM.finish);
  const finish = FINISH_LEVELS.find((f) => f.id === finishId);
  if (!finish) return null;

  const rawExtras = params.get(PARAM.extras);
  const requested = rawExtras
    ? rawExtras.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const validIds = new Set(EXTRAS.map((e) => e.id));
  const selectedExtraIds = EXTRAS.filter(
    (e) => requested.includes(e.id) && validIds.has(e.id)
  ).map((e) => e.id);

  return {
    selectedTypeId: projectType.id,
    sqft,
    selectedFinishId: finish.id,
    selectedExtraIds,
  };
}

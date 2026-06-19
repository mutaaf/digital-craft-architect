// Ticket 0062 - Persist the visitor's last ROI calculator result and surface
// it as a saved card on /my dashboard.
//
// Client-side store of the most recent ROI calculator submission, mirroring
// the parse-safe pattern of src/utils/quizPersonaStore.ts and the
// delegated-validation pattern of src/pages/construction/lastEstimateStore.ts
// (ticket 0014): every localStorage read/write is wrapped in try/catch, a
// malformed stored value resolves to null, and validation is delegated to
// the existing encode/decode round-trip in roiCalculatorParams.ts so a
// future BOUNDS change flows through automatically without a store edit.
//
// The stored payload is { inputs, savedAt }. Outputs are recomputed on
// read via the existing computeRoi helper so a future formula tweak in
// roiCalculatorParams.ts does not strand stored data with a stale figure.

import {
  computeRoi,
  decodeRoiParams,
  encodeRoiParams,
  type RoiInputs,
  type RoiOutputs,
} from '@/pages/roiCalculatorParams';

const STORAGE_KEY = 'dca_last_roi_result_v1';

interface StoredPayload {
  inputs: RoiInputs;
  savedAt: number;
}

function isStoredPayload(value: unknown): value is StoredPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.savedAt !== 'number' || !Number.isFinite(v.savedAt)) return false;
  if (typeof v.inputs !== 'object' || v.inputs === null) return false;
  const i = v.inputs as Record<string, unknown>;
  return (
    typeof i.leads === 'number' &&
    typeof i.minutes === 'number' &&
    typeof i.hourly === 'number' &&
    typeof i.afterhours === 'number'
  );
}

function inputsEqual(a: RoiInputs, b: RoiInputs): boolean {
  return (
    a.leads === b.leads &&
    a.minutes === b.minutes &&
    a.hourly === b.hourly &&
    a.afterhours === b.afterhours
  );
}

/**
 * Persist the visitor's most recent ROI calculator inputs. The inputs are
 * round-tripped through encodeRoiParams / decodeRoiParams so an out-of-range
 * value can never poison the store; the encoded-then-decoded bundle is what
 * gets written. Storage failures (quota, private mode, missing backend) are
 * silent.
 */
export function saveLastRoiResult(inputs: RoiInputs): void {
  try {
    const validated = decodeRoiParams(encodeRoiParams(inputs));
    const payload: StoredPayload = { inputs: validated, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable - non-fatal */
  }
}

/**
 * Read the stored ROI bundle, recompute outputs via computeRoi, and return
 * the full triple. A malformed stored value, a quota-exceeded environment,
 * or an absent storage backend all resolve to null. The stored inputs are
 * re-validated via the same round-trip on read so a future BOUNDS tightening
 * in roiCalculatorParams.ts retroactively rejects stale stored values.
 */
export function getLastRoiResult():
  | { inputs: RoiInputs; outputs: RoiOutputs; savedAt: number }
  | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; /* storage unavailable - non-fatal */
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isStoredPayload(parsed)) return null;

  const revalidated = decodeRoiParams(encodeRoiParams(parsed.inputs));
  // If the stored inputs do not round-trip byte-identically (an
  // out-of-range field was clamped), suppress the card so the visitor never
  // sees a number that diverges from what they typed.
  if (!inputsEqual(revalidated, parsed.inputs)) return null;

  return {
    inputs: revalidated,
    outputs: computeRoi(revalidated),
    savedAt: parsed.savedAt,
  };
}

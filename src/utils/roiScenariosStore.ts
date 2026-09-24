// Ticket 0093 - Persist named ROI calculator scenarios ("Saved ROI scenarios"
// card on /my). Parse-safe + allow-list-validated shape mirrors ticket 0074
// recentComparesStore.ts; inputs allow-list is delegated to the shipped
// decodeRoiParams(encodeRoiParams(inputs)) round-trip in roiCalculatorParams.ts
// (2026-05-25 mirror-source rule) so BOUNDS changes flow through without a
// store edit. Per the 2026-09-10 raw-vs-sliced lesson, readAllScenarios()
// returns the full validated list; getRoiScenarios() slices for display.

import {
  decodeRoiParams,
  encodeRoiParams,
  type RoiInputs,
} from '@/pages/roiCalculatorParams';

const STORAGE_KEY = 'dca_roi_scenarios_v1';
const MAX_SCENARIOS = 5;
const MAX_NAME_LENGTH = 40;

export interface RoiScenario {
  id: string;
  name: string;
  inputs: RoiInputs;
  savedAt: number;
}

/** Deterministic kebab-case ASCII-safe slug derived from a display name. */
export function scenarioSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inputsEqual(a: RoiInputs, b: RoiInputs): boolean {
  return (
    a.leads === b.leads &&
    a.minutes === b.minutes &&
    a.hourly === b.hourly &&
    a.afterhours === b.afterhours
  );
}

function isRoiInputsShape(value: unknown): value is RoiInputs {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.leads === 'number' &&
    typeof v.minutes === 'number' &&
    typeof v.hourly === 'number' &&
    typeof v.afterhours === 'number'
  );
}

function isRoiScenario(value: unknown): value is RoiScenario {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.savedAt === 'number' &&
    Number.isFinite(v.savedAt) &&
    isRoiInputsShape(v.inputs)
  );
}

/** Parse-safe + round-trip-validated read WITHOUT the display slice. */
function readAllScenarios(): RoiScenario[] {
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
    .filter(isRoiScenario)
    .filter((entry) => {
      const revalidated = decodeRoiParams(encodeRoiParams(entry.inputs));
      return inputsEqual(revalidated, entry.inputs);
    });
}

/** Public dashboard getter capped at MAX_SCENARIOS (most-recent save first). */
export function getRoiScenarios(): RoiScenario[] {
  return readAllScenarios().slice(0, MAX_SCENARIOS);
}

export interface SaveRoiScenarioResult {
  status: 'saved' | 'invalid-name' | 'invalid-inputs';
  /** The stored scenario record when status === 'saved'. */
  scenario?: RoiScenario;
  /** The scenario that was pushed off the tail to make room for a NEW save
   *  (undefined when the save was a dedup update or when the store had
   *  fewer than MAX_SCENARIOS entries before the save). */
  evicted?: RoiScenario;
  /** True when the save updated an existing entry in place (matched by the
   *  case-insensitive slug) rather than creating a new one. */
  wasDedup?: boolean;
}

/** Persist a named scenario. Trims name; rejects empty / > MAX_NAME_LENGTH;
 *  delegates input validation to the shipped round-trip; dedups by slug
 *  (case-insensitive), FIFO-evicts the oldest on the sixth NEW save. */
export function saveRoiScenario(
  name: string,
  inputs: RoiInputs,
): SaveRoiScenarioResult {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) {
    return { status: 'invalid-name' };
  }
  const validated = decodeRoiParams(encodeRoiParams(inputs));
  if (!inputsEqual(validated, inputs)) {
    return { status: 'invalid-inputs' };
  }

  const id = scenarioSlug(trimmed);
  if (id.length === 0) return { status: 'invalid-name' };

  const existing = readAllScenarios();
  const filtered = existing.filter((entry) => entry.id !== id);
  const wasDedup = filtered.length !== existing.length;

  const scenario: RoiScenario = {
    id,
    name: trimmed,
    inputs: validated,
    savedAt: Date.now(),
  };
  const combined = [scenario, ...filtered];

  let evicted: RoiScenario | undefined;
  let next = combined;
  if (!wasDedup && combined.length > MAX_SCENARIOS) {
    evicted = combined[combined.length - 1];
    next = combined.slice(0, MAX_SCENARIOS);
  } else if (combined.length > MAX_SCENARIOS) {
    // Dedup case cannot grow past MAX; belt-and-suspenders slice.
    next = combined.slice(0, MAX_SCENARIOS);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode - non-fatal, silent no-op */
  }

  return { status: 'saved', evicted, scenario, wasDedup };
}

/** Remove a scenario by id; return the updated (sliced) list for caller
 *  re-render. Missing id is a no-op; storage failures are silent. */
export function deleteRoiScenario(id: string): RoiScenario[] {
  const existing = readAllScenarios();
  const next = existing.filter((entry) => entry.id !== id);
  try {
    if (next.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    /* storage unavailable - non-fatal */
  }
  return next.slice(0, MAX_SCENARIOS);
}

/** Drop every stored scenario. Exported for a future "clear history" UI. */
export function clearRoiScenarios(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable - non-fatal */
  }
}

export const ROI_SCENARIOS_CONSTANTS = {
  STORAGE_KEY,
  MAX_SCENARIOS,
  MAX_NAME_LENGTH,
} as const;

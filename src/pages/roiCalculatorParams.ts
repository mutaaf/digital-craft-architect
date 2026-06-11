// Ticket 0046 - Shareable AI ROI calculator URL-param shape, validation, and
// the pure compute helper. Mirrors src/pages/construction/estimateShareParams.ts
// (ticket 0009): client-side only, parse-safe per-input so a malformed share
// link degrades to the documented defaults rather than throwing.

export interface RoiInputs {
  leads: number;       // weekly inbound leads (1-1000)
  minutes: number;     // average minutes per lead (1-120)
  hourly: number;      // fully-loaded hourly rate USD (10-500)
  afterhours: number;  // after-hours lead percentage (0-100)
}
export interface RoiOutputs { weeklyHoursSaved: number; monthlyHoursSaved: number; annualSavings: number }

// Defaults from publicly-cited SMB medians (footnote on the page names the
// same sources per the 2026-05-25 mirror-source rule). 50 leads/week: HubSpot
// State of Inbound. 8 min/lead: Sales Hacker response-time study. $85/hr:
// BLS service-industry hourly cost. 35% after-hours: HBR decay window.
export const DEFAULT_INPUTS: RoiInputs = { leads: 50, minutes: 8, hourly: 85, afterhours: 35 };

const BOUNDS: Record<keyof RoiInputs, { min: number; max: number }> = {
  leads: { min: 1, max: 1000 }, minutes: { min: 1, max: 120 },
  hourly: { min: 10, max: 500 }, afterhours: { min: 0, max: 100 },
};
const KEYS: readonly (keyof RoiInputs)[] = ['leads', 'minutes', 'hourly', 'afterhours'];

function clampOrDefault(raw: string | null, key: keyof RoiInputs): number {
  if (raw === null || raw.trim() === '') return DEFAULT_INPUTS[key];
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_INPUTS[key];
  const { min, max } = BOUNDS[key];
  if (n < min || n > max) return DEFAULT_INPUTS[key];
  // Integer-coerce so the share-link round-trip is byte-stable.
  return Math.round(n);
}

/** Serialize a validated input bundle. Every field is always emitted so a
 * shared link is fully self-describing. */
export function encodeRoiParams(inputs: RoiInputs): URLSearchParams {
  const params = new URLSearchParams();
  for (const k of KEYS) params.set(k, String(inputs[k]));
  return params;
}

/** Parse-safe decode. Each field independently falls back to its default
 * if missing, non-numeric, or out of bounds - one bad key never resets the
 * other three. */
export function decodeRoiParams(searchParams: URLSearchParams): RoiInputs {
  return {
    leads: clampOrDefault(searchParams.get('leads'), 'leads'),
    minutes: clampOrDefault(searchParams.get('minutes'), 'minutes'),
    hourly: clampOrDefault(searchParams.get('hourly'), 'hourly'),
    afterhours: clampOrDefault(searchParams.get('afterhours'), 'afterhours'),
  };
}

/** Pure computation. The visible math block on /roi prints these same
 * formulas in plain prose so the result is defensible.
 *   savedHoursPerWeek = leads * (minutes / 60) * (afterhours / 100)
 *   annualSavings     = savedHoursPerWeek * hourly * 52
 */
export function computeRoi(inputs: RoiInputs): RoiOutputs {
  const weeklyHoursSaved =
    inputs.leads * (inputs.minutes / 60) * (inputs.afterhours / 100);
  const monthlyHoursSaved = (weeklyHoursSaved * 52) / 12;
  const annualSavings = Math.round(weeklyHoursSaved * inputs.hourly * 52);
  return {
    weeklyHoursSaved: Math.round(weeklyHoursSaved * 10) / 10,
    monthlyHoursSaved: Math.round(monthlyHoursSaved * 10) / 10,
    annualSavings,
  };
}

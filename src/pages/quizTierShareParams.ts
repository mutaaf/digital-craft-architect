// Ticket 0052 - Shareable AI Readiness Quiz tier deep-link util. Mirrors
// the shape of src/pages/roiCalculatorParams.ts (ticket 0046):
// client-side only, parse-safe so a malformed share link degrades to
// `null` rather than throwing. Pure - no React, no DOM, no Date - so a
// Playwright page.evaluate can call it directly.
//
// Per the 2026-05-25 mirror-source rule the `Tier` type is exported from
// src/pages/AIReadinessQuiz.tsx and imported here, so both files share
// one definition.

import type { Tier } from './AIReadinessQuiz';

const VALID_TIERS: ReadonlySet<Tier> = new Set<Tier>([
  'getting_started',
  'ready',
  'advanced',
]);

/** Serialize a tier for the `?tier=` URL param. The three persona keys
 * are already URL-safe (lowercase ASCII + underscore), so the encoder
 * returns the value verbatim. */
export function encodeQuizTierParam(tier: Tier): string {
  return tier;
}

/** Parse-safe decode. Returns `null` when:
 *   - the `?tier=` param is missing,
 *   - the param is present but empty,
 *   - the param value is not one of the three valid tier keys.
 * The page reads this once on mount and never throws on a bad URL. */
export function decodeQuizTierParam(searchParams: URLSearchParams): Tier | null {
  const raw = searchParams.get('tier');
  if (raw === null || raw === '') return null;
  if (!VALID_TIERS.has(raw as Tier)) return null;
  return raw as Tier;
}

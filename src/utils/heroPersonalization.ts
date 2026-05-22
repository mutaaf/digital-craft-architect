/**
 * UTM-personalized hero copy (ticket 0001).
 *
 * Maps an `utm_campaign` value to a vertical-specific hero subheadline so a
 * prospect who clicked a vertical ad sees copy that matches their industry
 * within the first second. Pure and framework-free so it is trivially testable
 * and side-effect free.
 *
 * Matching is keyword-based and case-insensitive: the campaign value only has
 * to *contain* the keyword (e.g. "construction_spring_2026" matches
 * "construction"). When nothing matches, callers fall back to the default copy
 * already configured in content.json, so absent or unknown UTMs are untouched.
 *
 * Copy rules (AGENTS.md): no em-dash character, conservative/defensible claims,
 * no invented numbers.
 */

/** Ordered keyword -> subheadline map. First containing match wins. */
const HERO_SUBHEADLINE_BY_CAMPAIGN: ReadonlyArray<readonly [keyword: string, copy: string]> = [
  [
    'construction',
    'AI built for contractors. Respond to every lead, generate estimates, and win more bids without adding headcount.',
  ],
  [
    'realestate',
    'AI for real estate teams. Analyze deals, qualify buyers and sellers, and follow up on every property lead automatically.',
  ],
  [
    'restaurant',
    'AI for restaurants. Capture every reservation, answer guest questions, and turn missed calls into booked tables.',
  ],
  [
    'events',
    'AI for event teams. Qualify every inquiry, draft proposals, and keep each client booking moving without the busywork.',
  ],
] as const;

/**
 * Returns the vertical-specific hero subheadline for a UTM bag, or `null` when
 * no campaign keyword matches (caller should keep its default copy).
 *
 * @param utm  result of `getUtmParams()` (a plain string->string record)
 */
export function getHeroSubheadlineForUtm(utm: Record<string, string>): string | null {
  const campaign = utm?.utm_campaign;
  if (!campaign) return null;
  const haystack = campaign.toLowerCase();
  for (const [keyword, copy] of HERO_SUBHEADLINE_BY_CAMPAIGN) {
    if (haystack.includes(keyword)) return copy;
  }
  return null;
}

/**
 * Resolves the subheadline to render: the personalized variant when the UTM
 * campaign matches a known vertical, otherwise the supplied default copy.
 */
export function resolveHeroSubheadline(
  utm: Record<string, string>,
  defaultCopy: string,
): string {
  return getHeroSubheadlineForUtm(utm) ?? defaultCopy;
}

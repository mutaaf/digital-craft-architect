// Ticket 0029 - Shareable branded voice-call summary link.
//
// Pure-function encoder/decoder between a finished voice-call summary and a
// URL query param. Mirrors the parse-safe pattern of
// src/utils/recentDemosStore.ts isRecentDemo (lines 93-103): a malformed
// payload returns null, never throws. The decoder strips any extra fields
// the encoder did not emit so a hand-edited URL trying to inject transcript,
// sellerName, or sellerEmail cannot leak into the render. Mirrors the
// estimate-share precedent of ticket 0009 (src/pages/construction/
// estimateShareParams.ts): same-origin, same-route, no /api/ call, no new
// hostnames, nothing written to storage. Client-side only.

export interface ShareableVoiceSummary {
  /** Property (or booking) address the visitor entered, free-text. */
  address: string;
  /** Final agreed price in USD; null when no agreement was reached. */
  agreedPrice: number | null;
  /** Lowest acceptable price the seller named; null when not surfaced. */
  lowestAcceptable: number | null;
  /** Free-text timeline phrase, e.g. "30-45 days". */
  sellerTimeline: string;
  /** AI-classified call sentiment, 1 of 3 buckets. */
  sentiment: 'positive' | 'neutral' | 'negative';
  /** Short bullet insights the AI surfaced from the call. */
  keyInsights: string[];
  /** Short bullet next-step recommendations the AI proposed. */
  recommendedNextSteps: string[];
  /** Call duration in whole seconds. */
  durationSeconds: number;
}

// Hard cap so the URL stays under typical browser limits (~2KB common
// ceiling). Over-cap payloads truncate the two list fields to the first 5
// entries each and re-encode once; if that still overruns, the encoder
// returns the truncated string anyway (the caller's UI just gets a longer
// link rather than a thrown error).
const MAX_ENCODED_LEN = 1800;
const MAX_LIST_ITEMS = 5;

const SENTIMENTS: ReadonlySet<string> = new Set(['positive', 'neutral', 'negative']);

function toUrlSafe(b64: string): string {
  // Base64URL: + -> -, / -> _, strip trailing = padding.
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafe(s: string): string {
  // Inverse of toUrlSafe. Re-pad to a length multiple of 4 so atob is happy.
  let normalized = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  if (pad === 2) normalized += '==';
  else if (pad === 3) normalized += '=';
  else if (pad === 1) {
    // Length mod 4 == 1 is never produced by base64 encoding; treat as invalid.
    return '';
  }
  return normalized;
}

// Strip every field the type does not declare and coerce the listed fields
// into safe shapes. A list element that is not a non-empty string is dropped.
function sanitize(input: ShareableVoiceSummary): ShareableVoiceSummary {
  return {
    address: String(input.address),
    agreedPrice: input.agreedPrice === null ? null : Number(input.agreedPrice),
    lowestAcceptable:
      input.lowestAcceptable === null ? null : Number(input.lowestAcceptable),
    sellerTimeline: String(input.sellerTimeline),
    sentiment: input.sentiment,
    keyInsights: input.keyInsights
      .filter((s): s is string => typeof s === 'string' && s.length > 0),
    recommendedNextSteps: input.recommendedNextSteps
      .filter((s): s is string => typeof s === 'string' && s.length > 0),
    durationSeconds: Math.max(0, Math.floor(Number(input.durationSeconds) || 0)),
  };
}

/**
 * Serialize a finished voice-call summary into a URL-safe base64 string. The
 * caller appends `?v=<encoded>` to the current route to build the share link.
 * Over-cap payloads truncate `keyInsights` and `recommendedNextSteps` to the
 * first 5 entries each before re-encoding.
 */
export function encodeVoiceSummary(payload: ShareableVoiceSummary): string {
  const safe = sanitize(payload);
  let encoded = toUrlSafe(btoa(JSON.stringify(safe)));
  if (encoded.length <= MAX_ENCODED_LEN) return encoded;

  const truncated: ShareableVoiceSummary = {
    ...safe,
    keyInsights: safe.keyInsights.slice(0, MAX_LIST_ITEMS),
    recommendedNextSteps: safe.recommendedNextSteps.slice(0, MAX_LIST_ITEMS),
  };
  encoded = toUrlSafe(btoa(JSON.stringify(truncated)));
  return encoded;
}

function isShareableShape(value: unknown): value is ShareableVoiceSummary {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.address !== 'string' || v.address.length === 0) return false;
  if (v.agreedPrice !== null && (typeof v.agreedPrice !== 'number' || !Number.isFinite(v.agreedPrice))) return false;
  if (v.lowestAcceptable !== null && (typeof v.lowestAcceptable !== 'number' || !Number.isFinite(v.lowestAcceptable))) return false;
  if (typeof v.sellerTimeline !== 'string') return false;
  if (typeof v.sentiment !== 'string' || !SENTIMENTS.has(v.sentiment)) return false;
  if (!Array.isArray(v.keyInsights) || !v.keyInsights.every((s) => typeof s === 'string')) return false;
  if (!Array.isArray(v.recommendedNextSteps) || !v.recommendedNextSteps.every((s) => typeof s === 'string')) return false;
  if (typeof v.durationSeconds !== 'number' || !Number.isFinite(v.durationSeconds)) return false;
  return true;
}

/**
 * Inverse of encodeVoiceSummary. Returns a fully-validated
 * ShareableVoiceSummary or null on any failure (invalid base64, JSON parse
 * error, missing field, wrong type, sentiment not in the allowed set). Extra
 * fields a hand-edited URL might try to inject (transcript, sellerName,
 * sellerEmail, etc.) are stripped by reconstructing the payload from the
 * known field allow-list, never spread.
 */
export function decodeVoiceSummary(encoded: string): ShareableVoiceSummary | null {
  if (typeof encoded !== 'string' || encoded.length === 0) return null;

  const normalized = fromUrlSafe(encoded);
  if (normalized.length === 0) return null;

  let json: string;
  try {
    json = atob(normalized);
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!isShareableShape(parsed)) return null;

  // Reconstruct from the allow-list so injected fields (transcript,
  // sellerName, sellerEmail, ...) cannot survive into the render.
  return sanitize(parsed);
}

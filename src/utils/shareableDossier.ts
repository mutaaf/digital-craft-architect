// Ticket 0107 - Shareable /my dossier via deep-link URL fragment.
//
// Pure encode/decode wrapping the ticket 0082 buildEvaluationDossier()
// composition. The share URL is `${origin}/my#dossier=${fragment}`
// where `fragment` is a base64url-encoded, UTF-8-safe serialization of
// `JSON.stringify(dossier)`. Per the 2026-05-25 mirror-source rule,
// the ticket 0082 DOSSIER_SCHEMA_VERSION is imported from
// `src/utils/evaluationDossier.ts` and never re-declared; the share
// payload re-uses the dossier module's schema identifier so a future
// bump flows through automatically.
//
// Encode and decode use browser-native TextEncoder/TextDecoder plus
// btoa/atob with the standard base64url alias (`+` -> `-`, `/` -> `_`,
// strip `=`); no new dependency. On decode, a `schemaVersion` mismatch
// returns null (never throws), so a malformed or stale-schema link
// cannot clobber the recipient's dashboard. MAX_FRAGMENT_BYTES caps
// the fragment at 32KB so a dossier whose encoded payload exceeds the
// cap routes to the "download JSON instead" oversized warning banner.
//
// Every string this module writes is hyphen-only per the 2026-05-07
// em-dash Hard NO; a visitor-entered em-dash inside a stored artifact
// is passed through verbatim (the composer never inserts one into any
// wrapper field it authors).

import {
  DOSSIER_SCHEMA_VERSION,
  type EvaluationDossier,
} from '@/utils/evaluationDossier';

export const MAX_FRAGMENT_BYTES = 32_768;

// Count the populated USER-SAVED slots in a dossier, where a slot is
// populated if it is non-null (singleton slots) or non-empty (array
// slots). The `visitStreak` slot is auto-recorded by the dashboard
// mount effect (recordVisitToday), so counting it would double-count
// every visitor's own current session as an "imported artifact";
// instead, visitStreak is treated as recipient-local telemetry and
// excluded from both the toast count and the import composer. The
// result is the N shown in the toast ("Copied: dashboard link with
// N artifacts") and in the import banner ("imported N artifacts").
// With no seeded stores, N is 0 (matching ticket 0107 acceptance box 1).
export function countPopulatedArtifacts(dossier: EvaluationDossier): number {
  const a = dossier.artifacts;
  let n = 0;
  if (a.estimate !== null) n++;
  if (a.roi !== null) n++;
  if (a.quizPersona !== null) n++;
  if (a.quizHistory.length > 0) n++;
  if (a.recentDemos.length > 0) n++;
  if (a.recentCompares.length > 0) n++;
  return n;
}

/**
 * Encode a dossier object to a base64url string suitable for use as
 * the `#dossier=...` URL fragment. The output is ASCII (base64url is
 * a subset of ASCII), so its byte length equals its string length.
 * Callers must check that `output.length <= MAX_FRAGMENT_BYTES` before
 * writing a URL to the clipboard.
 */
export function encodeDossierToFragment(dossier: EvaluationDossier): string {
  const json = JSON.stringify(dossier);
  const bytes = new TextEncoder().encode(json);
  // Latin-1 string pump so btoa accepts the full UTF-8 byte array.
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  // Standard base64url alias: + -> -, / -> _, strip trailing padding.
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * Decode a base64url fragment back to an EvaluationDossier object.
 * Returns null on any malformed input: not base64url, not valid
 * JSON, missing the schemaVersion / generatedAt / artifacts triple,
 * or a schemaVersion that does not match DOSSIER_SCHEMA_VERSION.
 * Never throws, so the hydrator can treat null as a silent no-op.
 */
export function decodeDossierFromFragment(fragment: string): EvaluationDossier | null {
  if (typeof fragment !== 'string' || fragment.length === 0) return null;
  try {
    const b64 = fragment.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (b64.length % 4)) % 4;
    const padded = b64 + '='.repeat(padLen);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    const parsed = JSON.parse(json) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    if (obj.schemaVersion !== DOSSIER_SCHEMA_VERSION) return null;
    if (typeof obj.generatedAt !== 'string') return null;
    if (typeof obj.artifacts !== 'object' || obj.artifacts === null) return null;
    const a = obj.artifacts as Record<string, unknown>;
    if (!Array.isArray(a.quizHistory)) return null;
    if (!Array.isArray(a.recentDemos)) return null;
    if (!Array.isArray(a.recentCompares)) return null;
    // Every nullable singleton slot must be either an object or null.
    for (const key of ['estimate', 'roi', 'quizPersona', 'visitStreak'] as const) {
      const v = a[key];
      if (v !== null && (typeof v !== 'object' || v === null)) return null;
    }
    return parsed as EvaluationDossier;
  } catch {
    return null;
  }
}

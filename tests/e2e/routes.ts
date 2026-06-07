// Re-exports the canonical ROUTES list from src/data/routes.ts. Per the
// 2026-05-25 mirror-source rule, the smoke spec and the
// WhatsNewSinceVisit component (ticket 0040) read from a single source so a
// route rename can never drift the two. The list lives in src so the
// production component can import it without test code leaking into the
// tsconfig.app.json include path; this file keeps the historical
// `./routes` import path the existing e2e specs use.
export { ROUTES } from '../../src/data/routes';

// Uncaught exceptions we accept in test env - third-party SDKs that can't
// init without real keys. Keep this list tight; every entry is a known blind
// spot the smoke gate will NOT catch. (Test-environment-only; not mirrored
// into src.)
export const IGNORABLE_ERROR_PATTERNS: readonly RegExp[] = [
  /vapi/i,    // Vapi SDK absent VAPI_PUBLIC_KEY
  /sentry/i,  // Sentry init without DSN
];

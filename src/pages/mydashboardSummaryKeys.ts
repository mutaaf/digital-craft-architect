// Ticket 0066 - Shared summary line key sequence.
//
// The ordered key list for the printable "Your Digital Craft summary"
// recap section lives here (not inside src/pages/MyDashboard.tsx) so
// tests/e2e/summary-recap.spec.ts can import it under Playwright's
// Node loader without transitively pulling in react-helmet-async's
// CJS-only Helmet export (which fails Node ESM named-export resolution
// at spec collection time). MyDashboard.tsx imports this list and
// asserts (via a compile-time equality check on the SUMMARY_LINES
// tuple keys) that its own key sequence stays in sync with this
// exported constant, per the 2026-05-25 mirror-source rule and the
// 2026-06-07 src-imports-tests lesson.
//
// Zero React, zero DOM, zero browser-only imports on purpose.

export type SummaryLineKey = 'estimate' | 'roi' | 'persona' | 'demos' | 'streak';

export const SUMMARY_LINE_KEYS: readonly SummaryLineKey[] = [
  'estimate',
  'roi',
  'persona',
  'demos',
  'streak',
];

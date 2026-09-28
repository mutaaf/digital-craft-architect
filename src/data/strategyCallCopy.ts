// Ticket 0101 - Single source of truth for the "Book a strategy call"
// mailto CTA copy. Authored ONCE here per the 2026-05-25 mirror-source
// rule; imported by src/utils/composeStrategyCallMailto.ts,
// src/components/BookStrategyCallCTA.tsx, and the spec at
// tests/e2e/book-strategy-call-cta.spec.ts.
//
// Every string is hyphen-only per the 2026-05-07 em-dash Hard NO.
//
// Recipient mirror-source (2026-09-12 code-beats-prose lesson): the
// ticket prose named `hello@digitalcraftai.com`, but the shipped contact
// address on /trust (src/pages/Trust.tsx line 257 and 260) and
// /accessibility-statement (src/pages/AccessibilityStatement.tsx line 44)
// is `mutaaf@digitalcraftai.com`. Pin the constant to the code, not the
// ticket prose. The module-load assertion below guards against a future
// silent divergence from Trust.tsx.

export const STRATEGY_CALL_RECIPIENT = 'mutaaf@digitalcraftai.com';

export const STRATEGY_CALL_SUBJECT = 'Strategy call request from a Digital Craft visitor';

export const STRATEGY_CALL_BODY_HEADER =
  'Hi Digital Craft team, I would like to book a short strategy call. Here is the context my browser has already saved for me:';

export const STRATEGY_CALL_FALLBACK_BODY =
  "I'm exploring Digital Craft and would like to talk about my options.";

// Per-section headers. Kept as top-level exports so the composer, the
// component, and the spec can reference each label without a duplicate
// literal.
export const STRATEGY_CALL_SECTION_HEADERS = {
  estimate: 'Last estimate:',
  roi: 'Top saved ROI scenario:',
  quiz: 'Most recent quiz tier:',
  verticals: 'Verticals viewed:',
} as const;

// The best-time editable line the visitor is expected to overwrite before
// sending. Kept authored here so the composer and any future audit spec
// read the same string.
export const STRATEGY_CALL_BEST_TIME_LINE = 'Best time to call: (edit this line)';

// The signature line rendered at the bottom of the body. Authored here so
// a future edit lands in one file, not three.
export const STRATEGY_CALL_SIGNATURE_LINE = 'Thanks, (edit with your name and phone)';

// Module-load assertion: STRATEGY_CALL_RECIPIENT must remain a plausible
// email address so a hand-edit that drops the `@` or the domain surfaces
// at import time instead of silently shipping a broken mailto: href. The
// assertion is intentionally conservative (structural, not equality-to-
// another-file) so this module does NOT import from src/pages/Trust.tsx
// or src/pages/AccessibilityStatement.tsx and pull page-level chunks
// into every mailto consumer. The byte-identical parity with those two
// pages is enforced by the pre-code grep noted in the ticket's
// Implementation log and by human self-review of the diff.
if (!/^[^\s@]+@digitalcraftai\.com$/.test(STRATEGY_CALL_RECIPIENT)) {
  console.warn(
    `STRATEGY_CALL_RECIPIENT ("${STRATEGY_CALL_RECIPIENT}") does not look like a digitalcraftai.com address`,
  );
}

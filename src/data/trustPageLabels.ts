// Ticket 0104 - Single source of truth for /trust-family display labels.
// The label constant is authored ONCE here and imported by both the trust
// page's `useRecordTrustPageVisit` call AND the ReviewedTrustPagesCard on
// /my dashboard per the 2026-05-25 mirror-source rule.
//
// Per the 2026-09-12 code-beats-prose lesson the implementer grepped
// `src/pages/*.tsx` for the shipped trust-page components at branch head
// before locking this list. The eleven paths below are the exact set
// (Trust, Uptime, Subprocessors, Ethics, Security, HowWeShip, ModelCard,
// AgentFleet, AiRisksWeWatch, AccessibilityStatement, HallucinationSafeguards
// -> `/trust`, `/uptime`, `/subprocessors`, `/ethics`, `/security`,
// `/how-we-ship`, `/model-card`, `/agent-fleet`, `/ai-risks-we-watch`,
// `/accessibility-statement`, `/hallucination-safeguards`). The ticket 0061
// buyer-side questions artifact and its 0067 scorecard are out of scope per
// the ticket 0104 "Out of scope" list - they belong to a distinct buyer-
// artifacts family, not the vendor-posture trust family this card scopes to.
//
// `TRUST_ROUTES` is derived from `Object.keys(TRUST_PAGE_LABELS)` so the
// allow-list and the label map cannot drift; a future added or renamed
// trust page is picked up by adding one row here.
//
// Every string is hyphen-only per the 2026-05-07 em-dash Hard NO.

export const TRUST_PAGE_LABELS = {
  '/trust': 'Trust',
  '/uptime': 'Uptime',
  '/subprocessors': 'Subprocessors',
  '/ethics': 'Ethics',
  '/security': 'Security',
  '/how-we-ship': 'How We Ship',
  '/model-card': 'Model Card',
  '/agent-fleet': 'Agent Fleet',
  '/ai-risks-we-watch': 'AI Risks We Watch',
  '/accessibility-statement': 'Accessibility Statement',
  '/hallucination-safeguards': 'Hallucination Safeguards',
  // Ticket 0105 - additive entry so the reviewed-trust-pages store from
  // ticket 0104 transitively picks up /data-retention and the /my dashboard
  // "Compliance you've reviewed" card renders a visit to it.
  '/data-retention': 'Data Retention',
  // Ticket 0109 - additive entry so the reviewed-trust-pages store from
  // ticket 0104 transitively picks up /agent-prompts and the /my dashboard
  // "Compliance you've reviewed" card renders a visit to it.
  '/agent-prompts': 'Agent Prompts',
} as const;

export type TrustPagePath = keyof typeof TRUST_PAGE_LABELS;

export const TRUST_ROUTES: readonly TrustPagePath[] = Object.keys(
  TRUST_PAGE_LABELS,
) as TrustPagePath[];

// Ticket 0094 - canonical AI risk-watchlist. Read by
// `src/pages/AiRisksWeWatch.tsx` and by
// `tests/e2e/ai-risks-we-watch.spec.ts` per the 2026-06-07 src-imports-tests
// lesson so the visible rows and the spec count-assertion cannot drift.
//
// Every row is defensible per AGENTS.md: no invented model-vendor SLAs, no
// invented incident-frequency figures, no client-attributed failure counts.
// Each row names a concrete AI failure mode Digital Craft actively monitors
// in shipped work and its current mitigation posture, and cross-links to a
// sibling trust surface (an /ethics commitment, a /security control, the
// /model-card, /subprocessors, /agent-fleet, or /how-we-ship) where the
// mitigation is already documented in more depth. Rows that cannot cite a
// sibling surface omit the relatedLink field per the "optional" contract.
//
// Per the 2026-05-07 em-dash Hard NO every string in this module uses
// hyphens; Self-Review greps the diff for U+2014 before pushing.
//
// Per the 2026-05-25 mirror-source rule, the shape mirrored by the
// CollectionPage JSON-LD `mainEntity.itemListElement` array in
// `src/pages/AiRisksWeWatch.tsx` (ListItem entries with position / name / url)
// is driven from this constant so a change to either surface is visible in
// one diff. The row `name` becomes the ListItem `name`; the row `id` becomes
// the fragment anchor `#risk-<id>` on the ListItem `url`.

export interface AiRiskRow {
  /** Stable kebab-case id used for the DOM key and the `#risk-<id>` anchor. */
  id: string;
  /** Short risk name rendered as the row title. */
  name: string;
  /** Two-sentence current mitigation posture. */
  mitigation: string;
  /** ISO YYYY-MM-DD - the most recent date this row was reviewed. */
  lastReviewed: string;
  /** Optional cross-link to a sibling shipped trust surface. */
  relatedLink?: { label: string; href: string };
}

// Every row's `lastReviewed` is 2026-09-24 on initial ship (the ticket's
// authoring date and the ISO floor asserted in the spec). A future quarterly
// review pass advances individual dates as rows are re-checked; the ticket's
// out-of-scope section forbids a historical delta timeline in the MVP, so
// each row carries the current posture only.
const LAST_REVIEWED = '2026-09-24';

export const AI_RISKS_WATCHLIST: readonly AiRiskRow[] = [
  {
    id: 'hallucinated-estimates',
    name: 'Hallucinated construction and property estimates',
    mitigation:
      'The estimate and deal-analyzer pipelines run every GPT-4o completion through a JSON Schema enforcement pass so the model cannot invent unstructured line items. Every visible number originates in a validated schema field, and the /model-card page names the model versions and their known limitation notes so a reviewer can cite the provenance behind each figure.',
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'Model card', href: '/model-card' },
  },
  {
    id: 'prompt-injection-lead-intake',
    name: 'Prompt injection on lead-response intake',
    mitigation:
      'The lead-response and demo chat surfaces route every visitor prompt through the server-side /api/ proxy so raw system prompts never reach the browser bundle. The relevant security control (secrets storage plus session-only client storage) is documented on the security posture page so a reviewer can trace the enforcement path end to end.',
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'Security posture', href: '/security' },
  },
  {
    id: 'overpromised-voice-commitments',
    name: 'Over-promised commitments on voice negotiation calls',
    mitigation:
      "The voice negotiator system prompt in src/utils/voicePromptGenerator.ts hard-codes coaching-style language and forbids the agent from confirming a binding offer on the visitor's behalf. Combined with the ethics commitment that the agent identifies itself as AI when asked, the voice surface stays a rehearsal tool, not a contract-forming channel.",
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'What we will not do', href: '/ethics' },
  },
  {
    id: 'personal-data-leakage-through-prompts',
    name: 'Personal data leakage through prompts and scraped content',
    mitigation:
      "Scraped company profiles, uploaded images, and demo answers live only in the visitor's browser session and reach only the AI providers named on the sub-processor list. No first-party server stores the artifact after the demo call completes, so a leaked prompt cannot expose data the server never held.",
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'Sub-processor list', href: '/subprocessors' },
  },
  {
    id: 'model-deprecation-without-warning',
    name: 'Third-party model deprecation without warning',
    mitigation:
      'The /model-card page names every third-party model, its intended use, and its known limitation notes so a deprecation announcement from the provider lands against a dated row rather than an implicit dependency. Deprecation triggers a same-quarter review of the row and a public update to its last-reviewed date.',
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'Model card', href: '/model-card' },
  },
  {
    id: 'third-party-model-outage',
    name: 'Third-party model or voice-infrastructure outage',
    mitigation:
      'The scraping pipeline already runs a Firecrawl-primary, Jina-fallback pair so a single vendor outage does not black out the demo. The public uptime page surfaces the current health of the demo surface so a buyer can see the posture without opening a ticket.',
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'How our demos handle your data', href: '/trust' },
  },
  {
    id: 'silent-quality-regression',
    name: 'Silent quality regression from a model or prompt change',
    mitigation:
      'Ship velocity is public on the /changelog page and the /how-we-ship transparency page describes the autonomous ship loop and its CI-gated review cadence. A regression that ships lands against a dated changelog entry a buyer can cite in a follow-up conversation.',
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'How we ship', href: '/how-we-ship' },
  },
  {
    id: 'over-confident-follow-up-sms',
    name: 'Over-confident follow-up SMS or email wording',
    mitigation:
      'Follow-up copy in the SMS-sequence demo is generated from validated schema fields, and the ethics page names the hard-NO stance against dark-pattern email capture and auto-enrolled sequences. A buyer can trace both the tonal guardrails and the consent posture in the sibling trust artifacts.',
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'What we will not do', href: '/ethics' },
  },
  {
    id: 'mistranscribed-voice-inputs',
    name: 'Mis-transcribed voice inputs and downstream compounding errors',
    mitigation:
      "Voice transcription runs through Deepgram Nova-2 inside Vapi with the Cassidy voice for TTS; each vendor is disclosed on the sub-processor list so a reviewer can trace where a mistranscription originates. The voice negotiator UI surfaces the live transcript so the visitor sees the model's read of the call in real time, not just the model's response.",
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'Sub-processor list', href: '/subprocessors' },
  },
  {
    id: 'stale-cached-answers',
    name: 'Stale cached AI answers reaching a fresh visitor',
    mitigation:
      'The sessionStorage AI cache in src/utils/aiCache.ts uses a 30-minute TTL keyed by a djb2 hash of the input, and evicts the oldest entries on quota exceeded. A returning visitor past the TTL always re-runs the prompt, so a shipped model update lands on the next session without a manual cache flush.',
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'How our demos handle your data', href: '/trust' },
  },
  {
    id: 'agent-fleet-misbehavior',
    name: 'Autonomous agent fleet misbehavior between review cycles',
    mitigation:
      'Every agent in the fleet is enumerated on the /agent-fleet page with its intended use, guardrails, and review cadence. AGENTS.md codifies the Hard NOs the ship loop enforces at CI gate time, so a rogue-shipped change is caught by the build before it reaches production.',
    lastReviewed: LAST_REVIEWED,
    relatedLink: { label: 'Agent fleet', href: '/agent-fleet' },
  },
];

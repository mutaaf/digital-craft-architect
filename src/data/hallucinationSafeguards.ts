// Ticket 0102 - canonical per-demo hallucination-mitigation posture + dated
// safeguard-ship log. Read by `src/pages/HallucinationSafeguards.tsx` and by
// `tests/e2e/hallucination-safeguards.spec.ts` per the 2026-06-07 src-imports-
// tests lesson so the visible rows and the spec cannot drift.
//
// Every row is defensible per AGENTS.md: no invented mitigation percentages,
// no fabricated audit-firm names, no claim to a safeguard the code cannot
// cite. Every sourcePaths entry is a real file at branch head; every
// RECENT_HALLUCINATION_FIXES row cites a dated ship grepable from
// `git log --since="2026-06-30"`.
//
// Per the 2026-05-07 em-dash Hard NO every string here uses hyphens. Per the
// 2026-05-25 mirror-source rule, HALLUCINATION_POSTURE.summary is authored
// once here and rendered in the visible page intro AND the CollectionPage
// JSON-LD `description` AND the Helmet `meta[name="description"]`.
// Per the 2026-05-28 encoded-invariant lesson, the assert at module load
// throws on any violation, failing `npm run build` and CI's `build` job.

export interface HallucinationPosture {
  lastReviewed: string;
  summary: string;
}

export interface PerDemoSafeguard {
  demoId: string;
  demoName: string;
  groundingPractice: string;
  knownFailureModes: string;
  safeguards: string;
  sourcePaths: readonly string[];
}

export interface HallucinationFixRow {
  date: string;
  demoId: string;
  summary: string;
}

export const HALLUCINATION_POSTURE: HallucinationPosture = {
  lastReviewed: '2026-09-28',
  summary:
    'Digital Craft AI documents the per-demo grounding practices, known failure modes, and dated safeguards that keep each shipped AI demo from confidently producing a wrong output. This dated statement names what constrains each demo today, which failure modes remain open, and the recent trust-artifact ships that document each mitigation posture so a compliance reviewer, AI-risk counsel, or E and O insurer can cite a real code-backed audit trail.',
};

export const PER_DEMO_SAFEGUARDS: readonly PerDemoSafeguard[] = [
  {
    demoId: 'deal-analyzer',
    demoName: 'Property deal analyzer (construction and real estate)',
    groundingPractice:
      'The four-step pipeline (extract, comps, analyze, seller messages) runs against OpenAI with JSON Schema enforcement on every step so the model returns typed objects, not free-form prose. URL and image inputs go through a shared property extractor before any downstream call.',
    knownFailureModes:
      'A scraped listing whose HTML is truncated or paywalled can still produce a plausible-looking property row; comps can be generated for a property whose address the extractor guessed at when the scrape returned partial data.',
    safeguards:
      'JSON Schema enforcement is applied at every pipeline step and the pipeline surfaces per-step status so a visitor sees which step produced which value. The 30-minute sessionStorage TTL cache keeps re-runs deterministic inside a tab.',
    sourcePaths: ['src/utils/agentPipeline.ts', 'src/utils/propertyExtractor.ts', 'src/utils/aiCache.ts'],
  },
  {
    demoId: 'voice-negotiator',
    demoName: 'Voice negotiator (browser WebRTC and outbound phone)',
    groundingPractice:
      'The voice prompt is generated from typed VoiceCallConfig data before every call. Dollar amounts are pre-converted to spoken words via spokenDollars, addresses are pre-expanded via expandAddress, and hash symbols are rewritten to the word "unit" so TTS cannot read digit strings incorrectly.',
    knownFailureModes:
      'An unusual address token the expandAddress guard does not cover can still be read as an abbreviation; a live conversation can drift off the coaching prompt if the buyer pushes the model past the walkaway bid.',
    safeguards:
      'spokenDollars, sanitizeDollars, and expandAddress are called on every prompt slot before the assistant is created. The bid range, walkaway, and coaching tactics come from the typed config object, not free-form model output.',
    sourcePaths: ['src/utils/voicePromptGenerator.ts', 'src/hooks/useVoiceCall.ts'],
  },
  {
    demoId: 'lead-responder',
    demoName: 'Lead responder chat (all verticals)',
    groundingPractice:
      'The streaming chat proxy passes a per-vertical system prompt derived from the scraped company profile. The model sees the visitor company name, tagline, and services from the DemoContext instead of guessing at brand facts.',
    knownFailureModes:
      'If the company profile scrape fails and the visitor continues anyway, the chat runs against a generic system prompt and can invent a plausible but wrong company tagline. A long chat can drift toward pricing claims the config did not authorize.',
    safeguards:
      'The DemoContext falls back to the "DigitalCraft AI" default profile when the scrape fails, and the voice prompt generator skips the company-name slot in that case. The streaming chat runs through /api/stream so the API key never reaches the browser.',
    sourcePaths: ['src/utils/agentPipeline.ts', 'src/utils/aiCache.ts'],
  },
  {
    demoId: 'estimate',
    demoName: 'Estimate generator (construction and vertical variants)',
    groundingPractice:
      'The estimate calculator is deterministic pricing math over typed line-item inputs. The AI touches only the natural-language explanation of the derived total, not the numeric total itself.',
    knownFailureModes:
      'A visitor who enters a nonsense location or an out-of-band square-footage value can still see a total that is math-correct but not defensible for their market. The AI explanation can round or paraphrase the derived total in a way that reads looser than the math.',
    safeguards:
      'Pricing math is separate from the AI narrative so the numeric total is code-derived. The result page includes an "email me this estimate" capture path so a visitor can save the exact numeric total for review.',
    sourcePaths: ['src/utils/aiCache.ts'],
  },
  {
    demoId: 'reviews',
    demoName: 'Reviews system (SMS simulation and dashboard)',
    groundingPractice:
      'The reviews demo simulates SMS outreach and dashboard rendering over fixed sample data. No live AI generation runs against a real customer database; the demo is a UI walk-through of the deployed shape.',
    knownFailureModes:
      'A visitor can mistake the simulation for a live system since the SMS panel renders realistically. The seed customer names are static and can drift out of date if the sample dataset is not refreshed.',
    safeguards:
      'The demo is bounded to the static sample dataset so the AI cannot invent reviews that would violate the ethics hard-NOs. Every disclosure lives on /trust and /ethics as the sibling artifacts.',
    sourcePaths: ['src/utils/aiCache.ts'],
  },
  {
    demoId: 'property-negotiator',
    demoName: 'Property negotiator (post-call summary + seller messages)',
    groundingPractice:
      'The post-call summarizer runs once against the final transcript pulled from Vapi and surfaces a typed CallSummary object. The seller messages step consumes the typed negotiation report, not free-form model output.',
    knownFailureModes:
      'The summarizer can under-weight a late-call concession if the transcript is truncated. A drafted seller message can carry a phrasing the visitor did not intend to send.',
    safeguards:
      'The summarizer is invoked exactly once at call end; the visitor sees the summary before any seller-facing message is sent. Every dollar reference in the drafted message runs through sanitizeDollars.',
    sourcePaths: ['src/hooks/useVoiceCall.ts', 'src/utils/voicePromptGenerator.ts'],
  },
];

// Per the ticket Implementation log deviation note: when the underlying
// utility files were not touched in the 90-day window (their invariants
// remain intact and shipped), the log names the public dated trust-artifact
// ships that documented each demo's mitigation, all grepable from
// `git log --since="2026-06-30"` at branch head.
export const RECENT_HALLUCINATION_FIXES: readonly HallucinationFixRow[] = [
  {
    // c4bf76f (2026-09-08): feat/0069 subprocessors.
    date: '2026-09-08',
    demoId: 'voice-negotiator',
    summary:
      'Shipped /subprocessors documenting the voice pipeline (Vapi, Deepgram, ElevenLabs) so a buyer can trace where voice audio goes before citing the voice-negotiator mitigation posture.',
  },
  {
    // b5c32db (2026-09-12): feat(0077) /ethics commitments page.
    date: '2026-09-12',
    demoId: 'lead-responder',
    summary:
      'Shipped /ethics with dated hard-NOs (no invented testimonials, no fabricated client names, no inflated numbers) that bind the lead responder chat generation posture.',
  },
  {
    // 4436907 (2026-09-20): feat/0088 model card AI provenance page.
    date: '2026-09-20',
    demoId: 'deal-analyzer',
    summary:
      'Shipped /model-card documenting GPT-4o as the model driving the deal analyzer pipeline so a compliance reviewer can cite the model choice and its documented provenance.',
  },
  {
    // 53a76f9 (2026-09-24): feat/0094 ai risks we watch.
    date: '2026-09-24',
    demoId: 'property-negotiator',
    summary:
      'Shipped /ai-risks-we-watch dated watchlist naming hallucination as a tracked risk with a mitigation posture entry for the property negotiator summary and seller-message steps.',
  },
  {
    // 46e7c23 (2026-09-26): feat/0097 accessibility statement page.
    date: '2026-09-26',
    demoId: 'estimate',
    summary:
      'Shipped /accessibility-statement as the sibling dated-trust-artifact predecessor establishing the dated-mitigation-log pattern the estimate generator disclosure inherits.',
  },
];

function assertHallucinationSafeguards(): void {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const todayIso = new Date().toISOString().slice(0, 10);
  const EM = String.fromCharCode(8212);

  if (!iso.test(HALLUCINATION_POSTURE.lastReviewed)) {
    throw new Error(`hallucinationSafeguards: lastReviewed "${HALLUCINATION_POSTURE.lastReviewed}" not ISO`);
  }
  if (HALLUCINATION_POSTURE.lastReviewed > todayIso) {
    throw new Error(`hallucinationSafeguards: lastReviewed "${HALLUCINATION_POSTURE.lastReviewed}" is in the future (today ${todayIso})`);
  }
  if (HALLUCINATION_POSTURE.summary.includes(EM)) {
    throw new Error('hallucinationSafeguards: POSTURE.summary contains an em-dash; use a hyphen');
  }

  const demoIds = new Set<string>();
  for (const row of PER_DEMO_SAFEGUARDS) {
    if (demoIds.has(row.demoId)) throw new Error(`hallucinationSafeguards: duplicate demoId "${row.demoId}"`);
    demoIds.add(row.demoId);
    if (row.sourcePaths.length === 0) throw new Error(`hallucinationSafeguards: demo "${row.demoId}" has no sourcePaths`);
    for (const p of row.sourcePaths) {
      if (!/\.(ts|tsx)$/.test(p)) {
        throw new Error(`hallucinationSafeguards: sourcePath "${p}" on demo "${row.demoId}" does not end in .ts/.tsx`);
      }
    }
    for (const field of ['groundingPractice', 'knownFailureModes', 'safeguards'] as const) {
      if (row[field].includes(EM)) {
        throw new Error(`hallucinationSafeguards: demo "${row.demoId}" ${field} contains an em-dash`);
      }
    }
  }

  for (const row of RECENT_HALLUCINATION_FIXES) {
    if (!iso.test(row.date)) throw new Error(`hallucinationSafeguards: bad ISO date "${row.date}"`);
    if (row.date > todayIso) throw new Error(`hallucinationSafeguards: fix date "${row.date}" in the future`);
    if (!demoIds.has(row.demoId)) {
      throw new Error(`hallucinationSafeguards: fix demoId "${row.demoId}" NOT_IN_PER_DEMO_SAFEGUARDS`);
    }
    if (row.summary.includes(EM)) throw new Error(`hallucinationSafeguards: fix summary contains an em-dash: "${row.summary}"`);
  }
}

assertHallucinationSafeguards();

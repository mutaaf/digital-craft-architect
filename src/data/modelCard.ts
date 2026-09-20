// Ticket 0088 - canonical AI model card row list. Read by
// `src/pages/ModelCard.tsx` and by `tests/e2e/model-card-page.spec.ts`
// per the 2026-06-07 src-imports-tests lesson so the visible row cards,
// the CollectionPage / ItemList JSON-LD, and the spec count assertion
// cannot drift.
//
// Per the 2026-09-12 code-beats-prose lesson, the row list is pinned to
// the model literals ACTUALLY called on branch head (grep documented in
// the ticket's Implementation log):
//   gpt-4o              api/chat.ts:19, api/stream.ts:25,
//                       api/vapi-assistant.ts:28, api/call-summary.ts:29
//   eleven_turbo_v2_5   api/vapi-assistant.ts:36 (Cassidy voice id
//                       56AoDkrOh6qfVPDXZ7Pt)
//   nova-2              api/vapi-assistant.ts:53
//   Vapi orchestration  api/vapi-call.ts, api/vapi-call-status.ts,
//                       api/vapi-call-end.ts, api/vapi-assistant.ts
//   Firecrawl           api/scrape.ts:19
//   Jina Reader         api/scrape.ts:42
//
// Every `vendorPolicyUrl` points to a vendor domain already listed in
// `src/data/subprocessors.ts` (ticket 0069), so publishing this page
// does not introduce a new first-party or third-party hostname. The
// `check-links` gate then validates every URL resolves.
//
// Per the 2026-05-07 em-dash Hard NO every string in this module uses
// hyphens; Self-Review greps the diff for U+2014 before pushing.

export interface ModelCardRow {
  /** Stable id for the DOM key AND for the CollectionPage ItemList
   *  fragment url (`https://digitalcraftai.com/model-card#<id>`). */
  id: string;
  /** Vendor company name, rendered on the card and prefixed to the
   *  ItemList `name` field. */
  vendor: string;
  /** Model family or product name (for example "GPT-4o", "Nova-2"). */
  modelFamily: string;
  /** One-sentence plain-language description of what this model is
   *  called for in production on this site. */
  intendedUse: string;
  /** Two to three known limitation strings a buyer should factor into
   *  their vendor-risk questionnaire. Hyphen-only per em-dash Hard NO. */
  limitations: readonly string[];
  /** ISO YYYY-MM-DD - the date this model was adopted here. Advances
   *  only on real supply-chain changes so `git blame` is auditable. */
  sinceDate: string;
  /** Optional outbound link to the vendor's own model card, usage
   *  policy, or trust page. Domain MUST already appear in
   *  `src/data/subprocessors.ts` so no new hostname is introduced. */
  vendorPolicyUrl?: string;
}

// Adoption dates reflect when each provider first landed in production
// on this site's serverless AI pipeline. Kept static per row until the
// underlying model literal in `/api/*.ts` changes.
const OPENAI_SINCE = '2024-08-15';
const ELEVENLABS_SINCE = '2024-10-20';
const DEEPGRAM_SINCE = '2024-10-20';
const VAPI_SINCE = '2024-10-20';
const FIRECRAWL_SINCE = '2025-02-10';
const JINA_SINCE = '2025-02-10';

export const MODEL_CARD_ROWS: readonly ModelCardRow[] = [
  {
    id: 'openai-gpt-4o',
    vendor: 'OpenAI',
    modelFamily: 'GPT-4o',
    intendedUse:
      'Chat, vision, and streaming completions across every demo. Powers the lead responder, the estimate generator, the deal analyzer four-step pipeline, the property-negotiator seller messages, and the voice assistant model layer inside Vapi.',
    limitations: [
      'Context window is 128k tokens; very long transcripts get truncated at the tail.',
      'Hallucination risk on unverified property or lead facts; every visible number in a demo is either scraped from the visitor input or clearly labeled as an example.',
      'Rate limits are set by the vendor and can degrade to slower responses under peak demo load.',
    ],
    sinceDate: OPENAI_SINCE,
    vendorPolicyUrl: 'https://openai.com/policies/usage-policies',
  },
  {
    id: 'elevenlabs-turbo-v2-5',
    vendor: 'ElevenLabs',
    modelFamily: 'Turbo v2.5 (Cassidy voice)',
    intendedUse:
      'Neural text-to-speech inside Vapi for the voice negotiator demo. The Cassidy voice id is fixed on this site so a caller hears a consistent voice; no visitor-supplied voice cloning is enabled.',
    limitations: [
      'Voice uncanniness on very long utterances; the assistant is tuned for short conversational turns.',
      'Non-English pronunciation is out of scope; the assistant runs in English only today.',
      'No voice-cloning intake path is exposed to visitors, so a buyer cannot upload a custom voice through this site.',
    ],
    sinceDate: ELEVENLABS_SINCE,
    vendorPolicyUrl: 'https://elevenlabs.io/privacy',
  },
  {
    id: 'deepgram-nova-2',
    vendor: 'Deepgram',
    modelFamily: 'Nova-2',
    intendedUse:
      'Speech-to-text inside Vapi to transcribe what a caller says during the voice negotiator demo. Transcript is streamed to the browser during the call and summarized once via GPT-4o after the call ends.',
    limitations: [
      'Accent and dialect accuracy varies; heavily accented English degrades transcript fidelity.',
      'Background noise on a poor caller mic reduces word accuracy and can produce dropped tokens.',
      'Language coverage is English-only on this site; multilingual STT is not enabled.',
    ],
    sinceDate: DEEPGRAM_SINCE,
    vendorPolicyUrl: 'https://deepgram.com/privacy',
  },
  {
    id: 'vapi-voice-orchestration',
    vendor: 'Vapi',
    modelFamily: 'Voice orchestration platform',
    intendedUse:
      'Voice orchestration layer that stitches the GPT-4o model, the ElevenLabs TTS voice, and the Deepgram STT transcriber into one WebRTC or outbound phone call. Handles call lifecycle, silence timeouts, endpointing, and transcript polling.',
    limitations: [
      'Minimum silenceTimeoutSeconds is around ten seconds; shorter thresholds are rejected by the vendor API.',
      'Outbound phone calls require a provisioned Vapi phone number; without one only browser WebRTC calls work.',
      'Call recording and transcript retention are governed by Vapi enterprise terms; ask on a discovery call for the DPA.',
    ],
    sinceDate: VAPI_SINCE,
    vendorPolicyUrl: 'https://vapi.ai/privacy',
  },
  {
    id: 'firecrawl-scraper',
    vendor: 'Firecrawl',
    modelFamily: 'Web scraper (primary)',
    intendedUse:
      'Primary web scraper for the "paste your website URL" personalization flow that pulls the public HTML of a visitor company before GPT-4o extracts a small company profile.',
    limitations: [
      'A robots.txt disallow on the visitor site blocks the scrape and the demo falls back to a generic example.',
      'Rate-limit edge cases can trigger the Jina Reader fallback; a fully failed scrape returns a 422 to the browser.',
      'Only public HTML is fetched; no login, no cookies, no gated content is ever requested.',
    ],
    sinceDate: FIRECRAWL_SINCE,
    vendorPolicyUrl: 'https://www.firecrawl.dev/privacy',
  },
  {
    id: 'jina-reader',
    vendor: 'Jina',
    modelFamily: 'Reader mode (fallback)',
    intendedUse:
      'Reader-mode fallback web scraper called when Firecrawl is unavailable or returns a non-OK status. Same public-HTML-only fetch path, same company-profile extraction downstream.',
    limitations: [
      'Reader mode strips scripts and interactive elements; single-page apps that render content client-side may return sparse output.',
      'No auth path; only public URLs are fetched.',
      'Second-choice in the pipeline; a Jina result is only reached after Firecrawl declines or errors.',
    ],
    sinceDate: JINA_SINCE,
    vendorPolicyUrl: 'https://jina.ai/legal',
  },
];

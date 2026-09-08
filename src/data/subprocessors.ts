// Ticket 0069 - canonical sub-processor list, extracted from the
// module-local `PROVIDERS` constant that previously lived in
// `src/pages/Trust.tsx` per the 2026-06-07 src-imports-tests lesson.
//
// Both the sibling `/trust` page and the new `/subprocessors` page read
// from this single source so their contents cannot drift. The `name` and
// `purpose` values are byte-identical to the /trust PROVIDERS array as of
// ticket 0018; the two additive columns `category` and `publicTrustUrl`
// are new and only used by the sub-processors table + JSON-LD.
//
// Every `publicTrustUrl` is the vendor's canonical publicly-reachable
// trust, privacy, or legal policy page - not a marketing URL and not a
// login-gated page. Each domain is already reachable from the visitor's
// browser regardless of this page, so publishing the list does not add a
// new first-party hostname.
//
// Per the 2026-05-07 em-dash Hard NO every string in this module uses
// hyphens; Self-Review greps the diff for U+2014 before pushing.

export interface Subprocessor {
  name: string;
  category: string;
  purpose: string;
  publicTrustUrl: string;
}

export const SUBPROCESSORS: readonly Subprocessor[] = [
  {
    name: 'OpenAI',
    category: 'Large language model',
    purpose: 'GPT-4o powers chat, vision, and streaming completions across every demo.',
    publicTrustUrl: 'https://openai.com/policies/privacy-policy',
  },
  {
    name: 'Vapi',
    category: 'Voice infrastructure',
    purpose: 'Voice infrastructure for browser WebRTC calls and outbound phone calls in the voice negotiator demo.',
    publicTrustUrl: 'https://vapi.ai/privacy',
  },
  {
    name: 'ElevenLabs',
    category: 'Text-to-speech',
    purpose: 'Neural text-to-speech (Cassidy voice, Turbo v2.5) used inside Vapi for the AI voice.',
    publicTrustUrl: 'https://elevenlabs.io/privacy',
  },
  {
    name: 'Deepgram',
    category: 'Speech-to-text',
    purpose: 'Speech-to-text (Nova-2) used inside Vapi to transcribe what callers say.',
    publicTrustUrl: 'https://deepgram.com/privacy',
  },
  {
    name: 'Firecrawl',
    category: 'Web scraping',
    purpose: 'Primary web scraper for the "enter your website" demo personalization flow.',
    publicTrustUrl: 'https://www.firecrawl.dev/privacy',
  },
  {
    name: 'Jina',
    category: 'Web scraping',
    purpose: 'Reader-mode fallback when Firecrawl is unavailable; same purpose, same flow.',
    publicTrustUrl: 'https://jina.ai/legal',
  },
  {
    name: 'Formspree',
    category: 'Email delivery',
    purpose: 'Receives newsletter sign-ups, the 5-day email course opt-in, and "email me this estimate" submissions.',
    publicTrustUrl: 'https://formspree.io/legal/privacy-policy',
  },
  {
    name: 'Sentry',
    category: 'Error tracking',
    purpose: 'Error tracking for browser-side exceptions so we can fix bugs visitors hit.',
    publicTrustUrl: 'https://sentry.io/privacy',
  },
  {
    name: 'Google Analytics',
    category: 'Analytics',
    purpose: 'Aggregated page-view and CTA-click counts (property G-JQ53W917HT).',
    publicTrustUrl: 'https://policies.google.com/privacy',
  },
];

// Ticket 0077 - canonical /ethics commitments list. Read by
// `src/pages/Ethics.tsx` and by `tests/e2e/ethics-page.spec.ts` per the
// 2026-06-07 src-imports-tests lesson so the visible cards and the spec
// count-assertion cannot drift.
//
// Every commitment is a dated hard-NO stance the vendor has already made
// implicit in shipped work or in AGENTS.md rules. No commitment on this list
// is invented for this ticket; each `sinceDate` cites a real shipped-work
// anchor (a shipped ticket date, an AGENTS.md rule date, or a docs/LESSONS.md
// date). The anchor is documented in the leading comment on each entry so a
// future editor can re-verify without trusting marketing copy.
//
// Per the 2026-05-07 em-dash Hard NO every string in this module uses
// hyphens; Self-Review greps the diff for U+2014 before pushing.
//
// Per the 2026-05-25 mirror-source rule the shape mirrored by the JSON-LD
// BreadcrumbList block in `src/pages/Ethics.tsx` lives here so a change to
// either surface is visible in a single diff.

export interface EthicsCommitment {
  /** Stable id for the DOM key and for any future anchor deep-link. */
  id: string;
  /** Short card headline. */
  title: string;
  /** One-sentence hard-NO stance rendered in bold. */
  stance: string;
  /** Two to four sentences of rationale. */
  rationale: string;
  /**
   * ISO YYYY-MM-DD date the commitment was first articulated in shipped code
   * or copy. Cites a real anchor; see the leading comment on each entry.
   */
  sinceDate: string;
}

export const ETHICS_COMMITMENTS: readonly EthicsCommitment[] = [
  // Anchor: AGENTS.md non-negotiable #3 ("no fake testimonials or invented
  // client names") lives in the AGENTS.md file first added on 2026-05-22 as
  // the fleet-standard successor to AGENT.md (the "The non-negotiables"
  // section codifies the rule). The 2026-05-22 two-PR-ship lesson in
  // docs/LESSONS.md is the earliest datestamp anchoring that day's
  // AGENTS.md rules.
  {
    id: 'no-fabricated-testimonials',
    title: 'We will not fabricate customer testimonials or reviews',
    stance:
      'Every quote, star rating, and named endorsement on the site comes from a real customer who consented in writing to being cited.',
    rationale:
      'Fabricated testimonials are the single most common integrity failure among AI vendors. Our on-site copy carries no placeholder quotes, no stock-photo faces, and no generated star counts. If a review or quote appears anywhere on this site, we can produce the original written consent for it on request.',
    sinceDate: '2026-05-22',
  },
  // Anchor: AGENTS.md non-negotiable #3 ("Conservative claims (50+, not
  // 500+). No fake testimonials or invented client names") in the 2026-05-22
  // AGENTS.md rules. Same rule family; separated because the two commitments
  // cover distinct patterns (endorsements vs. aggregate case-study numbers).
  {
    id: 'no-invented-case-study-numbers',
    title: 'We will not invent case-study numbers or client names',
    stance:
      'Aggregate numbers, ROI figures, and client names appear on the site only when they trace to a defensible source.',
    rationale:
      'Numbers like "500+ businesses served" or "10x ROI" are the second-most-common vendor integrity failure. Our conservative-claims rule is codified in AGENTS.md and enforced at review time. Where we quote a range or a benchmark, we cite the underlying methodology or link back to the shipped ticket that produced it.',
    sinceDate: '2026-05-22',
  },
  // Anchor: ticket 0036 /uptime shipped 2026-06-19 (see README index status
  // and the docs/LESSONS.md thread around that date; the ticket 0036
  // engineering close named "no fourth capture form" as a standing pattern).
  // The ticket 0018 /trust "no legalese, no popup, no claim that isn't
  // already true in the code" copy predates it (2026-05-25 window per the
  // trust-page ship log), so 2026-05-25 is the earliest defensible anchor.
  {
    id: 'no-dark-pattern-email-capture',
    title: 'We will not use dark-pattern email capture',
    stance:
      'No exit-intent popups, no forced signup walls, and no "your session will expire" modals blocking access to public pages.',
    rationale:
      'Every email field on this site is opt-in and clearly labeled. The three legitimate capture points (footer newsletter, 5-day email course opt-in, "email me this estimate" on the estimate demo) are enumerated on the /trust page. Any surface that pressures you to hand over an email to see the content is by construction a dark pattern; we do not ship them.',
    sinceDate: '2026-05-25',
  },
  // Anchor: ticket 0018 /trust page shipped in the 2026-05-25 window,
  // codifying the "what we never store on Digital Craft servers" section
  // and the enumerated browser-storage keys (dca_deal_, dca_demo_company_,
  // dca_visit_days_v1, dca_last_roi_result_v1). The /trust disclosure IS
  // the exhaustive list; anything not on it is not stored client-side either.
  {
    id: 'no-hidden-client-side-retention',
    title: 'We will not hide client-side data retention',
    stance:
      'Every localStorage and sessionStorage key we write is named on the /trust page with its shape and TTL.',
    rationale:
      'The /trust page enumerates every browser-storage key the app writes and what it holds. If a key is not in that list, the app does not write it. Clearing browser storage resets every one of them and no server-side copy persists. The /subprocessors table lists every third-party surface data may reach downstream.',
    sinceDate: '2026-05-25',
  },
  // Anchor: ticket 0029 shareable voice-call summary shipped in the
  // 2026-07-08 window (README index shipped status); the voice-negotiator
  // system prompt already enforced "the AI always identifies itself as AI
  // when asked" via src/utils/voicePromptGenerator.ts, which predates
  // ticket 0029 and traces to the original voice-demo ship (ticket window
  // around 2026-06-05). Earliest defensible anchor is 2026-06-05.
  {
    id: 'no-persona-misrepresentation-on-voice',
    title: 'We will not misrepresent the AI as human on voice demo calls',
    stance:
      'When you ask the voice agent whether it is a real person, it must say it is an AI.',
    rationale:
      'The voice negotiator system prompt requires the agent to identify itself as AI on request. This is a hard behavioral guardrail baked into the prompt at generation time, not a courtesy the agent may drop under pressure. The prompt template lives in src/utils/voicePromptGenerator.ts and every generated call inherits it.',
    sinceDate: '2026-06-05',
  },
  // Anchor: ticket 0069 /subprocessors shipped 2026-09-04 (README index
  // 0069 status). The subprocessors table lists every third-party data
  // recipient and their public trust URL; scraping-then-resale would
  // require adding a data broker to that table, which we have not done and
  // will not do.
  {
    id: 'no-scraped-data-resale',
    title: 'We will not sell or resell scraped first-party data to third parties',
    stance:
      'Company profiles scraped during a demo are used only for the demo session and are not sold, resold, or shared with a data broker.',
    rationale:
      'When you paste a URL into a demo, the scrape output lives in your browser and reaches only the AI providers listed on /subprocessors. No entry on that list is a data broker, and no entry receives scraped content for any purpose besides completing your demo request. Adding a new recipient requires editing the public /subprocessors table first.',
    sinceDate: '2026-09-04',
  },
  // Anchor: ticket 0015 "Email me this estimate" opt-in shipped 2026-05-24
  // window (README 0015 shipped status) with explicit consent as the only
  // path to email a result to yourself; ticket 0002 5-day course opt-in
  // (shipped earlier, 2026-05-23) established the same double-opt-in
  // pattern. Earliest defensible anchor is 2026-05-23.
  {
    id: 'no-auto-enrolled-email-sequences',
    title: 'We will not auto-enroll demo visitors in email sequences',
    stance:
      'Every marketing email you receive from us comes from an explicit opt-in you made on the site.',
    rationale:
      'Trying a demo does not enroll you in any email sequence. The three opt-in surfaces (footer newsletter, 5-day AI implementation email course, "email me this estimate") each state their purpose at the point of capture. Submissions go to Formspree and are handled as plain email, not as a tracked sequence; reply STOP to any reply and we will stop.',
    sinceDate: '2026-05-23',
  },
  // Anchor: ticket 0018 /trust "what we never store on Digital Craft
  // servers" section codified the promise that uploaded photos and
  // scraped content stay session-scoped (2026-05-25 window). No later
  // ticket expanded server-side retention beyond the /trust list.
  {
    id: 'no-marketing-use-of-visitor-uploads',
    title: 'We will not use your uploaded photos or scraped website content for marketing',
    stance:
      'Property photos, invoice uploads, and scraped website copy provided during a demo are used only to run that demo session.',
    rationale:
      'Anything you paste, upload, or scrape into a demo lives in your browser session and reaches only the AI provider needed to complete the demo call. We do not repurpose it for training, marketing collateral, social posts, or public case studies. If we ever want to feature your work in a case study, we ask for and receive explicit written consent first (see the no-fabricated-testimonials commitment above).',
    sinceDate: '2026-05-25',
  },
];

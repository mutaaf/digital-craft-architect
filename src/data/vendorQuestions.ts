// Ticket 0067 - Mechanical extraction of the VENDOR_QUESTIONS array and the
// VendorQuestion type from src/pages/QuestionsToAskAnAiVendor.tsx (ticket 0061).
// Per the 2026-06-07 src-imports-tests lesson, canonical constants live in
// src/data/ so multiple production surfaces can consume them without going
// through tests/e2e/. Per the 2026-05-25 mirror-source rule this is the single
// source of truth for the buyer-side vendor question set; both
// QuestionsToAskAnAiVendor.tsx (as a checklist) and VendorScorecard.tsx (as a
// printable scoring grid) import from here so a future copy edit updates both
// surfaces AND the sibling FAQPage JSON-LD in one place.
//
// Values are byte-identical to the original 2026-09-05 declaration; if a copy
// edit is ever needed it belongs in its own content ticket, not in this
// mechanical move.

export interface VendorQuestion {
  id: string;
  question: string;
  whyItMatters: string;
  ourAnswerHref?: string;
  ourAnswerLabel?: string;
}

// 11 questions covering the required topic set from ticket 0061: data handling,
// model/provider transparency, pricing model and churn, deployment process,
// what breaks when AI is wrong, uptime track record, ship velocity, comparable
// vendor comparisons, exit and data export, security posture, defensible
// efficacy claims, cross-vertical generalization. Topics are merged where
// honest (efficacy + cross-vertical sit naturally as two distinct questions).
export const VENDOR_QUESTIONS: readonly VendorQuestion[] = [
  {
    id: 'data-handling',
    question: 'Where exactly does my customer data go, and which third parties touch it?',
    whyItMatters:
      'Any AI vendor either routes your calls and chats through their own infrastructure or proxies them to one or more model providers (OpenAI, Anthropic, Vapi, Deepgram, ElevenLabs, and so on). A vendor that cannot name the exact list of third parties and the exact data each one sees is either hiding a longer list than they want to admit or has never audited their own data flow. Either answer should slow you down. Ask for the list in writing and ask which of those third parties retain prompts or transcripts for model training.',
    ourAnswerHref: '/trust',
    ourAnswerLabel: 'See our data-handling page',
  },
  {
    id: 'model-provider',
    question: 'Which AI model and which provider powers each surface, and can I see it change in your changelog?',
    whyItMatters:
      'The honest answer names a specific model and a specific provider per surface (chat uses one provider, voice uses another, transcription uses a third). A vendor that says only "we use AI" or "we use the best model for the job" is either obfuscating the cost structure or has not designed the system carefully enough to track which model handles which task. Ask for the names. Ask how you would learn when they change a model under you.',
    ourAnswerHref: '/changelog',
    ourAnswerLabel: 'Read our changelog',
  },
  {
    id: 'pricing-model',
    question: 'How is pricing structured, and what happens to my data and access if I stop paying?',
    whyItMatters:
      'A flat monthly fee, a per-conversation fee, and a per-minute voice fee all behave very differently when your call volume spikes or your team churns. A vendor that will not write down the unit they bill on (per conversation, per minute, per active user, per workflow) is preserving the option to reprice you after you depend on them. Ask the same vendor what happens to your saved transcripts, your trained prompts, and your phone-number forwarding the day you stop paying.',
  },
  {
    id: 'deployment-process',
    question: 'What does the first 30 days actually look like, step by step?',
    whyItMatters:
      'A real deployment process names the discovery call, the success metric you agree on in writing, the single funnel the pilot will touch, the guardrails you sign off on before the AI goes live, and the weekly check-in cadence. A vendor whose first 30 days collapse into "we will get you set up" has not deployed enough times to know what the first 30 days actually look like. Ask for the written playbook before the second sales call.',
    ourAnswerHref: '/playbook',
    ourAnswerLabel: 'Read our playbook',
  },
  {
    id: 'failure-mode',
    question: 'What happens when the AI is wrong on a real customer, and how would I find out?',
    whyItMatters:
      'Every production AI system mishandles real conversations sometimes. The honest vendor will describe the specific failure modes they have seen (an AI that booked a duplicate appointment, an AI that quoted an out-of-scope job, an AI that misheard a phone number on a noisy call) and the specific guardrails and human-in-the-loop escalation paths in place. A vendor whose answer is "our AI does not get things wrong" is either lying or has never shipped to a real production funnel.',
  },
  {
    id: 'uptime-track-record',
    question: 'What has your uptime actually been over the past 90 days, and where can I read the incident history?',
    whyItMatters:
      'A real uptime number is a public page with timestamps and incident notes a buyer can audit without a login. A vendor that quotes "99.9% uptime" with no public page is quoting a marketing number, not an operational one. Ask for the URL of the public status page and ask how long the last incident lasted.',
    ourAnswerHref: '/uptime',
    ourAnswerLabel: 'See our uptime page',
  },
  {
    id: 'ship-velocity',
    question: 'How often do you ship changes, and where do I read what shipped last week?',
    whyItMatters:
      'A vendor that ships weekly improvements is investing in the product; a vendor whose last public ship note is six months old is probably investing in sales instead. Ask for the changelog URL. Read the last four entries. Pattern-match the ratio of customer-facing improvements to internal refactors.',
    ourAnswerHref: '/changelog',
    ourAnswerLabel: 'Read our changelog',
  },
  {
    id: 'vendor-comparison',
    question: 'Who do you lose deals to, and where on your own site do you compare yourself against them honestly?',
    whyItMatters:
      'A vendor that maintains public side-by-side comparisons against the two or three competitors they most often lose to is operating from a position of "we know what we are good at and where we are not the right fit." A vendor whose answer is "we are the best at everything" or who refuses to name a comparable competitor is hiding either the cost difference or a feature gap. Ask for the comparison page URL.',
    ourAnswerHref: '/compare',
    ourAnswerLabel: 'See our comparison hub',
  },
  {
    id: 'exit-terms',
    question: 'On the day I cancel, how do I export my transcripts, prompts, contacts, and integrations?',
    whyItMatters:
      'Exit terms are the single best predictor of how a vendor treats long-tenured customers, because they are the one clause a vendor writes when they are negotiating against their own incentive to lock you in. Ask for the data-export format (CSV, JSON, a downloadable archive), the time window (same day, 30 days, no guarantee), and the call-forwarding handoff process so your real phone number is yours, not theirs.',
  },
  {
    id: 'security-posture',
    question: 'What is your security posture, and what would I tell my own security team about you?',
    whyItMatters:
      'A vendor that has thought about security can name the data each third party sees, the encryption at rest and in transit, the retention windows on transcripts and recordings, whether prompts feed any provider training data, and the breach-notification timeline. A vendor whose security answer is one sentence is either pre-revenue or has not been asked the question by a buyer with a security team. If you have a security team, ask the vendor to fill out your real questionnaire.',
    ourAnswerHref: '/trust',
    ourAnswerLabel: 'See our data-handling page',
  },
  {
    id: 'defensible-claims',
    question: 'Which of your efficacy claims can you defend with a specific customer and a specific number?',
    whyItMatters:
      'Any vendor whose homepage claims "10x more leads" or "90% answer rate" should be able to name the specific customer, the specific time window, and the specific baseline that produced the number. A vendor that cannot attach a real customer name to a real number is showing you a marketing claim, not a result. Ask for one defensible case study with the customer reachable for a reference call.',
  },
];

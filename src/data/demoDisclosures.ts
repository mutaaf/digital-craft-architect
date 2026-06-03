// Ticket 0033 - Per-demo "what we store" disclosure chip linked to /trust.
//
// Static per-path disclosure facts surfaced inline on each demo page so a
// visitor about to type real customer data sees, in two sentences, what
// THIS demo writes to browser storage and what it sends to which providers.
// Every storage-key string and every provider name below also appears in
// the rendered body of src/pages/Trust.tsx (the e2e spec asserts the
// overlap); the 2026-05-25 mirror-source lesson applies, so any future
// edit to a provider name or storage key here must be reflected on /trust.
//
// A module-load assertion throws if a key in this map is not also in
// KNOWN_PATHS from src/utils/recentDemosStore.ts so a renamed demo cannot
// strand a chip mount with no matching disclosure entry.

import { KNOWN_PATHS } from '@/utils/recentDemosStore';

export interface DemoDisclosure {
  storageKeys: string[];
  serverSendsTo: string[];
  neverStored: string[];
}

// Shared disclosure for chat-style lead-qualification demos (LeadResponder).
// Browser-only chat thread, GPT-4o via our serverless proxy, scraped company
// profile lives in localStorage under a per-vertical key.
const LEAD_CHAT: DemoDisclosure = {
  storageKeys: ['dca_demo_company_<vertical>'],
  serverSendsTo: ['OpenAI'],
  neverStored: ['the chat transcript on Digital Craft servers'],
};

// Shared disclosure for estimate-style calculators (EstimateGenerator).
// Inputs stay in the browser; only the optional "email me this estimate"
// path crosses our serverless layer to Formspree.
const ESTIMATE_CALC: DemoDisclosure = {
  storageKeys: ['dca_demo_company_<vertical>'],
  serverSendsTo: ['Formspree (only if you email yourself the estimate)'],
  neverStored: ['your estimate inputs or results on Digital Craft servers'],
};

// Shared disclosure for voice-negotiator demos (VoiceNegotiator,
// VoiceBookingAgent). Audio flows through Vapi which uses Deepgram for STT
// and ElevenLabs for TTS; the live transcript is summarized once via OpenAI.
const VOICE_CALL: DemoDisclosure = {
  storageKeys: ['dca_demo_company_<vertical>', 'dca_deal_<hash>'],
  serverSendsTo: ['OpenAI', 'Vapi', 'Deepgram', 'ElevenLabs'],
  neverStored: ['the call audio or live transcript on Digital Craft servers'],
};

// Shared disclosure for deal-analyzer flows (PropertyNegotiator).
// 4-step GPT-4o pipeline; URL scraping via Firecrawl with Jina fallback;
// AI response cache in sessionStorage with 30-minute TTL.
const DEAL_ANALYZER: DemoDisclosure = {
  storageKeys: ['dca_demo_company_<vertical>', 'dca_deal_<hash>'],
  serverSendsTo: ['OpenAI', 'Firecrawl', 'Jina'],
  neverStored: ['your scraped listing or analysis on Digital Craft servers'],
};

// Shared disclosure for catalog-style demos (ContractDrafter, MarketAnalyzer,
// InvoiceGenerator, SMSSequence, LeadScoring, ReviewSystem, ProposalGenerator,
// InquiryQualifier). One GPT-4o round-trip through our serverless proxy.
const SERVERLESS_AI: DemoDisclosure = {
  storageKeys: ['dca_demo_company_<vertical>'],
  serverSendsTo: ['OpenAI'],
  neverStored: ['your demo inputs or outputs on Digital Craft servers'],
};

export const DEMO_DISCLOSURES: Readonly<Record<string, DemoDisclosure>> = {
  // Construction
  '/construction/demo/lead-responder': LEAD_CHAT,
  '/construction/demo/estimate': ESTIMATE_CALC,
  '/construction/demo/invoice': SERVERLESS_AI,
  '/construction/demo/sms-sequence': SERVERLESS_AI,
  '/construction/demo/lead-scoring': SERVERLESS_AI,
  '/construction/demo/reviews': SERVERLESS_AI,
  '/construction/demo/property-negotiator': DEAL_ANALYZER,
  '/construction/demo/voice-negotiator': VOICE_CALL,
  // Real Estate
  '/realestate/demo/lead-responder': LEAD_CHAT,
  '/realestate/demo/property-negotiator': DEAL_ANALYZER,
  '/realestate/demo/contract': SERVERLESS_AI,
  '/realestate/demo/market-analysis': SERVERLESS_AI,
  '/realestate/demo/voice-negotiator': VOICE_CALL,
  // Events
  '/events/demo/inquiry': LEAD_CHAT,
  '/events/demo/proposal': SERVERLESS_AI,
  '/events/demo/voice-booking': VOICE_CALL,
  // Home Services
  '/homeservices/demo/lead-responder': LEAD_CHAT,
  '/homeservices/demo/estimate': ESTIMATE_CALC,
  '/homeservices/demo/voice-followup': VOICE_CALL,
  // Healthcare
  '/healthcare/demo/intake': LEAD_CHAT,
  '/healthcare/demo/scheduler': SERVERLESS_AI,
  '/healthcare/demo/voice-followup': VOICE_CALL,
  // Legal
  '/legal/demo/intake': LEAD_CHAT,
  '/legal/demo/consultation': SERVERLESS_AI,
  '/legal/demo/voice-followup': VOICE_CALL,
  // Restaurant
  '/restaurant/demo/reservations': LEAD_CHAT,
  '/restaurant/demo/catering': ESTIMATE_CALC,
  '/restaurant/demo/reviews': SERVERLESS_AI,
  // Kids Play
  '/kidsplay/demo/party-booker': LEAD_CHAT,
  '/kidsplay/demo/packages': ESTIMATE_CALC,
  '/kidsplay/demo/voice-booking': VOICE_CALL,
  // Fitness
  '/fitness/demo/lead-qualifier': LEAD_CHAT,
  '/fitness/demo/membership': ESTIMATE_CALC,
  '/fitness/demo/voice-retention': VOICE_CALL,
  // Dental
  '/dental/demo/intake': LEAD_CHAT,
  '/dental/demo/estimate': ESTIMATE_CALC,
  '/dental/demo/voice-recall': VOICE_CALL,
  // Salon
  '/salon/demo/booking': LEAD_CHAT,
  '/salon/demo/services': ESTIMATE_CALC,
  '/salon/demo/voice-rebook': VOICE_CALL,
  // Auto Repair
  '/autorepair/demo/advisor': LEAD_CHAT,
  '/autorepair/demo/estimate': ESTIMATE_CALC,
  '/autorepair/demo/voice-reminder': VOICE_CALL,
};

// Module-load assertion: every key in DEMO_DISCLOSURES must also be in
// KNOWN_PATHS so a renamed or removed demo route cannot strand a chip mount
// without a matching disclosure entry (and vice versa: the spec asserts the
// chip renders on 4 representative routes drawn from this map).
for (const path of Object.keys(DEMO_DISCLOSURES)) {
  if (!KNOWN_PATHS.has(path)) {
    throw new Error(
      `demoDisclosures: path "${path}" is not in KNOWN_PATHS (src/utils/recentDemosStore.ts). ` +
        `Add it to KNOWN_PATHS or remove it from DEMO_DISCLOSURES.`,
    );
  }
}

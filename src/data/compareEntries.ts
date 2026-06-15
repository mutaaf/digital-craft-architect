// Ticket 0048 - canonical source of truth for the /compare hub. Both the
// rendered grid in src/pages/CompareHub.tsx AND the ItemList JSON-LD
// `itemListElement` array read from this single constant so a new
// comparison appended here surfaces automatically in both surfaces (the
// 2026-05-25 mirror-source rule). Each `path` must exist in
// src/data/routes.ts ROUTES; the new e2e spec asserts that membership at
// runtime. Taglines are factual one-liners sourced from the intro
// paragraph of the matching /compare/* page so the hub copy and the
// comparison page stay in sync. No em-dashes (2026-05-07 Hard NO); use
// hyphens for dash-style separators.

export interface CompareEntry {
  /** Stable identifier, also used as the React list key. */
  id: string;
  /** Display name of the incumbent tool (as it appears on the matching page). */
  tool: string;
  /** Path of the matching /compare/<tool> route registered in src/data/routes.ts. */
  path: string;
  /** Factual one-line positioning summary; no inflated claims, no em-dash. */
  tagline: string;
}

export const COMPARE_ENTRIES: readonly CompareEntry[] = [
  {
    id: 'hubspot',
    tool: 'HubSpot',
    path: '/compare/hubspot',
    tagline: 'HubSpot is the all-in-one marketing platform. Digital Craft is the specialized AI automation layer for service businesses.',
  },
  {
    id: 'gohighlevel',
    tool: 'GoHighLevel',
    path: '/compare/gohighlevel',
    tagline: 'GoHighLevel is the all-in-one agency CRM. Digital Craft is the pre-built AI agent stack for service-industry owners.',
  },
  {
    id: 'zapier',
    tool: 'Zapier',
    path: '/compare/zapier',
    tagline: 'Zapier wires systems together for technical users. Digital Craft ships pre-built AI agents that work on day one.',
  },
  {
    id: 'make',
    tool: 'Make',
    path: '/compare/make',
    tagline: 'Make is a visual automation builder. Digital Craft is the pre-built AI agent layer that handles the work workflows cannot.',
  },
  {
    id: 'intercom',
    tool: 'Intercom',
    path: '/compare/intercom',
    tagline: 'Intercom is built for SaaS support teams. Digital Craft is built for service businesses where most leads still come in by phone.',
  },
  {
    id: 'jobber',
    tool: 'Jobber',
    path: '/compare/jobber',
    tagline: 'Jobber is the SMB field-service CRM. Digital Craft is the AI agent layer that captures and qualifies the leads Jobber was never built to handle.',
  },
  {
    id: 'servicetitan',
    tool: 'ServiceTitan',
    path: '/compare/servicetitan',
    tagline: 'ServiceTitan is the high-end field-service CRM with dispatch and payments. Digital Craft is the AI conversation layer that answers and qualifies leads.',
  },
  {
    id: 'podium',
    tool: 'Podium',
    path: '/compare/podium',
    tagline: 'Podium is the SMS, review, and inbox platform for local businesses. Digital Craft is the AI agent layer that adds voice answering and included lead chat.',
  },
  {
    id: 'housecallpro',
    tool: 'Housecall Pro',
    path: '/compare/housecallpro',
    tagline: 'Housecall Pro is the field-service platform with dispatch and a real technician mobile app. Digital Craft is the AI agent layer that adds voice answering and included lead chat.',
  },
  {
    id: 'buildertrend',
    tool: 'Buildertrend',
    path: '/compare/buildertrend',
    tagline: 'Buildertrend is the residential-construction project-management platform. Digital Craft is the AI front-of-funnel layer that adds voice negotiation and included lead chat.',
  },
  {
    id: 'thumbtack',
    tool: 'Thumbtack',
    path: '/compare/thumbtack',
    tagline: 'Thumbtack sells you leads. Digital Craft is the AI agent layer that books the leads you already have.',
  },
  {
    id: 'angi',
    tool: 'Angi',
    path: '/compare/angi',
    tagline: 'Angi sells you shared leads. Digital Craft is the AI agent layer that books the leads you already have.',
  },
];

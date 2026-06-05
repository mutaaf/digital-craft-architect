// Ticket 0036 - typed registry of the public serverless surfaces that the
// /uptime page probes. Each entry's `probePath` MUST be an EXISTING /api/*
// route already used by the running site (no new probe endpoint - AGENTS.md
// Hard NO on /api/ edits). Each `trustAnchor` MUST resolve to a section id
// in src/pages/Trust.tsx; the uptime-page e2e spec asserts every anchor is
// present on /trust (mirror-source rule per the 2026-05-25 lesson).
//
// Adding a surface: append an entry below, verify the route exists under
// api/*.ts, verify the trustAnchor matches a SECTIONS id in Trust.tsx, run
// the local gate. Removing a surface: also drop any matching incidents in
// uptimeIncidents.ts (the module-load assertion there will throw on drift).

export type UptimeProbeMethod = 'HEAD' | 'OPTIONS' | 'GET';

export interface UptimeSurface {
  id: string;
  name: string;
  description: string;
  probePath: string;
  method: UptimeProbeMethod;
  trustAnchor: string;
}

export const UPTIME_SURFACES: readonly UptimeSurface[] = [
  {
    id: 'ai-chat',
    name: 'AI chat',
    description: 'The streaming OpenAI proxy that powers the lead-responder chat across every demo.',
    probePath: '/api/stream',
    method: 'OPTIONS',
    trustAnchor: 'never-stored',
  },
  {
    id: 'web-scraping',
    name: 'Website scraping',
    description: 'The Firecrawl + Jina proxy that personalizes a demo to a visitor-supplied URL.',
    probePath: '/api/scrape',
    method: 'OPTIONS',
    trustAnchor: 'scraped-website-data',
  },
  {
    id: 'voice-infra',
    name: 'Voice infrastructure',
    description: 'The Vapi feature-flag check that controls browser and outbound phone calls.',
    probePath: '/api/vapi-status',
    method: 'GET',
    trustAnchor: 'voice-call-audio',
  },
  {
    id: 'call-summary',
    name: 'Call summary',
    description: 'The post-call OpenAI summarizer that produces the structured negotiation recap.',
    probePath: '/api/call-summary',
    method: 'OPTIONS',
    trustAnchor: 'voice-call-audio',
  },
] as const;

export type UptimeStatus = 'green' | 'yellow' | 'red' | 'unknown';

# Architecture Decision Records

This document captures key decisions made during development, their context, and rationale.

---

## ADR-001: Vercel Serverless Functions as Backend

### Status
Accepted

### Context
The app needs to call OpenAI, Vapi, Firecrawl, and other APIs that require secret keys. A traditional backend (Express, Fastify) would add deployment complexity.

### Decision
Use Vercel Serverless Functions in the `/api/` directory as the entire backend layer.

### Rationale
1. Zero-config deployment — functions deploy alongside the frontend
2. API keys stay server-side, never reaching the browser
3. Per-endpoint timeout control (`maxDuration: 10-60`)
4. No server infrastructure to manage
5. Natural fit since the frontend is already deployed on Vercel

### Implementation
Each file in `api/` exports a default handler function with `VercelRequest`/`VercelResponse` types. The `vercel.json` rewrites pass `/api/*` through to the functions.

### Consequences
- Cold starts can add 1-2s latency on first call
- Limited to 10-minute max execution time (Vercel Pro)
- No WebSocket support (polling used for phone call status instead)
- Each function is isolated — no shared in-memory state

---

## ADR-002: Proxy All AI Calls Through Server

### Status
Accepted

### Context
OpenAI and Vapi API keys must not be exposed to the browser. CORS restrictions also block direct browser-to-API calls for some services.

### Decision
Every AI API call goes through a Vercel serverless function. The frontend calls `/api/chat`, `/api/stream`, `/api/vapi-*` etc.

### Rationale
1. API keys stay in Vercel environment variables
2. Eliminates CORS issues (same-origin requests)
3. Allows server-side rate limiting and error normalization
4. SSE streaming works through the proxy (`api/stream.ts`)

### Implementation
- `api/chat.ts` — non-streaming GPT-4o proxy
- `api/stream.ts` — SSE streaming proxy
- `api/vapi-assistant.ts` — creates Vapi assistants server-side
- `api/scrape.ts` — web scraping with Firecrawl/Jina

### Consequences
- Slight latency overhead from the extra hop
- All AI costs are centralized under one API key
- Easy to add logging, caching, or rate limiting later

---

## ADR-003: Company Customization via Website Scraping

### Status
Accepted

### Context
The key selling proposition is showing prospects what AI would look like for *their* company. Manual data entry would be too much friction.

### Decision
Users paste their website URL. The app scrapes it (Firecrawl primary, Jina fallback), feeds the content to GPT-4o to extract a `CompanyProfile`, and stores it in sessionStorage via `DemoContext`.

### Rationale
1. One-click personalization creates a "wow" moment
2. Firecrawl handles JS-rendered sites; Jina handles simpler pages
3. GPT-4o reliably extracts company name, services, contact info, branding from raw markdown
4. sessionStorage keeps it ephemeral (clears when tab closes)

### Implementation
`src/utils/websiteScraper.ts` → `api/scrape.ts` → `api/chat.ts` → `DemoContext`

### Consequences
- Scraping can fail for heavily protected sites (Cloudflare, etc.)
- GPT-4o extraction is ~90% accurate; some fields may need manual correction
- Dual scraper fallback (Firecrawl → Jina) adds resilience

---

## ADR-004: Three Voice Call Modes (Demo / Browser / Phone)

### Status
Accepted

### Context
Voice AI demos need to work for everyone — even without a Vapi account. But production use needs real outbound phone calls.

### Decision
Implement three modes with automatic fallback:
1. **Demo mode** — simulated conversation (no API keys needed)
2. **Browser mode** — Vapi WebRTC (needs `VAPI_PUBLIC_KEY`)
3. **Phone mode** — outbound call (needs `VAPI_PHONE_NUMBER_ID`)

### Rationale
1. Demo mode lets anyone try the product without configuration
2. Browser mode is instant and free for testing
3. Phone mode is the production use case
4. Graceful degradation: phone → browser → demo

### Implementation
`useVoiceCall.ts` checks `api/vapi-status` to determine available mode. Phone calls use REST polling (`vapi-call-status` every 3s). Browser calls use the Vapi Web SDK event system.

### Consequences
- Phone call transcripts arrive via polling with 3s delay (not real-time)
- Demo mode uses AI-generated or pre-baked conversation
- Three code paths to maintain

---

## ADR-005: TTS-Optimized Prompt Engineering

### Status
Accepted

### Context
ElevenLabs TTS reads "$340,000" as "dollar three four zero comma zero zero zero" and "Dr" as "Doctor". This made the voice agent sound robotic and broken.

### Decision
Pre-process all prompt content to spoken word form before it reaches the LLM. Write the system prompt in a conversational coaching style rather than a rules-heavy format.

### Rationale
1. `spokenDollars()` converts numeric amounts to "three forty thousand dollars"
2. `sanitizeDollars()` regex-replaces `$X,XXX` in free-text strategy strings
3. `expandAddress()` converts abbreviations (St→Street, Dr→Drive, TX→Texas)
4. Coaching-style prompt makes the LLM respond more naturally

### Implementation
`src/utils/voicePromptGenerator.ts` — three helper functions + conversational prompt template.

### Consequences
- Prompt is longer due to spoken-word numbers
- Works well for English; would need adaptation for other languages
- Users can override the prompt via the interactive editor in VoiceCallSetup

---

## ADR-006: Session-Based AI Response Caching

### Status
Accepted

### Context
The deal analyzer pipeline makes 4 sequential GPT-4o calls. Re-analyzing the same property shouldn't re-run all 4 calls.

### Decision
Cache AI responses in `sessionStorage` with a 30-minute TTL using djb2 hash keys.

### Rationale
1. Saves API costs on repeated analyses
2. sessionStorage clears naturally when the tab closes
3. djb2 hash is fast and collision-resistant enough for this use case
4. Auto-eviction (3 oldest entries) handles quota limits

### Implementation
`src/utils/aiCache.ts` — `cachedVision()` and `cachedStream()` wrap OpenAI calls.

### Consequences
- Stale results for up to 30 minutes (acceptable for property analysis)
- sessionStorage has ~5MB limit per origin
- Cache keys include full message content, so different prompts = different cache entries

---

## ADR-007: Vapi for Voice AI (Not Twilio + Custom TTS)

### Status
Accepted

### Context
The voice negotiator needs: outbound phone calls, real-time transcription, LLM-powered responses, natural TTS, and the ability to hang up the call programmatically.

### Decision
Use Vapi as the orchestration layer. Vapi handles the entire voice pipeline: phone calls, STT (Deepgram), LLM (GPT-4o), TTS (ElevenLabs), and call control.

### Rationale
1. Single integration instead of stitching together Twilio + Deepgram + OpenAI + ElevenLabs
2. Browser SDK for WebRTC demo calls
3. REST API for outbound phone calls
4. Built-in `endCall` function the AI can invoke
5. Configurable voice parameters (stability, speed, style)

### Implementation
- `api/vapi-assistant.ts` creates transient assistants with full voice config
- `api/vapi-call.ts` initiates outbound calls
- `@vapi-ai/web` SDK for browser calls
- Phone calls polled via `api/vapi-call-status.ts`

### Consequences
- Vendor lock-in to Vapi's API schema (field validation is strict — causes 400s when config is wrong)
- `silenceTimeoutSeconds` has an undocumented minimum (~10s)
- Phone call transcripts arrive via polling, not real-time events
- Monthly Vapi costs scale with call volume

---

## ADR-008: shadcn/ui as Component Library

### Status
Accepted

### Context
Need a comprehensive, accessible component library that integrates well with Tailwind CSS and allows full customization.

### Decision
Use shadcn/ui (Radix UI primitives + Tailwind styling) as the base component library.

### Rationale
1. Components are copied into the project (not npm dependency) — full ownership
2. Built on accessible Radix primitives
3. Tailwind-native styling matches the project's approach
4. Large component catalog: dialogs, forms, sliders, tabs, toasts, etc.

### Implementation
Components live in `src/components/ui/`. Class variance authority (`cva`) handles variant styles.

### Consequences
- Components are in-tree and need manual updates if upstream changes
- Full shadcn/ui component set included even if not all used (minor bundle impact)
- Consistent design language across all pages

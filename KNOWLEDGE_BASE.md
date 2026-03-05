# Digital Craft Architect - Knowledge Base

> A comprehensive reference document for developers and AI agents working on this codebase.

**See Also:**
- [CLAUDE.md](./CLAUDE.md) - High-level overview for AI assistants
- [docs/DECISIONS.md](./docs/DECISIONS.md) - Architecture decision records (ADRs)
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) - Version history and changes

---

## Quick Reference

### Tech Stack
| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Runtime | React | 18.3.1 | SPA, client-side routing |
| Language | TypeScript | 5.5.3 | Strict mode via tsconfig |
| Build | Vite | 5.4.1 | SWC plugin for fast HMR |
| Styling | Tailwind CSS | 3.4.11 | + tailwindcss-animate |
| Components | shadcn/ui (Radix) | Latest | Full component set |
| Icons | Lucide React | 0.462 | |
| State (server) | TanStack React Query | 5.56.2 | Retry 2x, stale 5min |
| State (client) | React Context | - | DemoContext (sessionStorage) |
| Forms | React Hook Form + Zod | 7.53 / 3.23 | |
| Routing | React Router DOM | 6.26.2 | |
| Charts | Recharts | 2.12.7 | |
| Backend | Vercel Serverless | - | Node.js, @vercel/node types |
| AI | OpenAI GPT-4o | - | Via /api/chat and /api/stream |
| Voice | Vapi Web SDK | 2.5.2 | @vapi-ai/web |
| Errors | Sentry | 7.77 | + session replay |
| SEO | react-helmet-async | 2.0.5 | |

### Key Commands
```bash
npm run dev          # Vite dev server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build (sourcemaps)
npm run lint         # ESLint
npm run preview      # Preview production build
```

---

## Feature Inventory

| # | Feature | Status | Key Files |
|---|---------|--------|-----------|
| 1 | Landing page (marketing) | Complete | `src/pages/Index.tsx`, `src/components/Hero.tsx` |
| 2 | Construction marketing page | Complete | `src/pages/Construction.tsx` |
| 3 | Real estate marketing page | Complete | `src/pages/RealEstate.tsx` |
| 4 | Events marketing page | Partial | `src/pages/Events.tsx` |
| 5 | Company website scraping | Complete | `src/utils/websiteScraper.ts`, `api/scrape.ts` |
| 6 | Demo company customization | Complete | `src/contexts/DemoContext.tsx` |
| 7 | AI Lead Responder chatbot | Complete | `src/pages/construction/LeadResponder.tsx` |
| 8 | Construction Estimate Generator | Complete | `src/pages/construction/EstimateGenerator.tsx` |
| 9 | Review Management System | Complete | `src/pages/construction/ReviewSystem.tsx` |
| 10 | Property Deal Analyzer (4-step pipeline) | Complete | `src/pages/construction/PropertyNegotiator.tsx` |
| 11 | AI Voice Negotiator (browser) | Complete | `src/pages/construction/VoiceNegotiator.tsx` |
| 12 | AI Voice Negotiator (phone) | Complete | `src/hooks/useVoiceCall.ts`, `api/vapi-call.ts` |
| 13 | Voice demo simulator (fallback) | Complete | `src/utils/voiceDemoSimulator.ts` |
| 14 | Conversation history + Call Again | Complete | `src/utils/conversationStore.ts` |
| 15 | Interactive prompt editor | Complete | `src/components/construction/negotiator/VoiceCallSetup.tsx` |
| 16 | Coaching panel (mid-call) | In Progress | `src/components/construction/negotiator/CoachingPanel.tsx` |
| 17 | Easter egg (snake game) | Complete | `src/components/EasterEgg.tsx` |

---

## Architecture Documentation

### AI Proxy Pattern

All OpenAI/Vapi calls are proxied through Vercel serverless functions. The frontend never sees API keys.

```
Browser → POST /api/chat → Vercel Function → OpenAI API
Browser → POST /api/stream → Vercel Function → OpenAI API (SSE)
Browser → POST /api/vapi-assistant → Vercel Function → Vapi API
Browser → Vapi Web SDK (with public key only)
```

### Deal Analyzer Pipeline (`src/utils/agentPipeline.ts`)

```
Input (URL / Image / Manual)
    │
    ▼
Step 1: EXTRACT ─── /api/scrape → /api/chat (GPT-4o Vision)
    │                Returns: PropertyData
    ▼
Step 2: COMPS ───── /api/chat (GPT-4o, JSON schema)
    │                Returns: ComparableProperty[]
    ▼
Step 3: ANALYZE ─── /api/chat (GPT-4o, JSON schema)
    │                Returns: NegotiationReport (with ROI projection)
    ▼
Step 4: MESSAGES ── /api/chat (GPT-4o)
    │                Returns: SellerMessage[] (3 types × 2 formats)
    ▼
AgentResult { property, comps, report, sellerMessages, elapsedMs }
```

Each step calls `onStepUpdate(stepIndex, 'working' | 'done' | 'error')` to update the UI timeline.

### Voice Call State Machine (`src/hooks/useVoiceCall.ts`)

```
idle ──[startCall]──→ configuring ──→ connecting ──→ ringing ──→ in_progress ──→ ended
  │                        │               │            │              │            │
  │                        │               │            │              │            ├─→ Summary generation
  │                        │               │            │              │            └─→ Auto-save to localStorage
  │                        └───────────────┴────────────┴──────────────┘
  │                                        ↓ (on error)
  └─────────────────────────────────────→ error
```

Three call modes:
1. **Demo**: `voiceDemoSimulator.ts` generates scripted conversation (AI-enhanced if Vapi available, pre-baked fallback otherwise)
2. **Browser**: Vapi Web SDK (`@vapi-ai/web`) — WebRTC, real-time transcript events
3. **Phone**: REST-based — `POST /api/vapi-call` starts call, polls `/api/vapi-call-status` every 3s, `POST /api/vapi-call-end` terminates

### Company Customization Flow

```
User enters URL → /api/scrape (Firecrawl/Jina) → markdown
    → /api/chat (GPT-4o) → CompanyProfile JSON
    → DemoContext (sessionStorage)
    → All demos render with company branding
```

### Caching Strategy (`src/utils/aiCache.ts`)

```
Request → djb2 hash of (messages + model) → check sessionStorage
    ├─ HIT (< 30 min old) → return cached
    └─ MISS → call OpenAI → store result → return
```

Key: `dca_deal_{hash}`, TTL: 30 minutes, Auto-evict: 3 oldest on quota exceeded.

---

## File Reference

### API Endpoints (`api/`)
```
api/
├── chat.ts              # POST — Non-streaming GPT-4o proxy (temp 0.4, 4096 tokens)
├── stream.ts            # POST — Streaming SSE GPT-4o proxy (temp 0.7, 1024 tokens)
├── scrape.ts            # POST — Web scraper: Firecrawl primary, Jina fallback
├── call-summary.ts      # POST — Transcript → structured CallSummary (JSON schema)
├── vapi-assistant.ts    # POST — Create Vapi assistant (ElevenLabs Cassidy voice)
├── vapi-call.ts         # POST — Initiate outbound phone call
├── vapi-call-status.ts  # GET  — Poll call status + transcript
├── vapi-call-end.ts     # POST — Terminate active call (DELETE /call/{id})
└── vapi-status.ts       # GET  — Feature flags (hasPublicKey, hasPhoneNumber)
```

### Pages (`src/pages/`)
```
pages/
├── Index.tsx                    # Landing page
├── Construction.tsx             # Construction vertical marketing
├── RealEstate.tsx               # Real estate vertical marketing
├── Events.tsx                   # Events vertical marketing
├── NotFound.tsx                 # 404
├── construction/
│   ├── DemoHub.tsx              # 5-card demo selector
│   ├── LeadResponder.tsx        # AI chatbot demo
│   ├── EstimateGenerator.tsx    # Cost calculator demo
│   ├── ReviewSystem.tsx         # Review management demo
│   ├── PropertyNegotiator.tsx   # Deal analyzer (4-step pipeline)
│   └── VoiceNegotiator.tsx      # Voice call demo (3 modes)
├── realestate/
│   └── RealEstateDemoHub.tsx    # 3-card demo selector
└── events/
    └── EventsDemoHub.tsx        # Events demo selector
```

### Voice Negotiator Components (`src/components/construction/negotiator/`)
```
negotiator/
├── VoiceCallSetup.tsx       # Bid range config, seller info, prompt editor
├── VoiceCallLive.tsx        # Active call UI: timer, transcript, waveform
├── VoiceCallSummary.tsx     # Post-call summary display
├── VoiceTranscript.tsx      # Scrollable transcript messages
├── AudioWaveform.tsx        # Animated waveform visualization
├── CoachingPanel.tsx        # Mid-call system message injection
├── ConversationHistory.tsx  # Past calls list with Call Again
├── PropertyInputPanel.tsx   # URL/image/manual property input
├── AgentTimeline.tsx        # 4-step pipeline progress display
├── CompsTable.tsx           # Comparable sales table
├── DealReportCard.tsx       # Negotiation report display
├── SellerOutreach.tsx       # Generated seller messages
├── FollowUpChat.tsx         # Post-analysis follow-up chat
├── ImageDropZone.tsx        # Drag-and-drop image upload
└── SpeedBanner.tsx          # Pipeline timing display
```

---

## Extension Points

### Adding a New Demo
1. Create page component in `src/pages/construction/NewDemo.tsx`
2. Add route in `src/App.tsx` wrapped in `<DemoContextProvider>`
3. Add card in `src/pages/construction/DemoHub.tsx` demos array
4. Add link in `src/components/construction/DemoNavbar.tsx` (both `CONSTRUCTION_LINKS` and `REALESTATE_LINKS` if applicable)
5. If the demo needs AI, create a serverless function in `api/` and a utility in `src/utils/`

### Adding a New Vertical (like Events)
1. Create `src/pages/NewVertical.tsx` marketing page
2. Create `src/pages/newvertical/NewVerticalDemoHub.tsx`
3. Add routes in `src/App.tsx`
4. Add section detection in `src/components/construction/DemoNavbar.tsx` (add new `isNewVertical` check and links array)

### Adding a New API Endpoint
1. Create `api/endpoint-name.ts` exporting a default handler function
2. Set `export const config = { maxDuration: N }` (10-60 seconds)
3. Use `req.body` for POST data, `req.query` for GET params
4. Always check `req.method` and return 405 for unsupported methods
5. The endpoint is automatically available at `/api/endpoint-name`

### Modifying the Voice Agent Behavior
1. Edit `src/utils/voicePromptGenerator.ts` — the `generateVoiceSystemPrompt()` function
2. All dollar amounts: use `spokenDollars()` helper
3. All addresses: use `expandAddress()` helper
4. Free-text fields: sanitize with `sanitizeDollars()` to catch `$X,XXX` patterns
5. Users can also override the prompt at runtime via the "Agent Instructions" editor in VoiceCallSetup

### Modifying the Vapi Voice Configuration
Edit `api/vapi-assistant.ts`:
- Voice: Change `voiceId` (ElevenLabs voice ID), `model`, `stability`, `similarityBoost`, `speed`, `style`
- Chunking: Inside `chunkPlan` — `minCharacters`, `punctuationBoundaries`
- Timing: `silenceTimeoutSeconds` (min ~10), `responseDelaySeconds`, `maxDurationSeconds`
- Transcription: `transcriber.model` (currently `nova-2`)

---

## Common Code Patterns

### Serverless Function Pattern
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  try {
    // ... handler logic
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: { message } });
  }
}
```

### GPT-4o with JSON Schema Pattern
```typescript
const resp = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages,
    temperature: 0.4,
    max_tokens: 4096,
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'schema_name', strict: true, schema: { ... } },
    },
  }),
});
```

### DemoContext Usage Pattern
```typescript
const { company, isCustomized, loadFromUrl, isLoading } = useDemoContext();
const name = company?.companyName || 'DigitalCraft AI';
```

### AI Cache Pattern
```typescript
import { cachedVision, cachedStream } from '@/utils/aiCache';

// Non-streaming with cache
const result = await cachedVision(messages, 'gpt-4o', 0.4, 4096);

// Streaming with cache
await cachedStream(messages, 0.7, 1024, (chunk) => { /* handle */ });
```

---

## Environment Variables

### Server-side (Vercel Dashboard)
```bash
OPENAI_API_KEY=sk-...          # Required — all AI calls
VAPI_API_KEY=...               # Required — Vapi server calls
VAPI_PUBLIC_KEY=...            # Required — browser SDK init
VAPI_PHONE_NUMBER_ID=...      # Optional — enables outbound phone calls
FIRECRAWL_API_KEY=fc-...      # Optional — web scraping (Jina fallback if absent)
```

### Client-side (`.env`)
```bash
VITE_APP_VERSION=1.0.0        # Optional — Sentry release tag
VITE_CONTENT_URL=             # Optional — remote content.json URL
```

---

## Vapi Configuration Quick Reference

Current voice assistant config in `api/vapi-assistant.ts`:

| Setting | Value | Notes |
|---------|-------|-------|
| LLM | GPT-4o | temp 0.85, maxTokens 150 |
| Voice | ElevenLabs Cassidy (56AoDkrOh6qfVPDXZ7Pt) | Turbo v2.5 |
| Stability | 0.4 | Lower = more variation |
| SimilarityBoost | 0.75 | |
| Speed | 0.95 | Slightly slower for naturalness |
| Style | 0.5 | |
| Transcriber | Deepgram Nova-2 | English |
| Silence Timeout | 10s | Min ~10, lower causes 400 |
| Max Duration | 600s (10 min) | |
| Response Delay | 0.8s (browser), 1.2s (phone) | |
| Chunk Min Chars | 30 | Buffers TTS input |
| endCallFunctionEnabled | true | AI can hang up |

---

## Development History

### Origins
Started as a Lovable-scaffolded Vite + React + shadcn/ui template. Initial commits focused on a config-driven SPA with case studies and a contact form for an AI consulting agency.

### Major Milestones
1. **Construction vertical** — Full marketing page + 5 demo tools (lead responder, estimate, reviews, deal analyzer, voice negotiator)
2. **Server-side scraping** — Moved from client-side to Firecrawl + Jina fallback to avoid CORS
3. **Deal Analyzer upgrade** — From simple analysis to 4-step agentic pipeline with vision, comps, ROI, and seller messages
4. **Vapi Voice Integration** — Browser WebRTC calls, then outbound phone calls, demo fallback mode
5. **Voice quality iteration** — Multiple voice swaps (paula → Rachel → Alexandra → Cassidy), TTS digit fixes, prompt rewrites for naturalness
6. **Real estate vertical** — Separate marketing page + shared demo infrastructure

---

*Last updated: 2026-03-03*
*Maintained by: Development Team & AI Agents*

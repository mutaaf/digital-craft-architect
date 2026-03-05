# Digital Craft Architect - AI Knowledge Base

> Marketing site + live AI demo platform for construction and real estate professionals.

**See Also:**
- [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md) - Detailed technical reference
- [docs/DECISIONS.md](./docs/DECISIONS.md) - Architecture decision records
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) - Version history and changes

## Project Overview

### What This Is
A React + TypeScript SPA that serves as both a marketing website and an interactive demo platform. Visitors from construction or real estate companies enter their website URL, the app scrapes and analyzes their site, then runs AI-powered demos personalized to their brand — including lead response chat, estimate generation, property deal analysis, and live AI voice negotiation calls.

### Why It Exists
- Demonstrate AI automation capabilities to traditional industry businesses
- Let prospects experience AI tools customized to their own company before buying
- Showcase voice AI negotiation, deal analysis, lead qualification, and review management

### Who It's For
- Construction company owners evaluating AI automation
- Real estate investors and agents exploring AI-powered deal analysis and outbound calling
- Event planning businesses (early stage vertical)

---

## Architecture Overview

### Tech Stack
| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React + TypeScript | 18.3 / 5.5 |
| Build | Vite + SWC | 5.4 |
| Styling | Tailwind CSS + shadcn/ui | 3.4 |
| State | React Query + Context + sessionStorage/localStorage | 5.56 |
| Backend | Vercel Serverless Functions (Node.js) | - |
| AI | OpenAI GPT-4o (chat, vision, streaming) | - |
| Voice | Vapi (browser WebRTC + outbound phone) | 2.5 |
| TTS | ElevenLabs via Vapi (Cassidy voice) | Turbo v2.5 |
| STT | Deepgram via Vapi (Nova-2) | - |
| Scraping | Firecrawl (primary) + Jina Reader (fallback) | - |
| Error Tracking | Sentry | 7.77 |
| Analytics | Google Analytics (G-JQ53W917HT) | - |

### Key Design Decisions
1. **All AI calls proxied through Vercel serverless** — API keys never reach the browser
2. **Company customization via URL scraping** — visitors see demos branded to their own company
3. **Voice calls support both browser (WebRTC) and outbound phone** — demo mode falls back to simulated conversation
4. **Session-based caching** — AI responses cached in sessionStorage with 30-min TTL to avoid redundant GPT calls
5. **Prompt engineering for TTS** — all dollar amounts converted to spoken words, addresses expanded, to prevent TTS from reading digits individually

---

## Directory Structure

```
/
├── api/                           # Vercel serverless functions
│   ├── chat.ts                    # OpenAI non-streaming proxy
│   ├── stream.ts                  # OpenAI SSE streaming proxy
│   ├── scrape.ts                  # Firecrawl + Jina web scraper
│   ├── call-summary.ts            # Post-call transcript summarizer
│   ├── vapi-assistant.ts          # Creates Vapi assistant (voice config)
│   ├── vapi-call.ts               # Initiates outbound phone call
│   ├── vapi-call-status.ts        # Polls call status + transcript
│   ├── vapi-call-end.ts           # Terminates active call
│   └── vapi-status.ts             # Feature-flag: Vapi availability
├── src/
│   ├── App.tsx                    # Router + providers
│   ├── main.tsx                   # Entry: Sentry init, React root
│   ├── contexts/DemoContext.tsx    # Company profile (sessionStorage)
│   ├── pages/                     # Route-level page components
│   ├── components/                # UI components (shadcn + custom)
│   ├── data/                      # TypeScript types + pricing data
│   ├── hooks/                     # useVoiceCall, useContent, etc.
│   └── utils/                     # AI pipelines, Vapi client, caching
└── vercel.json                    # SPA rewrites + API routes
```

---

## Key Files Reference

### Voice System (`src/utils/voicePromptGenerator.ts`)
Generates the system prompt for voice negotiations. Converts dollars to spoken words (`spokenDollars`), expands address abbreviations (`expandAddress`), builds a conversational coaching-style prompt with property data, comps, bid range, and negotiation tactics.

### Deal Analyzer Pipeline (`src/utils/agentPipeline.ts`)
Orchestrates 4 sequential GPT-4o calls: Extract property → Generate comps → Analyze deal → Draft seller messages. Supports URL scraping, image OCR, and manual input. All calls use JSON Schema enforcement.

### Voice Call Hook (`src/hooks/useVoiceCall.ts`)
Central state machine for voice calls. Handles three modes: demo (simulated), browser (WebRTC via Vapi SDK), phone (outbound via REST API with 3s polling). Manages transcript, call lifecycle, post-call summary generation, and conversation persistence.

### Vapi Client (`src/utils/vapiClient.ts`)
Wraps the Vapi Web SDK. Provides `initVapi()`, `startPhoneCall()`, `endPhoneCall()`, `pollCallStatus()`, and phone number normalization to E.164 format.

### Demo Context (`src/contexts/DemoContext.tsx`)
React context that stores company profile in sessionStorage. `loadFromUrl()` scrapes a website via `/api/scrape` and extracts company info via GPT-4o. All demo pages are wrapped in `DemoContextProvider`.

### AI Cache (`src/utils/aiCache.ts`)
sessionStorage cache using djb2 hash keys with `dca_deal_` prefix and 30-minute TTL. Wraps both streaming and non-streaming OpenAI calls. Auto-evicts oldest entries on quota exceeded.

---

## Common Tasks

### Running Locally
```bash
npm install
npm run dev          # Starts Vite dev server on port 8080
```

### Building for Production
```bash
npm run build        # Vite production build → dist/
npm run preview      # Preview production build locally
```

### Linting
```bash
npm run lint         # ESLint with React hooks + refresh plugins
```

### Deploying
Push to `main` branch — Vercel auto-deploys. Environment variables must be set in Vercel dashboard.

---

## Known Considerations

1. **Vapi `silenceTimeoutSeconds` has a minimum of ~10s** — setting it lower causes 400 errors on assistant creation
2. **Voice config fields are strict** — `inputMinCharacters`, `inputPunctuationBoundaries`, `useSpeakerBoost` are NOT valid top-level voice fields; chunking settings go inside `chunkPlan`
3. **TTS reads digits individually** — all dollar amounts must be converted to spoken words before reaching the prompt; use `spokenDollars()` and `sanitizeDollars()`
4. **Address abbreviations** — `Dr` is read as "Doctor" by TTS; `expandAddress()` converts to "Drive" etc.
5. **Hash symbol** — `#` is read as "hash" by TTS; the regex `/#\s*(\d+)/g` converts to "unit [number]"
6. **Phone calls require E.164 format** — `normalizePhoneNumber()` in vapiClient handles this
7. **Demo mode activates automatically** when `VAPI_PUBLIC_KEY` is not set — uses simulated conversation
8. **Company name fallback** — when `companyName` is "DigitalCraft AI" (default), the voice prompt and first message skip mentioning it

---

## Environment Variables

### Server-side (Vercel Dashboard)
| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes | All AI completions |
| `VAPI_API_KEY` | Yes | Vapi server-side calls |
| `VAPI_PUBLIC_KEY` | Yes | Browser SDK initialization |
| `VAPI_PHONE_NUMBER_ID` | No | Outbound phone calls (without this, only browser calls work) |
| `FIRECRAWL_API_KEY` | No | Web scraping (falls back to Jina if absent) |

### Client-side (`.env`)
| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_APP_VERSION` | No | Sentry release tag (defaults to `1.0.0`) |
| `VITE_CONTENT_URL` | No | Remote content.json URL |

---

## Testing

No test framework is currently configured. The project relies on manual testing and the Vite build step for type checking.

```bash
npm run build        # TypeScript compilation catches type errors
npm run lint         # ESLint catches code quality issues
```

---

## Deployment

- **Platform:** Vercel (auto-deploy on push to `main`)
- **SPA Routing:** `vercel.json` rewrites all non-API routes to `/index.html`
- **API:** Serverless functions in `/api/` directory, auto-deployed by Vercel
- **Function Timeouts:** 10-60 seconds depending on endpoint (set via `export const config = { maxDuration: N }`)

---

## Route Map

| Path | Page | Features |
|------|------|----------|
| `/` | Landing page | Hero, services, pricing, testimonials |
| `/construction` | Construction marketing | Pain points, solutions, pricing tiers |
| `/construction/demo` | Demo hub | Company setup + 5 demo cards |
| `/construction/demo/lead-responder` | AI chatbot | Streaming GPT-4o lead qualification |
| `/construction/demo/estimate` | Estimate tool | Interactive construction cost calculator |
| `/construction/demo/reviews` | Review system | SMS simulation, review dashboard |
| `/construction/demo/property-negotiator` | Deal analyzer | 4-step GPT-4o pipeline, comps, seller outreach |
| `/construction/demo/voice-negotiator` | Voice AI | Live voice negotiation (browser + phone) |
| `/realestate` | Real estate marketing | RE-specific pain points, pricing |
| `/realestate/demo` | RE demo hub | 3 demo cards (deals, voice, leads) |
| `/realestate/demo/*` | Shared demos | Same components as construction demos |

---

## Future Roadmap Ideas

1. Add automated tests (Vitest + Playwright)
2. Events vertical completion (demo hub exists but demos are limited)
3. Coaching panel for live voice calls (component exists, needs integration)
4. CRM integration for lead data export
5. Multi-language voice support
6. Call recording playback in conversation history

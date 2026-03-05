# Changelog

All notable changes to Digital Craft Architect.

## [Unreleased]

### Added
- Comprehensive project documentation (CLAUDE.md, KNOWLEDGE_BASE.md, docs/)
- Interactive "Agent Instructions" prompt editor in VoiceCallSetup
- Smart field omission — voice prompt skips company name when not customized

### Changed
- Rewrote voice system prompt from compliance-manual style to conversational coaching notes
- Fixed `#` regex to match `# 1113` and `#1113` variants (previously only `#1`)

---

## [Current] - 2026-03-03

### Core Features

#### Marketing Pages
- Landing page with hero, services, testimonials, pricing, and contact form
- Construction vertical marketing page with industry-specific pain points and solutions
- Real estate vertical marketing page with RE-specific pricing tiers
- Events vertical marketing page (early stage)
- Formspree-powered contact forms on all marketing pages

#### Company Customization
- Website URL scraping via Firecrawl (primary) + Jina Reader (fallback)
- GPT-4o company profile extraction from scraped content
- sessionStorage persistence via DemoContext
- URL parameter sharing (`?site=domain.com`) for shareable demo links

#### AI Lead Responder
- Streaming GPT-4o chatbot personalized to company profile
- Lead qualification scoring
- Chat history with message bubbles
- Lead summary panel

#### Construction Estimate Generator
- Interactive cost calculator with 5 project types
- 3 finish levels (Standard, Mid-Range, Premium)
- Line-item breakdown (demo, materials, labor, overhead, contingency)
- Add-on extras (permits, design consultation, demo & haul-away)

#### Review Management System
- SMS simulation with phone mockup UI
- Review request timeline visualization
- Review dashboard with metrics

#### Property Deal Analyzer
- 4-step agentic GPT-4o pipeline (Extract → Comps → Analyze → Messages)
- URL scraping, image OCR (GPT-4o Vision), and manual input
- Comparable sales analysis with price/sqft and price/acre metrics
- Full negotiation report with ROI projection
- 6 auto-generated seller outreach messages (3 types × 2 formats)
- Pipeline timing display and step-by-step progress UI

#### AI Voice Negotiator
- Three call modes: Demo (simulated), Browser (WebRTC), Phone (outbound)
- ElevenLabs Cassidy voice via Vapi (Turbo v2.5)
- Deepgram Nova-2 transcription
- Real-time transcript display during calls
- Post-call structured summary (GPT-4o analysis)
- Bid range slider with min/target/max configuration
- Conversation history with localStorage persistence
- "Call Again" for previously analyzed properties
- Interactive prompt editor for non-technical users

### Technical Decisions
- All AI calls proxied through Vercel serverless functions (see ADR-002)
- Session-based AI response caching with 30-min TTL (see ADR-006)
- TTS-optimized prompt engineering with spoken dollar conversion (see ADR-005)
- Three voice call modes with automatic fallback (see ADR-004)

---

## Version History (from git)

### Voice System Evolution
- `c692a0b` — Initial AI Voice Negotiator with Vapi integration and demo fallback
- `7b9b844` — Fix Vapi assistant creation: correct API field names
- `713ed7e` — Add outbound phone calls via Vapi REST API
- `70625ea` — Fix phone call error handling: normalize to E.164
- `db1af90` — Fix phone call transcript, auto-end detection, and summary generation
- `ff70d47` — Improve voice agent: wait for seller, natural voice, expand abbreviations
- `64d3c7c` — Improve voice naturalness, stop interruptions, collect email
- `17b1868` — Fix bid range slider, TTS price/address reading, add Call Again
- `84f646c` — Fix TTS reading digits individually, make negotiation more persistent
- `998dc28` — Switch to Alexandra voice
- `ae6f0f3` — Fix Vapi 400 error, route RE demos under /realestate
- `a475fb4` — Switch to Cassidy voice (current)
- `ef3c71b` — Add warm call close and reduce silence timeout
- `eea2514` — Fix negotiation bidding up and call not ending
- `12808ec` — Rewrite voice prompt as coaching notes, add interactive prompt editor

### Deal Analyzer Evolution
- `415ba29` — Upgrade Deal Analyzer to agentic 4-step pipeline
- `076b38b` — Move scraping server-side with Firecrawl + Jina fallback
- `5e24026` — Increase serverless function timeout to 60s
- `f4cdb71` — Route all OpenAI calls through Vercel serverless proxy

### Infrastructure
- `ebd4d04` — Rebrand default demo from 448 Developments to DigitalCraft AI
- `7d541f9` — Add "Open in Email/Messages" buttons to seller outreach cards
- `d991704` — Redesign Review System POC to show business impact

---

## Design Philosophy

### Principles
1. **Show, don't tell** — live interactive demos over static marketing copy
2. **Personalization creates conversion** — scraping a prospect's website makes demos feel custom-built
3. **Graceful degradation** — every feature works even without all API keys configured
4. **Voice-first AI** — the voice negotiator is the flagship demo; quality matters more than features
5. **Fast iteration** — Vite + Vercel + serverless enables rapid deploy cycles

### UX Decisions
- Demo pages share components across verticals (construction, real estate) to avoid duplication
- Voice call UI shows real-time transcript to build trust in the AI
- Post-call summary provides actionable next steps, not just a transcript dump
- Interactive prompt editor gives power users control without requiring code changes

---

## Future Considerations

### Potential Features
- [ ] Automated tests (Vitest for units, Playwright for E2E)
- [ ] Events vertical completion
- [ ] Mid-call coaching panel integration
- [ ] CRM export (HubSpot, Salesforce) for captured leads
- [ ] Multi-language voice support
- [ ] Call recording playback
- [ ] Webhook for post-call actions (auto-send follow-up email)
- [ ] A/B testing different voice personas

### Technical Debt
- [ ] No test suite — relies entirely on manual testing and type checking
- [ ] Bundle size (1.3MB gzipped 380KB) could benefit from code splitting
- [ ] Easter egg snake game adds ~unused code to bundle
- [ ] Some shadcn/ui components imported but never used
- [ ] `lovable-tagger` dev dependency may no longer be needed

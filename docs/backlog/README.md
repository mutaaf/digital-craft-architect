# Backlog

Ticket files are the source of truth for **status**; this index is the source of
truth for **ordering**. `scripts/check-backlog.mjs` (wired into the `build`
gating job) fails CI if they drift. Each ticket follows `_template.md`.

Priorities: P0 (do now) · P1 (next) · P2 (someday) · P3 (icebox).
Statuses: proposed · groomed · in-progress · shipped · rejected · needs-discovery.

| id | title | priority | status | area |
|----|-------|----------|--------|------|
| 0001 | UTM-personalized hero copy | P1 | shipped | conversion |
| 0002 | 5-day AI implementation email course opt-in | P1 | shipped | conversion |
| 0003 | Route-aware dynamic pricing CTA | P2 | shipped | conversion |
| 0004 | Client logo marquee (placeholders) | P2 | shipped | trust |
| 0005 | Add CI type-check gate (tsc --noEmit) | P1 | shipped | infra |
| 0006 | Footer silently missing on Glossary, Industries, and comparison pages | P1 | shipped | conversion |
| 0007 | Ratchet tsconfig strictness (zero-cost flags) | P1 | shipped | infra |
| 0008 | Enable strict tsconfig flag (zero-cost ratchet) | P1 | shipped | infra |
| 0009 | Shareable branded estimate result link | P1 | shipped | demos |
| 0010 | Resumable demo session with "Continue your demo" prompt | P1 | shipped | demos |
| 0011 | Crawlable /demos index hub with ItemList structured data | P2 | shipped | seo |
| 0012 | Emit FAQPage structured data for the visible pricing FAQ | P1 | shipped | seo |
| 0013 | Add DefinedTermSet structured data to the AI glossary | P2 | shipped | seo |
| 0014 | Persist and re-offer the visitor's last completed estimate | P2 | shipped | demos |
| 0015 | "Email me this estimate" lead capture on the estimate result | P2 | shipped | conversion |
| 0016 | Emit WebSite + SiteNavigationElement JSON-LD for sitelinks search box | P1 | shipped | seo |
| 0017 | AI-for-plumbers long-tail landing page funneling into home-services demos | P1 | shipped | content |
| 0018 | How-the-demos-work transparency page at /trust | P2 | shipped | trust |
| 0019 | Visible breadcrumbs and BreadcrumbList JSON-LD on every demo page | P2 | shipped | conversion |
| 0020 | AI-for-HVAC long-tail landing page funneling into home-services demos | P1 | shipped | content |
| 0021 | Comparison page "Digital Craft vs Jobber" for high-intent home-services compares | P1 | shipped | seo |
| 0022 | Emit lastmod timestamps in sitemap.xml so Google prioritizes recrawl of fresh routes | P2 | shipped | seo |
| 0023 | Footer "AI providers we use" trust chip linking to /trust | P2 | shipped | trust |
| 0024 | AI-for-roofers long-tail landing page funneling into home-services demos | P1 | shipped | content |
| 0025 | Emit Organization JSON-LD with sameAs and contactPoint on the homepage | P1 | shipped | seo |
| 0026 | Recently viewed demos recap strip on the /demos hub | P2 | shipped | demos |
| 0027 | "More like this" cross-vertical recommendations under each demo | P1 | shipped | demos |
| 0028 | Comparison page "Digital Craft vs ServiceTitan" for high-intent field-service compares | P1 | shipped | seo |
| 0029 | Shareable branded voice-call summary link | P2 | shipped | demos |
| 0030 | Emit SoftwareApplication JSON-LD on the /demos hub | P1 | shipped | seo |
| 0031 | "Try the next demo" pinned CTA on voice and estimate result screens | P1 | shipped | demos |
| 0032 | Public /changelog page surfacing weekly ship velocity to crawlers and repeat visitors | P2 | shipped | content |
| 0033 | Per-demo "what we store" disclosure chip linked to /trust | P2 | shipped | trust |
| 0034 | AI-for-electricians long-tail landing page funneling into home-services demos | P1 | shipped | content |
| 0035 | Comparison page "Digital Craft vs Podium" for high-intent SMS and review compares | P1 | shipped | seo |
| 0036 | Public /uptime page surfacing demo and serverless health for regulated-vertical buyers | P2 | shipped | trust |
| 0037 | AI-for-painters long-tail landing page funneling into home-services demos | P1 | shipped | content |
| 0038 | Comparison page "Digital Craft vs Housecall Pro" for high-intent field-service buyers | P1 | shipped | seo |
| 0039 | Emit Quiz JSON-LD on the AI Readiness Quiz for question-rich-result eligibility | P2 | shipped | seo |
| 0040 | "What's new since you visited" delta strip on the /demos hub for week-2-and-beyond returners | P2 | shipped | demos |
| 0041 | AI-for-landscapers long-tail landing page funneling into home-services demos | P1 | shipped | content |
| 0042 | Comparison page "Digital Craft vs Buildertrend" for high-intent construction-software switchers | P1 | groomed | seo |
| 0043 | Emit ItemList JSON-LD on /changelog so search engines can index individual ship entries | P1 | groomed | seo |
| 0044 | Emit AboutPage + BreadcrumbList JSON-LD on /trust so the data-handling disclosure indexes as a canonical artifact | P2 | groomed | seo |

> **Migration note.** This ticket-file backlog supersedes the inline checklist in
> `AGENT.md`. The four highest-leverage open items are converted here to seed the
> system; the remaining legacy Tier-7 items still live in `AGENT.md` and will be
> converted by the next groom pass (and the 96 shipped items are summarized in
> `ARCHIVE.md`, not re-created as files).

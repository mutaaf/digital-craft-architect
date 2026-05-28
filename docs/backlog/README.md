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
| 0023 | Footer "AI providers we use" trust chip linking to /trust | P2 | in-progress | trust |

> **Migration note.** This ticket-file backlog supersedes the inline checklist in
> `AGENT.md`. The four highest-leverage open items are converted here to seed the
> system; the remaining legacy Tier-7 items still live in `AGENT.md` and will be
> converted by the next groom pass (and the 96 shipped items are summarized in
> `ARCHIVE.md`, not re-created as files).

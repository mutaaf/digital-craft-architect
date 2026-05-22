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
| 0003 | Route-aware dynamic pricing CTA | P2 | groomed | conversion |
| 0004 | Client logo marquee (placeholders) | P2 | groomed | trust |
| 0005 | Add CI type-check gate (tsc --noEmit) | P1 | shipped | infra |

> **Migration note.** This ticket-file backlog supersedes the inline checklist in
> `AGENT.md`. The four highest-leverage open items are converted here to seed the
> system; the remaining legacy Tier-7 items still live in `AGENT.md` and will be
> converted by the next groom pass (and the 96 shipped items are summarized in
> `ARCHIVE.md`, not re-created as files).

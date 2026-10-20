---
id: 0122
title: CTO site copy follows the house rule - no em-dashes
status: shipped
priority: P3
area: content
created: 2026-10-20
owner: gtm-innovation
---

## User story

As a visitor reading cto.digitalcraftai.com, I want copy that reads like a person wrote it, so the page doesn't carry the tell-tale em-dash rhythm of generated text.

## Why now

AGENTS.md bans em-dashes in copy; the CTO page (IndexV2) predates the rule and still had about twenty. The owner approved removing them after the phone pass (0121).

## Acceptance criteria

- [x] No em-dash left in `src/pages/IndexV2.tsx` or `src/components/v2/LivePreviews.tsx` (copy, eyebrows, meta descriptions).
- [x] Section eyebrows use the house middle dot (`§ 01 · Outcomes`); sentences use commas or a colon; the quote attribution drops its dash.
- [x] Wording is otherwise unchanged; no claims or numbers change.

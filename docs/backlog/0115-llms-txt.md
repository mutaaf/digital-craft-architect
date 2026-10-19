---
id: 0115
title: Publish /llms.txt brief for AI agents, linking the founder's llms.txt
status: groomed
priority: P2
area: seo
created: 2026-10-19
owner: gtm-innovation
---

## User story

As a buyer who asks an AI assistant "what does DigitalCraft AI do and who is
behind it?", I want the assistant to read an accurate plain-text brief from
the site, so that the answer matches what the company actually sells.

## Why now (four lenses)

### Product Owner
mutaafaziz.com already publishes `llms.txt` and `resume.json`. This site, the
one that sells, has neither. One static file closes that gap.

### Stakeholder
It is the third piece of the founder-parity set (0113, 0114). The brief points
to `https://mutaafaziz.com/llms.txt` for the founder's facts instead of
duplicating them, so the two files cannot drift.

### User (in the real moment of use)
Invisible to humans, and correct for agents.

### Growth
LLM answer engines are a growing referral channel for "AI for contractors"
style queries.

## Acceptance criteria

- [ ] `public/llms.txt` exists. It starts with `# DigitalCraft AI` and a
      one-line `>` summary, then has sections: What we build (verticals and
      demos with their URLs), Engagements (fractional CTO at
      cto.digitalcraftai.com), Founder (one line, linking
      https://mutaafaziz.com/llms.txt), and Contact (calendly and email
      already on the site).
- [ ] It names no clients and makes no claims beyond copy already on the site.
- [ ] `GET /llms.txt` returns 200 as text/plain in the Vite preview, and is
      not rewritten to the SPA `index.html`.
- [ ] e2e: a request test asserts the status, content type, and the founder
      link.

## Out of scope

- An MCP server, and a resume.json for the company.

## Engineering notes

- Check whether the `vercel.json` SPA rewrite already excludes files that
  exist in `public/`. Vercel serves the filesystem first, so it likely does.
  Change `vercel.json` only if needed, and call it out in the PR.
- New deps: no.

## Implementation log

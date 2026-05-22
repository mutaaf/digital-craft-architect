# AGENTS.md — contributor guide for autonomous agents

The contract for any AI agent or human working on Digital Craft Architect. Read
it before changing a line. This is the fleet-standard successor to `AGENT.md`;
during the transition `AGENT.md` still holds the legacy inline backlog that the
old shell agents read. New work uses `docs/backlog/` ticket files.

## The non-negotiables

1. **The build must stay green.** `npm run build` plus every check (`check-links`,
   `check-images`, `check-meta`, `check-blog-dates`) and the e2e smoke suite pass
   before a PR merges.
2. **Never touch the no-touch zones.** `/api/` (serverless functions hold API
   keys), `.env*`, and — for the GTM queue — `package.json` / `package-lock.json`.
   Never hardcode an API key; never remove analytics.
3. **Brand voice is defensible, not hypey.** No em-dash character (`—`) in any
   copy written to React components or `src/data/blogPosts.ts`. Conservative
   claims (50+, not 500+). No fake testimonials or invented client names.
4. **Every blog post dates to today.** `YYYY-MM-DD`, no duplicates — the single
   most common silent failure. `check-blog-dates` gates it.
5. **Dark mode is mandatory.** Every new component ships `dark:` Tailwind
   variants. Use existing patterns + shadcn/ui.
6. **Small, focused changes.** ~200 lines of diff per PR (excl. blog content),
   one task per run.

## The loop

```
groom ──► ship ──► review ──► auto-merge ──► auto-deploy (Vercel on push to main)
(daily)   (hourly) (every 15m, votes; GitHub auto-merges on green + no block)
eng   ──► review ──► auto-merge   (every 6h; code quality, types, perf, test infra)
```

Backlog at `docs/backlog/` is the single source of truth (ticket files = status
truth, README index = ordering truth, kept in sync by `check-backlog.mjs`).
`docs/LESSONS.md` is append-only operational memory — every run reads it and
appends novel lessons.

## Agent parameters

> Read by the shared `agent-fleet` runners at runtime. The one place the generic
> ship/groom/review prompts look for Digital Craft's specifics.

- **Gating checks** — EXACTLY these GitHub check names gate a merge. Everything
  else (Vercel preview, Lighthouse warnings) is informational and MUST be ignored:
  - `build`
  - `smoke-required`
- **Agent branch prefixes**: `feat/` (features, ship), `chore/gtm-` (backlog
  refresh, groom), `eng/` (engineering). NOTE: this replaces the legacy
  `gtm-agent` / `eng-agent` *label*-based detection — the kit detects by prefix.
- **Local gate command** (heal/dev runs this before pushing; all must pass):
  `npm run lint && npm run typecheck && npm run check-links && npm run check-images && npm run check-meta && npm run check-blog-dates && node scripts/check-backlog.mjs && npm run build`
- **Subagents** (`.claude/agents/`): `implementation-dev`, `gtm-innovation`,
  `review`, `eng-dev`
- **Backlog areas**: conversion | seo | content | trust | demos | infra | perf
- **Backlog validator**: `node scripts/check-backlog.mjs`, wired into the `build`
  gating job — keeps ticket files and the README index in sync.

## Hard NOs

The reviewer treats any of these as an automatic `--request-changes`:

- Never push to `main`; never bypass branch protection; never merge with a red
  gating check (`build`, `smoke-required`).
- Never touch `/api/`, `.env*`, or (GTM queue) `package.json` /
  `package-lock.json`. The eng queue MAY touch deps with a ticket line.
- Never write an em-dash (`—`) into copy. Self-review greps the diff for it.
- Never ship a blog post dated anything but today; never duplicate a date.
- Never ship a component without `dark:` variants.
- Never invent testimonials, client names, or inflated numbers.
- Never exceed 2 `heal:` attempts on one PR — escalate via a human comment.

## When things go wrong

The living version is `docs/LESSONS.md`, which every agent reads and extends.

## License

Private. AI agents may contribute, but credit yourself in the commit trailer.

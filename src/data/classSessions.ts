/**
 * Re-export of the canonical class-sessions data.
 *
 * The real data lives at `api/_classSessions.ts` so Vercel's serverless
 * function bundler can include it locally for /api/og, /api/og-html, and
 * /api/og-image. Vite has no such restriction and follows this re-export
 * across directories at build time without issue, so React pages keep
 * importing from `@/data/classSessions` exactly as before.
 *
 * Single source of truth: `api/_classSessions.ts`.
 */

export * from '../../api/_classSessions';

// Ticket 0097 - canonical WCAG conformance target + dated remediation log.
// Read by `src/pages/AccessibilityStatement.tsx` and by
// `tests/e2e/accessibility-statement.spec.ts` per the 2026-06-07 src-imports-
// tests lesson so the visible rows and the spec cannot drift.
//
// Every row is defensible per AGENTS.md: no invented conformance percentages,
// no invented pass/fail counts, no fabricated audit-firm names, no claim to
// have completed a full third-party WCAG audit the site cannot cite. Each
// remediation is a real dated shipped change grepable from
// `git log --since="2026-06-28"` at branch head.
//
// Per the 2026-05-07 em-dash Hard NO every string in this module uses
// hyphens; Self-Review greps the diff for U+2014 before pushing.
//
// Per the 2026-05-25 mirror-source rule, the `CONFORMANCE_TARGET.summary`
// field is authored once here and rendered on both the visible page body
// AND the CollectionPage JSON-LD `description` field AND the Helmet
// `meta[name="description"]` content so the three cannot drift.
//
// Per the 2026-05-28 sitemap-lastmod encoded-invariant lesson, the
// `assertAccessibilityStatement()` call at module load throws on any
// violation (route not in ROUTES, bad ISO date, future date). Because the
// built page imports this module, a violation fails `npm run build` (the
// local gate) and CI's `build` gating job without any package.json edit.

import { ROUTES } from './routes';

/** WCAG conformance target Digital Craft AI currently targets. */
export interface ConformanceTarget {
  /** WCAG level (`AA` today; `AAA` is a future ratchet, not the MVP claim). */
  level: 'A' | 'AA' | 'AAA';
  /** WCAG version (`2.1` today; `2.2` is a future ratchet). */
  version: '2.0' | '2.1' | '2.2';
  /** ISO YYYY-MM-DD - the last date the full page was reviewed end to end. */
  lastReviewed: string;
  /**
   * Single-source summary rendered on the visible page body, emitted into the
   * CollectionPage JSON-LD `description` field, and set as the Helmet
   * `meta[name="description"]` content. Mirror-source per 2026-05-25.
   */
  summary: string;
}

/** One shipped accessibility fix, grepable from `git log`. */
export interface RemediationRow {
  /** ISO YYYY-MM-DD date the fix landed on `main`. */
  date: string;
  /** A route present in `src/data/routes.ts` that the fix affected. */
  route: string;
  /** One-sentence description of the shipped change (hyphens only). */
  summary: string;
}

export const CONFORMANCE_TARGET: ConformanceTarget = {
  level: 'AA',
  version: '2.1',
  lastReviewed: '2026-09-26',
  summary:
    'Digital Craft AI targets WCAG 2.1 AA conformance across every shipped route. This dated statement names the audit cadence, the currently open limitations, and the dated log of accessibility fixes shipped in the last 90 days so a compliance reviewer or ADA counsel can cite a real audit trail before booking a strategy call.',
};

// Each row is a real dated commit on `main` in the last 90 days that touched
// an accessibility-relevant surface (screen-reader loading state, dark-mode
// variants that keep contrast legible, focus-visible rings, keyboard-
// navigable chip clusters). The commit SHA is noted in the source comment
// for auditability; the visible row shows only the date, route, and
// summary. Per the ticket's out-of-scope section, this is NOT a completed
// third-party audit and does NOT claim a per-route pass/fail rating.
export const RECENT_REMEDIATIONS: readonly RemediationRow[] = [
  {
    // 5d1753c (2026-09-05): perf(bundle): route-level code-splitting + vendor
    // chunks. The Suspense RouteFallback ships a role="status" element with
    // aria-label="Loading" and a sr-only "Loading" span so screen readers
    // announce the loading state on every lazy-loaded route.
    date: '2026-09-05',
    route: '/',
    summary:
      'Added a role=status aria-label=Loading fallback with an sr-only Loading span to the Suspense boundary so screen readers announce the loading state on every lazy-loaded route.',
  },
  {
    // c4bf76f (2026-09-08): feat/0069 subprocessors. New sub-processor table
    // page shipped with dark:bg / dark:border / dark:text variants across
    // every cell so the structured table stays legible in dark mode.
    date: '2026-09-08',
    route: '/subprocessors',
    summary:
      'Shipped the sub-processor table with dark-mode variants on every cell, border, and heading so a dark-mode reader sees the same structured columns a light-mode reader sees.',
  },
  {
    // b5c32db (2026-09-12): feat(0077): public /ethics commitments page.
    // Dated hard-NO stances rendered with hyphens (no em-dash) and full
    // dark: variants; keyboard-focusable chip cluster with hover + focus
    // states.
    date: '2026-09-12',
    route: '/ethics',
    summary:
      'Shipped the ethics commitments page with hyphen-only copy and full dark-mode variants; the chip cluster is keyboard-focusable with visible focus states.',
  },
  {
    // 9d158b3 (2026-09-15): feat/0081 security posture page. Dated controls
    // table with dark:bg / dark:text variants; every anchor has
    // focus-visible ring styles inherited from the shared button
    // primitives.
    date: '2026-09-15',
    route: '/security',
    summary:
      'Shipped the security posture controls table with dark-mode variants and focus-visible ring styles inherited from the shared button primitives so keyboard-only visitors see the current control on every anchor.',
  },
  {
    // f4ef2f2 (2026-09-18): feat/0083 how we ship. Transparency page shipped
    // with dark-mode variants across every section and a semantic
    // section/article structure so a screen reader can navigate by landmark.
    date: '2026-09-18',
    route: '/how-we-ship',
    summary:
      'Shipped the how-we-ship page with dark-mode variants and semantic section/article landmarks so a screen reader can navigate the ship-loop narrative by landmark.',
  },
  {
    // 4436907 (2026-09-20): feat/0088 model card ai provenance page. Dated
    // model provenance table shipped with dark-mode variants and a jump-nav
    // chip cluster that is fully keyboard-navigable.
    date: '2026-09-20',
    route: '/model-card',
    summary:
      'Shipped the AI model provenance table with dark-mode variants and a jump-nav chip cluster that is reachable via keyboard tab order.',
  },
  {
    // 5dd6cbf (2026-09-22): feat/0090 agent fleet page. Dated agent-fleet
    // rows shipped with dark-mode variants and each row is a semantic
    // article element so a screen reader can enumerate the fleet.
    date: '2026-09-22',
    route: '/agent-fleet',
    summary:
      'Shipped the agent-fleet rows as semantic article elements with dark-mode variants so a screen reader can enumerate every fleet agent by landmark.',
  },
  {
    // 53a76f9 (2026-09-24): feat/0094 ai risks we watch. Dated risk-
    // watchlist rows shipped with dark-mode variants, aria-hidden icons
    // that do not confuse screen readers, and a scroll-mt-28 anchor offset
    // so fragment-link jumps land below the sticky navbar.
    date: '2026-09-24',
    route: '/ai-risks-we-watch',
    summary:
      'Shipped the AI risks watchlist rows with dark-mode variants, aria-hidden decorative icons, and a scroll-mt-28 anchor offset so fragment-link jumps land below the sticky navbar for keyboard-only visitors.',
  },
];

/**
 * Encoded-invariant assertion block per the 2026-05-28 sitemap-lastmod
 * lesson. Fires at module load; because the built page imports this module,
 * a violation fails `npm run build` locally and in CI's `build` gating job
 * without any package.json edit. The messages name the offending row so a
 * future editor can trace which remediation broke the invariant.
 */
function assertAccessibilityStatement(): void {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const routeSet = new Set<string>(ROUTES);
  const todayIso = new Date().toISOString().slice(0, 10);

  if (!iso.test(CONFORMANCE_TARGET.lastReviewed)) {
    throw new Error(
      `accessibilityStatement: CONFORMANCE_TARGET.lastReviewed "${CONFORMANCE_TARGET.lastReviewed}" is not ISO YYYY-MM-DD`,
    );
  }
  if (CONFORMANCE_TARGET.lastReviewed > todayIso) {
    throw new Error(
      `accessibilityStatement: CONFORMANCE_TARGET.lastReviewed "${CONFORMANCE_TARGET.lastReviewed}" is in the future (today is ${todayIso})`,
    );
  }
  if (CONFORMANCE_TARGET.summary.includes(String.fromCharCode(8212))) {
    throw new Error(
      'accessibilityStatement: CONFORMANCE_TARGET.summary contains an em-dash (U+2014); use a hyphen',
    );
  }

  for (const row of RECENT_REMEDIATIONS) {
    if (!iso.test(row.date)) {
      throw new Error(
        `accessibilityStatement: bad ISO date "${row.date}" on remediation "${row.summary}"`,
      );
    }
    if (row.date > todayIso) {
      throw new Error(
        `accessibilityStatement: remediation date "${row.date}" is in the future for "${row.summary}"`,
      );
    }
    if (!routeSet.has(row.route)) {
      throw new Error(
        `accessibilityStatement: route "${row.route}" NOT_IN_ROUTES for remediation "${row.summary}"`,
      );
    }
    if (row.summary.includes(String.fromCharCode(8212))) {
      throw new Error(
        `accessibilityStatement: remediation summary contains an em-dash: "${row.summary}"`,
      );
    }
  }
}

assertAccessibilityStatement();

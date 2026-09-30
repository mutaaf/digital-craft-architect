// Ticket 0105 - canonical per-storage-key retention posture for every
// persistent client-side store Digital Craft AI writes. Read by
// `src/pages/DataRetention.tsx` and by `tests/e2e/data-retention.spec.ts`
// per the 2026-06-07 src-imports-tests lesson so the visible rows and the
// spec cannot drift.
//
// Per the 2026-09-12 code-beats-prose lesson, the row set below mirrors
// the real branch-head enumeration in `NEW_PERSISTENT_STORES` from
// `src/data/demoDisclosures.ts` rather than the ticket prose's older
// enumeration. Ticket 0104 shipped `dca_reviewed_trust_pages_v1` after
// this ticket was authored, so the row set below is 6 keys, not 5.
//
// Every `sourcePath` string is a real .ts file grepable at branch head
// (verified 2026-09-30 via `ls src/utils/*Store.ts`).
//
// Per the 2026-05-07 em-dash Hard NO every string uses hyphens.
// Per the 2026-05-25 mirror-source rule, RETENTION_POSTURE.summary is
// authored once here and rendered on both the visible page body AND the
// CollectionPage JSON-LD `description` field AND the Helmet
// `meta[name="description"]` content so the three cannot drift.
// Per the 2026-05-28 sitemap-lastmod encoded-invariant lesson, the
// `assertRetentionPolicies()` call at module load throws on any violation
// (storage key not in NEW_PERSISTENT_STORES, bad ISO date, sourcePath not
// ending in .ts, next-review not strictly after last-reviewed). Because
// the built page imports this module, a violation fails `npm run build`
// (the local gate) and CI's `build` gating job.

import { NEW_PERSISTENT_STORES } from './demoDisclosures';

/** Site-wide dated retention posture. */
export interface RetentionPosture {
  /** ISO YYYY-MM-DD - the last date the retention policy was reviewed. */
  lastReviewed: string;
  /**
   * Single-source summary rendered on the visible page body, emitted into
   * the CollectionPage JSON-LD `description` field, and set as the Helmet
   * `meta[name="description"]` content. Mirror-source per 2026-05-25.
   */
  summary: string;
}

/** One row on the per-key retention table. */
export interface RetentionPolicyRow {
  /**
   * localStorage key byte-identical to a key in NEW_PERSISTENT_STORES from
   * src/data/demoDisclosures.ts (asserted at module load).
   */
  storageKey: string;
  /** Human-readable one-line purpose (which shipped card this key powers). */
  purpose: string;
  /**
   * Retention window (browser-local until manual clear, FIFO evict at N,
   * session-scoped, etc.). Grepable from the shipped store's slice-and-evict
   * source code cited in `sourcePath`.
   */
  retentionWindow: string;
  /**
   * Allow-list validation the store enforces at write time and re-checks at
   * read time so a stale or forged value cannot render a dead link.
   */
  allowListValidation: string;
  /** ISO YYYY-MM-DD - the next scheduled review of this row's retention. */
  nextReview: string;
  /** Real .ts file at branch head that implements the retention window. */
  sourcePath: string;
}

export const RETENTION_POSTURE: RetentionPosture = {
  lastReviewed: '2026-09-30',
  summary:
    'Digital Craft AI documents the per-storage-key retention window for every persistent client-side key the site writes to your browser. This dated policy names each key, its purpose, its retention window, and the review cadence so a data-protection officer, privacy counsel, or insurance underwriter can cite a defensible per-key retention posture before booking a strategy call. Every window is grepable from the shipped store source cited on each row, and the site never writes any of these keys to a Digital Craft server.',
};

export const RETENTION_POLICIES: readonly RetentionPolicyRow[] = [
  {
    storageKey: 'dca_recent_compares_v1',
    purpose:
      'Powers the "Comparisons you\'re weighing" card on /my by remembering which /compare/<tool> pages you have opened.',
    retentionWindow:
      'Browser-local until you clear localStorage. FIFO evict once six distinct entries have been recorded (cap of 5).',
    allowListValidation:
      'Every stored path is validated against COMPARE_ENTRIES; a renamed or forged /compare/* path is dropped at read time.',
    nextReview: '2026-12-30',
    sourcePath: 'src/utils/recentComparesStore.ts',
  },
  {
    storageKey: 'dca_quiz_history_v1',
    purpose:
      'Powers the "Your AI readiness trend" card on /my by plotting your AI Readiness Quiz tier trajectory as a sparkline.',
    retentionWindow:
      'Browser-local until you clear localStorage. FIFO evict once nine distinct entries have been recorded (cap of 8).',
    allowListValidation:
      'Every persona string is validated against the KNOWN_PERSONAS allow-list; a stale or forged persona is dropped at read time.',
    nextReview: '2026-12-30',
    sourcePath: 'src/utils/quizHistoryStore.ts',
  },
  {
    storageKey: 'dca_recent_blog_posts_v1',
    purpose:
      'Powers the "Articles you have read" card on /my by remembering which /blog/<slug> long-form articles you have opened.',
    retentionWindow:
      'Browser-local until you clear localStorage. FIFO evict once six distinct entries have been recorded (cap of 5).',
    allowListValidation:
      'Every slug is validated against the shipped blogPosts allow-list; a renamed or forged slug is dropped at read time.',
    nextReview: '2026-12-30',
    sourcePath: 'src/utils/recentBlogPostsStore.ts',
  },
  {
    storageKey: 'dca_roi_scenarios_v1',
    purpose:
      'Powers the "Saved ROI scenarios" card on /my by remembering named ROI calculator scenarios you have saved.',
    retentionWindow:
      'Browser-local until you clear localStorage. FIFO evict once six distinct saves have been recorded (cap of 5).',
    allowListValidation:
      'Every scenario is round-trip-validated on parse; a malformed row is dropped at read time. Names longer than 40 characters are rejected at write.',
    nextReview: '2026-12-30',
    sourcePath: 'src/utils/roiScenariosStore.ts',
  },
  {
    storageKey: 'dca_recent_verticals_v1',
    purpose:
      'Powers the "Verticals you\'re evaluating" card on /my by remembering which /ai-for-<vertical> landing pages you have opened.',
    retentionWindow:
      'Browser-local until you clear localStorage. FIFO evict once six distinct entries have been recorded (cap of 5).',
    allowListValidation:
      'Every path is validated against ROUTES filtered to /ai-for-* and against the /ai-for- prefix; a renamed or forged path is dropped at read time.',
    nextReview: '2026-12-30',
    sourcePath: 'src/utils/recentVerticalsStore.ts',
  },
  {
    storageKey: 'dca_reviewed_trust_pages_v1',
    purpose:
      'Powers the "Compliance you\'ve reviewed" card on /my by remembering which trust-family pages you have opened.',
    retentionWindow:
      'Browser-local until you clear localStorage. FIFO evict once seven distinct entries have been recorded (cap of 6).',
    allowListValidation:
      'Every path is validated against TRUST_ROUTES from src/data/trustPageLabels.ts; a renamed or forged path is dropped at read time.',
    nextReview: '2026-12-30',
    sourcePath: 'src/utils/reviewedTrustPagesStore.ts',
  },
];

function assertRetentionPolicies(): void {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const EM = String.fromCharCode(8212);

  if (!iso.test(RETENTION_POSTURE.lastReviewed)) {
    throw new Error(
      `dataRetention: lastReviewed "${RETENTION_POSTURE.lastReviewed}" is not ISO YYYY-MM-DD`,
    );
  }
  if (RETENTION_POSTURE.summary.includes(EM)) {
    throw new Error('dataRetention: POSTURE.summary contains an em-dash; use a hyphen');
  }
  if (RETENTION_POSTURE.summary.length < 40) {
    throw new Error(
      `dataRetention: POSTURE.summary too short (${RETENTION_POSTURE.summary.length} chars)`,
    );
  }

  const disclosedKeys = new Set<string>(
    NEW_PERSISTENT_STORES.map((s) => s.storageKey),
  );
  const seenKeys = new Set<string>();

  for (const row of RETENTION_POLICIES) {
    if (seenKeys.has(row.storageKey)) {
      throw new Error(
        `dataRetention: duplicate storageKey "${row.storageKey}" in RETENTION_POLICIES`,
      );
    }
    seenKeys.add(row.storageKey);

    if (!disclosedKeys.has(row.storageKey)) {
      throw new Error(
        `dataRetention: storageKey "${row.storageKey}" NOT_IN_DISCLOSURES ` +
          `(NEW_PERSISTENT_STORES in src/data/demoDisclosures.ts). ` +
          `Add it to NEW_PERSISTENT_STORES or remove the row.`,
      );
    }

    if (!row.sourcePath.endsWith('.ts')) {
      throw new Error(
        `dataRetention: sourcePath "${row.sourcePath}" for key "${row.storageKey}" must end in .ts`,
      );
    }

    for (const field of [
      'purpose',
      'retentionWindow',
      'allowListValidation',
    ] as const) {
      if (row[field].includes(EM)) {
        throw new Error(
          `dataRetention: row "${row.storageKey}" ${field} contains an em-dash; use a hyphen`,
        );
      }
      if (row[field].length < 20) {
        throw new Error(
          `dataRetention: row "${row.storageKey}" ${field} too short (${row[field].length} chars)`,
        );
      }
    }

    if (!iso.test(row.nextReview)) {
      throw new Error(
        `dataRetention: row "${row.storageKey}" nextReview "${row.nextReview}" is not ISO YYYY-MM-DD`,
      );
    }
    if (row.nextReview <= RETENTION_POSTURE.lastReviewed) {
      throw new Error(
        `dataRetention: row "${row.storageKey}" nextReview "${row.nextReview}" ` +
          `must be strictly after RETENTION_POSTURE.lastReviewed "${RETENTION_POSTURE.lastReviewed}"`,
      );
    }
  }
}

assertRetentionPolicies();

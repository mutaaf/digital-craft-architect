// Ticket 0082 - Downloadable JSON evaluation dossier export from /my.
//
// Composes every persisted client-side artifact (saved estimate, saved
// ROI, quiz persona, quiz history, recent demos, recent comparisons,
// visit streak) into one typed EvaluationDossier object with a
// schemaVersion string and an ISO generatedAt timestamp. The dossier is
// downloaded as a JSON Blob by the "Download JSON" button next to the
// ticket 0066 print button on /my; no network round-trip, no new
// dependency, no server handler.
//
// Each artifact reads through the owning store's existing public getter
// so the dossier stays honest to whatever the store considers a valid
// entry (2026-05-25 mirror-source rule). recentCompares reads the RAW
// pre-slice list via `readAllVisited` (exported from recentComparesStore
// in this same PR per the 2026-09-10 raw-vs-sliced lesson) so a visitor
// who has viewed more comparisons than the 5-entry display slice sees
// every one in the exported file.
//
// Types are pinned to the ACTUAL exported types on branch head per the
// 2026-09-12 code-beats-prose lesson. The ticket prose named
// `LastEstimate` and `RoiResult` as placeholder types; the composer
// pins to `EstimateShareState` (returned by `loadLastEstimate`) and a
// locally-declared `RoiSnapshot` mirroring the anonymous return shape
// of `getLastRoiResult`. Deviation documented in the ticket
// Implementation log.
//
// Every string this module writes is hyphen-only per the 2026-05-07
// em-dash Hard NO. The JSON payload may echo a visitor-entered em-dash
// only if the visitor typed one into a saved-estimate field; the
// composer never inserts one into any wrapper field it authors.

import { loadLastEstimate } from '@/pages/construction/lastEstimateStore';
import type { EstimateShareState } from '@/pages/construction/estimateShareParams';
import { getLastRoiResult } from '@/utils/roiResultStore';
import type { RoiInputs, RoiOutputs } from '@/pages/roiCalculatorParams';
import { getQuizPersona, type QuizPersona } from '@/utils/quizPersonaStore';
import { getQuizHistory, type QuizHistoryEntry } from '@/utils/quizHistoryStore';
import { getRecentDemos, type RecentDemo } from '@/utils/recentDemosStore';
import { readAllVisited, type RecentCompare } from '@/utils/recentComparesStore';
import { getVisitStreak, type VisitStreak } from '@/utils/visitStreakStore';

export const DOSSIER_SCHEMA_VERSION = '1.0';

// Ordered artifact-key tuple. The spec imports this constant directly
// (2026-05-25 mirror-source rule + 2026-06-07 src-imports-tests lesson)
// so a schema-key rename can never drift the source and the test.
export const DOSSIER_ARTIFACT_KEYS = [
  'estimate',
  'roi',
  'quizPersona',
  'quizHistory',
  'recentDemos',
  'recentCompares',
  'visitStreak',
] as const;

export type DossierArtifactKey = (typeof DOSSIER_ARTIFACT_KEYS)[number];

// The anonymous return shape of `getLastRoiResult` in
// src/utils/roiResultStore.ts:78-108 (no exported alias in that module).
// Mirrored here so the dossier schema surfaces a typed ROI slot rather
// than an inline object literal, per the 2026-09-12 code-beats-prose
// lesson: pin to the actual return shape, not the ticket's placeholder
// type name.
export interface RoiSnapshot {
  inputs: RoiInputs;
  outputs: RoiOutputs;
  savedAt: number;
}

export interface EvaluationDossier {
  schemaVersion: string;
  generatedAt: string;
  artifacts: {
    estimate: EstimateShareState | null;
    roi: RoiSnapshot | null;
    quizPersona: QuizPersona | null;
    quizHistory: QuizHistoryEntry[];
    recentDemos: RecentDemo[];
    recentCompares: RecentCompare[];
    visitStreak: VisitStreak | null;
  };
}

// Safe read wrapper: any exception from a store getter (storage
// unavailable, quota, etc.) resolves to the caller-supplied fallback so
// a partially-broken environment still produces a well-formed dossier.
function safeRead<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/**
 * Compose the visitor's persisted client-side artifacts into one typed
 * EvaluationDossier object. Every array-typed artifact is always an
 * Array (never undefined); every nullable single-value artifact is
 * either an object or null. `generatedAt` is a locally-computed ISO
 * timestamp with a timezone marker (`new Date().toISOString()`), not a
 * server-derived id.
 */
export function buildEvaluationDossier(): EvaluationDossier {
  return {
    schemaVersion: DOSSIER_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    artifacts: {
      estimate: safeRead(() => loadLastEstimate('construction'), null),
      roi: safeRead(() => getLastRoiResult(), null),
      quizPersona: safeRead(() => getQuizPersona(), null),
      quizHistory: safeRead(() => getQuizHistory(), []),
      recentDemos: safeRead(() => getRecentDemos(), []),
      recentCompares: safeRead(() => readAllVisited(), []),
      visitStreak: safeRead(() => getVisitStreak(), null),
    },
  };
}

/**
 * Return the UTC YYYY-MM-DD date string used to name the downloaded
 * file (`digital-craft-evaluation-<YYYY-MM-DD>.json`). UTC makes the
 * filename deterministic for a test seed regardless of the visitor's
 * timezone; mirrors the visitStreakStore date-format choice.
 */
export function dossierDownloadDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Return the canonical download filename for a given date. Kept as a
 * standalone helper so the click handler and any future test can share
 * one filename source.
 */
export function dossierDownloadFilename(now: Date = new Date()): string {
  return `digital-craft-evaluation-${dossierDownloadDateString(now)}.json`;
}

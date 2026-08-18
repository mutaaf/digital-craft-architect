import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Shared changelog helpers for the specs that exercise WhatsNewSinceVisit.
//
// Why this module exists: the strip renders only when some changelogEntries
// entry is newer than the visitor's last visit. Seeding that visit from
// Date.now() makes the assertion decay with the calendar. Once no backlog
// ticket ships for as long as the seed window, every "returner sees the strip"
// test fails on a branch that changed nothing (confirmed 2026-08-18: the
// newest entry was 60 days old and the same four tests failed on a clean
// origin/main).
//
// So the seed is derived from the changelog itself. Per the 2026-05-25
// mirror-source lesson, this file is the single source both specs consult, so
// the two cannot drift apart.

// The generated source is parsed rather than imported so the specs stay
// aligned with whatever the component renders without coupling to a TS module
// loader.
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const CHANGELOG_SRC = join(REPO_ROOT, 'src', 'data', 'changelogEntries.ts');

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ParsedEntry {
  id: string;
  title: string;
  created: string;
}

export function parseChangelog(): ParsedEntry[] {
  const src = readFileSync(CHANGELOG_SRC, 'utf-8');
  // Lines look like:
  //   { id: "0038", title: "...", area: "seo", created: "2026-06-07" },
  const re =
    /\{\s*id:\s*"([^"]+)",\s*title:\s*"((?:[^"\\]|\\.)*)",\s*area:\s*"[^"]+",\s*created:\s*"([^"]+)"\s*\}/g;
  const out: ParsedEntry[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    out.push({
      id: m[1],
      title: m[2].replace(/\\"/g, '"'),
      created: m[3],
    });
  }
  return out;
}

/** Epoch ms of the most recently created changelog entry. */
export function newestChangelogTime(): number {
  const times = parseChangelog()
    .map((e) => new Date(e.created).getTime())
    .filter((t) => Number.isFinite(t));
  if (times.length === 0) {
    throw new Error(
      `no changelog entries parsed from ${CHANGELOG_SRC}; the seed helpers cannot build a delta`,
    );
  }
  return Math.max(...times);
}

/**
 * A last-visit timestamp guaranteed to sit before at least one changelog
 * entry, so WhatsNewSinceVisit always has a non-empty delta to render.
 *
 * Anchored to the newest entry rather than to now, which is what keeps the
 * assertion true no matter how long it has been since a ticket shipped.
 * `daysBefore` widens the window to pull in more entries; the newest entry
 * alone already qualifies at any positive value.
 */
export function visitBeforeNewestEntry(daysBefore = 14): number {
  return newestChangelogTime() - daysBefore * DAY_MS;
}

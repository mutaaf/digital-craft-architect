import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";

// Ticket 0108 - Public /roadmap page generator (forward-looking sibling of
// the ticket 0032 /changelog generator).
//
// Reads every docs/backlog/*.md file at build time, parses the YAML
// frontmatter with the same hand-rolled regex pattern (no new dependency per
// the GTM queue Hard NO), filters to `status === 'groomed'` or `status ===
// 'in-progress'`, drops `area: infra` and `area: perf` rows (out-of-scope per
// the ticket's "eng has no groomer" anti-goal), sorts by priority then
// ticket id, computes a deterministic `intendedShipWeek` string for each
// row, and writes a typed src/data/roadmapEntries.ts file.
//
// Per the 2026-05-28 inline-assertion-in-the-gated-script lesson, this
// script THROWS on validation violation (invalid id, invalid priority,
// invalid area, missing or future `created` date, em-dash in title) and
// writes a `src/data/roadmapEntries.ts.broken` artifact. A thrown generator
// fails the gated `npm run build` chain through scripts/generate-sitemap.ts.
//
// This script is invoked from scripts/generate-sitemap.ts (ticket 0032's
// wiring pattern) so no package.json edit is required - the GTM queue Hard
// NO. The generated file IS committed so typecheck and lint see a real
// typed import without needing the generator to run first.

const ROOT = join(import.meta.dirname, "..");
const BACKLOG_DIR = join(ROOT, "docs", "backlog");
const OUT_PATH = join(ROOT, "src", "data", "roadmapEntries.ts");
const BROKEN_PATH = OUT_PATH + ".broken";

// U+2014 via charCode so this script itself contains no literal em-dash
// (the 2026-05-07 Hard NO bans the character in copy).
const EM_DASH = String.fromCharCode(8212);

export type RoadmapArea = "conversion" | "seo" | "content" | "trust" | "demos";
export type RoadmapPriority = "P0" | "P1" | "P2" | "P3";
export type RoadmapStatus = "groomed" | "in-progress";

export interface RoadmapEntry {
  id: string;
  title: string;
  priority: RoadmapPriority;
  area: RoadmapArea;
  status: RoadmapStatus;
  created: string;
  intendedShipWeek: string; // ISO week string like "2026-W40"
}

const VALID_AREAS: ReadonlySet<string> = new Set([
  "conversion",
  "seo",
  "content",
  "trust",
  "demos",
]);

const INCLUDED_STATUSES: ReadonlySet<string> = new Set([
  "groomed",
  "in-progress",
]);

const EXCLUDED_AREAS: ReadonlySet<string> = new Set(["infra", "perf"]);

const VALID_PRIORITIES: ReadonlySet<string> = new Set([
  "P0",
  "P1",
  "P2",
  "P3",
]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const PRIORITY_RANK: Record<string, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};

function todayYmd(): string {
  return new Date().toISOString().split("T")[0];
}

function unquote(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(text: string): Record<string, string> | null {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    out[kv[1]] = unquote(kv[2]);
  }
  return out;
}

// Compute the Monday on or after a given date. Returns a Date pinned to
// UTC midnight so downstream week-string math stays TZ-agnostic.
function nextMondayOnOrAfter(fromYmd: string): Date {
  const d = new Date(`${fromYmd}T00:00:00Z`);
  // getUTCDay(): Sun=0, Mon=1, ... Sat=6. Days to add to reach Monday.
  const dow = d.getUTCDay();
  const add = dow === 1 ? 0 : (8 - dow) % 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d;
}

// ISO 8601 week number of a given Date (UTC-pinned). Returns tuple [year,
// week]. Standard algorithm: shift Thursday into the week to pin the ISO
// year, then week = 1 + (dayOfYear / 7).
function isoWeek(date: Date): [number, number] {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // ISO weekday: Mon=1 ... Sun=7.
  const dayNum = d.getUTCDay() || 7;
  // Shift to the Thursday of the current week.
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week =
    Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return [d.getUTCFullYear(), week];
}

function formatIsoWeek(date: Date): string {
  const [y, w] = isoWeek(date);
  return `${y}-W${String(w).padStart(2, "0")}`;
}

function computeIntendedShipWeek(firstMonday: Date, queuePosition: number): string {
  const d = new Date(firstMonday.getTime());
  d.setUTCDate(d.getUTCDate() + queuePosition * 7);
  return formatIsoWeek(d);
}

interface RawRow {
  id: string;
  title: string;
  priority: RoadmapPriority;
  area: RoadmapArea;
  status: RoadmapStatus;
  created: string;
}

interface CollectResult {
  rows: RawRow[];
  problems: string[];
}

function collectRows(): CollectResult {
  const problems: string[] = [];
  const rows: RawRow[] = [];
  const seenIds = new Set<string>();
  const today = todayYmd();

  const files = readdirSync(BACKLOG_DIR)
    .filter((f) => /^\d{4}-.*\.md$/.test(f))
    .sort();

  for (const name of files) {
    const fullPath = join(BACKLOG_DIR, name);
    const text = readFileSync(fullPath, "utf-8");
    const fm = parseFrontmatter(text);
    const rel = relative(ROOT, fullPath);

    if (!fm) {
      problems.push(`${rel}: missing or malformed frontmatter block`);
      continue;
    }
    const status = fm.status;
    if (!INCLUDED_STATUSES.has(status)) continue; // shipped/proposed/rejected skip
    const area = fm.area;
    if (EXCLUDED_AREAS.has(area)) continue; // infra/perf skip per anti-goal

    const id = fm.id;
    const title = fm.title;
    const priority = fm.priority;
    const created = fm.created;

    if (!id || !/^\d{4}$/.test(id)) {
      problems.push(`${rel}: ticket has invalid id "${id}"`);
      continue;
    }
    if (seenIds.has(id)) {
      problems.push(`${rel}: duplicate ticket id ${id}`);
      continue;
    }
    if (!title) {
      problems.push(`${rel}: ticket ${id} has no title`);
      continue;
    }
    if (title.includes(EM_DASH)) {
      problems.push(
        `${rel}: ticket ${id} title contains an em-dash (U+2014); replace with a hyphen per the 2026-05-07 brand-voice rule`,
      );
      continue;
    }
    if (!priority || !VALID_PRIORITIES.has(priority)) {
      problems.push(
        `${rel}: ticket ${id} has invalid priority "${priority}" (allowed: P0, P1, P2, P3)`,
      );
      continue;
    }
    if (!area || !VALID_AREAS.has(area)) {
      problems.push(
        `${rel}: ticket ${id} has invalid area "${area}" (allowed on roadmap: ${[...VALID_AREAS].join(", ")})`,
      );
      continue;
    }
    if (!created || !DATE_RE.test(created)) {
      problems.push(
        `${rel}: ticket ${id} has invalid created "${created}" (expected YYYY-MM-DD)`,
      );
      continue;
    }
    if (created > today) {
      problems.push(
        `${rel}: ticket ${id} has created "${created}" in the future (today=${today})`,
      );
      continue;
    }

    seenIds.add(id);
    rows.push({
      id,
      title,
      priority: priority as RoadmapPriority,
      area: area as RoadmapArea,
      status: status as RoadmapStatus,
      created,
    });
  }

  // Sort by priority rank ascending, then by id ascending within each group.
  rows.sort((a, b) => {
    const dp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (dp !== 0) return dp;
    return a.id.localeCompare(b.id);
  });

  return { rows, problems };
}

// Mirror-source rule (2026-05-25): this string is the SINGLE source of
// truth for the page's intro paragraph, the Helmet meta description, and
// the CollectionPage JSON-LD `description` field.
const CADENCE_NOTE =
  "The ship loop runs one ticket per hour and typically lands 1-5 tickets per week based on backlog depth, heal retries, and reviewer blocks. Dates below are a planning signal, not a commitment: the autonomous ship loop reorders groomed tickets as the queue evolves, so an intended ship week can slip or accelerate.";

function renderModule(
  entries: RoadmapEntry[],
  generatedAt: string,
): string {
  const header = `// AUTO-GENERATED by scripts/generate-roadmap.ts at build time.
// Do not edit by hand - regenerate by running \`npm run build\`.
// Source of truth: docs/backlog/*.md frontmatter (status: groomed or in-progress).
// Ticket 0108.

export type RoadmapArea = "conversion" | "seo" | "content" | "trust" | "demos";
export type RoadmapPriority = "P0" | "P1" | "P2" | "P3";
export type RoadmapStatus = "groomed" | "in-progress";

export interface RoadmapEntry {
  id: string;
  title: string;
  priority: RoadmapPriority;
  area: RoadmapArea;
  status: RoadmapStatus;
  created: string;
  intendedShipWeek: string;
}

export const ROADMAP_GENERATED_AT: string = ${JSON.stringify(generatedAt)};

export const ROADMAP_CADENCE_NOTE: string = ${JSON.stringify(CADENCE_NOTE)};

export const ROADMAP_ENTRIES: readonly RoadmapEntry[] = [
`;
  const body = entries
    .map((e) =>
      `  { id: ${JSON.stringify(e.id)}, title: ${JSON.stringify(e.title)}, priority: ${JSON.stringify(e.priority)}, area: ${JSON.stringify(e.area)}, status: ${JSON.stringify(e.status)}, created: ${JSON.stringify(e.created)}, intendedShipWeek: ${JSON.stringify(e.intendedShipWeek)} },`,
    )
    .join("\n");
  const footer = body.length > 0 ? `\n] as const;\n` : `] as const;\n`;
  return header + body + footer;
}

export async function generateRoadmap(): Promise<{ count: number }> {
  const { rows, problems } = collectRows();

  if (problems.length > 0) {
    try {
      writeFileSync(
        BROKEN_PATH,
        renderModule([], todayYmd()),
        "utf-8",
      );
    } catch {
      /* best-effort */
    }
    console.error(
      `✗ roadmap: ${problems.length} validation problem(s); broken file saved to ${relative(ROOT, BROKEN_PATH)}`,
    );
    for (const p of problems) console.error(`  - ${p}`);
    throw new Error(`roadmap generator: ${problems.length} validation problem(s)`);
  }

  const generatedAt = todayYmd();
  const firstMonday = nextMondayOnOrAfter(generatedAt);
  const entries: RoadmapEntry[] = rows.map((r, i) => ({
    ...r,
    intendedShipWeek: computeIntendedShipWeek(firstMonday, i),
  }));

  // Belt-and-braces: no em-dash slipped into the rendered output. The row
  // loop above already rejects titles with U+2014; this is the final
  // scan of the full module text per the 2026-05-28 encoded-invariant
  // lesson. Also validates every ISO-week string shape.
  const out = renderModule(entries, generatedAt);
  if (out.includes(EM_DASH)) {
    writeFileSync(BROKEN_PATH, out, "utf-8");
    throw new Error(
      "roadmap generator: emitted module contains an em-dash (U+2014); refusing to write",
    );
  }
  const weekShape = /^\d{4}-W\d{2}$/;
  for (const e of entries) {
    if (!weekShape.test(e.intendedShipWeek)) {
      writeFileSync(BROKEN_PATH, out, "utf-8");
      throw new Error(
        `roadmap generator: ticket ${e.id} has malformed intendedShipWeek "${e.intendedShipWeek}"`,
      );
    }
  }

  writeFileSync(OUT_PATH, out, "utf-8");
  console.log(
    `✓ Roadmap generated with ${entries.length} upcoming entries → ${relative(ROOT, OUT_PATH)}`,
  );
  return { count: entries.length };
}

const invokedDirectly =
  process.argv[1] && process.argv[1].endsWith("generate-roadmap.ts");
if (invokedDirectly) {
  generateRoadmap().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}

import { mkdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { COMPARE_ENTRIES, type CompareEntry } from "../src/data/compareEntries";

// Ticket 0095 - JSON Feed 1.1 sibling to the shipped /compare hub (ticket
// 0048). Reads the SAME src/data/compareEntries.ts constant the hub
// renders from (the 2026-05-25 mirror-source rule), transforms each
// CompareEntry into a JsonFeedItem, and writes public/compare.json as
// pretty-printed JSON (two-space indentation) so Vercel's default static
// serving picks it up at /compare.json with application/json.
//
// Wired into the same build chain as the ticket 0078 generator: hooked
// from scripts/generate-sitemap.ts's run() after generateChangelog()
// completes. Dynamic import keeps this file's default-export surface
// stable and avoids a static side-effect import.
// No package.json edit, no new dependency (GTM queue Hard NO).
//
// Per the 2026-09-12 code-beats-prose lesson, the shipped
// COMPARE_ENTRIES shape is `{ id, tool, path, tagline }`; the ticket
// prose named `slug|title|description` (placeholder prose). Deviation
// captured in the ticket Implementation log: item.title derives as
// "Digital Craft vs " + tool (byte-identical mirror of the H2 render on
// the hub AND the ItemList JSON-LD `name` field), and item.content_text
// mirrors entry.tagline verbatim. There is no per-entry ship date on
// COMPARE_ENTRIES, so date_published falls back to the ticket 0048 hub
// ship date per AC #2.
//
// Per the 2026-05-28 encoded-invariant lesson, the post-write block
// fails the build on empty file, missing required item fields, URL
// allow-list violations, invalid ISO 8601 datetimes, or any U+2014
// em-dash. A .broken artifact is saved on failure so the local gate and
// CI `build` job surface the diagnostic without a new gated check.

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "public");
const OUT_PATH = join(OUT_DIR, "compare.json");
const BROKEN_PATH = OUT_PATH + ".broken";
const BASE_URL = "https://digitalcraftai.com";
const FEED_URL = `${BASE_URL}/compare.json`;
const HOME_PAGE_URL = `${BASE_URL}/compare`;
const FEED_VERSION = "https://jsonfeed.org/version/1.1";
const FEED_TITLE = "Digital Craft AI comparison feed";
const FEED_DESCRIPTION =
  "Every Digital Craft AI comparison page in one machine-readable feed. Subscribe to get diffs when a new head-to-head ships, without scraping HTML.";
// Ticket 0048 hub ship date (source: src/data/changelogEntries.ts entry
// { id: "0048", created: "2026-06-11" }). Anchored at noon UTC so the
// timestamp is timezone-stable across builds, matching the ticket 0055
// RSS toRfc822 and ticket 0078 toIsoTimestamp anchors.
const FALLBACK_DATE_PUBLISHED = "2026-06-11T12:00:00Z";
const EM_DASH = String.fromCharCode(8212);
const URL_ALLOW_LIST_RE = /^https:\/\/digitalcraftai\.com\/compare\/[a-z0-9-]+$/;
const REQUIRED_ITEM_FIELDS = [
  "id",
  "url",
  "title",
  "content_text",
  "date_published",
  "date_modified",
] as const;

interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published: string;
  date_modified: string;
}

interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  items: JsonFeedItem[];
}

function buildItem(entry: CompareEntry): JsonFeedItem {
  const url = `${BASE_URL}${entry.path}`;
  const title = `Digital Craft vs ${entry.tool}`;
  return {
    // Per AC #2: id is a stable URL string, equal to home_page_url + "/" +
    // slug. entry.path already begins with "/compare/", so BASE_URL + path
    // yields the canonical https://digitalcraftai.com/compare/<slug> id.
    id: url,
    url,
    title,
    content_text: entry.tagline,
    date_published: FALLBACK_DATE_PUBLISHED,
    // No per-entry modified date on COMPARE_ENTRIES; per AC #2, default
    // to date_published when not otherwise tracked.
    date_modified: FALLBACK_DATE_PUBLISHED,
  };
}

function buildFeed(entries: readonly CompareEntry[]): JsonFeed {
  return {
    version: FEED_VERSION,
    title: FEED_TITLE,
    home_page_url: HOME_PAGE_URL,
    feed_url: FEED_URL,
    description: FEED_DESCRIPTION,
    items: entries.map(buildItem),
  };
}

function assertWrittenFeed(
  json: string,
  feed: JsonFeed,
  entries: readonly CompareEntry[],
): void {
  const problems: string[] = [];

  let size = 0;
  try {
    size = statSync(OUT_PATH).size;
  } catch (err) {
    problems.push(`stat(${OUT_PATH}) failed: ${String(err)}`);
  }
  if (size === 0) problems.push("output file is empty");

  // (a) parse round-trip.
  let parsed: JsonFeed | null = null;
  try {
    parsed = JSON.parse(json) as JsonFeed;
  } catch (err) {
    problems.push(`JSON.parse round-trip failed: ${String(err)}`);
  }

  // (b) version pin.
  if (parsed && parsed.version !== FEED_VERSION) {
    problems.push(`version "${parsed.version}" != "${FEED_VERSION}"`);
  }
  if (parsed && parsed.title !== FEED_TITLE) {
    problems.push(`title "${parsed.title}" != "${FEED_TITLE}"`);
  }
  if (parsed && parsed.home_page_url !== HOME_PAGE_URL) {
    problems.push(`home_page_url "${parsed.home_page_url}" != "${HOME_PAGE_URL}"`);
  }
  if (parsed && parsed.feed_url !== FEED_URL) {
    problems.push(`feed_url "${parsed.feed_url}" != "${FEED_URL}"`);
  }

  // (c) length matches COMPARE_ENTRIES.
  if (feed.items.length !== entries.length) {
    problems.push(
      `expected ${entries.length} item(s), found ${feed.items.length}`,
    );
  }

  // (d) every item has non-empty required fields; (e) url matches the
  // /compare/<slug> allow-list; (f) content_text is hyphen-only.
  feed.items.forEach((item, idx) => {
    for (const field of REQUIRED_ITEM_FIELDS) {
      const value = item[field];
      const empty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.length === 0);
      if (empty) {
        const id = entries[idx]?.id ?? "<unknown>";
        problems.push(
          `item for entry ${id} is missing required field "${field}"`,
        );
      }
    }
    if (!URL_ALLOW_LIST_RE.test(item.url)) {
      problems.push(
        `item.url "${item.url}" does not match ${URL_ALLOW_LIST_RE}`,
      );
    }
    if (item.id !== item.url) {
      problems.push(
        `item.id "${item.id}" does not equal item.url "${item.url}" (AC #2 requires id == home_page_url + "/" + slug)`,
      );
    }
    if (isNaN(Date.parse(item.date_published))) {
      problems.push(
        `item.date_published "${item.date_published}" did not parse as ISO-8601`,
      );
    }
    if (isNaN(Date.parse(item.date_modified))) {
      problems.push(
        `item.date_modified "${item.date_modified}" did not parse as ISO-8601`,
      );
    }
    if (item.content_text.includes(EM_DASH)) {
      problems.push(
        `item.content_text for ${item.url} contains a U+2014 em-dash`,
      );
    }
    if (item.title.includes(EM_DASH)) {
      problems.push(
        `item.title for ${item.url} contains a U+2014 em-dash`,
      );
    }
  });

  // Ordering: items[] must match COMPARE_ENTRIES array order exactly.
  for (let i = 0; i < entries.length; i++) {
    const expected = `${BASE_URL}${entries[i].path}`;
    if (feed.items[i]?.url !== expected) {
      problems.push(
        `item ordering drift at index ${i}: expected url "${expected}", got "${feed.items[i]?.url}"`,
      );
      break;
    }
  }

  if (json.includes(EM_DASH)) {
    problems.push("output contains a U+2014 em-dash character");
  }

  if (problems.length > 0) {
    try {
      writeFileSync(BROKEN_PATH, json, "utf-8");
    } catch {
      /* best-effort */
    }
    console.error(
      `✗ compare-json: ${problems.length} invariant violation(s); broken feed saved to ${relative(ROOT, BROKEN_PATH)}`,
    );
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
}

export default async function generateCompareJson(): Promise<{ count: number }> {
  mkdirSync(OUT_DIR, { recursive: true });
  const feed = buildFeed(COMPARE_ENTRIES);
  const json = JSON.stringify(feed, null, 2) + "\n";
  writeFileSync(OUT_PATH, json, "utf-8");
  assertWrittenFeed(json, feed, COMPARE_ENTRIES);
  console.log(
    `✓ Compare JSON Feed generated with ${feed.items.length} entries -> ${relative(ROOT, OUT_PATH)}`,
  );
  return { count: feed.items.length };
}

if (process.argv[1] && process.argv[1].endsWith("generate-compare-json.ts")) {
  generateCompareJson().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}

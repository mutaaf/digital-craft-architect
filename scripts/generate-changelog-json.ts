import { mkdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { changelogEntries, type ChangelogEntry } from "../src/data/changelogEntries";

// Ticket 0078 - JSON Feed 1.1 sibling to /changelog/rss.xml (ticket 0055).
// Reads the SAME src/data/changelogEntries.ts constant the RSS generator
// reads, transforms each shipped ticket into a JsonFeedItem, and writes
// public/changelog.json as pretty-printed JSON (two-space indentation).
//
// Wired into the same build chain: scripts/generate-changelog-rss.ts
// invokes generateChangelogJson() at the end of its exported main, so the
// order is
//   generate-sitemap -> generate-changelog -> generate-changelog-rss ->
//   generate-changelog-json + generate-case-studies-rss.
// No package.json edit needed (GTM queue Hard NO).
//
// Per the 2026-05-28 inline-assertion-in-the-gated-script lesson, the
// post-write block fails the build on empty file, missing required item
// fields, or any U+2014 em-dash. A .broken artifact is saved on failure.
// Per the 2026-05-25 mirror-source rule, the top-level description string
// mirrors the /changelog page's meta description verbatim.

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "public");
const OUT_PATH = join(OUT_DIR, "changelog.json");
const BROKEN_PATH = OUT_PATH + ".broken";
const BASE_URL = "https://digitalcraftai.com";
const FEED_URL = `${BASE_URL}/changelog.json`;
const HOME_PAGE_URL = `${BASE_URL}/changelog`;
const FEED_VERSION = "https://jsonfeed.org/version/1.1";
const FEED_TITLE = "Digital Craft AI Changelog";
// Mirror-source: byte-identical to CHANGELOG_DESCRIPTION in src/pages/Changelog.tsx.
const FEED_DESCRIPTION =
  "Recent ships from the Digital Craft AI team. Dated, grouped by month, sourced directly from the public backlog so you can see what we shipped this week without checking LinkedIn.";
const FEED_LANGUAGE = "en-US";
const EM_DASH = String.fromCharCode(8212);
const REQUIRED_ITEM_FIELDS = [
  "id",
  "url",
  "title",
  "content_text",
  "date_published",
  "tags",
] as const;

interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published: string;
  tags: string[];
}

interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  language: string;
  items: JsonFeedItem[];
}

function toIsoTimestamp(dateStr: string): string {
  // Anchor at noon UTC so the timestamp is timezone-stable across builds
  // (matches the ticket 0055 RSS toRfc822 anchor).
  return new Date(dateStr + "T12:00:00Z").toISOString();
}

function buildItem(entry: ChangelogEntry): JsonFeedItem {
  const url = `${BASE_URL}/changelog#${entry.id}`;
  return {
    id: entry.id,
    url,
    title: entry.title,
    // content_text mirrors the title verbatim - the shipped constant
    // carries titles only, not rendered descriptions, per AC #2.
    content_text: entry.title,
    date_published: toIsoTimestamp(entry.created),
    tags: [entry.area],
  };
}

function buildFeed(entries: readonly ChangelogEntry[]): JsonFeed {
  return {
    version: FEED_VERSION,
    title: FEED_TITLE,
    home_page_url: HOME_PAGE_URL,
    feed_url: FEED_URL,
    description: FEED_DESCRIPTION,
    language: FEED_LANGUAGE,
    items: entries.map(buildItem),
  };
}

function assertWrittenFeed(
  json: string,
  feed: JsonFeed,
  entries: readonly ChangelogEntry[],
): void {
  const problems: string[] = [];

  let size = 0;
  try {
    size = statSync(OUT_PATH).size;
  } catch (err) {
    problems.push(`stat(${OUT_PATH}) failed: ${String(err)}`);
  }
  if (size === 0) problems.push("output file is empty");

  if (feed.items.length !== entries.length) {
    problems.push(
      `expected ${entries.length} item(s), found ${feed.items.length}`,
    );
  }

  feed.items.forEach((item, idx) => {
    for (const field of REQUIRED_ITEM_FIELDS) {
      const value = item[field];
      const empty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.length === 0) ||
        (Array.isArray(value) && value.length === 0);
      if (empty) {
        const id = entries[idx]?.id ?? "<unknown>";
        problems.push(
          `item for ticket ${id} is missing required field "${field}"`,
        );
      }
    }
    if (!/^\d{4}$/.test(item.id)) {
      problems.push(`item.id "${item.id}" is not a 4-digit ticket id`);
    }
    if (!item.url.startsWith(`${BASE_URL}/changelog#`)) {
      problems.push(
        `item.url "${item.url}" is not a ${BASE_URL}/changelog# permalink`,
      );
    }
    if (isNaN(Date.parse(item.date_published))) {
      problems.push(
        `item.date_published "${item.date_published}" did not parse as ISO-8601`,
      );
    }
  });

  // Ordering: newest-first. Adjacent-pair check keeps the assertion O(n).
  for (let i = 1; i < feed.items.length; i++) {
    const prev = Date.parse(feed.items[i - 1].date_published);
    const curr = Date.parse(feed.items[i].date_published);
    if (prev < curr) {
      problems.push(
        `items are not newest-first at index ${i}: ${feed.items[i - 1].date_published} < ${feed.items[i].date_published}`,
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
      `✗ changelog-json: ${problems.length} invariant violation(s); broken feed saved to ${relative(ROOT, BROKEN_PATH)}`,
    );
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
}

export default async function generateChangelogJson(): Promise<{ count: number }> {
  mkdirSync(OUT_DIR, { recursive: true });
  const feed = buildFeed(changelogEntries);
  const json = JSON.stringify(feed, null, 2) + "\n";
  writeFileSync(OUT_PATH, json, "utf-8");
  assertWrittenFeed(json, feed, changelogEntries);
  console.log(
    `✓ JSON Feed generated with ${feed.items.length} entries -> ${relative(ROOT, OUT_PATH)}`,
  );
  return { count: feed.items.length };
}

if (process.argv[1] && process.argv[1].endsWith("generate-changelog-json.ts")) {
  generateChangelogJson().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}

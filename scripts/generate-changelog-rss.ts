import { mkdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { changelogEntries, type ChangelogEntry } from "../src/data/changelogEntries";
import { escapeXml } from "./lib/escapeXml";

// Ticket 0055 - RSS 2.0 feed of shipped tickets at /changelog/rss.xml.
// Mirrors scripts/generate-rss.ts (the blog generator). Invoked from the
// end of generateChangelog() so the build chain writes the data before the
// feed reads it. No package.json edit, no new dependency. Per the
// 2026-05-28 inline-assertion lesson, the post-write block fails the build
// on empty file, missing required <item> children, or any U+2014 em-dash.

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "public", "changelog");
const OUT_PATH = join(OUT_DIR, "rss.xml");
const BROKEN_PATH = OUT_PATH + ".broken";
const BASE_URL = "https://digitalcraftai.com";
const FEED_URL = `${BASE_URL}/changelog/rss.xml`;
const CHANNEL_LINK = `${BASE_URL}/changelog`;
const CHANNEL_TITLE = "Digital Craft AI Changelog";
const CHANNEL_DESCRIPTION =
  "Recently shipped features and improvements on Digital Craft AI.";
const EM_DASH = String.fromCharCode(8212);
const REQUIRED_ITEM_TAGS = ["title", "link", "guid", "pubDate", "description", "category"] as const;

function toRfc822(dateStr: string): string {
  // Anchor at noon UTC so RFC 822 output is timezone-stable.
  return new Date(dateStr + "T12:00:00Z").toUTCString();
}

function buildItem(entry: ChangelogEntry): string {
  const url = `${BASE_URL}/changelog#${entry.id}`;
  // Description is area + ship date per AC #1, never a repeat of the title.
  const desc = `Shipped ${entry.created} in area: ${entry.area}.`;
  return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${url}</link>
      <description>${escapeXml(desc)}</description>
      <pubDate>${toRfc822(entry.created)}</pubDate>
      <guid isPermaLink="true">${url}</guid>
      <category>${escapeXml(entry.area)}</category>
    </item>`;
}

function buildFeed(entries: readonly ChangelogEntry[]): string {
  const items = entries.map(buildItem).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(CHANNEL_TITLE)}</title>
    <link>${CHANNEL_LINK}</link>
    <description>${escapeXml(CHANNEL_DESCRIPTION)}</description>
    <language>en-us</language>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

function assertWrittenFeed(xml: string, entries: readonly ChangelogEntry[]): void {
  const problems: string[] = [];

  let size = 0;
  try { size = statSync(OUT_PATH).size; }
  catch (err) { problems.push(`stat(${OUT_PATH}) failed: ${String(err)}`); }
  if (size === 0) problems.push("output file is empty");

  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  if (items.length !== entries.length) {
    problems.push(`expected ${entries.length} <item> block(s), found ${items.length}`);
  }
  items.forEach((item, idx) => {
    for (const tag of REQUIRED_ITEM_TAGS) {
      // <guid> carries isPermaLink, so the opening tag may include attributes.
      const re = new RegExp(`<${tag}(?:\\s[^>]*)?>[^<]+<\\/${tag}>`);
      if (!re.test(item)) {
        const id = entries[idx]?.id ?? "<unknown>";
        problems.push(`<item> for ticket ${id} is missing required child <${tag}>`);
      }
    }
  });

  if (xml.includes(EM_DASH)) problems.push("output contains a U+2014 em-dash character");

  if (problems.length > 0) {
    try { writeFileSync(BROKEN_PATH, xml, "utf-8"); } catch { /* best-effort */ }
    console.error(`✗ changelog-rss: ${problems.length} invariant violation(s); broken feed saved to ${relative(ROOT, BROKEN_PATH)}`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
}

export default async function generateChangelogRss(): Promise<{ count: number }> {
  mkdirSync(OUT_DIR, { recursive: true });
  const xml = buildFeed(changelogEntries);
  writeFileSync(OUT_PATH, xml, "utf-8");
  assertWrittenFeed(xml, changelogEntries);
  console.log(`✓ RSS feed generated with ${changelogEntries.length} entries -> ${relative(ROOT, OUT_PATH)}`);
  return { count: changelogEntries.length };
}

if (process.argv[1] && process.argv[1].endsWith("generate-changelog-rss.ts")) {
  generateChangelogRss().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}

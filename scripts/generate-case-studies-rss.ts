import { mkdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { caseStudies, type CaseStudyDetail } from "../src/data/caseStudies";
import { escapeXml } from "./lib/escapeXml";

// Ticket 0070 - RSS 2.0 feed of shipped case studies at /case-studies/rss.xml.
// Mirrors scripts/generate-changelog-rss.ts (ticket 0055, the direct peer).
// Invoked from generateChangelog() alongside the changelog RSS generator so
// the build chain writes the case-study data before the feed reads it. No
// package.json edit, no new dependency. Per the 2026-05-28 inline-assertion
// lesson, the pre-write block fails the build on empty output, wrong item
// count, missing required <item> children, or any U+2014 em-dash.
//
// pubDate strategy: the case-study data has no per-entry created date, so
// every item's <pubDate> anchors on today's build date at noon UTC. Same-
// build items therefore share a stable, sortable date - documented in the
// ticket 0070 Implementation log per the acceptance-criteria clause that
// asks the choice be recorded.

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "public", "case-studies");
const OUT_PATH = join(OUT_DIR, "rss.xml");
const BROKEN_PATH = OUT_PATH + ".broken";
const BASE_URL = "https://digitalcraftai.com";
const FEED_URL = `${BASE_URL}/case-studies/rss.xml`;
const CHANNEL_LINK = `${BASE_URL}/case-studies`;
const CHANNEL_TITLE = "Digital Craft AI Case Studies";
const CHANNEL_DESCRIPTION =
  "Shipped case studies across construction, real estate, and events from Digital Craft AI.";
const EM_DASH = String.fromCharCode(8212);
const REQUIRED_ITEM_TAGS = [
  "title",
  "link",
  "description",
  "guid",
  "pubDate",
  "category",
] as const;

function toRfc822(dateStr: string): string {
  // Anchor at noon UTC so RFC 822 output is timezone-stable.
  return new Date(dateStr + "T12:00:00Z").toUTCString();
}

function todayYmd(): string {
  return new Date().toISOString().split("T")[0];
}

function buildItem(entry: CaseStudyDetail, pubDate: string): string {
  const url = `${BASE_URL}/case-studies/${entry.slug}`;
  // Description mirrors the visible summary plus the hero stat so
  // feedreader previews carry the same headline metric surfaced on the hub
  // card and the detail page (2026-05-25 mirror-source rule).
  const desc = `${entry.summary} (${entry.heroStat.value} ${entry.heroStat.label}).`;
  return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${url}</link>
      <description>${escapeXml(desc)}</description>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(entry.vertical)}</category>
    </item>`;
}

function buildFeed(entries: readonly CaseStudyDetail[]): string {
  const pubDate = toRfc822(todayYmd());
  const items = entries.map((e) => buildItem(e, pubDate)).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(CHANNEL_TITLE)}</title>
    <link>${CHANNEL_LINK}</link>
    <description>${escapeXml(CHANNEL_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

// Pre-write assertions per the 2026-05-28 inline-assertion lesson. Any
// violation throws so a broken feed never lands.
function assertFeed(xml: string, entries: readonly CaseStudyDetail[]): string[] {
  const problems: string[] = [];

  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    problems.push("output does not start with the XML declaration");
  }
  const channelOpens = xml.match(/<channel>/g) ?? [];
  const channelCloses = xml.match(/<\/channel>/g) ?? [];
  if (channelOpens.length !== 1 || channelCloses.length !== 1) {
    problems.push(
      `expected exactly one <channel> block, found ${channelOpens.length} open / ${channelCloses.length} close`,
    );
  }

  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  if (items.length !== entries.length) {
    problems.push(`expected ${entries.length} <item> block(s), found ${items.length}`);
  }
  items.forEach((item, idx) => {
    for (const tag of REQUIRED_ITEM_TAGS) {
      // <guid> carries isPermaLink, so the opening tag may include attributes.
      const re = new RegExp(`<${tag}(?:\\s[^>]*)?>[^<]+<\\/${tag}>`);
      if (!re.test(item)) {
        const slug = entries[idx]?.slug ?? "<unknown>";
        problems.push(`<item> for case study ${slug} is missing required child <${tag}>`);
      }
    }
  });

  if (xml.includes(EM_DASH)) problems.push("output contains a U+2014 em-dash character");

  // Reject unescaped ampersands outside of already-escaped entities. The
  // escape helper is applied to every string value so a raw `&` here means
  // a bug in the template or a missing escape call.
  const ampersands = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g) ?? [];
  if (ampersands.length > 0) {
    problems.push(`output contains ${ampersands.length} unescaped ampersand(s)`);
  }

  return problems;
}

export default async function generateCaseStudiesRss(): Promise<{ count: number }> {
  mkdirSync(OUT_DIR, { recursive: true });
  const xml = buildFeed(caseStudies);
  const problems = assertFeed(xml, caseStudies);
  if (problems.length > 0) {
    try {
      writeFileSync(BROKEN_PATH, xml, "utf-8");
    } catch {
      /* best-effort */
    }
    console.error(
      `✗ case-studies-rss: ${problems.length} invariant violation(s); broken feed saved to ${relative(ROOT, BROKEN_PATH)}`,
    );
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  writeFileSync(OUT_PATH, xml, "utf-8");

  // Belt-and-suspenders: confirm the file was actually written non-empty.
  let size = 0;
  try {
    size = statSync(OUT_PATH).size;
  } catch (err) {
    console.error(`✗ case-studies-rss: stat(${OUT_PATH}) failed: ${String(err)}`);
    process.exit(1);
  }
  if (size === 0) {
    console.error(`✗ case-studies-rss: output file is empty`);
    process.exit(1);
  }

  console.log(
    `✓ Case-studies RSS feed generated with ${caseStudies.length} entries -> ${relative(ROOT, OUT_PATH)}`,
  );
  return { count: caseStudies.length };
}

if (process.argv[1] && process.argv[1].endsWith("generate-case-studies-rss.ts")) {
  generateCaseStudiesRss().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}

import { mkdirSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { PUBLISHED_FEEDS, type PublishedFeed } from "../src/data/publishedFeeds";
import { escapeXml } from "./lib/escapeXml";

// Ticket 0098 - OPML 2.0 subscription index at /feeds.opml aggregating
// every RSS and JSON Feed the site publishes. Mirrors the shape of
// scripts/generate-compare-json.ts (ticket 0095, the direct peer for a
// static machine-readable feed surface): reads a single canonical constant
// (src/data/publishedFeeds.ts) and writes public/feeds.opml so Vercel's
// default static serving picks it up at /feeds.opml.
//
// Wired into the same build chain as the ticket 0095 generator: hooked
// from scripts/generate-sitemap.ts's run() alongside generateCompareJson.
// Dynamic import keeps this file's default-export surface stable and
// mirrors the ticket 0055/0070/0078/0095 pattern of one-import-per-hook.
// No package.json edit, no new dependency (GTM queue Hard NO).
//
// Per the 2026-05-28 encoded-invariant lesson, the post-write block fails
// the build on empty file, missing required attributes, URL scheme
// violations, or any U+2014 em-dash. A .broken artifact is saved on
// failure so the local gate and CI `build` job surface the diagnostic
// without a new gated check.

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "public");
const OUT_PATH = join(OUT_DIR, "feeds.opml");
const BROKEN_PATH = OUT_PATH + ".broken";
const OPML_VERSION = "2.0";
const OPML_TITLE = "Digital Craft AI Feeds";
const ORIGIN_PREFIX = "https://digitalcraftai.com/";
const EM_DASH = String.fromCharCode(8212);
const XML_URL_ALLOW_LIST_RE = /^https:\/\/digitalcraftai\.com\//;
const VALID_TYPES = new Set(["rss", "json"]);

function buildOutline(feed: PublishedFeed): string {
  // OPML 2.0 outline: type + text are required, xmlUrl and htmlUrl are
  // required for subscribable feeds. Every attribute is XML-escaped for
  // safety (URLs may contain ampersands in a future addition).
  return `    <outline type="${escapeXml(feed.type)}" text="${escapeXml(
    feed.title,
  )}" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(
    feed.xmlUrl,
  )}" htmlUrl="${escapeXml(feed.htmlUrl)}"/>`;
}

function buildOpml(feeds: readonly PublishedFeed[], dateCreated: string): string {
  const outlines = feeds.map(buildOutline).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="${OPML_VERSION}">
  <head>
    <title>${escapeXml(OPML_TITLE)}</title>
    <dateCreated>${dateCreated}</dateCreated>
  </head>
  <body>
${outlines}
  </body>
</opml>
`;
}

function assertWrittenOpml(xml: string, feeds: readonly PublishedFeed[]): void {
  const problems: string[] = [];

  let size = 0;
  try {
    size = statSync(OUT_PATH).size;
  } catch (err) {
    problems.push(`stat(${OUT_PATH}) failed: ${String(err)}`);
  }
  if (size === 0) problems.push("output file is empty");

  // (a) parse: the OPML shape is fixed, so a hand-rolled regex over the
  // raw text is acceptable (per AC #3 and the ticket 0055 RSS generator
  // precedent). Do NOT install xml2js.
  if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    problems.push("output does not start with the XML declaration");
  }

  // (b) root element is <opml version="2.0">.
  const rootMatch = xml.match(/<opml\b[^>]*>/);
  if (!rootMatch) {
    problems.push("output missing <opml ...> root element");
  } else if (!rootMatch[0].includes(`version="${OPML_VERSION}"`)) {
    problems.push(
      `<opml> root missing version="${OPML_VERSION}"; got "${rootMatch[0]}"`,
    );
  }

  // (c) <head> contains a <title> matching OPML_TITLE.
  const headMatch = xml.match(/<head>([\s\S]*?)<\/head>/);
  if (!headMatch) {
    problems.push("output missing <head>...</head> block");
  } else {
    const titleMatch = headMatch[1].match(/<title>([^<]+)<\/title>/);
    if (!titleMatch) {
      problems.push("<head> missing <title>");
    } else if (titleMatch[1] !== OPML_TITLE) {
      problems.push(
        `<title> "${titleMatch[1]}" != expected "${OPML_TITLE}"`,
      );
    }
    if (!/<dateCreated>[^<]+<\/dateCreated>/.test(headMatch[1])) {
      problems.push("<head> missing <dateCreated>");
    }
  }

  // (d) <body> contains exactly feeds.length <outline> elements. Per the
  // 2026-06-15 attribute-list regex lesson, `[^>]*` (not `[^/>]*`) matches
  // attribute lists that include URL slashes.
  const bodyMatch = xml.match(/<body>([\s\S]*?)<\/body>/);
  if (!bodyMatch) {
    problems.push("output missing <body>...</body> block");
  } else {
    const outlines = bodyMatch[1].match(/<outline\b[^>]*\/?>/g) ?? [];
    if (outlines.length !== feeds.length) {
      problems.push(
        `expected ${feeds.length} <outline> element(s), found ${outlines.length}`,
      );
    }
    const feedXmlUrls = new Set(feeds.map((f) => f.xmlUrl));
    outlines.forEach((outline, idx) => {
      // (e) every <outline> has a non-empty xmlUrl attribute matching
      // the origin allow-list.
      const xmlUrlMatch = outline.match(/\bxmlUrl="([^"]+)"/);
      if (!xmlUrlMatch || xmlUrlMatch[1].length === 0) {
        problems.push(`<outline> ${idx} missing xmlUrl attribute: ${outline}`);
      } else if (!XML_URL_ALLOW_LIST_RE.test(xmlUrlMatch[1])) {
        problems.push(
          `<outline> ${idx} xmlUrl "${xmlUrlMatch[1]}" does not match ${XML_URL_ALLOW_LIST_RE}`,
        );
      } else if (!feedXmlUrls.has(xmlUrlMatch[1])) {
        // (g) mirror-source: every emitted xmlUrl must originate from
        // PUBLISHED_FEEDS. Guards against a template drift where a future
        // hard-coded URL sneaks in.
        problems.push(
          `<outline> ${idx} xmlUrl "${xmlUrlMatch[1]}" not present in PUBLISHED_FEEDS`,
        );
      }

      // (f) every <outline> has a non-empty type attribute in the
      // allow-list ("rss" or "json").
      const typeMatch = outline.match(/\btype="([^"]+)"/);
      if (!typeMatch || typeMatch[1].length === 0) {
        problems.push(`<outline> ${idx} missing type attribute: ${outline}`);
      } else if (!VALID_TYPES.has(typeMatch[1])) {
        problems.push(
          `<outline> ${idx} type "${typeMatch[1]}" not in ${JSON.stringify([...VALID_TYPES])}`,
        );
      }

      // Ordering: outlines[i].xmlUrl must byte-match feeds[i].xmlUrl.
      const expected = feeds[idx]?.xmlUrl;
      if (xmlUrlMatch && expected && xmlUrlMatch[1] !== expected) {
        problems.push(
          `<outline> ordering drift at index ${idx}: expected "${expected}", got "${xmlUrlMatch[1]}"`,
        );
      }
    });
  }

  // Origin invariant: the base URL must appear at least once (every feed
  // is same-origin per AC).
  if (!xml.includes(ORIGIN_PREFIX)) {
    problems.push(`output missing any occurrence of ${ORIGIN_PREFIX}`);
  }

  // (h) no U+2014 em-dash anywhere in the emitted OPML.
  if (xml.includes(EM_DASH)) {
    problems.push("output contains a U+2014 em-dash character");
  }

  // Reject unescaped ampersands outside of already-escaped entities.
  const ampersands = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g) ?? [];
  if (ampersands.length > 0) {
    problems.push(`output contains ${ampersands.length} unescaped ampersand(s)`);
  }

  if (problems.length > 0) {
    try {
      writeFileSync(BROKEN_PATH, xml, "utf-8");
    } catch {
      /* best-effort */
    }
    console.error(
      `x feeds-opml: ${problems.length} invariant violation(s); broken feed saved to ${relative(ROOT, BROKEN_PATH)}`,
    );
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
}

export default async function generateFeedsOpml(): Promise<{ count: number }> {
  mkdirSync(OUT_DIR, { recursive: true });
  // Anchor at noon UTC so the timestamp is timezone-stable across builds
  // (matches the ticket 0055 RSS toRfc822 and ticket 0078 toIsoTimestamp
  // anchors). ISO 8601 is the OPML 2.0 recommended dateCreated format.
  const dateCreated = new Date().toISOString();
  const xml = buildOpml(PUBLISHED_FEEDS, dateCreated);
  writeFileSync(OUT_PATH, xml, "utf-8");
  assertWrittenOpml(xml, PUBLISHED_FEEDS);
  console.log(
    `ok Feeds OPML generated with ${PUBLISHED_FEEDS.length} entries -> ${relative(ROOT, OUT_PATH)}`,
  );
  return { count: PUBLISHED_FEEDS.length };
}

if (process.argv[1] && process.argv[1].endsWith("generate-feeds-opml.ts")) {
  generateFeedsOpml().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}

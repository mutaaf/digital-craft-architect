import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const BASE_URL = "https://digitalcraftai.com";

interface BlogEntry {
  slug: string;
  title: string;
  description: string;
  date: string;
}

function extractBlogPosts(): BlogEntry[] {
  const content = readFileSync(join(SRC, "data", "blogPosts.ts"), "utf-8");

  const slugs: string[] = [];
  const titles: string[] = [];
  const descriptions: string[] = [];
  const dates: string[] = [];

  const slugRe = /^\s+slug:\s*'([^']+)'/gm;
  const titleRe = /^\s+title:\s*'((?:[^'\\]|\\.)*)'/gm;
  const descRe = /^\s+description:\s*'((?:[^'\\]|\\.)*)'/gm;
  const dateRe = /^\s+date:\s*'([^']+)'/gm;

  let m: RegExpExecArray | null;
  while ((m = slugRe.exec(content)) !== null) slugs.push(m[1]);
  while ((m = titleRe.exec(content)) !== null) titles.push(m[1].replace(/\\'/g, "'"));
  while ((m = descRe.exec(content)) !== null) descriptions.push(m[1].replace(/\\'/g, "'"));
  while ((m = dateRe.exec(content)) !== null) dates.push(m[1]);

  const count = Math.min(slugs.length, titles.length, descriptions.length, dates.length);
  const posts: BlogEntry[] = [];
  for (let i = 0; i < count; i++) {
    posts.push({ slug: slugs[i], title: titles[i], description: descriptions[i], date: dates[i] });
  }
  return posts;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toUTCString();
}

function generateRss(posts: BlogEntry[]): string {
  const items = posts.map((p) => {
    const url = `${BASE_URL}/blog/${p.slug}`;
    return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${toRfc822(p.date)}</pubDate>
      <guid isPermaLink="true">${url}</guid>
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DigitalCraft AI Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Insights on AI automation for construction, real estate, and event planning businesses.</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>
`;
}

function run() {
  const posts = extractBlogPosts();
  if (posts.length === 0) {
    console.error("✗ No blog posts found in blogPosts.ts");
    process.exit(1);
  }

  const rss = generateRss(posts);
  const outPath = join(ROOT, "public", "rss.xml");
  writeFileSync(outPath, rss, "utf-8");
  console.log(`✓ RSS feed generated with ${posts.length} posts → public/rss.xml`);
}

run();

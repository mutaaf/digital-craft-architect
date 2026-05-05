import { readFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const BLOG_FILE = join(ROOT, "src", "data", "blogPosts.ts");

interface PostEntry {
  slug: string;
  date: string;
  line: number;
}

function todayUtcYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function extractPosts(content: string): PostEntry[] {
  const posts: PostEntry[] = [];
  const re = /slug:\s*'([^']+)',[\s\S]*?date:\s*'(\d{4}-\d{2}-\d{2})'/g;

  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const slug = match[1];
    const date = match[2];
    if (slug === "your-url-slug") continue;
    const line = content.slice(0, match.index).split("\n").length;
    posts.push({ slug, date, line });
  }

  return posts;
}

function run() {
  const content = readFileSync(BLOG_FILE, "utf-8");
  const posts = extractPosts(content);
  const today = todayUtcYmd();

  let errors = 0;

  const futureDates = posts.filter((p) => p.date > today);
  if (futureDates.length > 0) {
    console.error(`\n✗ ${futureDates.length} blog post(s) have a date in the future (today: ${today}):`);
    for (const p of futureDates) {
      console.error(`    src/data/blogPosts.ts:${p.line}  ${p.slug} → ${p.date}`);
    }
    errors += futureDates.length;
  }

  const byDate = new Map<string, PostEntry[]>();
  for (const p of posts) {
    if (!byDate.has(p.date)) byDate.set(p.date, []);
    byDate.get(p.date)!.push(p);
  }
  const dupes = [...byDate.entries()].filter(([, list]) => list.length > 1);
  if (dupes.length > 0) {
    console.error(`\n✗ ${dupes.length} date(s) used by more than one blog post:`);
    for (const [date, list] of dupes) {
      console.error(`    ${date} (${list.length} posts):`);
      for (const p of list) {
        console.error(`        src/data/blogPosts.ts:${p.line}  ${p.slug}`);
      }
    }
    errors += dupes.reduce((n, [, list]) => n + list.length, 0);
  }

  if (errors > 0) {
    console.error(`\n${errors} blog date issue(s) found. Each post must have a unique date that is on or before today (${today}).`);
    console.error(`Fix: set the offending entries' \`date\` field in src/data/blogPosts.ts. Use \`date +%Y-%m-%d\` for today.`);
    process.exit(1);
  }

  console.log(`✓ All ${posts.length} blog posts have unique, non-future dates (today: ${today}).`);
}

run();

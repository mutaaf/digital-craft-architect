import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const BASE_URL = "https://digitalcraftai.com";
const CTO_URL = "https://cto.digitalcraftai.com";

function readFile(path: string): string {
  return readFileSync(path, "utf-8");
}

function extractStaticRoutes(appContent: string): string[] {
  const routes: string[] = [];
  const routeRegex = /path=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = routeRegex.exec(appContent)) !== null) {
    const path = match[1];
    if (path === "*" || path.includes(":")) continue;
    routes.push(path);
  }
  return routes;
}

function extractBlogSlugs(): string[] {
  const content = readFile(join(SRC, "data", "blogPosts.ts"));
  const slugs: string[] = [];
  const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = slugRegex.exec(content)) !== null) {
    slugs.push(match[1]);
  }
  return slugs;
}

function extractClassSessionSlugs(): string[] {
  const content = readFile(join(SRC, "data", "classSessions.ts"));
  const slugs: string[] = [];
  const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = slugRegex.exec(content)) !== null) {
    slugs.push(match[1]);
  }
  return slugs;
}

function getPriority(path: string): string {
  if (path === "/") return "1.0";
  if (path === "/ai-for-small-business") return "0.9";
  const depth = path.split("/").filter(Boolean).length;
  if (depth === 1) {
    if (path === "/blog") return "0.7";
    return "0.8";
  }
  if (path.startsWith("/compare/")) return "0.8";
  if (path.endsWith("/demo")) return "0.7";
  if (path.startsWith("/blog/")) return "0.6";
  return "0.6";
}

function getChangefreq(path: string): string {
  if (path.startsWith("/blog/")) return "monthly";
  return "weekly";
}

function generateSitemap(
  routes: string[],
  blogSlugs: string[],
  classSlugs: string[],
): string {
  const allPaths = [
    ...routes,
    ...blogSlugs.map((slug) => `/blog/${slug}`),
    ...classSlugs.flatMap((slug) => [`/classes/${slug}`, `/classes/${slug}/register`]),
  ];

  const seen = new Set<string>();
  const uniquePaths = allPaths.filter((p) => {
    if (seen.has(p)) return false;
    seen.add(p);
    return true;
  });

  const entries = uniquePaths.map((path) => {
    const loc = path === "/" ? BASE_URL : `${BASE_URL}${path}`;
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>${getChangefreq(path)}</changefreq>
    <priority>${getPriority(path)}</priority>
  </url>`;
  });

  // CTO subdomain landing — distinct canonical URL
  entries.push(`  <url>
    <loc>${CTO_URL}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;
}

function run() {
  const appContent = readFile(join(SRC, "App.tsx"));
  const routes = extractStaticRoutes(appContent);
  const blogSlugs = extractBlogSlugs();
  const classSlugs = extractClassSessionSlugs();

  const sitemap = generateSitemap(routes, blogSlugs, classSlugs);
  const outPath = join(ROOT, "public", "sitemap.xml");
  writeFileSync(outPath, sitemap, "utf-8");

  const totalUrls = routes.length + blogSlugs.length + classSlugs.length * 2 + 1;
  console.log(
    `✓ Sitemap generated with ${totalUrls} URLs (${routes.length} routes + ${blogSlugs.length} blog posts + ${classSlugs.length} class sessions × 2 + 1 subdomain) → public/sitemap.xml`
  );
}

run();

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { generateChangelog } from "./generate-changelog";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const APP_TSX = join(SRC, "App.tsx");
const BLOG_POSTS = join(SRC, "data", "blogPosts.ts");
const CLASSES_JSON = join(ROOT, "api", "_classes.json");
const BASE_URL = "https://digitalcraftai.com";
const CTO_URL = "https://cto.digitalcraftai.com";

function readFile(path: string): string {
  return readFileSync(path, "utf-8");
}

function todayYmd(): string {
  return new Date().toISOString().split("T")[0];
}

const warnedFiles = new Set<string>();

/**
 * Resolve the most recent commit date that touched a given file, formatted as
 * `YYYY-MM-DD` (git's `%cs` short-date format). Falls back to today's date if
 * git returns nothing (e.g. file not yet committed, or running outside a git
 * checkout in a CI build cache) and emits a single warning per missing file
 * so a future CI failure is debuggable. Never throws - the sitemap must still
 * be emitted even if git data is unavailable.
 */
function getLastmod(absolutePath: string): string {
  const relPath = relative(ROOT, absolutePath);
  try {
    if (!existsSync(absolutePath)) {
      if (!warnedFiles.has(relPath)) {
        console.warn(
          `⚠ sitemap: file does not exist (${relPath}); falling back to today's date.`
        );
        warnedFiles.add(relPath);
      }
      return todayYmd();
    }
    const out = execSync(`git log -1 --format=%cs -- "${relPath}"`, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!out) {
      if (!warnedFiles.has(relPath)) {
        console.warn(
          `⚠ sitemap: no git history for ${relPath}; falling back to today's date.`
        );
        warnedFiles.add(relPath);
      }
      return todayYmd();
    }
    return out;
  } catch {
    if (!warnedFiles.has(relPath)) {
      console.warn(
        `⚠ sitemap: git log failed for ${relPath}; falling back to today's date.`
      );
      warnedFiles.add(relPath);
    }
    return todayYmd();
  }
}

/** Pick the more recent (lexicographically larger) of two YYYY-MM-DD strings. */
function maxDate(a: string, b: string): string {
  return a > b ? a : b;
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
  const content = readFile(BLOG_POSTS);
  const slugs: string[] = [];
  const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = slugRegex.exec(content)) !== null) {
    slugs.push(match[1]);
  }
  return slugs;
}

function extractClassSessionSlugs(): string[] {
  // Canonical class data lives in api/_classes.json - adding a session
  // means appending one object there, no other code changes required.
  const content = readFile(CLASSES_JSON);
  const data = JSON.parse(content) as Array<{ slug?: string }>;
  return data.filter((s) => typeof s?.slug === "string").map((s) => s.slug as string);
}

/**
 * Build a `ComponentName -> absolutePath` table from the `import X from "./pages/..."`
 * lines at the top of App.tsx. Used to resolve each route to its underlying
 * source file for the lastmod lookup.
 */
function buildPageImportTable(appContent: string): Map<string, string> {
  const table = new Map<string, string>();
  const importRegex = /import\s+(\w+)\s+from\s+["'](\.\/pages\/[^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(appContent)) !== null) {
    const componentName = match[1];
    const relativeImport = match[2]; // e.g. ./pages/AiForPlumbers
    const abs = join(SRC, relativeImport.replace(/^\.\//, "") + ".tsx");
    table.set(componentName, abs);
  }
  return table;
}

/**
 * For each route path, find the leaf component rendered in its `<Route ...
 * element={<X ... />}>` definition. When multiple routes share the same
 * component (e.g. `LeadResponder` across many verticals), the component file's
 * lastmod is still the right signal for the per-route registration plus the
 * shared UI; per the ticket's engineering note, App.tsx's own lastmod is also
 * folded in via `maxDate` so any route added/moved bumps every route.
 */
function buildRouteToComponentTable(appContent: string): Map<string, string> {
  const table = new Map<string, string>();
  const routeLineRegex =
    /<Route\s+path=["']([^"']+)["']\s+element=\{[\s\S]*?<(\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = routeLineRegex.exec(appContent)) !== null) {
    const path = match[1];
    const firstComponent = match[2];
    // For DemoContextProvider-wrapped routes, the FIRST captured component is
    // the wrapper, so look for the SECOND <Component in the same element block.
    if (firstComponent === "DemoContextProvider") {
      const after = appContent.slice(match.index + match[0].length);
      const inner = after.match(/<(\w+)/);
      if (inner) {
        table.set(path, inner[1]);
        continue;
      }
    }
    table.set(path, firstComponent);
  }
  return table;
}

/**
 * Resolve a route path to the absolute file path whose lastmod should drive
 * the route's <lastmod>. Returns null if the route cannot be mapped to a
 * specific page file (caller falls back to App.tsx).
 */
function resolveSourceFileForRoute(
  routePath: string,
  routeToComponent: Map<string, string>,
  componentToFile: Map<string, string>
): string | null {
  // Special-case the root: LandingRoot is a local component that delegates to
  // Index / IndexV2 based on subdomain; both files participate in its freshness.
  if (routePath === "/") {
    return join(SRC, "pages", "Index.tsx");
  }
  const component = routeToComponent.get(routePath);
  if (!component) return null;
  const file = componentToFile.get(component);
  return file ?? null;
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

function getLastmodForPath(
  path: string,
  appLastmod: string,
  routeToComponent: Map<string, string>,
  componentToFile: Map<string, string>,
  blogPostsLastmod: string,
  classesLastmod: string
): string {
  if (path.startsWith("/blog/")) {
    // All blog posts share the same data source.
    return maxDate(blogPostsLastmod, appLastmod);
  }
  if (path.startsWith("/classes/")) {
    return maxDate(classesLastmod, appLastmod);
  }
  const sourceFile = resolveSourceFileForRoute(
    path,
    routeToComponent,
    componentToFile
  );
  if (!sourceFile) {
    // Shared component or unmapped route - fall back to App.tsx, which is
    // touched whenever a route is added, moved, or removed.
    return appLastmod;
  }
  return maxDate(getLastmod(sourceFile), appLastmod);
}

function generateSitemap(
  routes: string[],
  blogSlugs: string[],
  classSlugs: string[],
  appContent: string,
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

  const appLastmod = getLastmod(APP_TSX);
  const blogPostsLastmod = getLastmod(BLOG_POSTS);
  const classesLastmod = getLastmod(CLASSES_JSON);
  const routeToComponent = buildRouteToComponentTable(appContent);
  const componentToFile = buildPageImportTable(appContent);

  const entries = uniquePaths.map((path) => {
    const loc = path === "/" ? BASE_URL : `${BASE_URL}${path}`;
    const lastmod = getLastmodForPath(
      path,
      appLastmod,
      routeToComponent,
      componentToFile,
      blogPostsLastmod,
      classesLastmod,
    );
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${getChangefreq(path)}</changefreq>
    <priority>${getPriority(path)}</priority>
  </url>`;
  });

  // CTO subdomain landing - distinct canonical URL; tied to IndexV2.tsx.
  const ctoLastmod = maxDate(
    getLastmod(join(SRC, "pages", "IndexV2.tsx")),
    appLastmod,
  );
  entries.push(`  <url>
    <loc>${CTO_URL}</loc>
    <lastmod>${ctoLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;
}

/**
 * Acceptance-criteria invariants for the emitted sitemap. Encoded here rather
 * than in a separate Vitest spec because (a) this repo has no Vitest, and
 * (b) `npm run build` invokes this script, so a thrown error fails the local
 * gate and CI build job without adding a new dependency or gated check. If
 * any invariant fails the build, the sitemap is written to a `.broken` path
 * for debugging and the process exits non-zero.
 */
function assertSitemapLastmodInvariants(xml: string, expectedUrlCount: number): void {
  const problems: string[] = [];

  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  if (urlBlocks.length !== expectedUrlCount) {
    problems.push(
      `expected ${expectedUrlCount} <url> blocks, found ${urlBlocks.length}`
    );
  }

  const dateRe = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;
  let missing = 0;
  let badFormat = 0;
  let badOrder = 0;
  for (const block of urlBlocks) {
    const lastmodMatches = block.match(/<lastmod>([^<]+)<\/lastmod>/g) ?? [];
    if (lastmodMatches.length !== 1) {
      missing++;
      continue;
    }
    const value = lastmodMatches[0].replace(/<\/?lastmod>/g, "");
    if (!dateRe.test(value)) badFormat++;
    // sitemap.org element order: loc, lastmod, changefreq, priority.
    const locIdx = block.indexOf("<loc>");
    const lastmodIdx = block.indexOf("<lastmod>");
    const changefreqIdx = block.indexOf("<changefreq>");
    const priorityIdx = block.indexOf("<priority>");
    if (
      !(locIdx < lastmodIdx && lastmodIdx < changefreqIdx && changefreqIdx < priorityIdx)
    ) {
      badOrder++;
    }
  }
  if (missing > 0) problems.push(`${missing} <url> block(s) missing exactly one <lastmod>`);
  if (badFormat > 0) problems.push(`${badFormat} <lastmod> value(s) not in YYYY-MM-DD or ISO-8601 format`);
  if (badOrder > 0) problems.push(`${badOrder} <url> block(s) have child elements out of sitemap.org order (loc, lastmod, changefreq, priority)`);

  // Self-test the resolver against a known checked-in file.
  const knownFile = join(SRC, "pages", "AiForPlumbers.tsx");
  const knownDate = getLastmod(knownFile);
  if (!dateRe.test(knownDate)) {
    problems.push(`getLastmod(AiForPlumbers.tsx) returned non-date "${knownDate}"`);
  }
  // Self-test the fallback path for a nonexistent file. Pre-seed the warn
  // dedupe set so this canary lookup does not pollute build output.
  const canary = join(ROOT, "__sitemap_self_test_missing_file__.xyz");
  warnedFiles.add(relative(ROOT, canary));
  const fallbackDate = getLastmod(canary);
  if (fallbackDate !== todayYmd()) {
    problems.push(`getLastmod fallback for missing file returned "${fallbackDate}", expected "${todayYmd()}"`);
  }

  if (problems.length > 0) {
    const brokenPath = join(ROOT, "public", "sitemap.xml.broken");
    writeFileSync(brokenPath, xml, "utf-8");
    console.error(`✗ sitemap: ${problems.length} invariant violation(s); broken XML saved to ${relative(ROOT, brokenPath)}`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
}

function run() {
  // Ticket 0032 - regenerate src/data/changelogEntries.ts from the shipped
  // backlog frontmatter BEFORE we build the sitemap. The changelog generator
  // has its own inline assertions (2026-05-28 pattern); a malformed entry
  // throws here and fails the gated build, with a .broken artifact saved.
  // Wiring this into the sitemap script keeps the GTM queue clear of any
  // package.json edit (AGENTS.md Hard NO) while still gating it on every
  // `npm run build` and CI `build` job.
  generateChangelog();

  const appContent = readFile(APP_TSX);
  const routes = extractStaticRoutes(appContent);
  const blogSlugs = extractBlogSlugs();
  const classSlugs = extractClassSessionSlugs();

  const sitemap = generateSitemap(routes, blogSlugs, classSlugs, appContent);
  const outPath = join(ROOT, "public", "sitemap.xml");
  writeFileSync(outPath, sitemap, "utf-8");

  const totalUrls = routes.length + blogSlugs.length + classSlugs.length * 2 + 1;
  console.log(
    `✓ Sitemap generated with ${totalUrls} URLs (${routes.length} routes + ${blogSlugs.length} blog posts + ${classSlugs.length} class sessions × 2 + 1 subdomain) → public/sitemap.xml`
  );

  assertSitemapLastmodInvariants(sitemap, totalUrls);
}

run();

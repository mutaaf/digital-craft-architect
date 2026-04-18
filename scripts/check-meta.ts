import { readFileSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

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

function extractMetaPages(htmlContent: string): Set<string> {
  const pagesMatch = htmlContent.match(/var pages\s*=\s*\{(.+)\};/);
  if (!pagesMatch) {
    console.error("✗ Could not find pages object in index.html");
    process.exit(1);
  }
  const routes = new Set<string>();
  const keyRegex = /"(\/[^"]*)":\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = keyRegex.exec(pagesMatch[1])) !== null) {
    routes.add(match[1]);
  }
  return routes;
}

function extractPrefixImages(htmlContent: string): string[] {
  const prefixes: string[] = [];
  const prefixMatch = htmlContent.match(/var prefixImg\s*=\s*\[(.*?)\];/s);
  if (!prefixMatch) return prefixes;
  const entryRegex = /\["([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(prefixMatch[1])) !== null) {
    prefixes.push(match[1]);
  }
  return prefixes;
}

function hasOgImageCoverage(route: string, prefixes: string[]): boolean {
  for (const prefix of prefixes) {
    if (route === prefix || route.startsWith(prefix + "/")) return true;
  }
  return false;
}

function run() {
  const appContent = readFile(join(SRC, "App.tsx"));
  const htmlContent = readFile(join(ROOT, "index.html"));

  const routes = extractStaticRoutes(appContent);
  const metaPages = extractMetaPages(htmlContent);
  const imgPrefixes = extractPrefixImages(htmlContent);

  let missingMeta = 0;
  let missingOgImage = 0;

  const missingMetaRoutes: string[] = [];
  const missingOgRoutes: string[] = [];

  for (const route of routes) {
    if (!metaPages.has(route)) {
      missingMetaRoutes.push(route);
      missingMeta++;
    }
    if (!metaPages.has(route) || !hasOgImageCoverage(route, imgPrefixes)) {
      const page = metaPages.has(route);
      if (!page && !hasOgImageCoverage(route, imgPrefixes)) {
        missingOgRoutes.push(route);
        missingOgImage++;
      }
    }
  }

  if (missingMetaRoutes.length > 0) {
    console.warn("\n⚠ Routes missing explicit meta tags in index.html:");
    for (const r of missingMetaRoutes) {
      const hasOg = hasOgImageCoverage(r, imgPrefixes);
      console.warn(`  ${r}${hasOg ? "" : " (also missing OG image prefix)"}`);
    }
  }

  if (missingMeta === 0 && missingOgImage === 0) {
    console.log(
      `✓ All ${routes.length} routes have meta tag configuration.`
    );
  } else {
    console.warn(
      `\n⚠ ${missingMeta} of ${routes.length} routes missing explicit meta tags (falling back to homepage defaults).`
    );
    if (missingOgImage > 0) {
      console.warn(
        `⚠ ${missingOgImage} routes also missing OG image prefix coverage (using default image).`
      );
    }
  }
}

run();

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

function readFile(path: string): string {
  return readFileSync(path, "utf-8");
}

function collectFiles(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
      results.push(...collectFiles(full, exts));
    } else if (exts.includes(extname(full))) {
      results.push(full);
    }
  }
  return results;
}

function extractRoutes(appContent: string): { static: Set<string>; dynamic: { pattern: RegExp; template: string }[] } {
  const staticRoutes = new Set<string>();
  const dynamicRoutes: { pattern: RegExp; template: string }[] = [];

  const routeRegex = /path=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = routeRegex.exec(appContent)) !== null) {
    const path = match[1];
    if (path === "*") continue;
    if (path.includes(":")) {
      const regexStr = "^" + path.replace(/:[^/]+/g, "[^/]+") + "$";
      dynamicRoutes.push({ pattern: new RegExp(regexStr), template: path });
    } else {
      staticRoutes.add(path);
    }
  }

  return { static: staticRoutes, dynamic: dynamicRoutes };
}

function extractBlogSlugs(srcDir: string): string[] {
  const blogPostsPath = join(srcDir, "data", "blogPosts.ts");
  try {
    const content = readFile(blogPostsPath);
    const slugs: string[] = [];
    const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = slugRegex.exec(content)) !== null) {
      slugs.push(match[1]);
    }
    return slugs;
  } catch {
    return [];
  }
}

interface LinkInfo {
  file: string;
  line: number;
  link: string;
  type: "to" | "href";
}

function extractLinks(files: string[]): LinkInfo[] {
  const links: LinkInfo[] = [];
  const linkRegex = /(?:to|href)=["']([^"']+)["']/g;
  const toRegex = /to=["']([^"']+)["']/;

  for (const file of files) {
    const content = readFile(file);
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match: RegExpExecArray | null;
      linkRegex.lastIndex = 0;
      while ((match = linkRegex.exec(line)) !== null) {
        const link = match[1];
        if (
          link.startsWith("http://") ||
          link.startsWith("https://") ||
          link.startsWith("mailto:") ||
          link.startsWith("tel:") ||
          link.startsWith("#") ||
          link.startsWith("{") ||
          link.includes("${")
        ) {
          continue;
        }
        if (!link.startsWith("/")) continue;

        const ext = link.split("?")[0].split("#")[0].split(".").pop();
        const assetExts = ["svg", "ico", "png", "jpg", "jpeg", "gif", "webp", "css", "js", "xml", "txt", "pdf", "woff", "woff2", "ttf", "eot", "map", "json"];
        if (ext && assetExts.includes(ext)) continue;

        const type = toRegex.test(match[0]) ? "to" : "href";
        const relFile = file.replace(ROOT + "/", "");
        links.push({ file: relFile, line: i + 1, link, type });
      }
    }
  }
  return links;
}

function run() {
  const appContent = readFile(join(SRC, "App.tsx"));
  const routes = extractRoutes(appContent);
  const blogSlugs = extractBlogSlugs(SRC);

  const files = collectFiles(SRC, [".tsx", ".ts"]);
  const htmlFiles = collectFiles(ROOT, [".html"]).filter(
    (f) => !f.includes("node_modules") && !f.includes("dist")
  );
  const allFiles = [...files, ...htmlFiles];
  const links = extractLinks(allFiles);

  let errors = 0;

  for (const { file, line, link, type } of links) {
    const pathOnly = link.split("#")[0].split("?")[0];

    if (!pathOnly || pathOnly === "/") {
      if (routes.static.has("/")) continue;
    }

    if (routes.static.has(pathOnly)) continue;

    let matchesDynamic = false;
    for (const dyn of routes.dynamic) {
      if (dyn.pattern.test(pathOnly)) {
        if (dyn.template === "/blog/:slug") {
          const slug = pathOnly.replace("/blog/", "");
          if (!blogSlugs.includes(slug)) {
            console.error(
              `✗ ${file}:${line} — ${type}="${link}" matches /blog/:slug but slug "${slug}" not found in blogPosts.ts`
            );
            errors++;
          }
        }
        matchesDynamic = true;
        break;
      }
    }
    if (matchesDynamic) continue;

    console.error(
      `✗ ${file}:${line} — ${type}="${link}" has no matching route`
    );
    errors++;
  }

  if (errors > 0) {
    console.error(`\n${errors} broken internal link(s) found.`);
    process.exit(1);
  } else {
    console.log(`✓ All internal links valid (${links.length} links checked against ${routes.static.size} static routes + ${routes.dynamic.length} dynamic routes).`);
    process.exit(0);
  }
}

run();

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname, relative } from "path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const PUBLIC = join(ROOT, "public");

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

function collectPublicImages(dir: string): Set<string> {
  const images = new Set<string>();
  const imageExts = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico"];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      for (const img of collectPublicImages(full)) {
        images.add(img);
      }
    } else if (imageExts.includes(extname(full).toLowerCase())) {
      const rel = "/" + relative(PUBLIC, full);
      images.add(rel);
    }
  }
  return images;
}

interface ImageRef {
  file: string;
  line: number;
  path: string;
  type: string;
}

const IMAGE_EXTS = /\.(png|jpe?g|gif|svg|webp|ico)$/i;

function extractImageRefs(files: string[]): ImageRef[] {
  const refs: ImageRef[] = [];

  const patterns: { regex: RegExp; type: string }[] = [
    { regex: /(?:src|content)=["'](\/[^"']+)["']/g, type: "attribute" },
    { regex: /href=["'](\/[^"']*\.(?:png|jpe?g|gif|svg|webp|ico))["']/gi, type: "href" },
  ];

  for (const file of files) {
    const content = readFile(file);
    const lines = content.split("\n");
    const relFile = relative(ROOT, file);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const { regex, type } of patterns) {
        regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(line)) !== null) {
          const path = match[1];
          if (!IMAGE_EXTS.test(path)) continue;
          if (path.startsWith("//")) continue;
          refs.push({ file: relFile, line: i + 1, path, type });
        }
      }
    }
  }

  return refs;
}

function extractContentJsonRefs(): ImageRef[] {
  const refs: ImageRef[] = [];
  const contentPath = join(PUBLIC, "content.json");
  if (!existsSync(contentPath)) return refs;

  const content = readFile(contentPath);
  const lines = content.split("\n");
  const relFile = relative(ROOT, contentPath);

  const regex = /["'](lovable-uploads\/[^"']+\.(?:png|jpe?g|gif|svg|webp))["']/gi;

  for (let i = 0; i < lines.length; i++) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(lines[i])) !== null) {
      refs.push({ file: relFile, line: i + 1, path: "/" + match[1], type: "content.json" });
    }
  }

  return refs;
}

function extractIndexHtmlOgRefs(): ImageRef[] {
  const refs: ImageRef[] = [];
  const htmlPath = join(ROOT, "index.html");
  if (!existsSync(htmlPath)) return refs;

  const content = readFile(htmlPath);
  const lines = content.split("\n");
  const origin = "https://digitalcraftai.com";

  const regex = new RegExp(`${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\/[^"'\\s]+\\.(?:png|jpe?g|gif|svg|webp|ico))`, "gi");

  for (let i = 0; i < lines.length; i++) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(lines[i])) !== null) {
      refs.push({ file: "index.html", line: i + 1, path: match[1], type: "og-absolute" });
    }
  }

  return refs;
}

function run() {
  const publicImages = collectPublicImages(PUBLIC);
  const codeFiles = [
    ...collectFiles(SRC, [".tsx", ".ts"]),
    join(ROOT, "index.html"),
  ];

  const codeRefs = extractImageRefs(codeFiles);
  const contentRefs = extractContentJsonRefs();
  const ogRefs = extractIndexHtmlOgRefs();
  const allRefs = [...codeRefs, ...contentRefs, ...ogRefs];

  const referencedImages = new Set<string>();
  let errors = 0;

  for (const ref of allRefs) {
    referencedImages.add(ref.path);
    if (!publicImages.has(ref.path)) {
      console.error(`✗ ${ref.file}:${ref.line} — image "${ref.path}" not found in public/`);
      errors++;
    }
  }

  const unreferenced: string[] = [];
  for (const img of publicImages) {
    if (!referencedImages.has(img)) {
      unreferenced.push(img);
    }
  }

  if (unreferenced.length > 0) {
    console.log(`\nUnreferenced images in public/ (could be cleaned up):`);
    for (const img of unreferenced.sort()) {
      console.log(`  ? ${img}`);
    }
  }

  if (errors > 0) {
    console.error(`\n${errors} missing image(s) found.`);
    process.exit(1);
  } else {
    console.log(`\n✓ All referenced images exist (${allRefs.length} references checked, ${publicImages.size} images in public/).`);
    if (unreferenced.length > 0) {
      console.log(`  ${unreferenced.length} unreferenced image(s) could be cleaned up.`);
    }
    process.exit(0);
  }
}

run();

#!/usr/bin/env node
// aurora-field is vendored, pinned by hash in src/vendor/aurora-field.json:
//   public/vendor/aurora-field@<version>/aurora-field.min.js   the browser build (the CTO hero loads it after first paint)
//   api/_scene/aurora-field.cjs                                the same library for /api/scene: validate() and schema()
//
//   node scripts/aurora-field.mjs                    verify both copies match the lock (CI)
//   node scripts/aurora-field.mjs --sync <repo-dir>  copy them in from an aurora-field checkout and rewrite the lock
//
// Same pattern as mutaafaziz.com's data/aurora-field.json. No dependencies.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCK = join(ROOT, "src", "vendor", "aurora-field.json");
const API = join(ROOT, "api", "_scene", "aurora-field.cjs");
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const browser = (version) => join(ROOT, "public", "vendor", `aurora-field@${version}`, "aurora-field.min.js");

const i = process.argv.indexOf("--sync");
if (i > 0) {
  const repo = process.argv[i + 1];
  if (!repo) { console.error("usage: node scripts/aurora-field.mjs --sync <path to aurora-field>"); process.exit(2); }
  const src = readFileSync(join(repo, "src", "aurora-field.js"));
  const min = readFileSync(join(repo, "dist", "aurora-field.min.js"));
  const version = (String(src).match(/var VERSION = '([^']+)'/) || [])[1];
  if (!version) { console.error("✗ could not read VERSION from the library"); process.exit(1); }
  let commit = null;
  try { commit = execFileSync("git", ["-C", repo, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch { /* not a checkout */ }
  if (existsSync(LOCK)) {
    const old = JSON.parse(readFileSync(LOCK, "utf8"));
    if (old.version !== version) rmSync(dirname(browser(old.version)), { recursive: true, force: true });
  }
  mkdirSync(dirname(browser(version)), { recursive: true });
  writeFileSync(browser(version), min);
  mkdirSync(dirname(API), { recursive: true });
  writeFileSync(API, src);
  mkdirSync(dirname(LOCK), { recursive: true });
  writeFileSync(LOCK, JSON.stringify({ version, browser: sha(min), api: sha(src), commit, source: "https://github.com/mutaaf/aurora-field" }, null, 2) + "\n");
  console.log(`✓ vendored aurora-field ${version} (browser ${sha(min).slice(0, 12)}, api ${sha(src).slice(0, 12)})`);
  process.exit(0);
}

const lock = JSON.parse(readFileSync(LOCK, "utf8"));
let bad = 0;
for (const [file, want] of [[browser(lock.version), lock.browser], [API, lock.api]]) {
  if (!existsSync(file)) { console.error(`✗ aurora-field ${lock.version} is locked but ${file} is missing`); bad++; continue; }
  const got = sha(readFileSync(file));
  if (got !== want) { console.error(`✗ aurora-field drift: ${file} hashes to ${got}, the lock says ${want}`); bad++; }
}
if (bad) { console.error("  Re-vendor with: node scripts/aurora-field.mjs --sync <path to aurora-field>"); process.exit(1); }
console.log(`✓ aurora-field ${lock.version}: vendored files match the lock.`);

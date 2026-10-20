#!/usr/bin/env node
// The app launcher shared with mutaafaziz.com is vendored, pinned by hash in src/vendor/launcher.json:
//   public/vendor/launcher@<version>/launcher.js   both navbars load it after first paint (AppLauncher.tsx)
//
//   node scripts/launcher.mjs                    verify the copy matches the lock (CI)
//   node scripts/launcher.mjs --sync <repo-dir>  copy it in from a launcher checkout and rewrite the lock
//
// Same pattern as scripts/aurora-field.mjs. No dependencies.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCK = join(ROOT, "src", "vendor", "launcher.json");
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const file = (version) => join(ROOT, "public", "vendor", `launcher@${version}`, "launcher.js");

const i = process.argv.indexOf("--sync");
if (i > 0) {
  const repo = process.argv[i + 1];
  if (!repo) { console.error("usage: node scripts/launcher.mjs --sync <path to launcher>"); process.exit(2); }
  const src = readFileSync(join(repo, "src", "launcher.js"));
  const version = (String(src).match(/var VERSION = '([^']+)'/) || [])[1];
  if (!version) { console.error("✗ could not read VERSION from the launcher"); process.exit(1); }
  let commit = null;
  try { commit = execFileSync("git", ["-C", repo, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch { /* not a checkout */ }
  if (existsSync(LOCK)) {
    const old = JSON.parse(readFileSync(LOCK, "utf8"));
    if (old.version !== version) rmSync(dirname(file(old.version)), { recursive: true, force: true });
  }
  mkdirSync(dirname(file(version)), { recursive: true });
  writeFileSync(file(version), src);
  mkdirSync(dirname(LOCK), { recursive: true });
  writeFileSync(LOCK, JSON.stringify({ version, sha256: sha(src), commit, source: "https://github.com/mutaaf/launcher" }, null, 2) + "\n");
  console.log(`✓ vendored launcher ${version} (${sha(src).slice(0, 12)})`);
  process.exit(0);
}

const lock = JSON.parse(readFileSync(LOCK, "utf8"));
const f = file(lock.version);
if (!existsSync(f)) { console.error(`✗ launcher ${lock.version} is locked but ${f} is missing`); process.exit(1); }
const got = sha(readFileSync(f));
if (got !== lock.sha256) {
  console.error(`✗ launcher drift: ${f} hashes to ${got}, the lock says ${lock.sha256}`);
  console.error("  Re-vendor with: node scripts/launcher.mjs --sync <path to launcher>");
  process.exit(1);
}
console.log(`✓ launcher ${lock.version}: vendored file matches the lock.`);

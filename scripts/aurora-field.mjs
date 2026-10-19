#!/usr/bin/env node
// aurora-field is vendored, not an npm dependency (it isn't published): one ES5 file served
// from public/vendor/aurora-field@<version>/ and loaded only by the CTO hero (CrewOfLight).
// src/vendor/aurora-field.json pins the version, the sha256 and the upstream commit.
//
//   node scripts/aurora-field.mjs                    verify the vendored file matches the lock (CI)
//   node scripts/aurora-field.mjs --sync <repo-dir>  copy <repo-dir>/src/aurora-field.js in, rewrite the lock
//
// Same pattern as mutaafaziz.com's data/aurora-field.json. No dependencies.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCK = join(ROOT, "src", "vendor", "aurora-field.json");
const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const vendored = (version) => join(ROOT, "public", "vendor", `aurora-field@${version}`, "aurora-field.js");

const i = process.argv.indexOf("--sync");
if (i > 0) {
  const repo = process.argv[i + 1];
  if (!repo) { console.error("usage: node scripts/aurora-field.mjs --sync <path to aurora-field>"); process.exit(2); }
  const src = readFileSync(join(repo, "src", "aurora-field.js"));
  const version = (String(src).match(/var VERSION = '([^']+)'/) || [])[1];
  if (!version) { console.error("✗ could not read VERSION from the library"); process.exit(1); }
  let commit = null;
  try { commit = execFileSync("git", ["-C", repo, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch { /* not a checkout */ }
  if (existsSync(LOCK)) {
    const old = JSON.parse(readFileSync(LOCK, "utf8"));
    if (old.version !== version) rmSync(dirname(vendored(old.version)), { recursive: true, force: true });
  }
  mkdirSync(dirname(vendored(version)), { recursive: true });
  writeFileSync(vendored(version), src);
  mkdirSync(dirname(LOCK), { recursive: true });
  writeFileSync(LOCK, JSON.stringify({ version, sha256: sha(src), commit, source: "https://github.com/mutaaf/aurora-field" }, null, 2) + "\n");
  console.log(`✓ vendored aurora-field ${version} (${sha(src).slice(0, 12)})`);
  process.exit(0);
}

const lock = JSON.parse(readFileSync(LOCK, "utf8"));
const file = vendored(lock.version);
if (!existsSync(file)) { console.error(`✗ aurora-field ${lock.version} is locked but ${file} is missing`); process.exit(1); }
const got = sha(readFileSync(file));
if (got !== lock.sha256) {
  console.error(`✗ aurora-field drift: ${file} hashes to ${got}, the lock says ${lock.sha256}.\n  Re-vendor with: node scripts/aurora-field.mjs --sync <path to aurora-field>`);
  process.exit(1);
}
console.log(`✓ aurora-field ${lock.version}: vendored file matches the lock.`);

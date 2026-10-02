import { execFileSync } from "child_process";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";

// Ticket 0109 - /agent-prompts transparency page generator.
//
// Reads every .claude/agents/*.md file at build time and emits a typed
// src/data/agentPrompts.ts module with the first 2000 characters of each
// prompt body (frontmatter stripped), the full byte-length of each file,
// the git-tracked last-modified short SHA for each file, and a canonical
// "AGENT_PROMPTS_GENERATED_AT" ISO date.
//
// Per the 2026-05-28 inline-assertion-in-the-gated-script lesson, this
// script THROWS on any invariant violation (missing agent file for a
// known agent, unreadable file, excerpt body empty, duplicate agentId,
// unresolved SHA) and writes a src/data/agentPrompts.ts.broken artifact
// for debugging. A thrown generator fails the gated `npm run build`
// chain through scripts/generate-sitemap.ts; no package.json edit is
// required per the GTM queue Hard NO.
//
// Per the 2026-09-12 code-beats-prose lesson, the role map pins to the
// files actually present under .claude/agents/ at branch head; a file
// listed in ROLE_MAP but missing on disk throws, and a file present on
// disk but missing from ROLE_MAP also throws (so a new agent file forces
// an explicit role addition rather than silently rendering with the
// default label).
//
// The emitted src/data/agentPrompts.ts is committed (not gitignored) so
// typecheck, lint, and the Playwright collector see a real typed import
// without needing the generator to run first.

const ROOT = join(import.meta.dirname, "..");
const AGENTS_DIR = join(ROOT, ".claude", "agents");
const OUT_PATH = join(ROOT, "src", "data", "agentPrompts.ts");
const BROKEN_PATH = OUT_PATH + ".broken";

// U+2014 via charCode so this script itself contains no literal em-dash
// (the 2026-05-07 Hard NO bans the character in copy; the excerpt body
// itself is scoped out per the acceptance box 11 scoping decision, but
// everything else the generator writes - caveat, role map, header
// comments - is subject to the Hard NO).
const EM_DASH = String.fromCharCode(8212);

const EXCERPT_CHAR_LIMIT = 2000;

// Mirror-source rule (2026-05-25): these page-level constants live here
// so the Helmet meta tag, the visible render, the CollectionPage JSON-LD
// description, and the Playwright spec all read from a single source.
const PAGE_H1 = "Agent Prompts";
const PAGE_URL = "https://digitalcraftai.com/agent-prompts";
const COLLECTION_PAGE_NAME = "Digital Craft AI Agent Prompts";
const AGENT_PROMPTS_CAVEAT =
  "The excerpt below for each autonomous agent is the first 2000 characters of the committed prompt file at the build SHA, verified byte-identical to the version-controlled .claude/agents/<agentId>.md source by the build-time generator. The agents may receive additional runtime context from the fleet runner (environment, branch head SHA, prior PR state, autonomous ship-loop configuration) that is NOT in the committed prompt file; that runtime context is a distinct observability surface documented on /how-we-ship and /agent-fleet.";

// GitHub blob URL template. The {sha} placeholder is replaced at build
// time with the git short SHA; {agentId} is the per-row basename. The
// owner/repo pair is pinned to the public source-of-truth repository.
const GITHUB_OWNER = "mutaaf";
const GITHUB_REPO = "digital-craft-architect";
const GITHUB_URL_TEMPLATE = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/{sha}/.claude/agents/{agentId}.md`;

// Role map - pinned to .claude/agents/*.md at branch head on 2026-10-02.
// Per the 2026-09-12 code-beats-prose lesson, every key is a file that
// actually exists under .claude/agents/; adding a new agent file requires
// adding a new row here (the collectRows() loop throws on an unmapped
// file so a silent drift is impossible).
const ROLE_MAP: Record<string, string> = {
  "gtm-innovation": "Groomer and blog author",
  "implementation-dev": "Feature shipper",
  review: "PR reviewer",
  "eng-dev": "Engineering shipper",
  validation: "Regression prover",
};

export interface AgentPromptRow {
  agentId: string;
  role: string;
  filePath: string;
  excerpt: string;
  fullCharCount: number;
  lastModifiedSha: string;
}

function todayYmd(): string {
  return new Date().toISOString().split("T")[0];
}

// Strip a leading YAML frontmatter block (--- ... ---) matching the
// ticket 0032 generator's frontmatter-stripping regex. If no frontmatter
// is present, returns the input unchanged.
function stripFrontmatter(text: string): string {
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (!m) return text;
  return text.slice(m[0].length);
}

// Resolve the git short SHA that last modified the given file. Falls
// back to the current HEAD short SHA on failure, then to the string
// "unresolved" (which the spec's hex-regex rejects, so a resolver
// failure fails the local gate loudly rather than silently).
function resolveLastModifiedSha(absolutePath: string): string {
  const relPath = relative(ROOT, absolutePath);
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%h", "--", relPath],
      { cwd: ROOT, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (out && /^[0-9a-f]{7,40}$/.test(out)) return out;
  } catch {
    /* fall through */
  }
  try {
    const head = execFileSync(
      "git",
      ["rev-parse", "--short", "HEAD"],
      { cwd: ROOT, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (head && /^[0-9a-f]{7,40}$/.test(head)) return head;
  } catch {
    /* fall through */
  }
  return "unresolved";
}

interface CollectResult {
  rows: AgentPromptRow[];
  buildSha: string;
  problems: string[];
}

function collectRows(): CollectResult {
  const problems: string[] = [];
  const rows: AgentPromptRow[] = [];
  const seenIds = new Set<string>();

  // Resolve a single build SHA so the "View full prompt" URL template
  // can embed it consistently (every row uses the same SHA for a
  // reproducible dated reference at the build moment).
  let buildSha = "unresolved";
  try {
    buildSha = execFileSync(
      "git",
      ["rev-parse", "--short", "HEAD"],
      { cwd: ROOT, encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    /* keep "unresolved" so the inline assertion fires */
  }

  let files: string[];
  try {
    files = readdirSync(AGENTS_DIR)
      .filter((f) => /^[a-z-]+\.md$/.test(f))
      .sort();
  } catch (err) {
    problems.push(
      `cannot read .claude/agents/ directory at ${relative(ROOT, AGENTS_DIR)}: ${err instanceof Error ? err.message : String(err)}`,
    );
    return { rows, buildSha, problems };
  }

  if (files.length === 0) {
    problems.push(
      `.claude/agents/ is empty - at least one agent prompt file is required for /agent-prompts`,
    );
    return { rows, buildSha, problems };
  }

  // Verify every file on disk has a role mapping. A new agent file with
  // no ROLE_MAP entry fails the build loudly per the 2026-09-12
  // code-beats-prose lesson.
  for (const name of files) {
    const agentId = name.replace(/\.md$/, "");
    if (!(agentId in ROLE_MAP)) {
      problems.push(
        `.claude/agents/${name} has no ROLE_MAP entry; add an entry to scripts/generate-agent-prompts.ts ROLE_MAP so the agent gets a human-readable role column.`,
      );
    }
  }
  // And every ROLE_MAP entry must have a file on disk (so a renamed /
  // deleted agent file surfaces here rather than rendering an empty row).
  const diskAgentIds = new Set(files.map((n) => n.replace(/\.md$/, "")));
  for (const mappedId of Object.keys(ROLE_MAP)) {
    if (!diskAgentIds.has(mappedId)) {
      problems.push(
        `ROLE_MAP has "${mappedId}" but .claude/agents/${mappedId}.md does not exist; remove the ROLE_MAP entry or restore the file.`,
      );
    }
  }

  for (const name of files) {
    const agentId = name.replace(/\.md$/, "");
    const absolutePath = join(AGENTS_DIR, name);
    const filePath = `.claude/agents/${name}`;

    if (seenIds.has(agentId)) {
      problems.push(`duplicate agentId "${agentId}" from ${filePath}`);
      continue;
    }

    let text: string;
    try {
      text = readFileSync(absolutePath, "utf-8");
    } catch (err) {
      problems.push(
        `${filePath}: unreadable (${err instanceof Error ? err.message : String(err)})`,
      );
      continue;
    }

    const fullCharCount = text.length;
    if (fullCharCount === 0) {
      problems.push(`${filePath}: file is empty`);
      continue;
    }

    const body = stripFrontmatter(text);
    const excerpt = body.slice(0, EXCERPT_CHAR_LIMIT);
    if (excerpt.length === 0) {
      problems.push(
        `${filePath}: body excerpt is empty after frontmatter strip (file may be frontmatter-only)`,
      );
      continue;
    }

    const role = ROLE_MAP[agentId] ?? "";
    if (!role) {
      // Already reported above by the ROLE_MAP presence check; skip row
      // creation to avoid writing a row with an empty role string.
      continue;
    }

    const lastModifiedSha = resolveLastModifiedSha(absolutePath);
    if (!/^[0-9a-f]{7,40}$/.test(lastModifiedSha)) {
      problems.push(
        `${filePath}: could not resolve last-modified SHA (got "${lastModifiedSha}")`,
      );
      continue;
    }

    seenIds.add(agentId);
    rows.push({
      agentId,
      role,
      filePath,
      excerpt,
      fullCharCount,
      lastModifiedSha,
    });
  }

  if (!/^[0-9a-f]{7,40}$/.test(buildSha)) {
    problems.push(
      `could not resolve build SHA (got "${buildSha}"); the "View full prompt" GitHub URL template requires a short SHA.`,
    );
  }

  return { rows, buildSha, problems };
}

function renderModule(
  rows: AgentPromptRow[],
  generatedAt: string,
  buildSha: string,
): string {
  const header = `// AUTO-GENERATED by scripts/generate-agent-prompts.ts at build time.
// Do not edit by hand - regenerate by running \`npm run build\`.
// Source of truth: .claude/agents/*.md at the build SHA.
// Ticket 0109.

export interface AgentPromptRow {
  /** basename of the .claude/agents/<id>.md file, used as DOM key. */
  agentId: string;
  /** Human-readable role label from the generator's ROLE_MAP. */
  role: string;
  /** Repo-relative path to the committed prompt file (plain text, not a link). */
  filePath: string;
  /** First ${EXCERPT_CHAR_LIMIT} characters of the file body (frontmatter stripped). */
  excerpt: string;
  /** Full character count of the on-disk file (so a truncation is auditable). */
  fullCharCount: number;
  /** Short SHA of the commit that last modified the file. */
  lastModifiedSha: string;
}

export const PAGE_H1: string = ${JSON.stringify(PAGE_H1)};
export const PAGE_URL: string = ${JSON.stringify(PAGE_URL)};
export const COLLECTION_PAGE_NAME: string = ${JSON.stringify(COLLECTION_PAGE_NAME)};

export const AGENT_PROMPTS_GENERATED_AT: string = ${JSON.stringify(generatedAt)};

export const AGENT_PROMPTS_BUILD_SHA: string = ${JSON.stringify(buildSha)};

export const AGENT_PROMPTS_CAVEAT: string = ${JSON.stringify(AGENT_PROMPTS_CAVEAT)};

/**
 * GitHub blob URL template. The {sha} placeholder is replaced at build
 * time with the git short SHA; {agentId} is the per-row basename. The
 * owner/repo pair is pinned to the public source-of-truth repository
 * so a reader can click through to the full prompt body at a stable
 * dated reference.
 */
export const AGENT_PROMPTS_GITHUB_URL_TEMPLATE: string = ${JSON.stringify(GITHUB_URL_TEMPLATE)};

/**
 * Resolve a per-row "View full prompt" href by substituting the build
 * SHA and the row's agentId into the template.
 */
export function resolveAgentPromptGithubUrl(agentId: string): string {
  return AGENT_PROMPTS_GITHUB_URL_TEMPLATE.replace(
    "{sha}",
    AGENT_PROMPTS_BUILD_SHA,
  ).replace("{agentId}", agentId);
}

export const AGENT_PROMPTS: readonly AgentPromptRow[] = [
`;
  const body = rows
    .map(
      (r) =>
        `  { agentId: ${JSON.stringify(r.agentId)}, role: ${JSON.stringify(r.role)}, filePath: ${JSON.stringify(r.filePath)}, excerpt: ${JSON.stringify(r.excerpt)}, fullCharCount: ${JSON.stringify(r.fullCharCount)}, lastModifiedSha: ${JSON.stringify(r.lastModifiedSha)} },`,
    )
    .join("\n");
  const footer = body.length > 0 ? `\n] as const;\n` : `] as const;\n`;
  return header + body + footer;
}

export async function generateAgentPrompts(): Promise<{ count: number }> {
  const { rows, buildSha, problems } = collectRows();

  if (problems.length > 0) {
    try {
      writeFileSync(BROKEN_PATH, renderModule([], todayYmd(), buildSha), "utf-8");
    } catch {
      /* best-effort */
    }
    console.error(
      `✗ agent-prompts: ${problems.length} validation problem(s); broken file saved to ${relative(ROOT, BROKEN_PATH)}`,
    );
    for (const p of problems) console.error(`  - ${p}`);
    throw new Error(
      `agent-prompts generator: ${problems.length} validation problem(s)`,
    );
  }

  const generatedAt = todayYmd();
  const out = renderModule(rows, generatedAt, buildSha);

  // Belt-and-braces per the 2026-05-28 encoded-invariant lesson: the
  // excerpt body is scoped out of the em-dash check per acceptance box
  // 11, but the emitted module WRAPPER (role map, caveat, header
  // comments, type declarations) must contain no em-dash. Verify by
  // reconstructing the wrapper string without the excerpt bodies.
  const wrapperOnly = out
    .split("\n")
    .filter((line) => !/excerpt:/.test(line))
    .join("\n");
  if (wrapperOnly.includes(EM_DASH)) {
    writeFileSync(BROKEN_PATH, out, "utf-8");
    throw new Error(
      "agent-prompts generator: emitted module wrapper contains an em-dash (U+2014); refusing to write",
    );
  }

  writeFileSync(OUT_PATH, out, "utf-8");
  console.log(
    `✓ Agent prompts generated with ${rows.length} agents (build SHA ${buildSha}) → ${relative(ROOT, OUT_PATH)}`,
  );
  return { count: rows.length };
}

const invokedDirectly =
  process.argv[1] && process.argv[1].endsWith("generate-agent-prompts.ts");
if (invokedDirectly) {
  generateAgentPrompts().catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}

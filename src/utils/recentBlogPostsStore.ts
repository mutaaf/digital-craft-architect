// Ticket 0091 - Persist the visitor's read blog posts and surface an
// "Articles you've read" card on /my dashboard.
//
// Mirrors the parse-safe, allow-list-validated pattern of
// src/utils/recentComparesStore.ts (ticket 0074): every localStorage
// read/write is wrapped in try/catch, malformed values resolve to []/no-op,
// and a quota-exceeded write is silently tolerated. The store records
// slug + title + tag list + a client-side timestamp only - all already
// public catalog metadata from src/data/blogPosts.ts, no PII - and stays
// in the existing dca_* localStorage namespace. The
// `dca_recent_blog_posts_v1` key is disclosed on /trust in the same PR
// per the ticket 0018 / 0033 / 0045 / 0060 / 0062 / 0074 / 0076 honesty
// rule (see NEW_PERSISTENT_STORES in src/data/demoDisclosures.ts).
//
// The slug allow-list is derived at module load time from
// blogPosts.map(p => p.slug) so appending a new post automatically widens
// the allow-list. Entries whose slug is no longer in the allow-list are
// filtered at read time so a renamed post cannot strand a dead recap
// link (mirroring the ticket 0074 KNOWN_PATHS invariant applied to blog
// posts).

import { blogPosts, type BlogPost } from '@/data/blogPosts';

export interface RecentBlogPost {
  slug: string;
  title: string;
  tags: readonly string[];
  readAt: number;
}

const STORAGE_KEY = 'dca_recent_blog_posts_v1';
const MAX_ENTRIES = 5;

// The union of every blogPosts[i].slug. Recording a read of a slug outside
// this set is a no-op so a stale or stray entry cannot produce a dead
// link. The 2026-05-25 mirror-source lesson applies: this set is the
// single allow-list both the store writer and the read-back validator
// consult.
const KNOWN_SLUGS: ReadonlySet<string> = new Set<string>(
  blogPosts.map((p) => p.slug),
);

function isRecentBlogPost(value: unknown): value is RecentBlogPost {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.slug !== 'string') return false;
  if (typeof v.title !== 'string') return false;
  if (typeof v.readAt !== 'number' || !Number.isFinite(v.readAt)) return false;
  if (!Array.isArray(v.tags)) return false;
  if (!v.tags.every((t) => typeof t === 'string')) return false;
  return true;
}

/**
 * Read every parse-safe, allow-list-validated entry currently in storage
 * WITHOUT the display-limit slice. Used by `suggestNextBlogPost` so the
 * unread-post search considers every stored read, not just the top
 * MAX_ENTRIES that surface on the dashboard.
 *
 * Per the 2026-09-10 raw-vs-sliced lesson: a store that caps its display
 * list but also exports a derived query ("which post haven't you read?")
 * must keep the query reading the RAW parsed list, post-allow-list,
 * pre-slice. `getRecentBlogPosts()` slices this for display; the
 * suggestion reads it directly so the "every post has been read" case
 * truly returns null.
 */
function readAllVisited(): RecentBlogPost[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return []; /* storage unavailable - non-fatal */
  }
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(isRecentBlogPost)
    .filter((entry) => KNOWN_SLUGS.has(entry.slug));
}

/**
 * Read the recent-blog-posts list, parse-safe and slug-validated. A
 * malformed stored value, a quota-exceeded environment, or an absent
 * storage backend all resolve to []. Entries whose slug is no longer in
 * the blogPosts allow-list are filtered out at read time so a stale list
 * cannot render a dead link. Capped at MAX_ENTRIES for the dashboard
 * display.
 */
export function getRecentBlogPosts(): RecentBlogPost[] {
  return readAllVisited().slice(0, MAX_ENTRIES);
}

/**
 * Record a blog-post read at the front of the list. A re-read of an
 * already-stored slug moves the entry to the front rather than
 * duplicating it. A slug not in the blogPosts allow-list is rejected (no
 * write), so a removed post cannot strand a dead link. A storage failure
 * is silently tolerated.
 */
export function recordBlogPostRead(
  slug: string,
  title: string,
  tags: readonly string[],
): void {
  if (!KNOWN_SLUGS.has(slug)) return;

  try {
    const existing = readAllVisited();
    const filtered = existing.filter((entry) => entry.slug !== slug);
    const next: RecentBlogPost[] = [
      { slug, title, tags: [...tags], readAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable - non-fatal */
  }
}

/**
 * Return a blogPosts entry whose slug is NOT present in the visitor's
 * full read history (the raw list, per the 2026-09-10 raw-vs-sliced
 * lesson). The suggestion prefers a post that SHARES at least one tag
 * with the most-recently-read post (a same-vertical follow-up nudge);
 * when no same-tag unread post exists, the function falls back to the
 * FIRST unread entry in blogPosts array order.
 *
 * Returns null when every post has been read (all slugs seeded) OR when
 * the visitor has no history yet (the suggest chip is only shown to
 * visitors who have already read at least one post). Pure and
 * deterministic per the ticket 0074 suggestNextCompare shape.
 */
export function suggestNextBlogPost(): BlogPost | null {
  const visited = readAllVisited();
  if (visited.length === 0) return null;
  const visitedSlugs = new Set(visited.map((r) => r.slug));

  // The most-recently-read entry is at position 0 (the writer prepends).
  const mostRecentTags = new Set(visited[0].tags);

  // First pass: prefer an unread post that shares at least one tag with
  // the most-recently-read entry.
  for (const post of blogPosts) {
    if (visitedSlugs.has(post.slug)) continue;
    if (post.tags.some((t) => mostRecentTags.has(t))) return post;
  }

  // Fallback: first unread post in blogPosts array order.
  for (const post of blogPosts) {
    if (!visitedSlugs.has(post.slug)) return post;
  }

  return null;
}

/**
 * Drop every recorded blog-post read. Exported for a future "clear
 * history" UI surface; this ticket renders the card without a visible
 * clear control (mirroring the ticket 0074 pattern of reserving the
 * clear function for a later general-clear UI ticket).
 */
export function clearRecentBlogPosts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable - non-fatal */
  }
}

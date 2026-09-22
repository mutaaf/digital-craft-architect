// Ticket 0091 - "Articles you've read" card on /my dashboard.
//
// Rendered ABOVE the existing saved-estimate / saved-ROI / recent-demos
// cards on /my when the visitor's read history has at least one entry.
// Card owns its own hydration (mirroring the ticket 0076 QuizHistoryCard
// pattern) so the parent dashboard does not need a new hydration branch
// for the store; the parent renders the card unconditionally once it has
// hydrated its own stores, and the card returns null when the store is
// empty. Layout mirrors the ticket 0074 RecentComparesCard vertically-
// stacked-row treatment so the two adjacent recap cards feel like a
// single retention cluster.
//
// Every color class carries a dark: variant (the 2026-05-22 AGENTS.md
// dark-mode Hard NO applies to new components). Every string is
// hyphen-only per the 2026-05-07 em-dash Hard NO.

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { BlogPost } from '@/data/blogPosts';
import { trackCTAClick } from '@/utils/analytics';
import {
  getRecentBlogPosts,
  suggestNextBlogPost,
  type RecentBlogPost,
} from '@/utils/recentBlogPostsStore';

const CARD =
  'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm';
const ICON =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary';

// Client-side relative-time chip. Mirrors the formatRelative helper on
// MyDashboard.tsx so the wording ("today", "yesterday", "3 days ago") is
// consistent across the recap cards. No fabricated dates - every number
// reads from the entry's own readAt.
function formatReadAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (!Number.isFinite(diff) || diff < 0) return 'read just now';
  const day = 86_400_000;
  if (diff < day) return 'read today';
  if (diff < 2 * day) return 'read yesterday';
  const days = Math.floor(diff / day);
  if (days < 14) return `read ${days} days ago`;
  return `read ${Math.floor(days / 7)} weeks ago`;
}

const RecentBlogPostsCard: React.FC = () => {
  const [entries, setEntries] = useState<RecentBlogPost[] | null>(null);
  const [suggestion, setSuggestion] = useState<BlogPost | null>(null);

  useEffect(() => {
    try {
      setEntries(getRecentBlogPosts());
      setSuggestion(suggestNextBlogPost());
    } catch {
      setEntries([]);
      setSuggestion(null);
    }
  }, []);

  if (!entries || entries.length === 0) return null;

  return (
    <article data-testid="recent-blog-posts-card" className={CARD}>
      <div className="flex items-start gap-4 mb-4">
        <div className={ICON}>
          <BookOpen size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Articles you've read
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Pick up the long-read you were on.
          </p>
        </div>
      </div>
      <ul className="space-y-2">
        {entries.map((entry) => {
          const firstTag = entry.tags[0] ?? null;
          return (
            <li key={entry.slug} data-testid="recent-blog-post-row">
              <Link
                to={`/blog/${entry.slug}`}
                onClick={() => trackCTAClick('my_blog_reopen', 'my_dashboard')}
                className="group flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 hover:border-primary dark:hover:border-primary transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {entry.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {firstTag && (
                      <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-gray-600 dark:text-gray-300">
                        {firstTag}
                      </span>
                    )}
                    <span>{formatReadAgo(entry.readAt)}</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary shrink-0 inline-flex items-center gap-1">
                  Reopen article
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {suggestion && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">You might also read</span>
          <Link
            to={`/blog/${suggestion.slug}`}
            data-testid="blog-suggest-chip"
            onClick={() => trackCTAClick('my_blog_suggest', 'my_dashboard')}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-primary hover:border-primary dark:hover:border-primary transition-colors"
          >
            {suggestion.title}
            <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </article>
  );
};

export default RecentBlogPostsCard;

// Ticket 0100 - "Verticals you're evaluating" card on /my dashboard.
//
// Rendered directly below the ticket 0093 saved-ROI-scenarios card on /my
// when the visitor's vertical-visit history has at least one entry. The
// card owns its own hydration (mirroring the ticket 0091 RecentBlogPostsCard
// pattern) so MyDashboard.tsx does not need a new hydration branch for the
// store; the parent renders the card unconditionally once its own stores
// have hydrated, and the card returns null when the store is empty.
//
// Every color class carries a dark: variant (the 2026-05-22 AGENTS.md
// dark-mode Hard NO applies to new components). Every string is
// hyphen-only per the 2026-05-07 em-dash Hard NO.

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import {
  getRecentVerticals,
  type RecentVertical,
} from '@/utils/recentVerticalsStore';

const CARD =
  'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm';
const ICON =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// YYYY-MM-DD in the visitor's local timezone. Kept in this file (not shared
// with MyDashboard's formatRelative helper) so the "last-visited date"
// column reads as a plain calendar date rather than a relative chip; both
// wordings are safe from the em-dash Hard NO.
function formatDate(ts: number): string {
  if (!Number.isFinite(ts) || ts <= 0) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

const RecentVerticalsCard: React.FC = () => {
  const [entries, setEntries] = useState<RecentVertical[] | null>(null);

  useEffect(() => {
    try {
      setEntries(getRecentVerticals());
    } catch {
      setEntries([]);
    }
  }, []);

  if (!entries || entries.length === 0) return null;

  return (
    <article data-testid="recent-verticals-card" className={CARD}>
      <div className="flex items-start gap-4 mb-4">
        <div className={ICON}>
          <Layers size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Verticals you're evaluating
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Pick up the AI-for-vertical landing page you were reading.
          </p>
        </div>
      </div>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.path} data-testid="recent-vertical-row">
            <Link
              to={entry.path}
              onClick={() => trackCTAClick('my_vertical_reopen', 'my_dashboard')}
              className="group flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 hover:border-primary dark:hover:border-primary transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {entry.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {`Last visited ${formatDate(entry.lastVisitedAt)}`}
                </div>
              </div>
              <span className="text-sm font-medium text-primary shrink-0 inline-flex items-center gap-1">
                Reopen
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
};

export default RecentVerticalsCard;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getRecentDemos } from '@/utils/recentDemosStore';
import { changelogEntries, type ChangelogEntry } from '@/data/changelogEntries';
import { ROUTES } from '@/data/routes';
import { trackCTAClick } from '@/utils/analytics';

// Ticket 0040 - "What's new since you visited" delta strip on /demos. Reads
// the most-recent viewedAt across getRecentDemos() (ticket 0026's existing
// dca_recent_demos_v1 store) and filters changelogEntries to entries shipped
// AFTER that timestamp. Renders the top 5 as chips with a "See all" link to
// /changelog. Conditional: a first-time visitor or a same-day returner with
// no delta sees nothing. Per the 2026-05-25 mirror-source lesson, ROUTES
// (re-exported into tests/e2e/routes.ts) is the SINGLE allow-list both the
// smoke spec and this component consult. Per the 2026-05-07 em-dash Hard NO,
// every string here uses hyphens.

const MAX_CHIPS = 5;
const ROUTE_SET: ReadonlySet<string> = new Set(ROUTES);

// ChangelogEntry from src/data/changelogEntries.ts does not declare a `path`
// field today, but the ticket spec anticipates one. We read it defensively so
// a future schema bump (path added by the generator) flows through without a
// component change. Until then, every chip falls back to /changelog#<id>.
type EntryWithPath = ChangelogEntry & { path?: string };

function resolveChipHref(entry: EntryWithPath): string {
  if (entry.path && ROUTE_SET.has(entry.path)) return entry.path;
  return `/changelog#${entry.id}`;
}

function readMostRecentVisit(): number | null {
  try {
    const recent = getRecentDemos();
    if (!recent || recent.length === 0) return null;
    const ts = Math.max(...recent.map((r) => r.viewedAt));
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
}

function formatVisitDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const WhatsNewSinceVisit: React.FC = () => {
  // Snapshot on mount; SSR (crawlers) gets null per the ticket's "strip is
  // personalization, not SEO" out-of-scope rule.
  const [lastVisit, setLastVisit] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLastVisit(readMostRecentVisit());
    setReady(true);
  }, []);

  if (!ready || lastVisit === null) return null;

  const newer = (changelogEntries as readonly EntryWithPath[]).filter((entry) => {
    const t = new Date(entry.created).getTime();
    return Number.isFinite(t) && t > lastVisit;
  });

  if (newer.length === 0) return null;

  const total = newer.length;
  const chips = newer.slice(0, MAX_CHIPS);
  const headerDate = formatVisitDate(lastVisit);

  return (
    <section
      data-testid="whats-new-strip"
      className="py-8 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {total} new since your last visit on {headerDate}
            </h2>
          </div>
          <Link
            to="/changelog"
            onClick={() => trackCTAClick('whatsnew_delta_seeall', 'demos')}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline self-start sm:self-auto"
          >
            See all
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((entry) => (
            <Link
              key={entry.id}
              to={resolveChipHref(entry)}
              data-testid="whats-new-chip"
              onClick={() => trackCTAClick('whatsnew_delta_open', entry.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
            >
              <span className="truncate max-w-[16rem]">{entry.title}</span>
              <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatsNewSinceVisit;

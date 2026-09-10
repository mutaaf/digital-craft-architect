import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ArrowRight, Calculator, ListChecks, Brain, Inbox, DollarSign, Printer, GitCompare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import WhatsNewSinceVisit from '@/components/WhatsNewSinceVisit';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { getRecentDemos, type RecentDemo } from '@/utils/recentDemosStore';
import {
  getRecentCompares,
  suggestNextCompare,
  type RecentCompare,
} from '@/utils/recentComparesStore';
import type { CompareEntry } from '@/data/compareEntries';
import { getQuizPersona, type QuizPersona } from '@/utils/quizPersonaStore';
import { getVisitStreak, recordVisitToday, type VisitStreak } from '@/utils/visitStreakStore';
import { getLastRoiResult } from '@/utils/roiResultStore';
import { loadLastEstimate } from '@/pages/construction/lastEstimateStore';
import { encodeEstimateParams, type EstimateShareState } from '@/pages/construction/estimateShareParams';
import { encodeRoiParams } from '@/pages/roiCalculatorParams';
import { PROJECT_TYPES, FINISH_LEVELS, EXTRAS, calculateEstimate } from '@/data/estimatePricing';
import { SUMMARY_LINE_KEYS, type SummaryLineKey } from '@/pages/mydashboardSummaryKeys';

// Ticket 0045 - Personalized /my visitor dashboard. Page shell mirrors
// src/pages/Demos.tsx and joins four pre-existing browser-local sources
// (lastEstimateStore 0014, recentDemosStore 0026, the new
// quizPersonaStore, and WhatsNewSinceVisit 0040). META_DESCRIPTION is
// the single constant the Helmet meta tag AND the WebPage JSON-LD
// description read from (2026-05-25 mirror-source rule). /my is excluded
// from the sitemap and is not in the index.html SEO Pilot table.

const SITE_URL = 'https://digitalcraftai.com';
const META_DESCRIPTION =
  'Your personal Digital Craft AI dashboard. Pick up where you left off: reopen your last estimate, jump back into a demo you tried, and see your AI readiness tier. Everything stays in your browser - nothing leaves this device.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Your Dashboard', item: `${SITE_URL}/my` },
  ],
};

// First WebPage block in the repo (predecessor-spec grep recorded in the
// ticket Implementation log). isPartOf references the homepage WebSite
// block by url - same identity, no duplicate Organization declaration.
const WEBPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Your Dashboard',
  description: META_DESCRIPTION,
  url: `${SITE_URL}/my`,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', url: SITE_URL },
};

const PROJECT_LABEL: Record<string, string> = Object.fromEntries(PROJECT_TYPES.map((p) => [p.id, p.label]));
const FINISH_LABEL: Record<string, string> = Object.fromEntries(FINISH_LEVELS.map((f) => [f.id, f.label]));
const CARD = 'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm';
const ICON = 'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary';
const PRIMARY_BTN = 'inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors';

// Ticket 0066 - printable "Your Digital Craft summary" recap section.
// SUMMARY_LINES is the single module-level source of truth for the
// ordered-list order AND the per-store copy template. Each render
// function returns the visible <li> text for that store or null when
// the store has no data (the outer render filters null entries before
// assigning ordered-list positions). Every string is hyphen-only per
// the 2026-05-07 em-dash Hard NO; no dollar figure or count is
// fabricated - each number reads from the actual persisted store.
type SummaryContext = {
  estimate: EstimateShareState | null;
  roiResult: ReturnType<typeof getLastRoiResult>;
  persona: QuizPersona | null;
  recent: RecentDemo[];
  streak: VisitStreak | null;
};

type SummaryLine = {
  key: SummaryLineKey;
  render: (ctx: SummaryContext) => string | null;
};

const SUMMARY_LINES: readonly SummaryLine[] = [
  {
    key: 'estimate',
    render: ({ estimate }) => {
      if (!estimate) return null;
      const project = PROJECT_TYPES.find((p) => p.id === estimate.selectedTypeId);
      const finish = FINISH_LEVELS.find((f) => f.id === estimate.selectedFinishId);
      if (!project || !finish) return null;
      const extras = EXTRAS.filter((e) => estimate.selectedExtraIds.includes(e.id));
      const breakdown = calculateEstimate(project, estimate.sqft, finish, extras);
      const mid = Math.round((breakdown.totalLow + breakdown.totalHigh) / 2);
      return `Estimate saved: $${mid.toLocaleString('en-US')} (${project.label}, ${estimate.sqft.toLocaleString('en-US')} sq ft, ${finish.label} finish)`;
    },
  },
  {
    key: 'roi',
    render: ({ roiResult }) => {
      if (!roiResult) return null;
      const savedDate = new Date(roiResult.savedAt).toISOString().slice(0, 10);
      return `ROI computed on ${savedDate}: $${roiResult.outputs.annualSavings.toLocaleString('en-US')} per year`;
    },
  },
  {
    key: 'persona',
    render: ({ persona }) => {
      if (!persona) return null;
      return `AI Readiness Quiz: ${persona.persona}`;
    },
  },
  {
    key: 'demos',
    render: ({ recent }) => {
      if (recent.length === 0) return null;
      const titles = recent.map((r) => r.title).join(', ');
      return `Recent demos explored: ${recent.length} (${titles})`;
    },
  },
  {
    // Streak line requires at least 2 distinct visit days so a first-time
    // visitor whose sole data is today's recordVisitToday() side effect
    // does not artificially trigger a summary line without any prior
    // engagement history to reflect.
    key: 'streak',
    render: ({ streak }) => {
      if (!streak || streak.daysInLast14 < 2) return null;
      return `Visits: ${streak.daysInLast14} days in the last 14`;
    },
  },
];

// Defense-in-depth: any future reorder of SUMMARY_LINES that forgets to
// update the shared SUMMARY_LINE_KEYS file surfaces at module load in
// dev instead of a silently-drifted print recap. Cheap constant-time
// check; SUMMARY_LINES is a static module-level tuple so this never
// trips in practice (2026-05-25 mirror-source rule).
if (SUMMARY_LINES.map((l) => l.key).join(',') !== SUMMARY_LINE_KEYS.join(',')) {
  console.warn('SUMMARY_LINES key order drifted from SUMMARY_LINE_KEYS');
}

// Print-mode CSS. Every hidden selector uses display: none !important
// because Tailwind's utility classes carry higher specificity than a
// plain rule. Selectors match the same data-testid strings the e2e
// spec asserts against so print rules cannot silently drift from the
// assertion targets. Colors are forced to dark-on-white regardless of
// the light/dark theme active on-screen (visitor may have applied
// document.documentElement.classList.add('dark') before printing).
const PRINT_STYLESHEET = `
@media print {
  nav, header, footer,
  [data-testid="dashboard-streak-badge"],
  [data-testid="dashboard-estimate-card"],
  [data-testid="dashboard-recent-demos-card"],
  [data-testid="recent-compares-card"],
  [data-testid="dashboard-roi-card"],
  [data-testid="dashboard-quiz-persona-card"],
  [data-testid="dashboard-empty-state"],
  [data-testid="whats-new-strip"],
  [data-testid="dashboard-summary-print"] {
    display: none !important;
  }
  [data-testid="dashboard-summary-recap"] {
    display: block !important;
    color: #000 !important;
    background: #fff !important;
  }
  [data-testid="dashboard-summary-recap"] * {
    color: #000 !important;
    background: transparent !important;
    border-color: #cbd5e1 !important;
  }
}
`;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatGeneratedAt(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `Generated on ${yyyy}-${mm}-${dd} at ${hh}:${mi} local`;
}

function buildReopenUrl(state: EstimateShareState): string {
  try { return `/construction/demo/estimate?${encodeEstimateParams(state).toString()}`; }
  catch { return '/construction/demo/estimate'; }
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  if (!Number.isFinite(diff) || diff < 0) return 'just now';
  const day = 86_400_000;
  if (diff < day) return 'today';
  if (diff < 2 * day) return 'yesterday';
  const days = Math.floor(diff / day);
  return days < 14 ? `${days} days ago` : `${Math.floor(days / 7)} weeks ago`;
}

const safeRead = <T,>(fn: () => T, fallback: T): T => { try { return fn(); } catch { return fallback; } };
const MyDashboard: React.FC = () => {
  const { content } = useContent();
  const [estimate, setEstimate] = useState<EstimateShareState | null>(null);
  const [recent, setRecent] = useState<RecentDemo[]>([]);
  const [persona, setPersona] = useState<QuizPersona | null>(null);
  const [streak, setStreak] = useState<ReturnType<typeof getVisitStreak> | null>(null);
  const [roiResult, setRoiResult] = useState<ReturnType<typeof getLastRoiResult>>(null);
  // Ticket 0074 - hydrate the /compare/<tool> visit history for the
  // RecentComparesCard rendered above the existing dashboard cards.
  const [recentCompares, setRecentCompares] = useState<RecentCompare[]>([]);
  const [nextCompare, setNextCompare] = useState<CompareEntry | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // Ticket 0060 - guard so React 18 strict-mode double-mount does not
  // double-fire the streak_badge_view analytics event.
  const streakViewTracked = useRef<boolean>(false);
  // Ticket 0062 - same double-fire guard for the new roi_card_view event.
  const roiCardViewTracked = useRef<boolean>(false);
  // Ticket 0066 - same double-fire guard for the new summary_recap_view event.
  const summaryViewTracked = useRef<boolean>(false);
  // Ticket 0066 - a stable timestamp for the "Generated on ... at ... local"
  // footer line so a downstream re-render (e.g. from a lazy content prop
  // update) does not tick the timestamp mid-view.
  const [generatedAt] = useState<Date>(() => new Date());

  useEffect(() => {
    // Ticket 0060 - The canonical recordVisitToday() call lives on the
    // top-level App component, but React mounts children before parents
    // so the child effect (this one) fires BEFORE the App effect on a
    // cold load. Replay the record here so getVisitStreak() observes
    // today's date on the first dashboard render. The store is
    // idempotent (recording today twice in the same session writes
    // the same Set, no multi-count).
    safeRead(() => { recordVisitToday(); return null; }, null);
    setEstimate(safeRead(() => loadLastEstimate('construction'), null));
    setRecent(safeRead(() => getRecentDemos().slice(0, 3), []));
    setPersona(safeRead(() => getQuizPersona(), null));
    setStreak(safeRead(() => getVisitStreak(), null));
    setRoiResult(safeRead(() => getLastRoiResult(), null));
    // Ticket 0074 - read the /compare/<tool> visit history and the next
    // suggested unvisited comparison. Both are pure, allow-list-validated
    // reads at src/utils/recentComparesStore.ts; safeRead swallows any
    // storage exception per the standing dashboard hydration pattern.
    setRecentCompares(safeRead(() => getRecentCompares(), []));
    setNextCompare(safeRead(() => suggestNextCompare(), null));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!streak || streak.daysInLast14 < 1) return;
    if (streakViewTracked.current) return;
    streakViewTracked.current = true;
    trackCTAClick('streak_badge_view', 'mydashboard');
  }, [streak]);

  // Ticket 0062 - fire roi_card_view exactly once when the saved ROI card
  // first appears for this mount. Mirrors the streakViewTracked guard.
  useEffect(() => {
    if (!roiResult) return;
    if (roiCardViewTracked.current) return;
    roiCardViewTracked.current = true;
    trackCTAClick('roi_card_view', 'mydashboard');
  }, [roiResult]);

  const anyData =
    estimate !== null ||
    recent.length > 0 ||
    persona !== null ||
    roiResult !== null ||
    recentCompares.length > 0;

  // Ticket 0066 - fire summary_recap_view exactly once when the recap first
  // renders for this mount. Mirrors the streakViewTracked / roiCardViewTracked
  // guards.
  useEffect(() => {
    if (!hydrated || !anyData) return;
    if (summaryViewTracked.current) return;
    summaryViewTracked.current = true;
    trackCTAClick('summary_recap_view', 'mydashboard');
  }, [hydrated, anyData]);

  // Ticket 0066 - compose the recap lines from the five persisted store
  // hooks already on this page. The filter drops null entries (empty
  // stores) so the surviving list preserves the SUMMARY_LINES key order.
  const summaryEntries = SUMMARY_LINES
    .map((line) => ({ key: line.key, text: line.render({ estimate, roiResult, persona, recent, streak }) }))
    .filter((entry): entry is { key: SummaryLineKey; text: string } => entry.text !== null);

  // Ticket 0066 - print handler. trackCTAClick MUST fire FIRST because the
  // print dialog blocks the event loop and would swallow a beacon queued
  // after the print call.
  const handleSummaryPrint = () => {
    trackCTAClick('summary_recap_print', 'mydashboard_summary_print');
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Your Dashboard | DigitalCraft AI</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/my`} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(WEBPAGE_SCHEMA)}</script>
      </Helmet>
      {/* Ticket 0066 - print-only stylesheet. Kept inline in the page render
          (rather than inside Helmet) so the @media print block cannot be
          swallowed by Helmet's tag deduplication and so the rules load
          synchronously with the page markup they target. */}
      <style data-testid="dashboard-summary-print-styles">{PRINT_STYLESHEET}</style>
      <Navbar />
      <ScrollProgress />

      <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles size={16} />
            Your Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Pick up where you <span className="text-primary">left off</span>
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your saved estimate, recent demos, and AI readiness tier. Everything stays in your
            browser. Nothing leaves this device.
          </p>
        </div>
      </section>

      <WhatsNewSinceVisit />

      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
          {/* Ticket 0074 - Comparisons you're weighing. Rendered above the
              existing saved-estimate / saved-ROI / recent-demos cards per
              the ticket 0062 vertical-order precedent (top-of-dashboard
              retention artifacts first). Hidden entirely for a first-time
              visitor with no compare history (no empty state, no nag). */}
          {hydrated && recentCompares.length > 0 && (
            <article data-testid="recent-compares-card" className={CARD}>
              <div className="flex items-start gap-4 mb-4">
                <div className={ICON}><GitCompare size={22} /></div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Comparisons you're weighing
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Pick up the head-to-head you were reading.
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {recentCompares.map((entry) => (
                  <li key={entry.path} data-testid="recent-compare-row">
                    <Link
                      to={entry.path}
                      onClick={() => trackCTAClick('my_compare_reopen', 'my_dashboard')}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 hover:border-primary dark:hover:border-primary transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {entry.tool}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {`Viewed ${formatRelative(entry.viewedAt)}`}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-primary shrink-0 inline-flex items-center gap-1">
                        Reopen comparison
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {nextCompare && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">You might also compare us to</span>
                  <Link
                    to={nextCompare.path}
                    data-testid="compare-suggest-chip"
                    onClick={() => trackCTAClick('my_compare_suggest', 'my_dashboard')}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-primary hover:border-primary dark:hover:border-primary transition-colors"
                  >
                    {nextCompare.tool}
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </article>
          )}

          {hydrated && streak && streak.daysInLast14 >= 1 && (
            <article data-testid="dashboard-streak-badge" className={CARD}>
              <div className="flex items-start gap-4">
                <div className={ICON}><Sparkles size={22} /></div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {`Visiting ${streak.daysInLast14} ${streak.daysInLast14 === 1 ? 'day' : 'days'} in the last 14`}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {streak.daysInLast14 >= 2 ? 'Welcome back.' : 'Glad you are here.'}
                  </p>
                </div>
              </div>
            </article>
          )}

          {hydrated && estimate && (
            <article data-testid="dashboard-estimate-card" className={CARD}>
              <div className="flex items-start gap-4">
                <div className={ICON}><Calculator size={22} /></div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your last estimate</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {PROJECT_LABEL[estimate.selectedTypeId] ?? 'Project'} at {estimate.sqft.toLocaleString()} sq ft,{' '}
                    {FINISH_LABEL[estimate.selectedFinishId] ?? 'standard'} finish.
                  </p>
                  <a
                    data-testid="dashboard-estimate-reopen"
                    href={buildReopenUrl(estimate)}
                    onClick={() => trackCTAClick('reopen_estimate', 'mydashboard_estimate_reopen')}
                    className={`mt-4 ${PRIMARY_BTN}`}
                  >
                    Reopen estimate
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </article>
          )}

          {hydrated && recent.length > 0 && (
            <article data-testid="dashboard-recent-demos-card" className={CARD}>
              <div className="flex items-start gap-4 mb-4">
                <div className={ICON}><ListChecks size={22} /></div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recently viewed</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Jump back into a demo you tried.</p>
                </div>
              </div>
              <ul className="space-y-2">
                {recent.map((entry) => (
                  <li key={entry.path}>
                    <Link
                      to={entry.path}
                      onClick={() => trackCTAClick('resume_demo', 'mydashboard_demo_resume')}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 hover:border-primary dark:hover:border-primary transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{entry.vertical} · {formatRelative(entry.viewedAt)}</div>
                      </div>
                      <ArrowRight size={16} className="text-primary shrink-0 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          )}

          {hydrated && roiResult && (
            <article data-testid="dashboard-roi-card" className={CARD}>
              <div className="flex items-start gap-4">
                <div className={ICON}><DollarSign size={22} /></div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your last ROI estimate</h2>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {`$${roiResult.outputs.annualSavings.toLocaleString('en-US')}`}
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">per year</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {`${roiResult.inputs.leads} leads/week, ${roiResult.inputs.minutes} min/lead, $${roiResult.inputs.hourly}/hr fully-loaded, ${roiResult.inputs.afterhours}% after-hours.`}
                  </p>
                  <a
                    data-testid="dashboard-roi-reopen"
                    href={`/roi?${encodeRoiParams(roiResult.inputs).toString()}`}
                    onClick={() => trackCTAClick('roi_card_reopen', 'mydashboard_roi_reopen')}
                    className={`mt-4 ${PRIMARY_BTN}`}
                  >
                    Reopen result
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </article>
          )}

          {hydrated && persona && (
            <article data-testid="dashboard-quiz-persona-card" className={CARD}>
              <div className="flex items-start gap-4">
                <div className={ICON}><Brain size={22} /></div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your AI readiness</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    You scored as <span className="font-medium text-gray-900 dark:text-white">{persona.persona}</span> on the readiness quiz.
                  </p>
                  <Link
                    to="/quiz"
                    onClick={() => trackCTAClick('retake_quiz', 'mydashboard_quiz_retake')}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Re-take the quiz
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          )}

          {hydrated && anyData && (
            <section
              data-testid="dashboard-summary-recap"
              aria-labelledby="dashboard-summary-recap-heading"
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={ICON}><Printer size={22} /></div>
                <div className="min-w-0 flex-1">
                  <h2
                    id="dashboard-summary-recap-heading"
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    Your Digital Craft summary
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    One page you can print or save as a PDF from your browser.
                  </p>
                  <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-gray-800 dark:text-gray-200">
                    {summaryEntries.map((entry) => (
                      <li key={entry.key} data-summary-key={entry.key}>
                        {entry.text}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    {formatGeneratedAt(generatedAt)}
                  </p>
                  <button
                    type="button"
                    data-testid="dashboard-summary-print"
                    onClick={handleSummaryPrint}
                    className={`mt-4 ${PRIMARY_BTN}`}
                  >
                    <Printer size={16} />
                    Print this summary
                  </button>
                </div>
              </div>
            </section>
          )}

          {hydrated && !anyData && (
            <div data-testid="dashboard-empty-state" className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-10 text-center">
              <div className={`mx-auto mb-4 ${ICON}`}><Inbox size={22} /></div>
              <p className="text-base text-gray-700 dark:text-gray-200 mb-6">You have not started a demo yet.</p>
              <Link
                data-testid="dashboard-empty-cta"
                to="/demos"
                onClick={() => trackCTAClick('start_demo', 'mydashboard_empty_start')}
                className={`px-5 py-2.5 ${PRIMARY_BTN}`}
              >
                Start a demo
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default MyDashboard;

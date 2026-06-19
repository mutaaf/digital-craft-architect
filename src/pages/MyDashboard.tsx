import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ArrowRight, Calculator, ListChecks, Brain, Inbox, DollarSign } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import WhatsNewSinceVisit from '@/components/WhatsNewSinceVisit';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { getRecentDemos, type RecentDemo } from '@/utils/recentDemosStore';
import { getQuizPersona, type QuizPersona } from '@/utils/quizPersonaStore';
import { getVisitStreak, recordVisitToday } from '@/utils/visitStreakStore';
import { getLastRoiResult } from '@/utils/roiResultStore';
import { loadLastEstimate } from '@/pages/construction/lastEstimateStore';
import { encodeEstimateParams, type EstimateShareState } from '@/pages/construction/estimateShareParams';
import { encodeRoiParams } from '@/pages/roiCalculatorParams';
import { PROJECT_TYPES, FINISH_LEVELS } from '@/data/estimatePricing';

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
  const [hydrated, setHydrated] = useState(false);
  // Ticket 0060 - guard so React 18 strict-mode double-mount does not
  // double-fire the streak_badge_view analytics event.
  const streakViewTracked = useRef<boolean>(false);
  // Ticket 0062 - same double-fire guard for the new roi_card_view event.
  const roiCardViewTracked = useRef<boolean>(false);

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

  const anyData = estimate !== null || recent.length > 0 || persona !== null || roiResult !== null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Your Dashboard | DigitalCraft AI</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/my`} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(WEBPAGE_SCHEMA)}</script>
      </Helmet>
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

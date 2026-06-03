import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getRelatedDemos } from '@/utils/relatedDemos';
import { recordDemoVisit } from '@/utils/recentDemosStore';
import { trackCTAClick } from '@/utils/analytics';

// Ticket 0031 - "Try the next demo" pinned CTA. Renders ONE prominent card
// at the visual peak of attention on result screens (voice-negotiator post-
// call summary and the estimate result view). The recommender comes from
// ticket 0027 (src/utils/relatedDemos.ts); this component reuses
// getRelatedDemos(currentPath, 1) and renders a larger, single-choice
// surface above the existing "More like this" strip.
//
// Per the 2026-05-25 mirror-source lesson, this component does NOT
// re-implement ranking, re-list the catalog, or hardcode any recommended
// path. Empty recommender result -> render null. Snapshot read at mount
// (no useEffect, no useState) so React 18 strict-mode double-mount does not
// double-fire the analytics click (the click handler itself fires once per
// real user click, not on mount).

interface NextDemoCTAProps {
  currentPath: string;
  surface: 'voice_result' | 'estimate_result';
}

function reasonCaption(reason: 'same-tool' | 'same-vertical', vertical: string): string {
  if (reason === 'same-tool') return `Same tool for ${vertical}`;
  return `Next in ${vertical}`;
}

const NextDemoCTA = ({ currentPath, surface }: NextDemoCTAProps) => {
  const [top] = getRelatedDemos(currentPath, 1);
  if (!top) return null;

  return (
    <section
      data-testid="next-demo-cta"
      data-surface={surface}
      className="rounded-xl border-2 border-primary/40 dark:border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 p-5 sm:p-6 shadow-sm"
    >
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
        {`Try ${top.title} for ${top.vertical} next`}
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
        {reasonCaption(top.reason, top.vertical)}
      </p>
      <Link
        to={top.path}
        onClick={() => {
          recordDemoVisit(top.path, top.title, top.vertical);
          trackCTAClick('try_next_demo', currentPath);
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 transition-colors"
      >
        Try it now
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
};

export default NextDemoCTA;

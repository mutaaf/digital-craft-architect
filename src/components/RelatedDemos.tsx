import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getRelatedDemos } from '@/utils/relatedDemos';
import { recordDemoVisit } from '@/utils/recentDemosStore';
import { trackCTAClick } from '@/utils/analytics';
import { CALENDLY } from '@/v3/verticals';

// The moment after someone has watched a demo work is the best moment to ask (2026-11-12 CTA pass),
// so every demo ends on the same two choices: talk to us, or run the demos as your own company.
const AfterDemo = ({ currentPath }: { currentPath: string }) => {
  const hub = currentPath.split('/demo/')[0] + '/demo';
  return (
    <section data-testid="after-demo-cta" className="bg-white px-4 pt-12 md:pt-16">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-[28px] bg-[#1d1d1f] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
        <div>
          <h2 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[36px]">Want this on your website?</h2>
          <p className="mt-2 text-[17px] text-[#a1a1a6]">We build it on your site and phone line. Live in two weeks.</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_discovery', `after_demo:${currentPath}`)} className="k-pill bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]">Book a free 30-minute call</a>
          <Link to={hub} onClick={() => trackCTAClick('personalize_demos', `after_demo:${currentPath}`)} className="inline-flex min-h-[44px] items-center text-[15px] font-medium text-[#7BE3C3] hover:underline">Or run every demo as your company ›</Link>
        </div>
      </div>
    </section>
  );
};

// Ticket 0027 - "More like this" cross-vertical recommendations under each
// demo. Snapshot read on mount (no state, no effect); short-circuits to
// null when the recommender returns []. Each card is a react-router Link
// whose onClick fires the dual side effect (recordDemoVisit + trackCTAClick)
// mirroring src/pages/Demos.tsx lines 263-266 from ticket 0026.

interface RelatedDemosProps {
  currentPath: string;
}

function reasonCaption(reason: 'same-tool' | 'same-vertical', vertical: string): string {
  if (reason === 'same-tool') return `Same tool for ${vertical}`;
  return `Next in ${vertical}`;
}

const RelatedDemos = ({ currentPath }: RelatedDemosProps) => {
  const items = getRelatedDemos(currentPath);
  if (items.length === 0) return <AfterDemo currentPath={currentPath} />;

  return (
    <>
    <AfterDemo currentPath={currentPath} />
    <section
      data-testid="related-demos"
      className="py-12 md:py-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="mb-6 text-[24px] font-semibold tracking-[-0.025em] text-gray-900 dark:text-white md:text-[28px]">
          More like this
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              data-testid="related-demo-card"
              onClick={() => {
                recordDemoVisit(item.path, item.title, item.vertical);
                trackCTAClick('related_demo', currentPath);
              }}
              className="group flex flex-col h-full rounded-[22px] bg-gray-50 dark:bg-gray-950 p-6 hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white mb-1">
                {item.title}
              </h3>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                {item.vertical}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {reasonCaption(item.reason, item.vertical)}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                Try it
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default RelatedDemos;

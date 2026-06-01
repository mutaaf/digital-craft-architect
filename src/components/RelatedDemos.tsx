import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getRelatedDemos } from '@/utils/relatedDemos';
import { recordDemoVisit } from '@/utils/recentDemosStore';
import { trackCTAClick } from '@/utils/analytics';

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
  if (items.length === 0) return null;

  return (
    <section
      data-testid="related-demos"
      className="py-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
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
              className="group flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
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
  );
};

export default RelatedDemos;

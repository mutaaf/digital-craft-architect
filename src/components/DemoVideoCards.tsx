import { Play, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DemoVideoCardsProps {
  /** Display name of the vertical, e.g. "Construction" */
  vertical: string;
  /** Poster image shown until the real explainer video ships */
  poster?: string;
}

const VIDEOS = [
  {
    title: 'Capturing & Qualifying Every Lead',
    duration: '0:48',
    description:
      'See how the AI greets inbound leads, asks the right questions, and books the meeting around the clock.',
  },
  {
    title: 'Instant Estimates & Proposals',
    duration: '0:55',
    description:
      'Watch a branded quote go from a few quick inputs to a polished, send-ready document in seconds.',
  },
  {
    title: 'AI Voice Agent on a Live Call',
    duration: '1:02',
    description:
      'Hear the AI handle a real conversation, follow up with the lead, and summarize the next steps automatically.',
  },
];

/**
 * Placeholder explainer-video cards shown above the interactive demos on each
 * demo hub. The <video> elements carry a poster image and a "Coming soon"
 * state today; the card shape is final, so real 30-60s explainers can drop in
 * later (via a <source> child) without any layout change.
 */
const DemoVideoCards = ({ vertical, poster = '/og-default.png' }: DemoVideoCardsProps) => {
  return (
    <section className="mb-10" aria-labelledby="demo-video-heading">
      <div className="text-center mb-6">
        <h2 id="demo-video-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
          Watch AI for {vertical} in Action
        </h2>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
          Short walkthroughs of each automation. Full explainer videos are on the way. Try the
          live demos below in the meantime.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {VIDEOS.map((v) => (
          <Card
            key={v.title}
            className="overflow-hidden flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
          >
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
              <video
                poster={poster}
                preload="none"
                muted
                playsInline
                aria-label={`${v.title}: explainer video for AI in ${vertical} (coming soon)`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg dark:bg-gray-900/90">
                  <Play size={24} className="ml-0.5 fill-current" />
                </span>
              </div>
              <span className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                Coming soon
              </span>
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                <Clock size={12} /> {v.duration}
              </span>
            </div>
            <div className="p-4 flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {v.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{v.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default DemoVideoCards;

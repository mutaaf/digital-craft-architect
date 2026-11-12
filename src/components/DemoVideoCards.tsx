import { Play, Clock } from 'lucide-react';

interface DemoVideoCardsProps {
  /** Display name of the vertical, e.g. "Construction" */
  vertical: string;
  /** A real frame from the explainer, once it ships (unused until then: a social card is not a frame) */
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
 * Placeholder explainer-video cards on each demo hub (keynote pass, 2026-11-12): light tiles, a play
 * glyph and a "Coming soon" tag, no social-card poster standing in for a video frame. The card shape is
 * final, so real 30-60s explainers can drop in later (a <source> child plus `poster`) without any
 * layout change. `poster` is only used once it is a real frame from the video.
 */
const DemoVideoCards = ({ vertical }: DemoVideoCardsProps) => {
  return (
    <section aria-labelledby="demo-video-heading">
      <div className="mb-10 text-center md:mb-14">
        <h2 id="demo-video-heading" className="mx-auto max-w-[18ch] text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1d1d1f] md:text-[44px]">
          Watch AI for {vertical} in Action
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-balance text-[17px] leading-relaxed text-[#6e6e73]">
          Short walkthroughs of each automation. Full explainer videos are on the way. Try the
          live demos below in the meantime.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        {VIDEOS.map((v) => (
          <div key={v.title} className="flex flex-col overflow-hidden rounded-[28px] bg-white">
            <div className="relative aspect-video bg-[#e8e8ed]">
              <video
                preload="none"
                muted
                playsInline
                aria-label={`${v.title}: explainer video for AI in ${vertical} (coming soon)`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-[#1d1d1f]">
                  <Play size={22} className="ml-0.5 fill-current" aria-hidden />
                </span>
              </div>
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-medium text-[#1d1d1f]">
                Coming soon
              </span>
              <span className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-medium text-[#1d1d1f]">
                <Clock size={12} aria-hidden /> {v.duration}
              </span>
            </div>
            <div className="flex-1 p-6 md:p-7">
              <h3 className="mb-1.5 text-[19px] font-semibold leading-snug text-[#1d1d1f]">{v.title}</h3>
              <p className="text-[15px] leading-relaxed text-[#6e6e73]">{v.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DemoVideoCards;

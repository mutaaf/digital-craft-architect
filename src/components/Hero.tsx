import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HeroSection } from '@/hooks/useContent';
import CrewOfLight, { type StoryState } from '@/components/v2/CrewOfLight';
import { trackCTAClick } from '@/utils/analytics';

interface HeroProps {
  data: HeroSection;
}

// Ticket 0119 - the company site's hero tells the Crew of Light story (the CTO site's, in the
// company's voice and sky accent): a contractor's lead slips after hours, DigitalCraft builds and
// briefs the agents, the same lead is caught. It plays in a dark "after hours" window on the
// light page, because that's when the story happens; the window's header keeps the time.
const Hero: React.FC<HeroProps> = ({ data }) => {
  const taps = useRef(0);
  const resetAt = useRef(0);
  const [story, setStory] = useState<StoryState | null>(null);

  // five taps on the window still opens the easter egg
  const handleTap = () => {
    taps.current += 1;
    window.clearTimeout(resetAt.current);
    if (taps.current >= 5) {
      taps.current = 0;
      window.dispatchEvent(new CustomEvent('hero-easter-egg-activated'));
      return;
    }
    resetAt.current = window.setTimeout(() => { taps.current = 0; }, 2000);
  };

  const after = !story ? 'Live' : story.chapter === 'miss' ? 'Missed' : story.chapter === 'build' ? 'Building' : 'Caught';

  return (
    <section className="pt-20 md:pt-28 pb-16 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:gap-10">
          <div className="w-full md:w-1/2 mb-10 md:mb-0 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
              {data.headline}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl text-balance">
              {data.subheadline}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={data.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick('book_discovery', 'root_hero')}
                className="btn-primary inline-block text-lg"
              >
                {data.cta}
              </a>
              <Link
                to="/construction/demo"
                onClick={() => trackCTAClick('story_try_demo', 'root_hero')}
                className="group inline-flex items-center gap-2 text-lg font-medium text-gray-800 transition-colors hover:text-skyblue dark:text-gray-100"
              >
                Watch it work on your company
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="w-full md:w-1/2 animate-slide-up">
            <div
              className="relative overflow-hidden rounded-2xl border border-slate-900/10 bg-[#0a1016] shadow-[0_30px_80px_-30px_rgba(10,40,60,0.55)] dark:border-white/10"
              onClick={handleTap}
            >
              {/* the night outside: a sky glow behind the stage, and the window's header */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(120% 70% at 70% 0%, rgba(51,195,240,0.16), transparent 60%), radial-gradient(80% 50% at 10% 100%, rgba(123,227,195,0.08), transparent 70%)' }}
              />
              <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-white/55">
                <span className="flex items-center gap-2">
                  <span className="flex gap-1.5" aria-hidden>
                    <span className="h-2 w-2 rounded-full bg-white/15" />
                    <span className="h-2 w-2 rounded-full bg-white/15" />
                    <span className="h-2 w-2 rounded-full bg-white/15" />
                  </span>
                  <span className="ml-2">After hours</span>
                </span>
                <span className="flex items-center gap-2" aria-hidden>
                  <span className={`h-1.5 w-1.5 rounded-full ${after === 'Missed' ? 'bg-amber-400' : after === 'Caught' ? 'bg-skyblue' : 'bg-emerald-300'} animate-pulse`} />
                  {after}
                </span>
              </div>
              <div className="relative h-[540px] px-4 pb-4 md:h-[600px]">
                <CrewOfLight host="root" onStory={setStory} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

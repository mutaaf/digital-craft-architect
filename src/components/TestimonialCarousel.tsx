import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { TestimonialItem } from '@/hooks/useContent';

interface TestimonialCarouselProps {
  data: TestimonialItem[];
  itemsToShow?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ data }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps',
  });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  // Auto-advance every 9s
  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(() => emblaApi.scrollNext(), 9000);
    return () => clearInterval(id);
  }, [emblaApi]);

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-4 -inset-y-8 -z-10 opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(50% 60% at 50% 50%, rgba(51, 195, 240, 0.18), transparent 70%)',
        }}
      />

      {/* Viewport */}
      <div className="overflow-hidden pt-14 pb-6" ref={emblaRef}>
        <div className="flex">
          {data.map((t, i) => (
            <div
              key={i}
              className="relative flex min-w-0 flex-[0_0_100%] px-3 md:px-5"
            >
              <article className="relative flex w-full flex-col gap-6 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] dark:border-gray-800/70 dark:bg-gray-900/80 md:p-10 lg:p-12">
                {/* Giant decorative quote glyph */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-10 left-6 select-none font-serif text-[140px] leading-none text-skyblue/25 md:-top-14 md:left-10 md:text-[190px]"
                  style={{ fontFamily: "'Newsreader', Georgia, serif" }}
                >
                  “
                </span>

                <div
                  className="relative flex items-center gap-0.5"
                  role="img"
                  aria-label="Rated 5 out of 5 stars"
                >
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={16}
                      aria-hidden="true"
                      className="fill-amber-500 stroke-amber-500"
                    />
                  ))}
                  <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gray-600 dark:text-gray-300">
                    Verified engagement
                  </span>
                </div>

                <blockquote
                  className="relative text-[20px] leading-[1.55] text-gray-800 dark:text-gray-100 md:text-[26px] md:leading-[1.45]"
                  style={{ fontFamily: "'Newsreader', Georgia, serif" }}
                >
                  {t.quote}
                </blockquote>

                <footer className="relative flex items-center gap-4 border-t border-gray-100 pt-6 dark:border-gray-800">
                  <img
                    src={t.image}
                    alt={t.author}
                    className="h-14 w-14 rounded-full border-2 border-skyblue/30 object-cover md:h-16 md:w-16"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white md:text-lg">
                      {t.author}
                    </div>
                    <div className="truncate text-sm text-gray-600 dark:text-gray-400">
                      {t.position}
                    </div>
                  </div>
                  <div className="ml-auto hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300 md:flex">
                    <span>
                      {String(i + 1).padStart(2, '0')} /{' '}
                      {String(data.length).padStart(2, '0')}
                    </span>
                  </div>
                </footer>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous testimonial"
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-skyblue hover:text-skyblue dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <ChevronLeft
            size={18}
            className="transition-transform group-hover:-translate-x-0.5"
          />
        </button>

        <div className="flex items-center" role="tablist" aria-label="Testimonials">
          {data.map((_, i) => {
            const active = i === selected;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                onClick={() => scrollTo(i)}
                aria-label={`Go to testimonial ${i + 1} of ${data.length}`}
                aria-selected={active}
                className="group flex h-11 w-11 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={`relative block h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                    active
                      ? 'w-10 bg-sky-600'
                      : 'w-1.5 bg-gray-400 group-hover:bg-gray-500 dark:bg-gray-500 dark:group-hover:bg-gray-400'
                  }`}
                >
                  {active && (
                    <span
                      className="absolute inset-y-0 left-0 bg-sky-600/60"
                      style={{ animation: 'tm-progress 9s linear forwards' }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next testimonial"
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-skyblue hover:text-skyblue dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <ChevronRight
            size={18}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {/* Attribution strip */}
      <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
        <div className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">
          Voices of
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-10">
          {data.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Show testimonial from ${t.position}`}
              className={`py-2 font-serif text-sm italic transition md:text-base ${
                i === selected
                  ? 'text-gray-900 underline decoration-sky-600 decoration-2 underline-offset-4 dark:text-white'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
              style={{ fontFamily: "'Newsreader', Georgia, serif" }}
            >
              {t.position}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;

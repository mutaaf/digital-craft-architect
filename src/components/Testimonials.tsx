
import React from 'react';
import { TestimonialItem } from '@/hooks/useContent';
import TestimonialCarousel from './TestimonialCarousel';

interface TestimonialsProps {
  data: TestimonialItem[];
  carouselConfig?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

const Testimonials: React.FC<TestimonialsProps> = ({ 
  data,
  carouselConfig = { mobile: 1, tablet: 2, desktop: 3 }
}) => {
  return (
    <section className="container-section">
      <div className="text-center mb-12 md:mb-14 animate-fade-in">
        <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-skyblue mb-3">
          § Client Voices
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
          The outcomes, <span className="italic font-serif font-normal" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>in their words.</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-balance">
          Multi-year retainers. Real operators. Real P&amp;L changes.
        </p>
      </div>

      <TestimonialCarousel data={data} itemsToShow={carouselConfig} />
    </section>
  );
};

export default Testimonials;


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
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">What Clients Say</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Don't take our word for it. Hear from the leaders who've transformed their operations.
        </p>
      </div>
      
      <TestimonialCarousel data={data} itemsToShow={carouselConfig} />
    </section>
  );
};

export default Testimonials;

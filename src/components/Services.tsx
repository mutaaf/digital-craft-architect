
import React from 'react';
import { ServiceItem } from '@/hooks/useContent';
import ServiceCarousel from './ServiceCarousel';

interface ServicesProps {
  data: ServiceItem[];
  carouselConfig?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

const Services: React.FC<ServicesProps> = ({ 
  data, 
  carouselConfig = { mobile: 1, tablet: 2, desktop: 3 } 
}) => {
  return (
    <section id="services" className="container-section bg-gray-50 dark:bg-gray-900">
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Build</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Transforming manual operations into elegant digital systems that save time, reduce errors, and drive growth.
        </p>
      </div>
      
      <ServiceCarousel data={data} itemsToShow={carouselConfig} />
    </section>
  );
};

export default Services;

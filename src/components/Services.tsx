
import React from 'react';
import { ServiceItem } from '@/hooks/useContent';

interface ServicesProps {
  data: ServiceItem[];
  carouselConfig?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

const Services: React.FC<ServicesProps> = ({ data, carouselConfig }) => {
  return (
    <section className="container-section">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.map((service, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105"
          >
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <img 
                  src={service.icon} 
                  alt={`${service.title} icon`} 
                  className="w-8 h-8 mr-4"
                />
                <h3 className="text-xl font-semibold">{service.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{service.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;

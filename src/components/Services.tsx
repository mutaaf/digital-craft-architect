
import React from 'react';
import { ServiceItem } from '@/hooks/useContent';

interface ServicesProps {
  data: ServiceItem[];
}

const Services: React.FC<ServicesProps> = ({ data }) => {
  return (
    <section id="services" className="container-section bg-gray-50 dark:bg-gray-900">
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Build</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Transforming manual operations into elegant digital systems that save time, reduce errors, and drive growth.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.map((service, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg animate-slide-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <img src={service.icon} alt={service.title} className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{service.desc}</p>
              </div>
              
              <div className="mt-auto">
                <img 
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;

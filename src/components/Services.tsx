
import React from 'react';
import { ServiceItem } from '@/hooks/useContent';

interface ServicesProps {
  data: ServiceItem[];
}

const Services: React.FC<ServicesProps> = ({ data }) => {
  return (
    <section id="services" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-neon-purple/5 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="font-bold mb-6 gradient-text">What We Build</h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Transforming manual operations into elegant digital systems that save time, reduce errors, and drive growth.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((service, index) => (
            <div 
              key={index} 
              className="bg-glass rounded-2xl p-8 card-hover animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 transform transition-transform duration-500 hover:rotate-6">
                    <img src={service.icon} alt={service.title} className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-foreground/70">{service.desc}</p>
                </div>
                
                <div className="mt-auto pt-6">
                  <div className="rounded-xl overflow-hidden group relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-sm font-medium">Learn more</span>
                      </div>
                    </div>
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

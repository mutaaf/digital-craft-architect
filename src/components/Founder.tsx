
import React from 'react';
import { FounderSection } from '@/hooks/useContent';

interface FounderProps {
  data: FounderSection;
}

const Founder: React.FC<FounderProps> = ({ data }) => {
  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-neon-purple/5 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-5/12 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-neon-purple/20 rounded-3xl transform -rotate-6 animate-pulse-soft"></div>
              <div className="absolute inset-0 bg-primary/10 rounded-3xl transform rotate-3 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
              <img
                src={data.photo}
                alt="Founder"
                className="rounded-2xl shadow-lg object-cover w-full h-[500px] relative z-10 transform transition-all duration-700 hover:scale-105"
              />
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-neon-blue rounded-full shadow-neon-blue animate-pulse-soft"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-neon-purple rounded-full shadow-neon-purple animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
          
          <div className="w-full lg:w-7/12 animate-slide-up">
            <h2 className="font-bold mb-6 gradient-text">About the Founder</h2>
            <p className="text-xl text-foreground/80 mb-10 text-balance">
              {data.bio}
            </p>
            
            <div className="space-y-8 relative">
              <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gradient-to-b from-primary via-neon-purple to-primary/30 z-0"></div>
              
              {data.timeline.map((item, index) => (
                <div 
                  key={index} 
                  className="relative pl-12 group"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="absolute left-0 top-0 mt-1.5 w-8 h-8 rounded-full bg-glass flex items-center justify-center z-10 transform transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary/20">
                    <div className="w-3 h-3 bg-primary rounded-full group-hover:bg-white"></div>
                  </div>
                  <div className="bg-glass group-hover:bg-glass/80 rounded-xl p-4 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg">
                    <span className="gradient-text font-semibold text-lg">{item.year}</span>
                    <p className="text-foreground/80 mt-2">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Founder;

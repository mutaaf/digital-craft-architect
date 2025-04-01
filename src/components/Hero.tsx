
import React from 'react';
import { HeroSection } from '@/hooks/useContent';

interface HeroProps {
  data: HeroSection;
}

const Hero: React.FC<HeroProps> = ({ data }) => {
  return (
    <section className="pt-24 md:pt-32 pb-20 md:pb-28 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-neon-purple/5 rounded-full filter blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 mb-16 lg:mb-0 animate-fade-in">
            <div className="max-w-xl">
              <h1 className="font-bold leading-tight mb-6 gradient-text">
                {data.headline}
              </h1>
              <p className="text-xl md:text-2xl text-foreground/80 dark:text-foreground/70 mb-8 max-w-xl text-balance">
                {data.subheadline}
              </p>
              <a
                href={data.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-primary rounded-full overflow-hidden transition-all duration-300 ease-out shadow-lg hover:scale-105 hover:shadow-primary/30"
              >
                <span className="absolute inset-0 w-0 bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-500 ease-out group-hover:w-full"></span>
                <span className="relative flex items-center">
                  {data.cta}
                  <svg className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center animate-slide-up">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl transform rotate-3 animate-pulse-soft"></div>
              <div className="absolute inset-2 bg-gradient-to-tr from-primary/20 to-neon-purple/20 rounded-3xl transform -rotate-3 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
              <img
                src={data.image}
                alt="Modern Digital Services"
                className="rounded-2xl shadow-lg object-cover h-[500px] relative z-10 transform transition-all duration-700 hover:scale-105 hover:rotate-1"
              />
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-neon-blue rounded-full shadow-neon-blue animate-pulse-soft"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-neon-purple rounded-full shadow-neon-purple animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

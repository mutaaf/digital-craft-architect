
import React, { useState } from 'react';
import { HeroSection } from '@/hooks/useContent';

interface HeroProps {
  data: HeroSection;
}

const Hero: React.FC<HeroProps> = ({ data }) => {
  const [tapCount, setTapCount] = useState(0);

  const handleImageTap = () => {
    // Increment the tap count
    setTapCount(prevCount => {
      const newCount = prevCount + 1;
      
      // Dispatch a custom event when 5 taps are detected
      if (newCount >= 5) {
        const easterEggEvent = new CustomEvent('hero-easter-egg-activated');
        window.dispatchEvent(easterEggEvent);
        return 0; // Reset tap count
      }
      
      // Reset tap count after 2 seconds of inactivity
      const resetTimer = setTimeout(() => {
        setTapCount(0);
      }, 2000);
      
      return newCount;
    });
  };

  return (
    <section className="pt-20 md:pt-28 pb-16 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-12 md:mb-0 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
              {data.headline}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl text-balance">
              {data.subheadline}
            </p>
            <a
              href={data.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block text-lg"
            >
              {data.cta}
            </a>
          </div>
          <div className="w-full md:w-1/2 flex justify-center animate-slide-up">
            <div 
              className="relative cursor-pointer" 
              onClick={handleImageTap} 
              aria-label="Hero image"
            >
              <div className="absolute inset-0 bg-skyblue/10 rounded-3xl transform rotate-3"></div>
              <img
                src={data.image}
                alt="AI-powered business automation"
                className="rounded-2xl shadow-lg object-cover h-[500px] relative z-10 transform -rotate-2 transition-transform duration-500 hover:rotate-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

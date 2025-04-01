
import React from 'react';
import { FounderSection } from '@/hooks/useContent';

interface FounderProps {
  data: FounderSection;
}

const Founder: React.FC<FounderProps> = ({ data }) => {
  return (
    <section id="about" className="container-section">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-5/12 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl transform rotate-3"></div>
            <img
              src={data.photo}
              alt="Founder"
              className="rounded-2xl shadow-lg object-cover w-full h-[500px] relative z-10 transform -rotate-2 transition-transform duration-500 hover:rotate-0"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-7/12 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About the Founder</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-balance">
            {data.bio}
          </p>
          
          <div className="border-l-2 border-skyblue pl-6 space-y-6">
            {data.timeline.map((item, index) => (
              <div 
                key={index} 
                className="relative"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="absolute -left-[31px] mt-1.5 w-6 h-6 rounded-full bg-skyblue flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <span className="text-skyblue font-semibold text-lg">{item.year}</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Founder;


import React, { useState } from 'react';
import { CaseStudyItem } from '@/hooks/useContent';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CaseStudiesProps {
  data: CaseStudyItem[];
}

const CaseStudies: React.FC<CaseStudiesProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextCase = () => {
    setActiveIndex((prev) => (prev + 1) % data.length);
  };

  const prevCase = () => {
    setActiveIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  return (
    <section id="case-studies" className="container-section bg-gray-50 dark:bg-gray-900">
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Case Studies</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Real problems solved with elegant tech solutions. See the transformation in action.
        </p>
      </div>
      
      <div className="relative">
        {data.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-10">
            <button 
              onClick={prevCase}
              className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md flex items-center justify-center hover:bg-skyblue hover:text-white transition-colors"
              aria-label="Previous case study"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        )}
        
        {data.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-10">
            <button 
              onClick={nextCase}
              className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md flex items-center justify-center hover:bg-skyblue hover:text-white transition-colors"
              aria-label="Next case study"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        )}
        
        <div className="overflow-hidden">
          <div 
            className="transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            <div className="flex">
              {data.map((caseStudy, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="h-64 overflow-hidden">
                      <img 
                        src={caseStudy.image} 
                        alt={caseStudy.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                    </div>
                    
                    <div className="p-8">
                      <h3 className="text-2xl font-bold mb-2">{caseStudy.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">{caseStudy.subtitle}</p>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold mb-3 text-red-500 dark:text-red-400">Before</h4>
                          <p className="text-gray-700 dark:text-gray-300">{caseStudy.before}</p>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">After</h4>
                          <p className="text-gray-700 dark:text-gray-300">{caseStudy.after}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {data.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {data.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-skyblue' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to case study ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CaseStudies;

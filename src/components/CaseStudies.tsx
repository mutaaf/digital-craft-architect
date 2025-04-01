
import React, { useState } from 'react';
import { CaseStudyItem } from '@/hooks/useContent';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CaseStudiesProps {
  data: CaseStudyItem[];
}

const CaseStudies: React.FC<CaseStudiesProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsToShow = 2;
  const maxIndex = Math.ceil(data.length / itemsToShow) - 1;

  const nextCase = () => {
    setActiveIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const prevCase = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  return (
    <section id="case-studies" className="container-section bg-gray-50 dark:bg-gray-900">
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Real problems solved with elegant tech solutions. See the transformation in action.
        </p>
      </div>
      
      <div className="relative">
        {data.length > itemsToShow && (
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
        
        {data.length > itemsToShow && (
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
              {Array.from({ length: Math.ceil(data.length / itemsToShow) }).map((_, groupIndex) => (
                <div key={groupIndex} className="w-full flex-shrink-0 px-4">
                  <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {data.slice(groupIndex * itemsToShow, (groupIndex * itemsToShow) + itemsToShow).map((caseStudy, index) => (
                      <Card key={index} className="bg-white dark:bg-gray-800 overflow-hidden h-full">
                        <div className="h-56 overflow-hidden">
                          <img 
                            src={caseStudy.image} 
                            alt={caseStudy.title}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                          />
                        </div>
                        
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-1">{caseStudy.title}</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">{caseStudy.subtitle}</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                              <h4 className="text-sm font-semibold mb-2 text-red-500 dark:text-red-400">BEFORE</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{caseStudy.before}</p>
                            </div>
                            
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                              <h4 className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400">AFTER</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{caseStudy.after}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {data.length > itemsToShow && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(data.length / itemsToShow) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-skyblue' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to case studies page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CaseStudies;

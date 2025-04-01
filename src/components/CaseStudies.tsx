
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
    <section id="case-studies" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none"></div>
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-neon-purple/5 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="font-bold mb-6 gradient-text">Success Stories</h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Real problems solved with elegant tech solutions. See the transformation in action.
          </p>
        </div>
        
        <div className="relative">
          {data.length > itemsToShow && (
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-10">
              <button 
                onClick={prevCase}
                className="w-14 h-14 rounded-full bg-glass backdrop-blur-lg shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Previous case study"
              >
                <ArrowLeft size={24} />
              </button>
            </div>
          )}
          
          {data.length > itemsToShow && (
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-10">
              <button 
                onClick={nextCase}
                className="w-14 h-14 rounded-full bg-glass backdrop-blur-lg shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
                aria-label="Next case study"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          )}
          
          <div className="overflow-hidden">
            <div 
              className="transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              <div className="flex">
                {Array.from({ length: Math.ceil(data.length / itemsToShow) }).map((_, groupIndex) => (
                  <div key={groupIndex} className="w-full flex-shrink-0 px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                      {data.slice(groupIndex * itemsToShow, (groupIndex * itemsToShow) + itemsToShow).map((caseStudy, index) => (
                        <Card key={index} className="bg-glass overflow-hidden h-full border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-glass/80">
                          <div className="h-60 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                            <img 
                              src={caseStudy.image} 
                              alt={caseStudy.title}
                              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                            <div className="absolute bottom-0 left-0 p-6 z-20">
                              <h3 className="text-2xl font-bold text-white mb-1">{caseStudy.title}</h3>
                              <p className="text-white/80 text-sm">{caseStudy.subtitle}</p>
                            </div>
                          </div>
                          
                          <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-red-50/50 dark:bg-red-900/20 p-5 rounded-xl">
                                <h4 className="text-sm font-semibold mb-2 text-red-500 dark:text-red-400">BEFORE</h4>
                                <p className="text-sm text-foreground/80">{caseStudy.before}</p>
                              </div>
                              
                              <div className="bg-green-50/50 dark:bg-green-900/20 p-5 rounded-xl">
                                <h4 className="text-sm font-semibold mb-2 text-green-600 dark:text-green-400">AFTER</h4>
                                <p className="text-sm text-foreground/80">{caseStudy.after}</p>
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
            <div className="flex justify-center mt-10 space-x-3">
              {Array.from({ length: Math.ceil(data.length / itemsToShow) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? 'bg-primary scale-125 shadow-md shadow-primary/30' 
                      : 'bg-primary/30 hover:bg-primary/50'
                  }`}
                  aria-label={`Go to case studies page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;

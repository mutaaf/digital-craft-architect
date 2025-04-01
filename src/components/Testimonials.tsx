
import React from 'react';
import { TestimonialItem } from '@/hooks/useContent';
import { Quote } from 'lucide-react';

interface TestimonialsProps {
  data: TestimonialItem[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ data }) => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-neon-purple/5 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="font-bold mb-6 gradient-text">What Clients Say</h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Don't take my word for it. Hear from the leaders who've transformed their operations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {data.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-glass rounded-2xl p-8 relative transform transition-all duration-500 hover:bg-glass/90 hover:-translate-y-2 hover:shadow-xl animate-slide-up" 
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-gradient-to-br from-primary to-neon-blue rounded-full flex items-center justify-center shadow-lg">
                <Quote size={20} className="text-white" />
              </div>
              
              <div className="pt-4">
                <p className="text-foreground/80 mb-8 italic">"{testimonial.quote}"</p>
                
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-neon-purple/80 rounded-full animate-pulse-soft"></div>
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.author} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-white/50 relative z-10"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-foreground/60">{testimonial.position}</p>
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

export default Testimonials;

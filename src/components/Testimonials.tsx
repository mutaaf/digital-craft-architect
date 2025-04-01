
import React from 'react';
import { TestimonialItem } from '@/hooks/useContent';
import { Quote } from 'lucide-react';

interface TestimonialsProps {
  data: TestimonialItem[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ data }) => {
  return (
    <section className="container-section">
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">What Clients Say</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Don't take my word for it. Hear from the leaders who've transformed their operations.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {data.map((testimonial, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 relative animate-slide-up" 
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-skyblue rounded-full flex items-center justify-center">
              <Quote size={20} className="text-white" />
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
            
            <div className="flex items-center">
              <img 
                src={testimonial.image} 
                alt={testimonial.author} 
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-semibold">{testimonial.author}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.position}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;

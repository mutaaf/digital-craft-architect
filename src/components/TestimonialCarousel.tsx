
import React from 'react';
import { TestimonialItem } from '@/hooks/useContent';
import { Quote } from 'lucide-react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import useEmblaCarousel from 'embla-carousel-react';

interface TestimonialCarouselProps {
  data: TestimonialItem[];
  itemsToShow: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ data, itemsToShow }) => {
  const [emblaRef] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(max-width: 640px)': { slidesToScroll: 1 },
      '(min-width: 641px) and (max-width: 1024px)': { slidesToScroll: 1 },
      '(min-width: 1025px)': { slidesToScroll: 1 }
    }
  });

  return (
    <div className="w-full">
      <Carousel opts={{ align: 'start', loop: true }}>
        <CarouselContent ref={emblaRef}>
          {data.map((testimonial, index) => (
            <CarouselItem 
              key={index} 
              className={`
                pl-4 
                sm:basis-full 
                md:basis-1/${itemsToShow.tablet} 
                lg:basis-1/${itemsToShow.desktop}
              `}
            >
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 relative h-full">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-skyblue rounded-full flex items-center justify-center">
                  <Quote size={20} className="text-white" />
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                
                <div className="flex items-center mt-auto">
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-6 gap-2">
          <CarouselPrevious className="relative inset-0 translate-y-0 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700" />
          <CarouselNext className="relative inset-0 translate-y-0 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700" />
        </div>
      </Carousel>
    </div>
  );
};

export default TestimonialCarousel;

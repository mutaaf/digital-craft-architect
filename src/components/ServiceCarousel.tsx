
import React from 'react';
import { ServiceItem } from '@/hooks/useContent';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import useEmblaCarousel from 'embla-carousel-react';

interface ServiceCarouselProps {
  data: ServiceItem[];
  itemsToShow: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

const ServiceCarousel: React.FC<ServiceCarouselProps> = ({ data, itemsToShow }) => {
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
          {data.map((service, index) => (
            <CarouselItem 
              key={index} 
              className={`
                pl-4 
                sm:basis-full 
                md:basis-1/${itemsToShow.tablet} 
                lg:basis-1/${itemsToShow.desktop}
              `}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg h-full">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <img src={service.icon} alt={service.title} className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{service.desc}</p>
                  </div>
                  
                  <div className="mt-auto">
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
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

export default ServiceCarousel;

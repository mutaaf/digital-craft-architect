import React from 'react';
import { MVPPromotionConfig } from '@/hooks/useContent';
import { Check, Sparkles } from 'lucide-react';

interface MVPPromotionProps {
  data: MVPPromotionConfig;
}

const MVPPromotion: React.FC<MVPPromotionProps> = ({ data }) => {
  if (!data.enabled) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-20">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-semibold">Limited Time Offer</span>
            </div>
            
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
                {data.headline}
              </h2>
              <p className="text-3xl md:text-4xl font-bold text-yellow-300">
                {data.subheadline}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block border-2 border-yellow-300">
              <div className="text-sm font-semibold text-yellow-300 mb-1">
                {data.priceLabel}
              </div>
              <div className="text-5xl md:text-6xl font-bold text-yellow-300">
                {data.price}
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-red-300/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400"></span>
              </span>
              <span className="text-sm font-semibold text-red-100">Only 3 spots remaining this month</span>
            </div>

            <p className="text-xl text-white/90 leading-relaxed">
              {data.description}
            </p>

            <a 
              href={data.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {data.ctaText}
            </a>
          </div>

          {/* Right Column - Features */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4 border border-white/20">
            <h3 className="text-2xl font-bold mb-6">What's Included:</h3>
            {data.features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-gray-900" strokeWidth={3} />
                </div>
                <p className="text-lg text-white/90 leading-relaxed">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
    </section>
  );
};

export default MVPPromotion;

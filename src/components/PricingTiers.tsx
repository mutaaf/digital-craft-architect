import React from 'react';
import { PricingTiersConfig } from '@/hooks/useContent';
import { Check, Zap } from 'lucide-react';

interface PricingTiersProps {
  data: PricingTiersConfig;
}

const PricingTiers: React.FC<PricingTiersProps> = ({ data }) => {
  return (
    <section id="pricing" className="container-section bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          {data.headline}
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {data.subheadline}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {data.tiers.map((tier, index) => (
          <div
            key={index}
            className={`relative rounded-2xl transition-all duration-300 hover:scale-105 ${
              tier.highlighted
                ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-2xl scale-105 border-4 border-yellow-400'
                : 'bg-card border border-border shadow-lg hover:shadow-xl'
            }`}
          >
            {/* Badge for Most Popular */}
            {tier.badge && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                  <Zap className="w-4 h-4" fill="currentColor" />
                  {tier.badge}
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-foreground'}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm mb-6 ${tier.highlighted ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {tier.description}
                </p>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className={`text-5xl font-bold ${tier.highlighted ? 'text-yellow-300' : 'text-primary'}`}>
                      ${tier.price}
                    </span>
                    <span className={`text-lg ${tier.highlighted ? 'text-white/80' : 'text-muted-foreground'}`}>
                      /{tier.period}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <a
                  href={tier.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-3 rounded-lg font-semibold text-center transition-all duration-300 ${
                    tier.highlighted
                      ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900 shadow-lg hover:shadow-xl'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {tier.ctaText}
                </a>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t border-white/20">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      tier.highlighted ? 'bg-green-400' : 'bg-primary/20'
                    }`}>
                      <Check 
                        className={`w-3 h-3 ${tier.highlighted ? 'text-gray-900' : 'text-primary'}`} 
                        strokeWidth={3} 
                      />
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      tier.highlighted ? 'text-white/90' : 'text-foreground/80'
                    }`}>
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badge */}
      <div className="text-center mt-16 animate-fade-in">
        <p className="text-muted-foreground text-lg">
          All plans include secure hosting, regular backups, and our satisfaction guarantee
        </p>
      </div>
    </section>
  );
};

export default PricingTiers;

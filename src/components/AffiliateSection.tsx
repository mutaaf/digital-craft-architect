
import React from 'react';

interface AffiliateItem {
  name: string;
  link: string;
  image: string;
}

interface AffiliateSectionProps {
  data: AffiliateItem[];
}

const AffiliateSection: React.FC<AffiliateSectionProps> = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <section className="container-section bg-gray-50 dark:bg-gray-900">
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Tools We Trust</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Industry-leading partners that power our AI solutions.
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
        {data.map((affiliate, index) => (
          <a 
            key={index} 
            href={affiliate.link}
            target="_blank"
            rel="sponsored noopener"
            className="opacity-70 hover:opacity-100 transition-opacity duration-300 group"
            onClick={() => {
              // Track affiliate link clicks if analytics exist
              if (window.gtag) {
                window.gtag('event', 'affiliate_click', {
                  affiliate_name: affiliate.name,
                  affiliate_link: affiliate.link
                });
              }
            }}
          >
            <img 
              src={affiliate.image} 
              alt={affiliate.name}
              className="h-10 md:h-12 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" 
            />
          </a>
        ))}
      </div>
    </section>
  );
};

export default AffiliateSection;

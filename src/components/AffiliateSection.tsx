
import React from 'react';

interface AffiliateItem {
  name: string;
  link: string;
  image?: string;
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
      
      <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 md:gap-16">
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
            {/* wordmarks, not hotlinked logos: those broke (OpenAI's) or rendered as a grey card (AWS's) */}
            <span className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white transition-colors duration-300">
              {affiliate.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default AffiliateSection;


import { useState, useEffect } from 'react';

export interface HeroSection {
  headline: string;
  subheadline: string;
  image: string;
  cta: string;
  ctaLink: string;
}

export interface ServiceItem {
  icon: string;
  title: string;
  desc: string;
  image: string;
}

export interface TimelineItem {
  year: string;
  event: string;
}

export interface FounderSection {
  photo: string;
  bio: string;
  timeline: TimelineItem[];
}

export interface CaseStudyItem {
  title: string;
  subtitle: string;
  image: string;
  before: string;
  after: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  position: string;
  image: string;
}

export interface AIFormalizationConfig {
  enabled: boolean;
  buttonText: string;
  apiConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    fallbackMessage: string;
  };
}

export interface FormSection {
  headline: string;
  fields: string[];
  submitText: string;
  submitUrl: string;
  aiFormalization?: AIFormalizationConfig;
}

export interface FooterSection {
  tagline: string;
  socialLinks: {
    [key: string]: string;
  };
}

export interface AffiliateItem {
  name: string;
  link: string;
  image: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  author: string;
  socialImage: string;
}

export interface UIConfig {
  carouselItemsPerView: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  parallaxEnabled: boolean;
  parallaxStrength: number;
}

export interface ContentData {
  hero: HeroSection;
  services: ServiceItem[];
  founder: FounderSection;
  caseStudies: CaseStudyItem[];
  testimonials: TestimonialItem[];
  form: FormSection;
  footer: FooterSection;
  affiliates?: AffiliateItem[];
  seo?: SEOData;
  uiConfig?: UIConfig;
}

const DEFAULT_UI_CONFIG: UIConfig = {
  carouselItemsPerView: {
    mobile: 1,  // Changed back to 1
    tablet: 2,  // Changed back to 2
    desktop: 3  // Kept at 3
  },
  parallaxEnabled: true,
  parallaxStrength: 0.3
};

export const useContent = () => {
  const [content, setContent] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // First try to get content from an environment variable URL if available
        const contentUrl = import.meta.env.VITE_CONTENT_URL;
        
        let data;
        if (contentUrl) {
          const response = await fetch(contentUrl);
          data = await response.json();
        } else {
          // Fallback to local content file
          const response = await fetch('/content.json');
          data = await response.json();
        }
        
        // Apply default UI config if not provided
        if (!data.uiConfig) {
          data.uiConfig = DEFAULT_UI_CONFIG;
        } else {
          // Merge with defaults for any missing properties
          data.uiConfig = {
            ...DEFAULT_UI_CONFIG,
            ...data.uiConfig,
            carouselItemsPerView: {
              ...DEFAULT_UI_CONFIG.carouselItemsPerView,
              ...(data.uiConfig.carouselItemsPerView || {})
            }
          };
        }
        
        setContent(data);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch content'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, isLoading, error };
};


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

export interface FormSection {
  headline: string;
  fields: string[];
  submitText: string;
  submitUrl: string;
}

export interface FooterSection {
  tagline: string;
  socialLinks: {
    [key: string]: string;
  };
}

export interface ContentData {
  hero: HeroSection;
  services: ServiceItem[];
  founder: FounderSection;
  caseStudies: CaseStudyItem[];
  form: FormSection;
  footer: FooterSection;
}

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

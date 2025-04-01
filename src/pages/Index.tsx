
import React, { useEffect } from 'react';
import { useContent } from '@/hooks/useContent';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Founder from '@/components/Founder';
import CaseStudies from '@/components/CaseStudies';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { content, isLoading, error } = useContent();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/50 mesh-bg">
        <div className="text-center bg-glass p-8 rounded-2xl animate-pulse-soft">
          <Loader2 size={48} className="animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg gradient-text font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/50 mesh-bg">
        <div className="text-center max-w-md p-8 bg-glass rounded-2xl shadow-glass">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Content</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            We couldn't load the content for this page. Please try refreshing the page or check your connection.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mesh-bg">
      <div className="fixed inset-0 bg-gradient-radial from-transparent to-background opacity-40 pointer-events-none z-0"></div>
      <div className="relative z-10">
        <Navbar />
        <Hero data={content.hero} />
        <Services data={content.services} />
        <Founder data={content.founder} />
        <CaseStudies data={content.caseStudies} />
        <Testimonials data={content.testimonials} />
        <ContactForm data={content.form} />
        <Footer data={content.footer} />
      </div>
    </div>
  );
};

export default Index;

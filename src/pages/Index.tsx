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
import AffiliateSection from '@/components/AffiliateSection';
import { Loader2 } from 'lucide-react';
import { useAnalytics } from '@/utils/analytics';

const Index = () => {
  const { content, isLoading, error } = useContent();
  
  // Initialize Google Analytics with your specific GA ID
  useAnalytics('G-JQ53W917HT');

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto mb-4 text-skyblue" />
          <p className="text-lg text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Content</h2>
          <p className="text-gray-700 mb-6">
            We couldn't load the content for this page. Please try refreshing the page or check your connection.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-skyblue hover:bg-skyblue/90 text-white px-6 py-3 rounded-md transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero data={content.hero} />
      <Services data={content.services} />
      <Founder data={content.founder} />
      <CaseStudies data={content.caseStudies} />
      <Testimonials data={content.testimonials} />
      {content.affiliates && <AffiliateSection data={content.affiliates} />}
      <ContactForm data={content.form} />
      <Footer data={content.footer} />
    </div>
  );
};

export default Index;

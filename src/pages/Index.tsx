
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
import ParallaxBackground from '@/components/ParallaxBackground';
import { Loader2 } from 'lucide-react';
import { useAnalytics } from '@/utils/analytics';
import { Helmet } from 'react-helmet-async';

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

  const uiConfig = content.uiConfig;
  
  return (
    <ParallaxBackground 
      enabled={uiConfig?.parallaxEnabled ?? true} 
      strength={uiConfig?.parallaxStrength ?? 0.3}
    >
      {content.seo && (
        <Helmet>
          <title>{content.seo.title}</title>
          <meta name="description" content={content.seo.description} />
          <meta name="keywords" content={content.seo.keywords} />
          <meta name="author" content={content.seo.author} />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:title" content={content.seo.title} />
          <meta property="og:description" content={content.seo.description} />
          <meta property="og:image" content="/lovable-uploads/c148eb9a-a8da-4557-8a7a-7001477fa8d0.png" />
          
          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={window.location.href} />
          <meta property="twitter:title" content={content.seo.title} />
          <meta property="twitter:description" content={content.seo.description} />
          <meta property="twitter:image" content="/lovable-uploads/c148eb9a-a8da-4557-8a7a-7001477fa8d0.png" />
          
          {/* Canonical URL */}
          <link rel="canonical" href={window.location.href} />
        </Helmet>
      )}
      <Navbar />
      <Hero data={content.hero} />
      <Services 
        data={content.services} 
        carouselConfig={uiConfig?.carouselItemsPerView}
      />
      <Founder data={content.founder} />
      <CaseStudies data={content.caseStudies} />
      <Testimonials 
        data={content.testimonials} 
        carouselConfig={uiConfig?.carouselItemsPerView}
      />
      {content.affiliates && <AffiliateSection data={content.affiliates} />}
      <ContactForm data={content.form} />
      <Footer data={content.footer} />
    </ParallaxBackground>
  );
};

export default Index;

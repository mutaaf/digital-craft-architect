
import React, { useEffect } from 'react';
import { useContent } from '@/hooks/useContent';
import Navbar from '@/components/Navbar';
import CountdownBanner from '@/components/CountdownBanner';
import Hero from '@/components/Hero';
import MVPPromotion from '@/components/MVPPromotion';
import Services from '@/components/Services';
import PricingTiers from '@/components/PricingTiers';
import Founder from '@/components/Founder';
import CaseStudies from '@/components/CaseStudies';
import { caseStudies } from '@/data/caseStudies';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import AffiliateSection from '@/components/AffiliateSection';
import { CTOHeroSection } from '@/components/CTOCallout';
import ParallaxBackground from '@/components/ParallaxBackground';
import StickyCTA from '@/components/StickyCTA';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import LiveChatBubble from '@/components/LiveChatBubble';
import ReturnVisitorBanner from '@/components/ReturnVisitorBanner';
import SocialProofBar from '@/components/SocialProofBar';
import ScrollProgress from '@/components/ScrollProgress';
import ClassesPromoBanner from '@/components/ClassesPromoBanner';
import ClientLogoMarquee from '@/components/ClientLogoMarquee';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight, Brain } from 'lucide-react';
import { useAnalytics, trackCTAClick, useEngagementTracking } from '@/utils/analytics';
import { getUtmParams } from '@/utils/utmTracker';
import { resolveHeroSubheadline } from '@/utils/heroPersonalization';
import { Helmet } from 'react-helmet-async';
import { ORGANIZATION_SCHEMA } from '@/data/organizationSchema';

const Index = () => {
  const { content, isLoading, error } = useContent();
  
  // Initialize Google Analytics with your specific GA ID
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  // Scroll to top on page load (unless arriving with a hash like #contact)
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  // Once content is hydrated, honor a hash like /#contact that navbar uses
  // when the user clicks Contact from a page that has no #contact section.
  useEffect(() => {
    if (!content) return;
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);
    // Wait a tick so the target section has rendered in the DOM
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(t);
  }, [content]);

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

  // Ticket 0001: swap the hero subheadline to vertical-specific copy when the
  // visitor arrived from a vertical ad (utm_campaign keyword). No match or no
  // UTM leaves the default content.json copy unchanged.
  const heroData = {
    ...content.hero,
    subheadline: resolveHeroSubheadline(getUtmParams(), content.hero.subheadline),
  };

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
          <meta property="og:image" content="/og-default.png" />
          
          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={window.location.href} />
          <meta property="twitter:title" content={content.seo.title} />
          <meta property="twitter:description" content={content.seo.description} />
          <meta property="twitter:image" content="/og-default.png" />
          
          {/* Canonical URL */}
          <link rel="canonical" href={window.location.href} />

          {/* Ticket 0025 - Organization JSON-LD with sameAs + contactPoint.
              Description is wired from content.seo.description at render time
              so a homepage copy edit propagates here in one render. */}
          <script type="application/ld+json">{JSON.stringify({ ...ORGANIZATION_SCHEMA, description: content.seo.description })}</script>
        </Helmet>
      )}
      <Navbar />
      <CountdownBanner />
      <ScrollProgress />
      <Hero data={heroData} />
      <ClientLogoMarquee />
      <ReturnVisitorBanner />
      <ClassesPromoBanner />
      <div className="bg-primary/5 dark:bg-primary/10 py-3">
        <div className="container mx-auto px-4 text-center">
          <Link
            to="/quiz"
            onClick={() => trackCTAClick('quiz_cta', 'hero_banner')}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <Brain size={18} />
            Take the 2-min AI Readiness Quiz
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <SocialProofBar />
      {content.pricingTiers && <PricingTiers data={content.pricingTiers} />}
      {content.mvpPromotion?.enabled && <MVPPromotion data={content.mvpPromotion} />}
      <Services
        data={content.services}
        carouselConfig={uiConfig?.carouselItemsPerView}
      />
      <CTOHeroSection />
      <Founder data={content.founder} />
      <CaseStudies data={content.caseStudies} />
      {/* Deep-dive case study links */}
      <section className="bg-gray-50 dark:bg-gray-900 pb-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-6">
            Read the full stories
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {caseStudies.map((study) => (
              <Link
                key={study.slug}
                to={`/case-studies/${study.slug}`}
                onClick={() => trackCTAClick('view_case_study', `case_study_${study.slug}`)}
                className="group flex items-center justify-between gap-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 hover:border-primary hover:shadow-md transition-all"
              >
                <span>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">{study.vertical}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">{study.heroStat.value} {study.heroStat.label}</span>
                </span>
                <ArrowRight size={18} className="text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* CTA after case studies */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Want Results Like These for Your Business?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Tell us about your business and get a free AI automation audit.
          </p>
          <a
            href="#contact"
            onClick={() => trackCTAClick('get_ai_audit', 'after_casestudies')}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-colors"
          >
            Get Your Free AI Audit <ArrowRight size={20} />
          </a>
        </div>
      </section>
      <Testimonials
        data={content.testimonials}
        carouselConfig={uiConfig?.carouselItemsPerView}
      />
      {/* CTA after testimonials */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to See Results Like These?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Book a free discovery call and we'll show you what AI can do for your business.
          </p>
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick('book_a_call', 'after_testimonials')}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-colors"
          >
            Book Your Free Call <ArrowRight size={20} />
          </a>
        </div>
      </section>
      {content.affiliates && <AffiliateSection data={content.affiliates} />}
      <ContactForm data={content.form} />
      <Footer data={content.footer} />
      <StickyCTA />
      <ExitIntentPopup />
      <LiveChatBubble />
    </ParallaxBackground>
  );
};

export default Index;

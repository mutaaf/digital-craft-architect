
import React from 'react';

// Add window.gtag type definition
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

/**
 * Initialize Google Analytics
 * @param id Google Analytics Measurement ID (format: G-XXXXXXXXXX)
 */
export const initGoogleAnalytics = (id: string): void => {
  // Add Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  `;
  
  document.head.appendChild(script1);
  document.head.appendChild(script2);
};

/**
 * Track a page view in Google Analytics
 * @param path Page path
 * @param title Page title
 */
export const trackPageView = (path: string, title: string): void => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }
};

/**
 * Track an event in Google Analytics
 * @param action Event action
 * @param category Event category
 * @param label Event label
 * @param value Event value
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/** Track form submissions (SetupClaw, Contact) */
export const trackFormSubmission = (formName: string, label?: string): void => {
  trackEvent('form_submission', 'conversion', label || formName);
};

/** Track CTA clicks (Book a Call, Calendly) */
export const trackCTAClick = (ctaName: string, location?: string): void => {
  trackEvent('cta_click', 'engagement', location ? `${ctaName} - ${location}` : ctaName);
};

/** Track demo card clicks */
export const trackDemoClick = (demoName: string, vertical: string): void => {
  trackEvent('demo_click', 'engagement', `${vertical} - ${demoName}`);
};

/** Track company URL submission (scrape trigger) */
export const trackCompanyUrlSubmission = (vertical: string): void => {
  trackEvent('company_url_submit', 'conversion', vertical);
};

// Initialize simple page view tracking
export const initPageViewTracking = (): void => {
  // Track initial page load
  trackPageView(window.location.pathname, document.title);
  
  // Track history changes (when using React Router)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(state, title, url) {
    originalPushState.apply(this, [state, title, url]);
    if (url) {
      trackPageView(
        typeof url === 'string' ? url : window.location.pathname,
        document.title
      );
    }
  };
  
  history.replaceState = function(state, title, url) {
    originalReplaceState.apply(this, [state, title, url]);
    if (url) {
      trackPageView(
        typeof url === 'string' ? url : window.location.pathname,
        document.title
      );
    }
  };
  
  // Track on popstate
  window.addEventListener('popstate', () => {
    trackPageView(window.location.pathname, document.title);
  });
};

/** Track scroll depth — fires once at each threshold (25%, 50%, 75%, 100%) */
export const trackScrollDepth = (): (() => void) => {
  const thresholds = [25, 50, 75, 100];
  const fired = new Set<number>();

  const handler = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    const percent = Math.round((window.scrollY / scrollHeight) * 100);

    for (const t of thresholds) {
      if (percent >= t && !fired.has(t)) {
        fired.add(t);
        trackEvent('scroll_depth', 'engagement', `${t}%`);
      }
    }
  };

  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
};

/** Track time on page — fires at 30s, 60s, 120s thresholds */
export const trackTimeOnPage = (): (() => void) => {
  const thresholds = [30, 60, 120];
  const timers: ReturnType<typeof setTimeout>[] = [];

  for (const seconds of thresholds) {
    timers.push(
      setTimeout(() => {
        trackEvent('time_on_page', 'engagement', `${seconds}s`);
      }, seconds * 1000)
    );
  }

  return () => timers.forEach(clearTimeout);
};

/** Track when a section enters the viewport via IntersectionObserver */
export const trackSectionView = (sectionId: string): (() => void) => {
  const el = document.getElementById(sectionId);
  if (!el) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          trackEvent('section_view', 'engagement', sectionId);
          observer.disconnect();
        }
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(el);
  return () => observer.disconnect();
};

/** Initialize enhanced engagement tracking (scroll depth + time on page) */
export const useEngagementTracking = () => {
  React.useEffect(() => {
    const cleanupScroll = trackScrollDepth();
    const cleanupTime = trackTimeOnPage();
    return () => {
      cleanupScroll();
      cleanupTime();
    };
  }, []);
};

// A simple analytics hook that can be called to initialize analytics
export const useAnalytics = (googleAnalyticsId?: string) => {
  React.useEffect(() => {
    if (googleAnalyticsId) {
      initGoogleAnalytics(googleAnalyticsId);
      initPageViewTracking();
    }
  }, [googleAnalyticsId]);
  
  return {
    trackEvent,
    trackPageView
  };
};

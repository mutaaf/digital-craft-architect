
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

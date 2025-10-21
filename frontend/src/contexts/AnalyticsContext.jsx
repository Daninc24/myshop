import React, { createContext, useContext, useEffect, useState } from 'react';
import { safeCreateContext } from '../utils/reactContextFix.js';
import { 
  trackEvent, 
  trackPurchase, 
  trackAddToCart, 
  trackRemoveFromCart, 
  trackViewItem, 
  trackViewItemList, 
  trackBeginCheckout, 
  trackAddToWishlist, 
  trackSearch, 
  trackSignUp, 
  trackLogin,
  trackCustomEvent,
  trackPerformance,
  trackError,
  setUserProperties,
  trackEnhancedEcommerce,
  trackConversion,
  trackSocialShare,
  trackVideoPlay,
  trackVideoComplete,
  trackFormSubmit,
  trackFormStart,
  trackScroll,
  trackTimeOnPage
} from '../components/GoogleAnalytics';

const AnalyticsContext = safeCreateContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [userProperties, setUserPropertiesState] = useState({});
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());

  // Initialize analytics on mount
  useEffect(() => {
    if (analyticsEnabled) {
      // Track session start
      trackEvent('session_start', {
        timestamp: sessionStartTime,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language
      });

      // Set up performance monitoring
      if ('performance' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              trackPerformance('page_load_time', entry.loadEventEnd - entry.loadEventStart);
            }
          }
        });
        observer.observe({ entryTypes: ['navigation'] });
      }

      // Set up scroll tracking
      let scrollTimeout;
      const handleScroll = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const scrollPercentage = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
          );
          trackScroll(scrollPercentage);
        }, 100);
      };

      window.addEventListener('scroll', handleScroll);

      // Set up time on page tracking
      const trackTimeOnPageInterval = setInterval(() => {
        const timeOnPage = Math.round((Date.now() - sessionStartTime) / 1000);
        trackTimeOnPage(timeOnPage);
      }, 30000); // Track every 30 seconds

      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearInterval(trackTimeOnPageInterval);
      };
    }
  }, [analyticsEnabled, sessionStartTime]);

  // Enhanced e-commerce tracking
  const trackEcommerce = {
    // Product impressions
    impression: (product, listName, position) => {
      if (analyticsEnabled) {
        trackEnhancedEcommerce.impression(product, listName, position);
      }
    },

    // Product clicks
    click: (product, listName, position) => {
      if (analyticsEnabled) {
        trackEnhancedEcommerce.click(product, listName, position);
      }
    },

    // Add to cart
    addToCart: (product, quantity = 1, listName = null) => {
      if (analyticsEnabled) {
        trackEnhancedEcommerce.addToCart(product, quantity, listName);
      }
    },

    // Remove from cart
    removeFromCart: (product, quantity = 1) => {
      if (analyticsEnabled) {
        trackEnhancedEcommerce.removeFromCart(product, quantity);
      }
    },

    // Checkout steps
    checkout: (step, products, value) => {
      if (analyticsEnabled) {
        trackEnhancedEcommerce.checkout(step, products, value);
      }
    },

    // Purchase
    purchase: (transactionId, products, value, tax = 0, shipping = 0) => {
      if (analyticsEnabled) {
        trackEnhancedEcommerce.purchase(transactionId, products, value, tax, shipping);
      }
    }
  };

  // User engagement tracking
  const trackEngagement = {
    // Search
    search: (searchTerm, resultsCount = 0) => {
      if (analyticsEnabled) {
        trackSearch(searchTerm, resultsCount);
      }
    },

    // Authentication
    signUp: (method = 'email') => {
      if (analyticsEnabled) {
        trackSignUp(method);
      }
    },

    login: (method = 'email') => {
      if (analyticsEnabled) {
        trackLogin(method);
      }
    },

    // Social sharing
    socialShare: (platform, content, url) => {
      if (analyticsEnabled) {
        trackSocialShare(platform, content, url);
      }
    },

    // Video interactions
    videoPlay: (videoTitle, videoId) => {
      if (analyticsEnabled) {
        trackVideoPlay(videoTitle, videoId);
      }
    },

    videoComplete: (videoTitle, videoId) => {
      if (analyticsEnabled) {
        trackVideoComplete(videoTitle, videoId);
      }
    },

    // Form interactions
    formStart: (formName, formId) => {
      if (analyticsEnabled) {
        trackFormStart(formName, formId);
      }
    },

    formSubmit: (formName, formId) => {
      if (analyticsEnabled) {
        trackFormSubmit(formName, formId);
      }
    }
  };

  // Error tracking
  const trackErrorEvent = (error, errorSource = 'javascript') => {
    if (analyticsEnabled) {
      trackError(error, errorSource);
    }
  };

  // Custom event tracking
  const trackCustomEventWithContext = (eventName, parameters = {}) => {
    if (analyticsEnabled) {
      trackCustomEvent(eventName, {
        ...parameters,
        user_properties: userProperties,
        session_duration: Math.round((Date.now() - sessionStartTime) / 1000)
      });
    }
  };

  // User properties management
  const updateUserProperties = (properties) => {
    const newProperties = { ...userProperties, ...properties };
    setUserPropertiesState(newProperties);
    if (analyticsEnabled) {
      setUserProperties(newProperties);
    }
  };

  // Conversion tracking
  const trackConversionEvent = (conversionId, conversionLabel, value = 0) => {
    if (analyticsEnabled) {
      trackConversion(conversionId, conversionLabel, value);
    }
  };

  // Performance tracking
  const trackPerformanceMetric = (metric, value) => {
    if (analyticsEnabled) {
      trackPerformance(metric, value);
    }
  };

  // Analytics control
  const toggleAnalytics = (enabled) => {
    setAnalyticsEnabled(enabled);
    if (enabled) {
      trackEvent('analytics_enabled', { timestamp: Date.now() });
    } else {
      trackEvent('analytics_disabled', { timestamp: Date.now() });
    }
  };

  const value = {
    analyticsEnabled,
    userProperties,
    trackEcommerce,
    trackEngagement,
    trackErrorEvent,
    trackCustomEventWithContext,
    updateUserProperties,
    trackConversionEvent,
    trackPerformanceMetric,
    toggleAnalytics
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

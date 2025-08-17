import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 Configuration
const GA_TRACKING_ID = process.env.VITE_GA_ID || 'G-XXXXXXXXXX';

// Initialize Google Analytics
const initializeGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    return;
  }

  // Load Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true
  });
};

// Enhanced Google Analytics Component
const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA on component mount
    initializeGA();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    if (window.gtag) {
      window.gtag('config', GA_TRACKING_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return null; // This component doesn't render anything
};

// Analytics utility functions
export const trackEvent = (eventName, parameters = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: Date.now()
    });
  }
};

// E-commerce tracking functions
export const trackPurchase = (transactionId, value, currency = 'KES', items = []) => {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }
};

export const trackAddToCart = (item) => {
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'KES',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: 1
      }]
    });
  }
};

export const trackRemoveFromCart = (item) => {
  if (window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'KES',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: 1
      }]
    });
  }
};

export const trackViewItem = (item) => {
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'KES',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price
      }]
    });
  }
};

export const trackViewItemList = (items, listName) => {
  if (window.gtag) {
    window.gtag('event', 'view_item_list', {
      item_list_name: listName,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price
      }))
    });
  }
};

export const trackBeginCheckout = (items, value) => {
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'KES',
      value: value,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }
};

export const trackAddToWishlist = (item) => {
  if (window.gtag) {
    window.gtag('event', 'add_to_wishlist', {
      currency: 'KES',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price
      }]
    });
  }
};

// User engagement tracking
export const trackSearch = (searchTerm, resultsCount = 0) => {
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }
};

export const trackSignUp = (method = 'email') => {
  if (window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method
    });
  }
};

export const trackLogin = (method = 'email') => {
  if (window.gtag) {
    window.gtag('event', 'login', {
      method: method
    });
  }
};

// Custom event tracking
export const trackCustomEvent = (eventName, parameters = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, {
      custom_parameters: parameters,
      timestamp: Date.now()
    });
  }
};

// Performance tracking
export const trackPerformance = (metric, value) => {
  if (window.gtag) {
    window.gtag('event', 'performance', {
      metric_name: metric,
      metric_value: value,
      page_location: window.location.href
    });
  }
};

// Error tracking
export const trackError = (error, errorSource = 'javascript') => {
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message || error,
      fatal: false,
      error_source: errorSource,
      page_location: window.location.href
    });
  }
};

// User properties
export const setUserProperties = (properties) => {
  if (window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      custom_map: properties
    });
  }
};

// Enhanced e-commerce tracking
export const trackEnhancedEcommerce = {
  // Product impressions
  impression: (product, listName, position) => {
    if (window.gtag) {
      window.gtag('event', 'view_item_list', {
        item_list_name: listName,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          index: position
        }]
      });
    }
  },

  // Product clicks
  click: (product, listName, position) => {
    if (window.gtag) {
      window.gtag('event', 'select_item', {
        item_list_name: listName,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          index: position
        }]
      });
    }
  },

  // Add to cart with enhanced data
  addToCart: (product, quantity = 1, listName = null) => {
    if (window.gtag) {
      const eventData = {
        currency: 'KES',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: quantity
        }]
      };

      if (listName) {
        eventData.item_list_name = listName;
      }

      window.gtag('event', 'add_to_cart', eventData);
    }
  },

  // Remove from cart with enhanced data
  removeFromCart: (product, quantity = 1) => {
    if (window.gtag) {
      window.gtag('event', 'remove_from_cart', {
        currency: 'KES',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: quantity
        }]
      });
    }
  },

  // Checkout steps
  checkout: (step, products, value) => {
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        checkout_step: step,
        currency: 'KES',
        value: value,
        items: products.map(product => ({
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: product.quantity
        }))
      });
    }
  },

  // Purchase with enhanced data
  purchase: (transactionId, products, value, tax = 0, shipping = 0) => {
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        tax: tax,
        shipping: shipping,
        currency: 'KES',
        items: products.map(product => ({
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: product.quantity
        }))
      });
    }
  }
};

// Conversion tracking
export const trackConversion = (conversionId, conversionLabel, value = 0) => {
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `AW-${conversionId}/${conversionLabel}`,
      value: value,
      currency: 'KES'
    });
  }
};

// Social media tracking
export const trackSocialShare = (platform, content, url) => {
  if (window.gtag) {
    window.gtag('event', 'share', {
      method: platform,
      content_type: content,
      item_id: url
    });
  }
};

// Video tracking
export const trackVideoPlay = (videoTitle, videoId) => {
  if (window.gtag) {
    window.gtag('event', 'video_start', {
      video_title: videoTitle,
      video_id: videoId
    });
  }
};

export const trackVideoComplete = (videoTitle, videoId) => {
  if (window.gtag) {
    window.gtag('event', 'video_complete', {
      video_title: videoTitle,
      video_id: videoId
    });
  }
};

// Form tracking
export const trackFormSubmit = (formName, formId) => {
  if (window.gtag) {
    window.gtag('event', 'form_submit', {
      form_name: formName,
      form_id: formId
    });
  }
};

export const trackFormStart = (formName, formId) => {
  if (window.gtag) {
    window.gtag('event', 'form_start', {
      form_name: formName,
      form_id: formId
    });
  }
};

// Scroll tracking
export const trackScroll = (percentage) => {
  if (window.gtag) {
    window.gtag('event', 'scroll', {
      scroll_percentage: percentage,
      page_location: window.location.href
    });
  }
};

// Time on page tracking
export const trackTimeOnPage = (seconds) => {
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: 'page_view',
      value: seconds * 1000, // Convert to milliseconds
      page_location: window.location.href
    });
  }
};

export default GoogleAnalytics;

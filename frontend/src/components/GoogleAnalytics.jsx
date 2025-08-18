import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 Configuration
const GA_TRACKING_ID = import.meta.env.VITE_GA_ID || 'G-XXXXXXXXXX';

// Initialize Google Analytics
const initializeGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    return;
  }

  // Don't initialize if tracking ID is not set or is the default placeholder
  if (!GA_TRACKING_ID || GA_TRACKING_ID === 'G-XXXXXXXXXX') {
    console.warn('Google Analytics tracking ID not configured. Analytics will be disabled.');
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

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA on component mount
    initializeGA();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    if (window.gtag && GA_TRACKING_ID && GA_TRACKING_ID !== 'G-XXXXXXXXXX') {
      window.gtag('config', GA_TRACKING_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search,
        custom_map: {
          'custom_parameter_1': 'user_type',
          'custom_parameter_2': 'product_category',
          'custom_parameter_3': 'search_term'
        }
      });

      // Enhanced ecommerce tracking
      window.gtag('config', GA_TRACKING_ID, {
        send_page_view: false,
        custom_map: {
          'custom_parameter_1': 'user_type',
          'custom_parameter_2': 'product_category',
          'custom_parameter_3': 'search_term'
        }
      });

      // Track user engagement
      const trackUserEngagement = () => {
        window.gtag('event', 'user_engagement', {
          engagement_time_msec: 1000,
          session_id: Date.now()
        });
      };

      // Track scroll depth
      let maxScroll = 0;
      const trackScrollDepth = () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
          if (maxScroll >= 25 && maxScroll % 25 === 0) {
            window.gtag('event', 'scroll_depth', {
              scroll_percentage: maxScroll,
              page_location: window.location.href
            });
          }
        }
      };

      // Track time on page
      let startTime = Date.now();
      const trackTimeOnPage = () => {
        const timeOnPage = Date.now() - startTime;
        if (timeOnPage >= 30000) { // Track after 30 seconds
          window.gtag('event', 'time_on_page', {
            time_on_page: timeOnPage,
            page_location: window.location.href
          });
        }
      };

      // Add event listeners
      window.addEventListener('scroll', trackScrollDepth);
      window.addEventListener('beforeunload', trackTimeOnPage);
      window.addEventListener('visibilitychange', trackUserEngagement);

      // Track search queries
      const urlParams = new URLSearchParams(location.search);
      const searchQuery = urlParams.get('search');
      if (searchQuery) {
        window.gtag('event', 'search', {
          search_term: searchQuery,
          page_location: window.location.href
        });
      }

      // Track product views
      if (location.pathname.includes('/product/')) {
        const productId = location.pathname.split('/').pop();
        window.gtag('event', 'view_item', {
          currency: 'KES',
          value: 0, // Will be updated with actual product price
          items: [{
            item_id: productId,
            item_name: document.title,
            currency: 'KES',
            quantity: 1
          }]
        });
      }

      // Track category views
      if (location.pathname === '/products') {
        const category = urlParams.get('category');
        if (category) {
          window.gtag('event', 'view_item_list', {
            item_list_name: category,
            items: [{
              item_list_name: category,
              currency: 'KES'
            }]
          });
        }
      }

      // Cleanup
      return () => {
        window.removeEventListener('scroll', trackScrollDepth);
        window.removeEventListener('beforeunload', trackTimeOnPage);
        window.removeEventListener('visibilitychange', trackUserEngagement);
      };
    }
  }, [location]);

  // Enhanced conversion tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Track add to cart events
      const trackAddToCart = (event) => {
        const productData = event.detail;
        window.gtag('event', 'add_to_cart', {
          currency: 'KES',
          value: productData.price,
          items: [{
            item_id: productData.id,
            item_name: productData.name,
            currency: 'KES',
            price: productData.price,
            quantity: productData.quantity || 1
          }]
        });
      };

      // Track purchase events
      const trackPurchase = (event) => {
        const orderData = event.detail;
        window.gtag('event', 'purchase', {
          transaction_id: orderData.id,
          value: orderData.total,
          currency: 'KES',
          tax: orderData.tax || 0,
          shipping: orderData.shipping || 0,
          items: orderData.items.map(item => ({
            item_id: item.id,
            item_name: item.name,
            currency: 'KES',
            price: item.price,
            quantity: item.quantity
          }))
        });
      };

      // Track wishlist events
      const trackWishlist = (event) => {
        const productData = event.detail;
        window.gtag('event', 'add_to_wishlist', {
          currency: 'KES',
          value: productData.price,
          items: [{
            item_id: productData.id,
            item_name: productData.name,
            currency: 'KES',
            price: productData.price,
            quantity: 1
          }]
        });
      };

      // Track search events
      const trackSearch = (event) => {
        const searchData = event.detail;
        window.gtag('event', 'search', {
          search_term: searchData.query,
          page_location: window.location.href
        });
      };

      // Add custom event listeners
          window.addEventListener('myshop:add_to_cart', trackAddToCart);
    window.addEventListener('myshop:purchase', trackPurchase);
    window.addEventListener('myshop:add_to_wishlist', trackWishlist);
    window.addEventListener('myshop:search', trackSearch);

      // Cleanup
      return () => {
              window.removeEventListener('myshop:add_to_cart', trackAddToCart);
      window.removeEventListener('myshop:purchase', trackPurchase);
      window.removeEventListener('myshop:add_to_wishlist', trackWishlist);
      window.removeEventListener('myshop:search', trackSearch);
      };
    }
  }, []);

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

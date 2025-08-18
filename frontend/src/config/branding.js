// Dynamic Branding Configuration
export const BRAND_CONFIG = {
  // Brand Identity
  name: 'MyShop',
  tagline: 'Your Premium Shopping Destination',
  description: 'Discover amazing products with confidence',
  
  // Contact Information
  email: 'info@myshop.com',
  phone: '+1234567890',
  whatsapp: '+1234567890',
  
  // Social Media
  social: {
    facebook: 'https://facebook.com/myshop',
    twitter: 'https://twitter.com/myshop',
    instagram: 'https://instagram.com/myshop',
    linkedin: 'https://linkedin.com/company/myshop'
  },
  
  // Website URLs
  website: {
    base: 'https://myshop.com',
    logo: 'https://myshop.com/logo.png',
    favicon: 'https://myshop.com/favicon.ico'
  },
  
  // SEO Defaults
  seo: {
    defaultTitle: 'MyShop - Your Premium Shopping Destination',
    defaultDescription: 'Discover premium products, exclusive deals, and excellent shopping experience at MyShop. Fast delivery, secure payments, and exceptional customer service.',
    defaultKeywords: 'online shopping, premium products, exclusive deals, fast delivery, secure payments, ecommerce, myshop',
    defaultImage: 'https://myshop.com/logo.png',
    defaultUrl: 'https://myshop.com'
  },
  
  // Colors (matching Tailwind config)
  colors: {
    primary: '#ff6600',
    secondary: '#3b82f6',
    accent: '#a855f7',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  },
  
  // Features
  features: {
    freeShipping: true,
    securePayments: true,
    easyReturns: true,
    flexiblePayment: true,
    sameDayDelivery: true,
    customerSupport: '24/7'
  },
  
  // Business Info
  business: {
    founded: '2024',
    location: 'Your Location',
    currency: 'USD',
    timezone: 'UTC',
    languages: ['English']
  },
  
  // Performance Targets
  performance: {
    targetLoadTime: 2000, // 2 seconds
    targetLighthouseScore: 90,
    targetCoreWebVitals: {
      fcp: 1500, // First Contentful Paint
      lcp: 2500, // Largest Contentful Paint
      cls: 0.1,  // Cumulative Layout Shift
      fid: 100   // First Input Delay
    }
  }
};

// Helper functions for dynamic branding
export const getBrandName = () => BRAND_CONFIG.name;
export const getBrandTagline = () => BRAND_CONFIG.tagline;
export const getBrandDescription = () => BRAND_CONFIG.description;
export const getBrandEmail = () => BRAND_CONFIG.email;
export const getBrandPhone = () => BRAND_CONFIG.phone;
export const getBrandWebsite = () => BRAND_CONFIG.website.base;
export const getBrandLogo = () => BRAND_CONFIG.website.logo;

// SEO helper functions
export const getSEOTitle = (pageTitle = '') => {
  return pageTitle ? `${pageTitle} - ${BRAND_CONFIG.name}` : BRAND_CONFIG.seo.defaultTitle;
};

export const getSEODescription = (description = '') => {
  return description || BRAND_CONFIG.seo.defaultDescription;
};

export const getSEOKeywords = (keywords = '') => {
  return keywords ? `${keywords}, ${BRAND_CONFIG.seo.defaultKeywords}` : BRAND_CONFIG.seo.defaultKeywords;
};

export const getSEOImage = (image = '') => {
  return image || BRAND_CONFIG.seo.defaultImage;
};

export const getSEOUrl = (path = '') => {
  return `${BRAND_CONFIG.website.base}${path}`;
};

// Social media helper functions
export const getSocialLinks = () => BRAND_CONFIG.social;
export const getFacebookLink = () => BRAND_CONFIG.social.facebook;
export const getTwitterLink = () => BRAND_CONFIG.social.twitter;
export const getInstagramLink = () => BRAND_CONFIG.social.instagram;

// Contact helper functions
export const getContactInfo = () => ({
  email: BRAND_CONFIG.email,
  phone: BRAND_CONFIG.phone,
  whatsapp: BRAND_CONFIG.whatsapp
});

// Feature helper functions
export const getFeatures = () => BRAND_CONFIG.features;
export const hasFeature = (feature) => BRAND_CONFIG.features[feature] || false;

// Performance helper functions
export const getPerformanceTargets = () => BRAND_CONFIG.performance;
export const getCoreWebVitalsTargets = () => BRAND_CONFIG.performance.targetCoreWebVitals;

export default BRAND_CONFIG;

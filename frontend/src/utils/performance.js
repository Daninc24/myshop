// Performance optimization utilities

// Debounce function for search and other frequent operations
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll and resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading utility for images
export const lazyLoadImage = (img) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = image.dataset.src;
        image.classList.remove('lazy');
        imageObserver.unobserve(image);
      }
    });
  });
  
  if (img) {
    imageObserver.observe(img);
  }
};

// Preload critical resources
export const preloadResource = (href, as = 'fetch') => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Cache management for API responses
export class CacheManager {
  constructor(maxSize = 50, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Create global cache instance
export const apiCache = new CacheManager();

// Optimize bundle loading
export const loadChunk = async (chunkName) => {
  try {
    const module = await import(/* webpackChunkName: "[request]" */ `../components/${chunkName}.jsx`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load chunk: ${chunkName}`, error);
    return null;
  }
};

// Memory usage monitoring (development only)
export const monitorMemory = () => {
  if (process.env.NODE_ENV === 'development' && typeof performance !== 'undefined' && 'memory' in performance) {
    try {
      const memInfo = performance.memory;
      console.log('Memory Usage:', {
        used: Math.round(memInfo.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memInfo.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + ' MB'
      });
    } catch (error) {
      console.log('Memory monitoring not available');
    }
  }
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Critical CSS inlining helper
export const inlineCriticalCSS = (css) => {
  if (typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

// Resource hints for better loading
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;
  
  // DNS prefetch for external domains
  const domains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'maps.googleapis.com'
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
  
  // Preconnect to API
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    // Extract base URL without /api path
    preconnect.href = apiUrl.replace('/api', '');
  }
  document.head.appendChild(preconnect);
};
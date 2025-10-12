// Performance Optimization Utilities

class PerformanceOptimizer {
  constructor() {
    this.loadTimes = new Map();
    this.apiCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Measure component load time
  startTimer(componentName) {
    this.loadTimes.set(componentName, performance.now());
  }

  endTimer(componentName) {
    const startTime = this.loadTimes.get(componentName);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      console.log(`⚡ ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      this.loadTimes.delete(componentName);
      return loadTime;
    }
  }

  // API Response Caching
  getCachedResponse(url) {
    const cached = this.apiCache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`📦 Using cached response for ${url}`);
      return cached.data;
    }
    return null;
  }

  setCachedResponse(url, data) {
    this.apiCache.set(url, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();
    for (const [url, cached] of this.apiCache.entries()) {
      if (now - cached.timestamp >= this.cacheTimeout) {
        this.apiCache.delete(url);
      }
    }
  }

  // Debounce function for search and other frequent operations
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for scroll and resize events
  throttle(func, limit) {
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
  }

  // Lazy load images
  lazyLoadImage(img) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.classList.remove('lazy');
          observer.unobserve(image);
        }
      });
    });

    imageObserver.observe(img);
  }

  // Preload critical resources
  preloadResource(url, type = 'fetch') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    if (type === 'image') {
      link.as = 'image';
    } else if (type === 'script') {
      link.as = 'script';
    } else {
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  }

  // Monitor Core Web Vitals
  measureWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('🎯 LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        console.log('⚡ FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          console.log('📐 CLS:', clsValue);
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Bundle size analyzer
  analyzeBundleSize() {
    if (import.meta.env.DEV) {
      console.log('📊 Bundle Analysis:');
      console.log('- React:', React.version);
      console.log('- Environment:', import.meta.env.MODE);
      
      // Estimate bundle size based on loaded modules
      const scripts = document.querySelectorAll('script[src]');
      let totalSize = 0;
      
      scripts.forEach(script => {
        fetch(script.src, { method: 'HEAD' })
          .then(response => {
            const size = response.headers.get('content-length');
            if (size) {
              totalSize += parseInt(size);
              console.log(`📦 ${script.src.split('/').pop()}: ${(size / 1024).toFixed(2)}KB`);
            }
          })
          .catch(() => {}); // Ignore CORS errors
      });
    }
  }

  // Memory usage monitoring
  monitorMemoryUsage() {
    if (performance.memory) {
      const memory = performance.memory;
      console.log('🧠 Memory Usage:');
      console.log(`- Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB`);
      console.log(`- Total: ${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`);
      console.log(`- Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`);
    }
  }

  // Network quality detection
  detectNetworkQuality() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      console.log('🌐 Network Info:');
      console.log(`- Type: ${connection.effectiveType}`);
      console.log(`- Downlink: ${connection.downlink}Mbps`);
      console.log(`- RTT: ${connection.rtt}ms`);
      
      return {
        type: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }
    return null;
  }

  // Initialize all performance monitoring
  init() {
    console.log('🚀 Performance Optimizer initialized');
    
    if (import.meta.env.DEV) {
      this.measureWebVitals();
      this.analyzeBundleSize();
      this.monitorMemoryUsage();
      this.detectNetworkQuality();
      
      // Clear expired cache every 5 minutes
      setInterval(() => {
        this.clearExpiredCache();
      }, 5 * 60 * 1000);
    }
  }
}

export const performanceOptimizer = new PerformanceOptimizer();
export default PerformanceOptimizer;
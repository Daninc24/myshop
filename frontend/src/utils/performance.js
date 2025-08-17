// World-Class Performance Monitoring Utility
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.isInitialized = false;
    this.coreWebVitals = {};
    this.customMetrics = {};
    this.performanceHistory = [];
    this.maxHistorySize = 100;
  }

  // Initialize performance monitoring
  init() {
    if (this.isInitialized) return;
    
    this.setupCoreWebVitals();
    this.setupCustomMetrics();
    this.setupPerformanceObserver();
    this.setupNetworkMonitoring();
    this.setupErrorTracking();
    
    this.isInitialized = true;
    console.log('Performance Monitor: Initialized');
  }

  // Setup Core Web Vitals monitoring
  setupCoreWebVitals() {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.coreWebVitals.lcp = lastEntry.startTime;
        this.recordMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP monitoring not supported:', error);
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fid = entry.processingStart - entry.startTime;
          this.coreWebVitals.fid = fid;
          this.recordMetric('fid', fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID monitoring not supported:', error);
    }

    // Cumulative Layout Shift (CLS)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.coreWebVitals.cls = clsValue;
        this.recordMetric('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS monitoring not supported:', error);
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[entries.length - 1].startTime;
        this.coreWebVitals.fcp = fcp;
        this.recordMetric('fcp', fcp);
      });
      fcpObserver.observe({ entryTypes: ['first-contentful-paint'] });
    } catch (error) {
      console.warn('FCP monitoring not supported:', error);
    }
  }

  // Setup custom performance metrics
  setupCustomMetrics() {
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const memoryUsage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        this.recordMetric('memory_usage', memoryUsage);
      }, 10000); // Every 10 seconds
    }

    // Monitor network information
    if ('connection' in navigator) {
      const connection = navigator.connection;
      this.recordMetric('network_type', connection.effectiveType || 'unknown');
      this.recordMetric('network_rtt', connection.rtt || 0);
      this.recordMetric('network_downlink', connection.downlink || 0);
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.recordMetric('first_byte', navigation.responseStart - navigation.requestStart);
      }
    });
  }

  // Setup Performance Observer for custom metrics
  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'measure') {
            this.recordMetric(entry.name, entry.duration);
          }
        });
      });
      observer.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  // Setup network monitoring
  setupNetworkMonitoring() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        this.recordMetric(`api_${this.getEndpointName(url)}`, duration);
        
        if (duration > 1000) {
          this.recordSlowRequest(url, duration);
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.recordMetric(`api_error_${this.getEndpointName(url)}`, duration);
        this.recordError('fetch_error', { url, error: error.message, duration });
        throw error;
      }
    };

    // Monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url) {
      this._startTime = performance.now();
      this._url = url;
      return originalXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function() {
      const xhr = this;
      const originalOnReadyStateChange = xhr.onreadystatechange;
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          const duration = performance.now() - xhr._startTime;
          const endpointName = performanceMonitor.getEndpointName(xhr._url);
          
          performanceMonitor.recordMetric(`xhr_${endpointName}`, duration);
          
          if (duration > 1000) {
            performanceMonitor.recordSlowRequest(xhr._url, duration);
          }
        }
        
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.apply(xhr, arguments);
        }
      };
      
      return originalXHRSend.apply(this, arguments);
    };
  }

  // Setup error tracking
  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.recordError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('unhandled_promise_rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  // Record a performance metric
  recordMetric(name, value) {
    const timestamp = Date.now();
    const metric = {
      name,
      value,
      timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.metrics.set(name, metric);
    this.performanceHistory.push(metric);

    // Keep history size manageable
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory = this.performanceHistory.slice(-this.maxHistorySize);
    }

    // Send to analytics if configured
    this.sendToAnalytics(metric);
  }

  // Record slow requests
  recordSlowRequest(url, duration) {
    this.recordError('slow_request', {
      url,
      duration,
      threshold: 1000
    });
  }

  // Record errors
  recordError(type, data) {
    const error = {
      type,
      data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.warn('Performance Monitor - Error:', error);
    
    // Send to analytics
    this.sendToAnalytics(error);
  }

  // Start timing an operation
  startTimer(name) {
    const startTime = performance.now();
    this.metrics.set(`${name}_start`, { startTime, name });
    
    return () => {
      const endTime = performance.now();
      const startMetric = this.metrics.get(`${name}_start`);
      if (startMetric) {
        const duration = endTime - startMetric.startTime;
        this.recordMetric(name, duration);
        this.metrics.delete(`${name}_start`);
      }
    };
  }

  // Measure a function execution time
  async measureFunction(name, fn) {
    const endTimer = this.startTimer(name);
    try {
      const result = await fn();
      endTimer();
      return result;
    } catch (error) {
      endTimer();
      this.recordError('function_error', { name, error: error.message });
      throw error;
    }
  }

  // Get performance summary
  getSummary() {
    const summary = {
      coreWebVitals: this.coreWebVitals,
      customMetrics: {},
      errors: [],
      slowRequests: []
    };

    // Calculate averages for custom metrics
    const metricGroups = {};
    this.performanceHistory.forEach(metric => {
      if (!metricGroups[metric.name]) {
        metricGroups[metric.name] = [];
      }
      metricGroups[metric.name].push(metric.value);
    });

    Object.keys(metricGroups).forEach(name => {
      const values = metricGroups[name];
      summary.customMetrics[name] = {
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    });

    return summary;
  }

  // Get Core Web Vitals grades
  getCoreWebVitalsGrades() {
    const grades = {};
    
    if (this.coreWebVitals.lcp) {
      grades.lcp = this.getGrade(this.coreWebVitals.lcp, { good: 2500, poor: 4000 });
    }
    
    if (this.coreWebVitals.fid) {
      grades.fid = this.getGrade(this.coreWebVitals.fid, { good: 100, poor: 300 });
    }
    
    if (this.coreWebVitals.cls) {
      grades.cls = this.getGrade(this.coreWebVitals.cls, { good: 0.1, poor: 0.25 });
    }
    
    if (this.coreWebVitals.fcp) {
      grades.fcp = this.getGrade(this.coreWebVitals.fcp, { good: 1800, poor: 3000 });
    }

    return grades;
  }

  // Get grade for a metric
  getGrade(value, thresholds) {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  // Send metrics to analytics
  sendToAnalytics(data) {
    // Send to your analytics service
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: data.name,
        metric_value: data.value,
        page_location: data.url
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(error => {
        console.warn('Failed to send performance data:', error);
      });
    }
  }

  // Get endpoint name from URL
  getEndpointName(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.replace(/\//g, '_').replace(/^_|_$/g, '') || 'root';
    } catch {
      return 'unknown';
    }
  }

  // Clear all metrics
  clear() {
    this.metrics.clear();
    this.performanceHistory = [];
    this.coreWebVitals = {};
  }

  // Export performance data
  exportData() {
    return {
      summary: this.getSummary(),
      grades: this.getCoreWebVitalsGrades(),
      history: this.performanceHistory,
      timestamp: Date.now()
    };
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component performance
export const usePerformanceMonitor = (componentName) => {
  const startRender = () => {
    performanceMonitor.startTimer(`render_${componentName}`);
  };

  const endRender = () => {
    const endTimer = performanceMonitor.startTimer(`render_${componentName}`);
    endTimer();
  };

  return { startRender, endRender };
};

// Higher-order component for performance monitoring
export const withPerformanceMonitor = (WrappedComponent, componentName) => {
  return function PerformanceMonitoredComponent(props) {
    const { startRender, endRender } = usePerformanceMonitor(componentName);
    
    startRender();
    
    React.useEffect(() => {
      endRender();
    });

    return <WrappedComponent {...props} />;
  };
};

// Utility functions
export const measureApiCall = async (name, apiCall) => {
  return performanceMonitor.measureFunction(`api_${name}`, apiCall);
};

export const measureRender = (name, renderFunction) => {
  return performanceMonitor.measureFunction(`render_${name}`, renderFunction);
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}

export default performanceMonitor;


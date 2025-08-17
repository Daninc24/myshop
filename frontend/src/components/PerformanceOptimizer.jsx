import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PerformanceOptimizer = ({ 
  children, 
  threshold = 0.1, 
  rootMargin = '50px',
  preload = false,
  priority = 'normal',
  onLoad,
  onError 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadTime, setLoadTime] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const ref = useRef(null);
  const loadStartTime = useRef(null);

  // Performance monitoring
  const measurePerformance = useCallback(() => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      const metrics = {
        pageLoadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        timestamp: Date.now()
      };

      setPerformanceMetrics(metrics);
      
      // Track Core Web Vitals
      if ('web-vital' in window) {
        // This would require the web-vitals library
        console.log('Core Web Vitals available');
      }
    }
  }, []);

  // Resource hints for preloading
  useEffect(() => {
    if (preload && priority === 'high') {
      // Add resource hints for critical resources
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = '/critical-image.jpg';
      document.head.appendChild(link);
    }
  }, [preload, priority]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          loadStartTime.current = performance.now();
          
          // Measure load time
          setTimeout(() => {
            const endTime = performance.now();
            const loadDuration = endTime - (loadStartTime.current || endTime);
            setLoadTime(loadDuration);
            
            if (onLoad) {
              onLoad(loadDuration);
            }
            
            // Measure performance after load
            measurePerformance();
          }, 100);
          
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, hasLoaded, onLoad, measurePerformance]);

  // Error boundary for performance monitoring
  useEffect(() => {
    const handleError = (event) => {
      console.error('Performance error:', event.error);
      if (onError) {
        onError(event.error);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  // Show skeleton while not visible
  if (!isVisible) {
    return (
      <div ref={ref} className="w-full">
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
          <div className="bg-gray-200 rounded h-4 mb-2"></div>
          <div className="bg-gray-200 rounded h-4 w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        ease: "easeOut"
      }}
      className="w-full"
    >
      {children}
      
      {/* Performance metrics display (development only) */}
      {process.env.NODE_ENV === 'development' && loadTime > 0 && (
        <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
          <div className="flex justify-between items-center">
            <span>Load time: {loadTime.toFixed(2)}ms</span>
            <span className={`px-2 py-1 rounded text-xs ${
              loadTime < 100 ? 'bg-green-100 text-green-700' :
              loadTime < 300 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {loadTime < 100 ? 'Fast' : loadTime < 300 ? 'Good' : 'Slow'}
            </span>
          </div>
          {performanceMetrics.firstContentfulPaint > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              FCP: {performanceMetrics.firstContentfulPaint.toFixed(0)}ms
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const [metrics, setMetrics] = useState({});
  const startTime = useRef(null);

  const startRender = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (startTime.current) {
      const renderTime = performance.now() - startTime.current;
      setMetrics(prev => ({
        ...prev,
        renderTime,
        lastRender: Date.now()
      }));

      // Log slow renders
      if (renderTime > 16) { // 60fps threshold
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
  }, [componentName]);

  const measureApiCall = useCallback(async (name, apiCall) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      
      setMetrics(prev => ({
        ...prev,
        apiCalls: {
          ...prev.apiCalls,
          [name]: { duration, timestamp: Date.now() }
        }
      }));

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`API call ${name} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, []);

  return { metrics, startRender, endRender, measureApiCall };
};

// Resource preloader
export const useResourcePreloader = () => {
  const preloadImage = useCallback((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }, []);

  const preloadScript = useCallback((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  }, []);

  const preloadFont = useCallback((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = src;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }, []);

  return { preloadImage, preloadScript, preloadFont };
};

// Performance budget checker
export const usePerformanceBudget = (budgets = {}) => {
  const [violations, setViolations] = useState([]);

  const checkBudget = useCallback((metric, value) => {
    const budget = budgets[metric];
    if (budget && value > budget) {
      const violation = {
        metric,
        value,
        budget,
        timestamp: Date.now()
      };
      setViolations(prev => [...prev, violation]);
      console.warn(`Performance budget violated: ${metric}`, violation);
    }
  }, [budgets]);

  return { violations, checkBudget };
};

export default PerformanceOptimizer;

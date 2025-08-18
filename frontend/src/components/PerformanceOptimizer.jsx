import React, { useEffect, useState } from 'react';

const PerformanceOptimizer = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0
  });

  useEffect(() => {
    // Performance monitoring
    const measurePerformance = () => {
      // Navigation Timing API
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          setPerformanceMetrics(prev => ({
            ...prev,
            loadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart)
          }));
        }
      }

      // Core Web Vitals
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setPerformanceMetrics(prev => ({
            ...prev,
            largestContentfulPaint: Math.round(lastEntry.startTime)
          }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            setPerformanceMetrics(prev => ({
              ...prev,
              firstInputDelay: Math.round(entry.processingStart - entry.startTime)
            }));
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          setPerformanceMetrics(prev => ({
            ...prev,
            cumulativeLayoutShift: Math.round(clsValue * 1000) / 1000
          }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Image optimization
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        // Lazy loading
        if (!img.loading) {
          img.loading = 'lazy';
        }

        // Responsive images
        if (!img.srcset && img.src) {
          const src = img.src;
          img.srcset = `${src} 1x, ${src.replace(/\.(\w+)$/, '@2x.$1')} 2x`;
        }

        // Error handling
        img.onerror = function() {
          this.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
        };
      });
    };

    // Preload critical resources
    const preloadCriticalResources = () => {
      // Only preload resources that actually exist and are needed
      const criticalResources = [
        // Only preload essential resources that we know exist
        // Removed favicon.ico to prevent preload warnings
      ];

      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = resource.includes('.ico') ? 'image' : 'image';
        link.href = resource;
        document.head.appendChild(link);
      });
    };

    // Service Worker registration for caching
    const registerServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered:', registration);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      }
    };

    // Resource hints
    const addResourceHints = () => {
      const hints = [
        { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
        { rel: 'preconnect', href: '//fonts.googleapis.com' },
        { rel: 'preconnect', href: '//fonts.gstatic.com', crossorigin: '' }
      ];

      hints.forEach(hint => {
        const link = document.createElement('link');
        Object.assign(link, hint);
        document.head.appendChild(link);
      });
    };

    // Execute optimizations
    measurePerformance();
    optimizeImages();
    preloadCriticalResources();
    registerServiceWorker();
    addResourceHints();

    // Monitor performance metrics
    const performanceInterval = setInterval(() => {
      measurePerformance();
    }, 5000);

    return () => {
      clearInterval(performanceInterval);
    };
  }, []);

  // Send performance data to analytics
  useEffect(() => {
    if (window.gtag && performanceMetrics.loadTime > 0) {
      window.gtag('event', 'performance', {
        load_time: performanceMetrics.loadTime,
        lcp: performanceMetrics.largestContentfulPaint,
        fid: performanceMetrics.firstInputDelay,
        cls: performanceMetrics.cumulativeLayoutShift,
        page_location: window.location.href
      });
    }
  }, [performanceMetrics]);

  // This component doesn't render anything visible
  return null;
};

export default PerformanceOptimizer;

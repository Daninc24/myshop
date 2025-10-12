import { useEffect } from 'react';
import { 
  registerServiceWorker, 
  addResourceHints, 
  monitorMemory,
  preloadResource 
} from '../utils/performance';

const PerformanceOptimizer = () => {
  useEffect(() => {
    // Register service worker for caching
    registerServiceWorker();
    
    // Add resource hints for better loading
    addResourceHints();
    
    // Preload critical resources
    preloadResource('/api/categories', 'fetch');
    preloadResource('/api/products?featured=true', 'fetch');
    
    // Monitor memory usage in development
    if (import.meta.env.DEV) {
      const interval = setInterval(monitorMemory, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
    
    // Optimize images loading
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
      
      // Cleanup
      return () => {
        images.forEach(img => imageObserver.unobserve(img));
      };
    }
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Web Vitals monitoring (only if package is available)
    if (import.meta.env.DEV) {
      try {
        // Simple performance monitoring without external dependencies
        if ('performance' in window && 'getEntriesByType' in performance) {
          const paintEntries = performance.getEntriesByType('paint');
          const navigationEntries = performance.getEntriesByType('navigation');
          
          console.log('Performance Metrics:', {
            paintEntries,
            navigationEntries: navigationEntries[0]
          });
        }
      } catch (error) {
        console.log('Performance monitoring not available');
      }
    }
    
    // Connection monitoring
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = navigator.connection;
      console.log('Network Info:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      });
      
      // Adjust quality based on connection
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        document.documentElement.classList.add('low-bandwidth');
      }
    }
    
    // Battery API for power-aware features
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        if (battery.level < 0.2 || !battery.charging) {
          document.documentElement.classList.add('power-save');
        }
      }).catch(() => {
        // Battery API not supported
      });
    }
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceOptimizer;
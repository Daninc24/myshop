import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({});
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if ('performance' in window) {
      setIsMonitoring(true);
      monitorPerformance();
    }
  }, []);

  const monitorPerformance = () => {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // This would require the web-vitals library
      // Web Vitals monitoring available
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      const performanceMetrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
        timestamp: Date.now()
      };

      setMetrics(prev => ({ ...prev, ...performanceMetrics }));
      
      // Send metrics to analytics
      sendMetricsToAnalytics(performanceMetrics);
    });

    // Monitor user interactions
    let interactionStart = 0;
    document.addEventListener('mousedown', () => {
      interactionStart = performance.now();
    });

    document.addEventListener('mouseup', () => {
      if (interactionStart > 0) {
        const interactionTime = performance.now() - interactionStart;
        if (interactionTime > 100) { // Only log slow interactions
          console.warn('Slow interaction detected:', interactionTime);
        }
      }
    });

    // Monitor API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        if (duration > 1000) { // Log slow API calls
          console.warn('Slow API call detected:', args[0], duration);
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        console.error('API call failed:', args[0], duration, error);
        throw error;
      }
    };
  };

  const sendMetricsToAnalytics = async (metrics) => {
    try {
      await axios.post('/api/analytics/performance', {
        ...metrics,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  };

  const getPerformanceGrade = (fcp) => {
    if (fcp < 1800) return { grade: 'A', color: 'text-green-500' };
    if (fcp < 3000) return { grade: 'B', color: 'text-yellow-500' };
    return { grade: 'C', color: 'text-red-500' };
  };

  if (!isMonitoring) return null;

  const { grade, color } = getPerformanceGrade(metrics.firstContentfulPaint);

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-50">
      <div className="text-sm font-medium text-gray-900 mb-2">Performance Monitor</div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className={color}>{grade}</span>
        </div>
        <div className="flex justify-between">
          <span>Load Time:</span>
          <span>{Math.round(metrics.pageLoadTime || 0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>DOM Ready:</span>
          <span>{Math.round(metrics.domContentLoaded || 0)}ms</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;

// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  // Start timing an operation
  startTimer(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  // End timing an operation
  endTimer(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // Log if duration is significant
      if (metric.duration > 100) {
        console.warn(`Performance: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
      
      // Notify observers
      this.observers.forEach(observer => {
        if (observer.name === name || observer.name === '*') {
          observer.callback(metric);
        }
      });
    }
  }

  // Get timing for an operation
  getTimer(name) {
    return this.metrics.get(name);
  }

  // Add observer for performance events
  addObserver(name, callback) {
    this.observers.push({ name, callback });
  }

  // Measure API call performance
  async measureApiCall(name, apiCall) {
    this.startTimer(name);
    try {
      const result = await apiCall();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  // Measure component render time
  measureRender(componentName, renderFunction) {
    this.startTimer(`render_${componentName}`);
    const result = renderFunction();
    this.endTimer(`render_${componentName}`);
    return result;
  }

  // Get performance summary
  getSummary() {
    const summary = {};
    this.metrics.forEach((metric, name) => {
      if (metric.duration !== null) {
        summary[name] = {
          duration: metric.duration,
          startTime: metric.startTime,
          endTime: metric.endTime
        };
      }
    });
    return summary;
  }

  // Clear all metrics
  clear() {
    this.metrics.clear();
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
    performanceMonitor.endTimer(`render_${componentName}`);
  };

  return { startRender, endRender };
};

// Higher-order component for performance monitoring
export const withPerformanceMonitor = (WrappedComponent, componentName) => {
  return function PerformanceMonitoredComponent(props) {
    const { startRender, endRender } = usePerformanceMonitor(componentName);
    
    startRender();
    const result = <WrappedComponent {...props} />;
    endRender();
    
    return result;
  };
};

// Utility for measuring API calls
export const measureApiCall = (name, apiCall) => {
  return performanceMonitor.measureApiCall(name, apiCall);
};

// Export the monitor instance
export default performanceMonitor;

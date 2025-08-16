import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  ChartBarIcon,
  CpuChipIcon,
  ServerIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const DynamicPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    apiResponseTime: 0,
    serverUptime: 0,
    activeUsers: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    errorRate: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    if ('performance' in window) {
      setIsMonitoring(true);
      startMonitoring();
    }
  }, []);

  const startMonitoring = () => {
    // Monitor Core Web Vitals
    monitorCoreWebVitals();
    
    // Monitor API performance
    monitorAPIPerformance();
    
    // Monitor system resources
    monitorSystemResources();
    
         // Set up real-time updates
      intervalRef.current = setInterval(() => {
        updateMetrics();
      }, 60000); // Update every 60 seconds (increased for better performance)
  };

  const monitorCoreWebVitals = () => {
    if ('PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({
          ...prev,
          lcp: lastEntry.startTime
        }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          setMetrics(prev => ({
            ...prev,
            fid: entry.processingStart - entry.startTime
          }));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Monitor Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setMetrics(prev => ({
          ...prev,
          cls: clsValue
        }));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  };

     const monitorAPIPerformance = async () => {
     try {
       const startTime = performance.now();
               const response = await axios.get('/analytics/performance', {
          timeout: 8000 // 8 second timeout (increased for better reliability)
        });
       const endTime = performance.now();
       
       setMetrics(prev => ({
         ...prev,
         apiResponseTime: endTime - startTime,
         ...response.data
       }));
     } catch (error) {
       console.error('Failed to fetch performance metrics:', error);
       // Don't add alerts for network errors to avoid spam
       if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNABORTED') {
         setAlerts(prev => [...prev, {
           type: 'error',
           message: 'Failed to fetch performance metrics',
           timestamp: new Date()
         }]);
       }
     }
   };

  const monitorSystemResources = () => {
    // Monitor memory usage
    if ('memory' in performance) {
      const memory = performance.memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }));
    }

    // Monitor network information
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setMetrics(prev => ({
        ...prev,
        networkLatency: connection.rtt || 0
      }));
    }
  };

  const updateMetrics = () => {
    // Update page load time
    const currentTime = performance.now();
    const pageLoadTime = currentTime - startTimeRef.current;
    
    setMetrics(prev => ({
      ...prev,
      pageLoadTime: pageLoadTime / 1000 // Convert to seconds
    }));

    // Add to performance history
    setPerformanceHistory(prev => {
      const newHistory = [...prev, {
        timestamp: Date.now(),
        pageLoadTime: pageLoadTime / 1000,
        apiResponseTime: prev.apiResponseTime,
        memoryUsage: prev.memoryUsage
      }];
      
      // Keep only last 20 entries
      return newHistory.slice(-20);
    });

    // Check for performance alerts
    checkPerformanceAlerts();
  };

  const checkPerformanceAlerts = () => {
    const newAlerts = [];
    
    if (metrics.pageLoadTime > 3) {
      newAlerts.push({
        type: 'warning',
        message: 'Page load time is slow',
        timestamp: new Date()
      });
    }
    
    if (metrics.apiResponseTime > 1000) {
      newAlerts.push({
        type: 'error',
        message: 'API response time is high',
        timestamp: new Date()
      });
    }
    
    if (metrics.memoryUsage > 80) {
      newAlerts.push({
        type: 'warning',
        message: 'High memory usage detected',
        timestamp: new Date()
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
    }
  };

  const getPerformanceGrade = (metric, thresholds) => {
    if (metric <= thresholds.excellent) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (metric <= thresholds.good) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (metric <= thresholds.average) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getMetricStatus = (metric, threshold) => {
    return metric <= threshold ? 'good' : 'poor';
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!isMonitoring) return null;

  const lcpGrade = getPerformanceGrade(metrics.lcp || 0, { excellent: 2.5, good: 4, average: 6 });
  const fidGrade = getPerformanceGrade(metrics.fid || 0, { excellent: 100, good: 300, average: 500 });
  const clsGrade = getPerformanceGrade(metrics.cls || 0, { excellent: 0.1, good: 0.25, average: 0.5 });

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Compact View */}
      {!isExpanded && (
        <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Performance</span>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Core Web Vitals */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className={`text-center p-2 rounded ${lcpGrade.bg}`}>
              <div className={`text-xs font-bold ${lcpGrade.color}`}>LCP</div>
              <div className="text-xs text-gray-600">{lcpGrade.grade}</div>
            </div>
            <div className={`text-center p-2 rounded ${fidGrade.bg}`}>
              <div className={`text-xs font-bold ${fidGrade.color}`}>FID</div>
              <div className="text-xs text-gray-600">{fidGrade.grade}</div>
            </div>
            <div className={`text-center p-2 rounded ${clsGrade.bg}`}>
              <div className={`text-xs font-bold ${clsGrade.color}`}>CLS</div>
              <div className="text-xs text-gray-600">{clsGrade.grade}</div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Load Time:</span>
                             <span className={getMetricStatus(metrics.pageLoadTime, 3) === 'good' ? 'text-green-600' : 'text-red-600'}>
                 {Number(metrics.pageLoadTime || 0).toFixed(2)}s
               </span>
            </div>
            <div className="flex justify-between">
              <span>API Response:</span>
                             <span className={getMetricStatus(metrics.apiResponseTime, 500) === 'good' ? 'text-green-600' : 'text-red-600'}>
                 {Number(metrics.apiResponseTime || 0).toFixed(0)}ms
               </span>
            </div>
            <div className="flex justify-between">
              <span>Memory:</span>
                             <span className={getMetricStatus(metrics.memoryUsage, 80) === 'good' ? 'text-green-600' : 'text-red-600'}>
                 {Number(metrics.memoryUsage || 0).toFixed(1)}%
               </span>
            </div>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200 max-w-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">Performance Monitor</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          {/* System Health */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">System Health</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <ServerIcon className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs text-gray-600">Server</div>
                                     <div className="text-sm font-semibold text-green-600">{Number(metrics.serverUptime || 0).toFixed(1)}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <CpuChipIcon className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-600">CPU</div>
                                     <div className="text-sm font-semibold text-blue-600">{Number(metrics.cpuUsage || 0).toFixed(1)}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <WifiIcon className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-600">Network</div>
                  <div className="text-sm font-semibold text-purple-600">{metrics.networkLatency}ms</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <BoltIcon className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-xs text-gray-600">Active Users</div>
                  <div className="text-sm font-semibold text-orange-600">{metrics.activeUsers}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Performance Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Page Load Time</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getMetricStatus(metrics.pageLoadTime, 3) === 'good' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                     <span className="text-sm font-semibold">{Number(metrics.pageLoadTime || 0).toFixed(2)}s</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Response Time</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getMetricStatus(metrics.apiResponseTime, 500) === 'good' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                     <span className="text-sm font-semibold">{Number(metrics.apiResponseTime || 0).toFixed(0)}ms</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getMetricStatus(metrics.memoryUsage, 80) === 'good' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                     <span className="text-sm font-semibold">{Number(metrics.memoryUsage || 0).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Alerts</h3>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {alerts.slice(-3).map((alert, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs p-2 bg-red-50 rounded">
                    <ExclamationTriangleIcon className="h-3 w-3 text-red-500" />
                    <span className="text-red-700">{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ClockIcon className="h-3 w-3" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicPerformanceMonitor;

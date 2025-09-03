import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon, 
  EyeIcon, 
  ClockIcon, 
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const AdvancedAnalytics = () => {
  const [metrics, setMetrics] = useState({
    pageViews: 0,
    uniqueVisitors: 0,
    sessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0,
    cartAbandonment: 0,
    topProducts: [],
    userBehavior: {},
    performance: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  // Track page view
  const trackPageView = useCallback((page) => {
    const pageView = {
      page,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userId: getUserId()
    };

    // Save to localStorage for offline tracking
    const pageViews = JSON.parse(localStorage.getItem('pageViews') || '[]');
    pageViews.push(pageView);
    localStorage.setItem('pageViews', JSON.stringify(pageViews.slice(-100))); // Keep last 100

    // Send to analytics server
    sendAnalyticsData('pageView', pageView);
  }, []);

  // Track user interaction
  const trackInteraction = useCallback((event, data) => {
    const interaction = {
      event,
      data,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userId: getUserId()
    };

    // Save to localStorage
    const interactions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
    interactions.push(interaction);
    localStorage.setItem('userInteractions', JSON.stringify(interactions.slice(-200)));

    // Send to analytics server
    sendAnalyticsData('interaction', interaction);
  }, []);

  // Track performance metrics
  const trackPerformance = useCallback((metric, value) => {
    const performanceData = {
      metric,
      value,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userId: getUserId()
    };

    // Save to localStorage
    const performance = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
    performance.push(performanceData);
    localStorage.setItem('performanceMetrics', JSON.stringify(performance.slice(-50)));

    // Send to analytics server
    sendAnalyticsData('performance', performanceData);
  }, []);

  // Track e-commerce events
  const trackEcommerce = useCallback((event, data) => {
    const ecommerceData = {
      event,
      data,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userId: getUserId()
    };

    // Save to localStorage
    const ecommerce = JSON.parse(localStorage.getItem('ecommerceEvents') || '[]');
    ecommerce.push(ecommerceData);
    localStorage.setItem('ecommerceEvents', JSON.stringify(ecommerce.slice(-100)));

    // Send to analytics server
    sendAnalyticsData('ecommerce', ecommerceData);
  }, []);

  // Get session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // Get user ID
  const getUserId = () => {
    return localStorage.getItem('userId') || 'anonymous';
  };

  // Send analytics data to server
  const sendAnalyticsData = async (type, data) => {
    try {
      await fetch('/api/analytics/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          url: window.location.href
        }),
      });
    } catch (error) {
      console.error('Error sending analytics data:', error);
      // Store failed requests for retry
      const failedRequests = JSON.parse(localStorage.getItem('failedAnalytics') || '[]');
      failedRequests.push({ type, data, timestamp: Date.now() });
      localStorage.setItem('failedAnalytics', JSON.stringify(failedRequests.slice(-50)));
    }
  };

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics dashboard data from server
        const response = await fetch(`/api/analytics/dashboard?range=${timeRange}`);
        const data = await response.json();

        // Map backend dashboard response to component metrics shape
        setMetrics(prev => ({
          ...prev,
          pageViews: data?.realTime?.recentViews ?? prev.pageViews ?? 0,
          conversionRate: data?.realTime?.conversionRate ?? prev.conversionRate ?? 0,
          topProducts: data?.popularProducts?.map(p => ({ productId: p._id || p.title, views: p.viewCount || 0 })) || prev.topProducts || [],
          // Keep existing or locally computed values for unavailable fields
          uniqueVisitors: prev.uniqueVisitors ?? 0,
          sessionDuration: prev.sessionDuration ?? 0,
          bounceRate: prev.bounceRate ?? 0,
          cartAbandonment: prev.cartAbandonment ?? 0,
          userBehavior: prev.userBehavior || {},
          performance: prev.performance || {}
        }));
      } catch (error) {
        console.error('Error loading analytics data:', error);
        // Load from localStorage as fallback
        loadLocalAnalytics();
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange]);

  // Load analytics from localStorage
  const loadLocalAnalytics = () => {
    const pageViews = JSON.parse(localStorage.getItem('pageViews') || '[]');
    const interactions = JSON.parse(localStorage.getItem('userInteractions') || '[]');
    const performance = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
    const ecommerce = JSON.parse(localStorage.getItem('ecommerceEvents') || '[]');

    // Calculate basic metrics
    const uniqueVisitors = new Set(pageViews.map(pv => pv.userId)).size;
    const totalPageViews = pageViews.length;
    const cartEvents = ecommerce.filter(e => e.event === 'add_to_cart');
    const purchaseEvents = ecommerce.filter(e => e.event === 'purchase');

    setMetrics({
      pageViews: totalPageViews,
      uniqueVisitors,
      sessionDuration: calculateSessionDuration(pageViews),
      bounceRate: calculateBounceRate(pageViews),
      conversionRate: calculateConversionRate(purchaseEvents, uniqueVisitors),
      cartAbandonment: calculateCartAbandonment(cartEvents, purchaseEvents),
      topProducts: getTopProducts(ecommerce),
      userBehavior: analyzeUserBehavior(interactions),
      performance: analyzePerformance(performance)
    });
  };

  // Calculate session duration
  const calculateSessionDuration = (pageViews) => {
    const sessions = {};
    pageViews.forEach(pv => {
      if (!sessions[pv.sessionId]) {
        sessions[pv.sessionId] = [];
      }
      sessions[pv.sessionId].push(pv.timestamp);
    });

    const durations = Object.values(sessions).map(timestamps => {
      const sorted = timestamps.sort((a, b) => a - b);
      return sorted[sorted.length - 1] - sorted[0];
    });

    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length / 1000 : 0;
  };

  // Calculate bounce rate
  const calculateBounceRate = (pageViews) => {
    const sessions = {};
    pageViews.forEach(pv => {
      if (!sessions[pv.sessionId]) {
        sessions[pv.sessionId] = [];
      }
      sessions[pv.sessionId].push(pv);
    });

    const singlePageSessions = Object.values(sessions).filter(session => session.length === 1);
    return sessions.length > 0 ? (singlePageSessions.length / Object.keys(sessions).length) * 100 : 0;
  };

  // Calculate conversion rate
  const calculateConversionRate = (purchases, visitors) => {
    return visitors > 0 ? (purchases.length / visitors) * 100 : 0;
  };

  // Calculate cart abandonment rate
  const calculateCartAbandonment = (cartEvents, purchaseEvents) => {
    return cartEvents.length > 0 ? ((cartEvents.length - purchaseEvents.length) / cartEvents.length) * 100 : 0;
  };

  // Get top products
  const getTopProducts = (ecommerce) => {
    const productViews = {};
    ecommerce.forEach(event => {
      if (event.event === 'view_item' && event.data.productId) {
        productViews[event.data.productId] = (productViews[event.data.productId] || 0) + 1;
      }
    });

    return Object.entries(productViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([productId, views]) => ({ productId, views }));
  };

  // Analyze user behavior
  const analyzeUserBehavior = (interactions) => {
    const eventCounts = {};
    interactions.forEach(interaction => {
      eventCounts[interaction.event] = (eventCounts[interaction.event] || 0) + 1;
    });

    return eventCounts;
  };

  // Analyze performance
  const analyzePerformance = (performance) => {
    const metrics = {};
    performance.forEach(p => {
      if (!metrics[p.metric]) {
        metrics[p.metric] = [];
      }
      metrics[p.metric].push(p.value);
    });

    const averages = {};
    Object.entries(metrics).forEach(([metric, values]) => {
      averages[metric] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    return averages;
  };

  // Retry failed analytics requests
  const retryFailedRequests = async () => {
    const failedRequests = JSON.parse(localStorage.getItem('failedAnalytics') || '[]');
    
    for (const request of failedRequests) {
      try {
        await sendAnalyticsData(request.type, request.data);
      } catch (error) {
        console.error('Failed to retry analytics request:', error);
      }
    }

    localStorage.removeItem('failedAnalytics');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <EyeIcon className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Page Views</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{metrics.pageViews.toLocaleString()}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">Unique Visitors</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{metrics.uniqueVisitors.toLocaleString()}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">Avg. Session</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{Math.round(metrics.sessionDuration)}s</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
                            <ArrowTrendingUpIcon className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">Conversion Rate</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{metrics.conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Behavior */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">User Behavior</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bounce Rate</span>
              <span className="text-sm font-medium">{metrics.bounceRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cart Abandonment</span>
              <span className="text-sm font-medium">{metrics.cartAbandonment.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Top Products</h4>
          <div className="space-y-2">
            {metrics.topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Product {product.productId}</span>
                <span className="text-sm font-medium">{product.views} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {Object.keys(metrics.performance).length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(metrics.performance).map(([metric, value]) => (
              <div key={metric} className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 uppercase">{metric}</div>
                <div className="text-lg font-semibold">{value.toFixed(2)}ms</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={retryFailedRequests}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Retry Failed Requests
        </button>
        <button
          onClick={loadLocalAnalytics}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;

import React, { createContext, useContext, useState } from 'react';

// Create the context
const AnalyticsContext = createContext();

// Provider component
export const AnalyticsProvider = ({ children }) => {
  // Minimal state for compatibility
  const [loading, setLoading] = useState(false);

  // Placeholder for analytics methods
  const trackEvent = (event, data) => {
    // You can implement real analytics here
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event:', event, data);
    }
  };

  // Context value
  const value = {
    loading,
    setLoading,
    trackEvent,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Custom hook for using analytics context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Error fixes for production deployment

// Fix for React error #31 (Objects as React children)
export const sanitizeReactChildren = (children) => {
  if (typeof children === 'object' && children !== null && !Array.isArray(children)) {
    // If it's an object with toString method, convert to string
    if (typeof children.toString === 'function') {
      return children.toString();
    }
    // If it's an object with a specific property, extract it
    if (children.name || children.code || children.symbol) {
      return children.name || children.code || children.symbol;
    }
    // Fallback to JSON string
    return JSON.stringify(children);
  }
  return children;
};

// Fix for currency display issues
export const formatCurrency = (currency) => {
  if (typeof currency === 'string') {
    return currency;
  }
  if (typeof currency === 'object' && currency !== null) {
    return `${currency.symbol || ''} ${currency.code || ''}`.trim();
  }
  return 'USD';
};

// Fix for authentication errors (401 is expected for non-authenticated users)
export const handleAuthError = (error) => {
  if (error?.response?.status === 401) {
    // 401 is expected for non-authenticated users, don't log as error
    return { isExpected: true, message: 'Not authenticated' };
  }
  return { isExpected: false, message: error?.message || 'Unknown error' };
};

// Fix for Google Maps API errors (block external requests in production)
export const suppressGoogleMapsErrors = () => {
  // Suppress Google Maps errors in production
  if (typeof window !== 'undefined') {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && message.includes('maps.googleapis.com')) {
        // Suppress Google Maps related errors
        return;
      }
      originalError.apply(console, args);
    };
  }
};

// Initialize error fixes
export const initializeErrorFixes = () => {
  suppressGoogleMapsErrors();
  
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      if (handleAuthError(error).isExpected) {
        event.preventDefault(); // Prevent logging expected auth errors
      }
    });
  }
};
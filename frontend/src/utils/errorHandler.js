// Comprehensive Error Handler for LuxeCart
// This utility handles expected errors silently and provides better error management

// Expected error patterns that should be silenced
const SILENT_ERRORS = [
  // Auth errors (expected for non-authenticated users)
  { pattern: /401/, message: 'Unauthorized - expected for non-authenticated users' },
  { pattern: /503/, message: 'Service Unavailable - temporary server issue' },
  
  // Analytics errors (expected when endpoints don't exist)
  { pattern: /analytics\/ad-impression.*404/, message: 'Analytics endpoint not available - expected' },
  { pattern: /analytics\/ad-click.*404/, message: 'Analytics endpoint not available - expected' },
  
  // Google Maps errors (blocked by ad blockers)
  { pattern: /maps\.googleapis\.com.*ERR_BLOCKED_BY_CLIENT/, message: 'Google Maps blocked by ad blocker - expected' },
  { pattern: /maps\.gstatic\.com.*ERR_BLOCKED_BY_CLIENT/, message: 'Google Maps blocked by ad blocker - expected' },
  
  // React DevTools errors
  { pattern: /Node cannot be found in the current page/, message: 'React DevTools error - expected in development' },
  
  // Service Worker errors (expected in development)
  { pattern: /Service Worker.*Loaded/, message: 'Service Worker loaded - expected' },
  { pattern: /Service Worker.*registered/, message: 'Service Worker registered - expected' }
];

// Check if an error should be silenced
export const shouldSilenceError = (error) => {
  const errorString = error.toString();
  const errorMessage = error.message || errorString;
  const errorStack = error.stack || '';
  
  const fullError = `${errorString} ${errorMessage} ${errorStack}`;
  
  return SILENT_ERRORS.some(silentError => 
    silentError.pattern.test(fullError)
  );
};

// Enhanced console.error that silences expected errors
export const silentConsoleError = (error, context = '') => {
  if (shouldSilenceError(error)) {
    // Silently ignore expected errors
    return;
  }
  
  // Log unexpected errors with context
  console.error(`[${context}] Unexpected error:`, error);
};

// Enhanced console.warn that silences expected warnings
export const silentConsoleWarn = (message, context = '') => {
  const messageString = message.toString();
  
  if (SILENT_ERRORS.some(silentError => silentError.pattern.test(messageString))) {
    // Silently ignore expected warnings
    return;
  }
  
  // Log unexpected warnings with context
  console.warn(`[${context}] Unexpected warning:`, message);
};

// Global error handler for window errors
export const setupGlobalErrorHandling = () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Override console.error
  console.error = (...args) => {
    const error = args[0];
    if (shouldSilenceError(error)) {
      return; // Silently ignore expected errors
    }
    originalConsoleError.apply(console, args);
  };
  
  // Override console.warn
  console.warn = (...args) => {
    const message = args[0];
    if (SILENT_ERRORS.some(silentError => silentError.pattern.test(message.toString()))) {
      return; // Silently ignore expected warnings
    }
    originalConsoleWarn.apply(console, args);
  };
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (shouldSilenceError(event.reason)) {
      event.preventDefault(); // Prevent default error handling
      return;
    }
    // Let unexpected errors through
  });
  
  // Handle general errors
  window.addEventListener('error', (event) => {
    if (shouldSilenceError(event.error)) {
      event.preventDefault(); // Prevent default error handling
      return;
    }
    // Let unexpected errors through
  });
};

// API error handler for axios
export const handleApiError = (error, context = 'API') => {
  // Check if it's an expected error
  if (error.response) {
    const status = error.response.status;
    const url = error.config?.url || '';
    
    // Silent handling for expected API errors
    if (status === 401 && url.includes('/auth/profile')) {
      return; // Expected for non-authenticated users
    }
    
    if (status === 404 && url.includes('/analytics/')) {
      return; // Expected when analytics endpoints don't exist
    }
    
    if (status === 503) {
      return; // Expected temporary server issues
    }
  }
  
  // Log unexpected API errors
  console.error(`[${context}] Unexpected API error:`, error);
};

// Initialize global error handling
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
}

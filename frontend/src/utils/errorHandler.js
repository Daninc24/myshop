// Comprehensive Error Handler for LuxeCart
class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Handle API errors with retry logic
  async handleApiError(error, retryCount = 0) {
    const errorKey = `${error.config?.url || 'unknown'}_${error.response?.status || 'network'}`;
    
    // Track error frequency
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Log error details
    console.warn(`API Error (${retryCount + 1}/${this.maxRetries}):`, {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      retryCount
    });

    // Handle specific error types
    if (error.response?.status === 503) {
      return this.handleServiceUnavailable(error);
    }

    if (error.response?.status === 404) {
      return this.handleNotFound(error);
    }

    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return this.handleNetworkError(error, retryCount);
    }

    // For other errors, return a fallback response
    return this.createFallbackResponse(error);
  }

  // Handle 503 Service Unavailable
  handleServiceUnavailable(error) {
    return {
      success: false,
      error: 'Service temporarily unavailable',
      message: 'Our servers are currently experiencing high traffic. Please try again later.',
      offline: true,
      retryAfter: 30 // seconds
    };
  }

  // Handle 404 Not Found
  handleNotFound(error) {
    return {
      success: false,
      error: 'Resource not found',
      message: 'The requested resource could not be found.',
      status: 404
    };
  }

  // Handle network errors with retry logic
  async handleNetworkError(error, retryCount) {
    if (retryCount < this.maxRetries) {
      // Wait before retrying
      await this.delay(this.retryDelay * Math.pow(2, retryCount));
      
      // Retry the request
      try {
        const response = await fetch(error.config.url, {
          method: error.config.method || 'GET',
          headers: error.config.headers,
          body: error.config.data
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (retryError) {
        // If retry fails, continue to next retry or fallback
        return this.handleNetworkError(error, retryCount + 1);
      }
    }

    // Max retries reached, return offline response
    return {
      success: false,
      error: 'Network error',
      message: 'Please check your internet connection and try again.',
      offline: true
    };
  }

  // Create fallback response for any error
  createFallbackResponse(error) {
    return {
      success: false,
      error: 'Request failed',
      message: 'Something went wrong. Please try again.',
      originalError: error.message
    };
  }

  // Handle image loading errors
  handleImageError(imageUrl, fallbackUrl = '/images/placeholder-image.svg') {
    console.warn(`Image failed to load: ${imageUrl}`);
    
    return {
      originalUrl: imageUrl,
      fallbackUrl,
      error: 'Image loading failed'
    };
  }

  // Handle service worker errors
  handleServiceWorkerError(error) {
    console.warn('Service Worker Error:', error);
    
    return {
      success: false,
      error: 'Service Worker error',
      message: 'Offline functionality may be limited.',
      offline: true
    };
  }

  // Handle analytics errors silently
  handleAnalyticsError(error) {
    // Don't log analytics errors to avoid console spam
    return {
      success: false,
      error: 'Analytics error',
      silent: true
    };
  }

  // Handle cache errors
  handleCacheError(error) {
    console.warn('Cache Error:', error);
    
    return {
      success: false,
      error: 'Cache error',
      message: 'Caching functionality may be limited.',
      offline: true
    };
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get error statistics
  getErrorStats() {
    const stats = {};
    for (const [key, count] of this.errorCounts) {
      stats[key] = count;
    }
    return stats;
  }

  // Clear error counts
  clearErrorCounts() {
    this.errorCounts.clear();
  }

  // Check if we're offline
  isOffline() {
    return !navigator.onLine;
  }

  // Check if we should show offline message
  shouldShowOfflineMessage() {
    return this.isOffline() || this.getErrorStats().offline > 2;
  }

  // Create user-friendly error message
  getUserFriendlyMessage(error) {
    if (this.isOffline()) {
      return 'You appear to be offline. Please check your internet connection.';
    }

    if (error.response?.status === 503) {
      return 'Our servers are temporarily unavailable. Please try again in a few minutes.';
    }

    if (error.response?.status === 404) {
      return 'The requested page or resource could not be found.';
    }

    if (error.code === 'NETWORK_ERROR') {
      return 'Unable to connect to our servers. Please check your internet connection.';
    }

    return 'Something went wrong. Please try again or contact support if the problem persists.';
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export both the class and the instance
export { ErrorHandler };
export default errorHandler;

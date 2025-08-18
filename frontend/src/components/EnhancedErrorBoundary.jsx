import React from 'react';
import { useToast } from '../contexts/ToastContext';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = this.generateErrorId();
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error to external service
    this.logErrorToService(error, errorInfo, errorId);
    
    // Track in analytics
    this.trackError(error, errorId);
    
    // Show user-friendly notification
    this.showUserNotification();
  }

  generateErrorId = () => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  logErrorToService = (error, errorInfo, errorId) => {
    const errorData = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    };

    // In production, send to error tracking service
    if (import.meta.env.MODE === 'production') {
      // Example: Sentry, LogRocket, etc.
      console.error('Error logged to service:', errorData);
    } else {
      console.error('Development error:', errorData);
    }
  };

  trackError = (error, errorId) => {
    // Track in analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_id: errorId
        }
      });
    }
  };

  showUserNotification = () => {
    // Show toast notification
    if (this.props.showToast) {
      this.props.showToast(
        'Something went wrong. We\'ve been notified and are working on a fix.',
        'error'
      );
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        if (this.props.showToast) {
          this.props.showToast('Error details copied to clipboard', 'success');
        }
      })
      .catch(() => {
        // Fallback: open email
        const subject = encodeURIComponent(`Error Report - ${errorId}`);
        const body = encodeURIComponent(JSON.stringify(errorReport, null, 2));
        window.open(`mailto:support@myshop.com?subject=${subject}&body=${body}`);
      });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              {/* Error Illustration */}
              <div className="mx-auto mb-4 w-32 h-32 flex items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" fill="#FFF3F0" stroke="#FF6600" strokeWidth="4" />
                  <path d="M35 60 Q50 75 65 60" stroke="#FF6600" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <circle cx="40" cy="45" r="5" fill="#FF6600" />
                  <circle cx="60" cy="45" r="5" fill="#FF6600" />
                  <rect x="47" y="30" width="6" height="20" rx="3" fill="#FF6600" />
                </svg>
              </div>
              
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
              
              {this.state.errorId && (
                <p className="text-xs text-gray-500 mb-4">
                  Error ID: {this.state.errorId}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </button>
              
              {import.meta.env.MODE === 'development' && (
                <button
                  onClick={this.handleReportError}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Report Error
                </button>
              )}
            </div>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.toString()}</pre>
                  </div>
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide toast context
const EnhancedErrorBoundaryWrapper = (props) => {
  const { showToast } = useToast();
  return <EnhancedErrorBoundary {...props} showToast={showToast} />;
};

export default EnhancedErrorBoundaryWrapper;

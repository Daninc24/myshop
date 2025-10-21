// Minimal toast context for testing
import React, { createContext, useContext } from 'react';

const SimpleToastContext = createContext({
  success: () => {},
  error: () => {},
  showToast: () => {}
});

export const SimpleToastProvider = ({ children }) => {
  const success = React.useCallback((message) => {
    console.log('Success:', message);
  }, []);

  const error = React.useCallback((message) => {
    console.log('Error:', message);
  }, []);

  const showToast = React.useCallback((message, type = 'info') => {
    console.log(`${type}:`, message);
  }, []);

  const value = React.useMemo(() => ({
    success,
    error,
    showToast
  }), [success, error, showToast]);

  return React.createElement(
    SimpleToastContext.Provider,
    { value },
    children
  );
};

export const useSimpleToast = () => {
  const context = useContext(SimpleToastContext);
  if (!context) {
    throw new Error('useSimpleToast must be used within SimpleToastProvider');
  }
  return context;
};

export default SimpleToastContext;
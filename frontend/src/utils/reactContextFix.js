// React Context Fix for Production Builds
import React from 'react';

// Create a safe createContext function that handles undefined React
export const safeCreateContext = (defaultValue) => {
  try {
    if (React && React.createContext) {
      return React.createContext(defaultValue);
    }
    
    // Fallback if React.createContext is not available
    console.warn('React.createContext not available, using fallback');
    return {
      Provider: ({ children, value }) => {
        // Store the value in a global variable as fallback
        window.__contextValue = value;
        return children;
      },
      Consumer: ({ children }) => {
        return children(window.__contextValue || defaultValue);
      },
      displayName: 'SafeContext'
    };
  } catch (error) {
    console.error('Error creating context:', error);
    // Return a minimal context implementation
    return {
      Provider: ({ children }) => children,
      Consumer: ({ children }) => children(defaultValue),
      displayName: 'ErrorContext'
    };
  }
};

// Hook to safely use context
export const safeUseContext = (context) => {
  try {
    if (React && React.useContext) {
      return React.useContext(context);
    }
    
    // Fallback if useContext is not available
    console.warn('React.useContext not available, using fallback');
    return window.__contextValue || {};
  } catch (error) {
    console.error('Error using context:', error);
    return {};
  }
};

// Initialize React globals with error handling
export const initializeReactGlobals = () => {
  try {
    if (typeof window !== 'undefined') {
      // Ensure React is available
      if (!window.React && React) {
        window.React = React;
      }
      
      // Ensure createContext is available
      if (!window.createContext && React.createContext) {
        window.createContext = React.createContext;
      }
      
      // Ensure useContext is available
      if (!window.useContext && React.useContext) {
        window.useContext = React.useContext;
      }
    }
    
    // Also set in globalThis
    if (typeof globalThis !== 'undefined') {
      if (!globalThis.React && React) {
        globalThis.React = React;
      }
      
      if (!globalThis.createContext && React.createContext) {
        globalThis.createContext = React.createContext;
      }
      
      if (!globalThis.useContext && React.useContext) {
        globalThis.useContext = React.useContext;
      }
    }
  } catch (error) {
    console.error('Error initializing React globals:', error);
  }
};

// Call initialization immediately
initializeReactGlobals();
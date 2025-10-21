// Critical React initialization - must run before any other code
import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple and direct React global setup with error handling
if (typeof window !== 'undefined') {
  try {
    window.React = React;
    window.ReactDOM = ReactDOM;
    
    // Only set properties that don't already exist or aren't read-only
    if (!window.hasOwnProperty('createContext')) {
      try {
        window.createContext = React.createContext;
      } catch (e) {
        // Property might be read-only, skip it
        console.warn('Could not set window.createContext:', e.message);
      }
    }
    
    // Set other React hooks safely
    const reactMethods = {
      useState: React.useState,
      useEffect: React.useEffect,
      useContext: React.useContext,
      useCallback: React.useCallback,
      useMemo: React.useMemo,
      useRef: React.useRef,
      useReducer: React.useReducer,
      useLayoutEffect: React.useLayoutEffect,
      useImperativeHandle: React.useImperativeHandle,
      useDebugValue: React.useDebugValue,
      forwardRef: React.forwardRef,
      memo: React.memo,
      lazy: React.lazy,
      Suspense: React.Suspense,
      Fragment: React.Fragment,
      StrictMode: React.StrictMode,
      createElement: React.createElement,
      cloneElement: React.cloneElement,
      isValidElement: React.isValidElement,
      Children: React.Children,
      Component: React.Component,
      PureComponent: React.PureComponent
    };
    
    Object.keys(reactMethods).forEach(method => {
      if (!window.hasOwnProperty(method)) {
        try {
          window[method] = reactMethods[method];
        } catch (e) {
          // Skip read-only properties
          console.warn(`Could not set window.${method}:`, e.message);
        }
      }
    });
  } catch (error) {
    console.warn('Error setting up React globals on window:', error);
  }
}

// Set in globalThis for ES modules (safer approach)
try {
  globalThis.React = React;
  globalThis.ReactDOM = ReactDOM;
  
  // Set React methods in globalThis safely
  const globalReactMethods = {
    createContext: React.createContext,
    useState: React.useState,
    useEffect: React.useEffect,
    useContext: React.useContext
  };
  
  Object.keys(globalReactMethods).forEach(method => {
    if (!globalThis.hasOwnProperty(method)) {
      try {
        globalThis[method] = globalReactMethods[method];
      } catch (e) {
        console.warn(`Could not set globalThis.${method}:`, e.message);
      }
    }
  });
} catch (error) {
  console.warn('Error setting up React globals on globalThis:', error);
}

// Export React for explicit imports
export default React;
export { ReactDOM };
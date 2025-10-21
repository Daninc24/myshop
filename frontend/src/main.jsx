import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'
import ReactTest from './ReactTest.jsx'
import './index.css'
import { setupGlobalErrorHandling } from './utils/errorHandler.js'
import { initializeErrorFixes } from './utils/errorFixes.js'

// Ensure React is available immediately
window.React = React;
globalThis.React = React;
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { SimpleToastProvider } from './contexts/SimpleToastContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { NotificationProvider } from './components/WorldClassNotifications.jsx';
import { AnalyticsProvider } from './contexts/AnalyticsContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import { getApiBaseUrl, logApiConfig, testApiConnection } from './utils/apiConfig';
import { ConfigProvider, theme as antdTheme } from 'antd';

// Configure axios to work with Vite proxy
(() => {
  // Configure axios with proper API base URL
  const baseUrl = getApiBaseUrl();
  axios.defaults.baseURL = baseUrl;
  axios.defaults.withCredentials = true;
  
  // Log configuration for debugging
  logApiConfig();
  
  // Test API connection in production
  if (!import.meta.env.DEV) {
    testApiConnection();
  }
})();

// Initialize error fixes for production
initializeErrorFixes();

// Ensure React is available globally for all libraries
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = ReactDOM;
}

// Ensure React is available in global scope for bundled libraries
globalThis.React = React;

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <HelmetProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#ff6600',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            borderRadius: 10,
          },
          algorithm: antdTheme.defaultAlgorithm,
        }}
      >
        <ToastProvider>
          <SimpleToastProvider>
            <AuthProvider>
              <CartProvider>
                <NotificationProvider>
                  <AnalyticsProvider>
                    <App />
                  </AnalyticsProvider>
                </NotificationProvider>
              </CartProvider>
            </AuthProvider>
          </SimpleToastProvider>
        </ToastProvider>
      </ConfigProvider>
    </HelmetProvider>
  </BrowserRouter>,
)

import { StrictMode } from 'react'
import React from 'react';
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { setupGlobalErrorHandling } from './utils/errorHandler.js'
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';

import { AnalyticsProvider } from './contexts/AnalyticsContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import 'antd/dist/reset.css';
import { ConfigProvider, theme as antdTheme } from 'antd';

// Configure axios to work with Vite proxy
(() => {
  // In development, use the proxy (no base URL needed)
  // In production, use the full API URL
  if (import.meta.env.DEV) {
    // Development: point to Vite proxy so calls like '/products' resolve to backend '/api/products'
    axios.defaults.baseURL = '/api';
  } else {
    // Production: use the full API URL as provided by environment variable
    let raw = import.meta.env.VITE_API_URL || 'https://myshop-hhfv.onrender.com';
    
    // If VITE_API_URL already includes /api, use it as is
    // If not, add /api to the base URL
    if (raw && !raw.includes('/api')) {
      raw = raw.replace(/\/+$/, '') + '/api';
    }
    
    const trimmed = raw.replace(/\/+$/, ''); // remove trailing slashes
    axios.defaults.baseURL = trimmed;
  }
  axios.defaults.withCredentials = true;
})();

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
          <AuthProvider>
            <CartProvider>
              <AnalyticsProvider>
                <App />
              </AnalyticsProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ConfigProvider>
    </HelmetProvider>
  </BrowserRouter>,
)

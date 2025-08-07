import { StrictMode } from 'react'
import React from 'react';
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import 'antd/dist/reset.css';
import { ConfigProvider, theme as antdTheme } from 'antd';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
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
                <App />
              </ConfigProvider>
            </HelmetProvider>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>,
)

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useToast();

  // Configure axios defaults (matches logic in main.jsx)
  (() => {
    // In development, use the proxy (no base URL needed)
    // In production, use the full API URL
    if (import.meta.env.DEV) {
      // Development: let Vite proxy handle API calls
      axios.defaults.baseURL = '';
    } else {
      // Production: use the full API URL
      const raw = import.meta.env.VITE_API_URL || 'http://localhost:5002';
      const trimmed = raw.replace(/\/+$/, ''); // remove trailing slashes
      const base = /\/api\/?$/.test(trimmed) ? trimmed : `${trimmed}/api`;
      axios.defaults.baseURL = base;
    }
    axios.defaults.withCredentials = true;
  })();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/profile');

      setUser(response.data.user);
    } catch (error) {
      setUser(null);
      // Don't show error for 401 on public pages - this is expected behavior
      if (error.response && error.response.status === 401) {
        const currentPath = window.location.pathname;
        const publicPaths = ['/login', '/register', '/', '/products', '/product', '/faq', '/contact', '/about', '/events'];
        const isPublicPath = publicPaths.some(path => 
          currentPath === path || currentPath.startsWith(path + '/')
        );
        
        // Only show error for protected routes
        if (!isPublicPath) {
          // User not authenticated - redirecting to login
        }
      } else {
        // Show error for other types of errors
        console.error('Auth check failed:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Sending login data
      const response = await axios.post('/auth/login', { email, password });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/auth/register', { name, email, password });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
      // Clear any stored cart data
      localStorage.removeItem('cart');
      // Clear any stored user preferences
      localStorage.removeItem('currency');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear the user state locally
      setUser(null);
      localStorage.removeItem('cart');
      localStorage.removeItem('currency');
      return { success: true };
    }
  };

  const loginWithGoogle = () => {
            window.location.href = (import.meta.env.VITE_API_URL || 'http://localhost:5002') + '/auth/google';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isShopkeeper: user?.role === 'shopkeeper',
    isStoreManager: user?.role === 'store_manager',
    isWarehouseManager: user?.role === 'warehouse_manager',
    isManagerOrAdmin: user?.role === 'admin' || user?.role === 'manager' || user?.role === 'warehouse_manager',
    isShopkeeperOrAdmin: user?.role === 'shopkeeper' || user?.role === 'admin',
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
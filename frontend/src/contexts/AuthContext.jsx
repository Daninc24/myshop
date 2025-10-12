import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';
import { handleApiError } from '../utils/errorHandler.js';

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

  // Axios configuration is handled in main.jsx - no need to duplicate here

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
      // Use the new error handler for consistent error management
      handleApiError(error, 'AuthContext');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Sending login data
      const response = await axios.post('/auth/login', { email, password });
      setUser(response.data.user);
      
      // Immediately check auth status to ensure consistency
      await checkAuth();
      
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
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, Cog6ToothIcon, ChartBarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { io } from 'socket.io-client';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const [currencies, setCurrencies] = useState(['USD']);
  const [selectedCurrency, setSelectedCurrency] = useState(() => localStorage.getItem('currency') || 'USD');

  // Socket.IO for online status
  useEffect(() => {
    if (!user) return;
    if (socketRef.current) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://myshop-hhfv.onrender.com', {
      withCredentials: true,
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });
    socket.emit('get_online_users');
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    axios.get('/payment/currency/list')
      .then(res => setCurrencies(res.data.currencies))
      .catch(() => setCurrencies(['USD']));
  }, []);

  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
    localStorage.setItem('currency', e.target.value);
    window.location.reload(); // reload to propagate currency change (can be improved with context)
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-surface shadow-strong sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center shadow-strong">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <span className="ml-2 text-2xl font-heading font-bold text-secondary hidden sm:block">
                MyShopping
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-secondary hover:text-primary px-4 py-2 rounded-xl text-base font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-secondary hover:text-primary px-4 py-2 rounded-xl text-base font-medium transition-colors"
            >
              Products
            </Link>
            {/* Currency Selector */}
            <select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              className="border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ minWidth: 100 }}
              title="Select currency"
            >
              {currencies.map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface rounded-2xl shadow-strong mt-2 p-4 animate-slide-in">
            <Link 
              to="/" 
              className="block text-secondary hover:text-primary px-4 py-3 rounded-xl text-lg font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="block text-secondary hover:text-primary px-4 py-3 rounded-xl text-lg font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              className="border border-gray-300 rounded-xl px-3 py-2 text-lg w-full mt-2 focus:outline-none focus:ring-2 focus:ring-primary"
              title="Select currency"
            >
              {currencies.map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
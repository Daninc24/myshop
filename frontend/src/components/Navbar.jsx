import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, ChatBubbleLeftRightIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { io } from 'socket.io-client';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { currency, setCurrency } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [currencies, setCurrencies] = useState(['USD']);

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
    setCurrency(e.target.value);
    localStorage.setItem('currency', e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const posRoles = ['admin', 'shopkeeper', 'staff', 'cashier', 'manager'];

  return (
    <nav className="bg-gradient-to-r from-blue-700 via-purple-700 to-yellow-400 shadow-strong sticky top-0 z-50 border-b border-yellow-300 dark:from-gray-900 dark:via-blue-900 dark:to-yellow-600 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 md:gap-3 min-w-0">
  <img src="/images/logo-footer.svg" alt="MyShop Logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white shadow-lg p-1" aria-label="MyShopping Center Logo" />
  <span className="hidden sm:inline font-heading text-xl sm:text-2xl font-bold text-yellow-400 drop-shadow">MyShopping Center</span>
</Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white hover:text-primary px-4 py-2 rounded-xl text-base font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-white hover:text-primary px-4 py-2 rounded-xl text-base font-medium transition-colors"
            >
              Products
            </Link>
            {/* Messages Link for all authenticated users */}
            {user && (
              <Link to="/messages" className="text-white hover:text-primary px-4 py-2 rounded-xl text-base font-medium transition-colors flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
                <span>Messages</span>
              </Link>
            )}
            {/* POS Link for allowed roles */}
            {user && posRoles.includes(user.role) && (
              <Link to="/pos" className="text-white hover:text-primary px-4 py-2 rounded-xl text-base font-medium transition-colors flex items-center gap-2">
                <CreditCardIcon className="h-6 w-6" />
                <span>POS</span>
              </Link>
            )}
            {/* Admin Dashboard Link */}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-white hover:text-primary px-4 py-2 rounded-xl text-base font-medium transition-colors">
                Admin Dashboard
              </Link>
            )}

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ minWidth: 100 }}
              title="Select currency"
            >
              {currencies.map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>

            {/* Cart Icon */}
            <Link to="/cart" className="relative group">
              <ShoppingCartIcon className="h-7 w-7 text-white group-hover:text-primary transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow-soft">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Controls */}
            {!user ? (
              <>
                <Link to="/login" className="btn-primary px-5 py-2 text-base font-semibold rounded-xl ml-2">
                  Login
                </Link>
                <Link to="/register" className="btn-secondary px-5 py-2 text-base font-semibold rounded-xl ml-2">
                  Register
                </Link>
              </>
            ) : (
              <div className="relative group ml-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-white hover:text-primary font-medium focus:outline-none">
                  <UserIcon className="h-6 w-6" />
                  <span className="hidden md:inline">{user.name?.split(' ')[0] || 'Account'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-surface border border-gray-100 rounded-xl shadow-strong z-20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity">
                  <Link to="/profile" className="block px-4 py-2 text-white hover:bg-gray-50 rounded-t-xl">Profile</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 rounded-b-xl">Logout</button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            {/* Mobile menu toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-white hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-7 w-7" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-7 w-7" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-surface shadow-lg`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Products
          </Link>
          {user && (
            <Link
              to="/messages"
              className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-gray-100 flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <span>Messages</span>
            </Link>
          )}
          {user && posRoles.includes(user.role) && (
            <Link
              to="/pos"
              className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-gray-100 flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CreditCardIcon className="h-6 w-6" />
              <span>POS</span>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}
          <div className="border-t border-gray-100 pt-2">
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="block w-full border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ minWidth: 100 }}
              title="Select currency"
            >
              {currencies.map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
          <Link
            to="/cart"
            className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-gray-100 flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ShoppingCartIcon className="h-6 w-6" />
            <span>Cart ({cartItemCount})</span>
          </Link>
          {!user ? (
            <div className="pt-2">
              <Link
                to="/login"
                className="block w-full text-center btn-primary px-3 py-2 rounded-xl text-base font-medium mb-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full text-center btn-secondary px-3 py-2 rounded-xl text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="pt-2">
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-xl text-base font-medium text-white hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, ShoppingBagIcon, UserIcon, Bars3Icon, XMarkIcon, ChatBubbleLeftRightIcon, CreditCardIcon, Squares2X2Icon, HomeIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon, UserPlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
// import categories from '../utils/categories';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { io } from 'socket.io-client';
import axios from 'axios';

const Navbar = () => {
  // ...existing hooks
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);
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
    <nav className="bg-blue-900 shadow-2xl sticky top-0 z-50 border-b border-yellow-400 transition-colors duration-300">
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
          <div className="hidden md:flex items-center space-x-6">
            {/* Home Icon */}
            <Link
              to="/"
              className="text-white hover:text-primary p-2 rounded-xl transition-colors flex items-center justify-center"
              title="Home"
            >
              <HomeIcon className="h-7 w-7" />
            </Link>
            {/* Products Icon */}
            <Link
              to="/products"
              className="text-white hover:text-primary p-2 rounded-xl transition-colors flex items-center justify-center"
              title="Products"
            >
              <ShoppingBagIcon className="h-7 w-7" />
            </Link>
            {/* Categories Dropdown */}
            <div className="relative group">
              <button
                className="text-yellow-400 hover:text-yellow-300 bg-blue-800 hover:bg-blue-700 p-2 rounded-xl transition-colors flex items-center justify-center focus:outline-none border border-blue-700 shadow"
                title="Categories"
                aria-haspopup="true"
                aria-expanded="false"
                tabIndex={0}
              >
                <Squares2X2Icon className="h-7 w-7" />
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white border border-blue-200 rounded-xl shadow-lg z-40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity max-h-80 overflow-y-auto">
                {categories.map(cat =>
  cat.subcategories ? (
    <div key={cat.id} className="group relative">
      <button
        className="flex justify-between items-center w-full px-4 py-2 text-gray-900 hover:bg-blue-100 hover:text-blue-800 focus:bg-yellow-100 focus:text-yellow-700 rounded-xl text-sm transition-colors"
        type="button"
      >
        <span>{cat.name}</span>
        <svg className="ml-2 h-4 w-4 text-gray-400 group-hover:text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
      <div className="absolute left-full top-0 mt-0 ml-1 w-52 bg-white border border-blue-200 rounded-xl shadow-lg z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity max-h-80 overflow-y-auto">
        {cat.subcategories.map(sub => (
          <Link
            key={sub.id}
            to={`/products?category=${encodeURIComponent(cat.id)}&subcategory=${encodeURIComponent(sub.id)}`}
            className="block px-4 py-2 text-gray-900 hover:bg-blue-100 hover:text-blue-800 focus:bg-yellow-100 focus:text-yellow-700 rounded-xl text-sm transition-colors"
          >
            {sub.name}
          </Link>
        ))}
      </div>
    </div>
  ) : (
    <Link
      key={cat.id}
      to={cat.id === 'all' ? '/products' : `/products?category=${encodeURIComponent(cat.id)}`}
      className="block px-4 py-2 text-gray-900 hover:bg-blue-100 hover:text-blue-800 focus:bg-yellow-100 focus:text-yellow-700 rounded-xl text-sm transition-colors"
    >
      {cat.name}
    </Link>
  )
)}
              </div>
            </div>
            {/* Messages Icon */}
            {user && (
              <Link to="/messages" className="text-white hover:text-primary p-2 rounded-xl transition-colors flex items-center justify-center" title="Messages">
                <ChatBubbleLeftRightIcon className="h-7 w-7" />
              </Link>
            )}
            {/* POS Icon */}
            {user && posRoles.includes(user.role) && (
              <Link to="/pos" className="text-white hover:text-primary p-2 rounded-xl transition-colors flex items-center justify-center" title="POS">
                <CreditCardIcon className="h-7 w-7" />
              </Link>
            )}
            {/* Admin Dashboard Icon */}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-white hover:text-primary p-2 rounded-xl transition-colors flex items-center justify-center" title="Admin Dashboard">
                <Cog6ToothIcon className="h-7 w-7" />
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
            <Link to="/cart" className="relative group" title="Cart">
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
                <Link to="/login" className="text-white hover:text-primary p-2 rounded-xl transition-colors flex items-center justify-center" title="Login">
                  <ArrowRightOnRectangleIcon className="h-7 w-7" />
                </Link>
                <Link to="/register" className="text-white hover:text-primary p-2 rounded-xl transition-colors flex items-center justify-center" title="Register">
                  <UserPlusIcon className="h-7 w-7" />
                </Link>
              </>
            ) : (
              <div className="relative group ml-2">
                <button className="flex items-center gap-2 p-2 rounded-xl text-white hover:text-primary focus:outline-none" title="Account">
                  <UserIcon className="h-7 w-7" />
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
          {/* Home Icon */}
          <Link
            to="/"
            className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(false)}
            title="Home"
          >
            <HomeIcon className="h-7 w-7" />
          </Link>
          {/* Products Icon */}
          <Link
            to="/products"
            className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(false)}
            title="Products"
          >
            <ShoppingBagIcon className="h-7 w-7" />
          </Link>
          {/* Categories Dropdown */}
          <div className="relative group">
            <button
              className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center w-full"
              title="Categories"
              aria-haspopup="true"
              aria-expanded="false"
              tabIndex={0}
              onClick={e => {
                e.stopPropagation();
                setShowCategoryMenu(m => !m);
              }}
            >
              <Squares2X2Icon className="h-7 w-7" />
            </button>
            {showCategoryMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-surface border border-gray-100 rounded-xl shadow-strong z-40">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={cat.id === 'all' ? '/products' : `/products?category=${encodeURIComponent(cat.id)}`}
                    className="block px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-primary/10 hover:text-primary rounded-xl text-sm"
                    onClick={() => { setIsMobileMenuOpen(false); setShowCategoryMenu(false); }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {user && (
            <Link
              to="/messages"
              className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
              title="Messages"
            >
              <ChatBubbleLeftRightIcon className="h-7 w-7" />
            </Link>
          )}
          {user && posRoles.includes(user.role) && (
            <Link
              to="/pos"
              className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
              title="POS"
            >
              <CreditCardIcon className="h-7 w-7" />
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
              title="Admin Dashboard"
            >
              <Cog6ToothIcon className="h-7 w-7" />
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
            className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center relative"
            onClick={() => setIsMobileMenuOpen(false)}
            title="Cart"
          >
            <ShoppingCartIcon className="h-7 w-7" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow-soft">
                {cartItemCount}
              </span>
            )}
          </Link>
          {!user ? (
            <div className="pt-2 flex gap-2">
              <Link
                to="/login"
                className="block w-full text-center text-white hover:text-primary px-3 py-2 rounded-xl flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
                title="Login"
              >
                <ArrowRightOnRectangleIcon className="h-7 w-7 mx-auto" />
              </Link>
              <Link
                to="/register"
                className="block w-full text-center text-white hover:text-primary px-3 py-2 rounded-xl flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
                title="Register"
              >
                <UserPlusIcon className="h-7 w-7 mx-auto" />
              </Link>
            </div>
          ) : (
            <div className="pt-2 flex gap-2">
              <Link
                to="/profile"
                className="block w-full text-center text-white hover:text-primary px-3 py-2 rounded-xl flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
                title="Profile"
              >
                <UserIcon className="h-7 w-7 mx-auto" />
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-center px-3 py-2 rounded-xl text-red-600 hover:text-primary flex items-center justify-center"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="h-7 w-7 mx-auto" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
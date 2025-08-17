import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import CategoryDropdown from './CategoryDropdown';
import MobileMenu from './MobileMenu';
import SmartNotificationSystem from './SmartNotificationSystem';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  UserIcon,
  HeartIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { 
  MagnifyingGlassIcon as MagnifyingGlassSolid,
  ShoppingCartIcon as ShoppingCartSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const categoryMenuRef = useRef(null);
  const categoryButtonRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [currencies, setCurrencies] = useState([
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' }
  ]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, logout } = useAuth();
  const { cart, currency, setCurrency } = useCart();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Category menu hover management
  const handleCategoryMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowCategoryMenu(true);
  };

  const handleCategoryMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowCategoryMenu(false);
    }, 150);
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        const categoriesData = response.data;
        
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategoriesList(categoriesData);
        } else {
          setCategoriesList([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesList([]);
      }
    };
    fetchCategories();
  }, []);

  // Load currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get('/payment/currency/list');
        const currencyData = response.data;
        
        // Ensure we have a valid array of currencies
        if (Array.isArray(currencyData) && currencyData.length > 0) {
          setCurrencies(currencyData);
        }
        // If no valid data, keep the default currencies
      } catch (error) {
        console.error('Error fetching currencies:', error);
        // Keep the default currencies on error
      }
    };
    fetchCurrencies();
  }, []);

  // Search functionality
  const handleSearch = async (term) => {
    if (term.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
              const response = await axios.get(`/products/search?q=${encodeURIComponent(term)}&limit=5`);
      setSearchResults(response.data || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
      setSearchTerm('');
      setShowSearchResults(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        navigate('/');
      } else {
        console.error('Logout failed:', result.error);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout by clearing state and redirecting
      navigate('/');
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-surface/95 backdrop-blur-lg border-b border-border shadow-medium' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">LuxeCart</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={handleCategoryMouseEnter}
                onMouseLeave={handleCategoryMouseLeave}
                className="flex items-center space-x-1 text-text-secondary hover:text-primary transition-colors duration-200 font-medium"
              >
                <span>Categories</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCategoryMenu && (
                <div
                  onMouseEnter={handleCategoryMouseEnter}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <CategoryDropdown 
                    show={showCategoryMenu}
                    categories={categoriesList}
                    onClose={() => setShowCategoryMenu(false)}
                    desktop={true}
                    loading={false}
                    error={false}
                  />
                </div>
              )}
            </div>

            {/* Admin Dashboard Link - Only for Admin Users */}
            {(user?.role === 'admin' || user?.role === 'shopkeeper' || user?.role === 'manager' || user?.role === 'warehouse_manager' || user?.role === 'store_manager') && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors duration-200 font-medium"
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* POS Link - Only for Shopkeepers and Warehouse Managers */}
            {(user?.role === 'shopkeeper' || user?.role === 'warehouse_manager' || user?.role === 'admin') && (
              <Link
                to="/pos"
                className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors duration-200 font-medium"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>POS System</span>
              </Link>
            )}

            {/* Search Bar */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="w-80 px-4 py-2 pl-10 pr-4 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-muted transition-all duration-300"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-text-muted hover:text-primary transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-large z-50">
                  {searchResults.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="flex items-center space-x-3 p-3 hover:bg-surface-hover transition-colors duration-200"
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchTerm('');
                      }}
                    >
                      <img
                        src={product.images?.[0] || '/placeholder-image.svg'}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{product.title}</p>
                        <p className="text-xs text-text-muted">${product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Currency Selector */}
            <div className="hidden md:block relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent border border-border rounded-lg px-3 py-1 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                {Array.isArray(currencies) && currencies.length > 0 ? (
                  currencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.code} - {curr.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="USD">$ USD - US Dollar</option>
                    <option value="EUR">€ EUR - Euro</option>
                    <option value="GBP">£ GBP - British Pound</option>
                    <option value="GMD">D GMD - Gambian Dalasi</option>
                  </>
                )}
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover hover:shadow-soft transition-all duration-300 group"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5 text-warning group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <MoonIcon className="w-5 h-5 text-text-secondary group-hover:scale-110 transition-transform duration-200" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover hover:shadow-soft transition-all duration-300 relative"
              >
                <BellIcon className="w-5 h-5 text-text-secondary" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-large z-50">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div key={index} className="p-3 border-b border-border last:border-b-0 hover:bg-surface-hover">
                          <p className="text-sm text-text-primary">{notification.message}</p>
                          <p className="text-xs text-text-muted mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-text-muted">
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover hover:shadow-soft transition-all duration-300 relative"
            >
              <HeartIcon className="w-5 h-5 text-text-secondary" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover hover:shadow-soft transition-all duration-300 relative"
            >
              <ShoppingCartIcon className="w-5 h-5 text-text-secondary" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Notification System */}
            <SmartNotificationSystem />

            {/* User Menu */}
            {user ? (
              <div className="relative user-menu">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover hover:shadow-soft transition-all duration-300"
                >
                  <UserIcon className="w-5 h-5 text-text-secondary" />
                  <span className="hidden md:block text-sm font-medium text-text-primary">
                    {user.name || user.email}
                  </span>
                  <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-large z-50">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-medium text-text-primary">{user.name || user.email}</p>
                      <p className="text-xs text-text-muted">{user.role || 'User'}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-surface-hover rounded-lg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-surface-hover rounded-lg transition-colors duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <ShoppingBagIcon className="w-4 h-4" />
                        <span>Orders</span>
                      </Link>
                      {(user.role === 'admin' || user.role === 'shopkeeper' || user.role === 'manager' || user.role === 'warehouse_manager' || user.role === 'store_manager') && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-surface-hover rounded-lg transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Cog6ToothIcon className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover hover:shadow-soft transition-all duration-300"
            >
              {showMobileMenu ? (
                <XMarkIcon className="w-5 h-5 text-text-secondary" />
              ) : (
                <Bars3Icon className="w-5 h-5 text-text-secondary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <MobileMenu 
          isOpen={showMobileMenu} 
          onClose={() => setShowMobileMenu(false)}
          user={user}
          handleLogout={handleLogout}
          cartItemCount={cartItemCount}
          currency={currency}
          currencies={currencies}
          handleCurrencyChange={(newCurrency) => setCurrency(newCurrency)}
          categories={categoriesList}
        />
      )}
    </nav>
  );
};

export default Navbar;
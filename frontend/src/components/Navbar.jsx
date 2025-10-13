import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { debounce, throttle } from '../utils/performance';

import CategoryDropdown from './CategoryDropdown';
import MobileMenu from './MobileMenu';
import BrandLogo from './BrandLogo';
import SmartNotificationSystem from './SmartNotificationSystem';
import EnhancedSearchBar from './EnhancedSearchBar';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  UserIcon,
  HeartIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
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
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const categoryMenuRef = useRef(null);
  const categoryButtonRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const [currencies] = useState([
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

  
  // Get wishlist count from localStorage
  const getWishlistCount = () => {
    if (!user) return 0;
    try {
      const stored = localStorage.getItem(`wishlist_${user._id}`);
      const items = stored ? JSON.parse(stored) : [];
      return items.length;
    } catch (error) {
      return 0;
    }
  };
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

  // Scroll effect with throttling
  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > 10);
    }, 16); // ~60fps
    
    window.addEventListener('scroll', handleScroll, { passive: true });
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

  // Close any open menus when route changes (tidier UX)
  useEffect(() => {
    setShowUserMenu(false);
    setShowNotifications(false);
    setShowCategoryMenu(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setShowMobileMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menus with Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowNotifications(false);
        setShowCategoryMenu(false);
        setShowMobileMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
      if (showCategoryMenu && !event.target.closest('.category-menu')) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showCategoryMenu]);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
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
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Currencies are now static to avoid API issues

  // Search functionality with debouncing
  const debouncedSearch = useCallback(
    debounce(async (term) => {
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
    }, 300),
    []
  );

  const handleSearch = (term) => {
    debouncedSearch(term);
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
        ? 'bg-white border-b border-slate-200 shadow-lg' 
        : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          
          {/* Logo and Mobile Categories */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <BrandLogo size="md" variant="full" />
            
            {/* Mobile Categories Button */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden flex items-center space-x-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span className="hidden sm:block">Categories</span>
            </button>
            
            {/* Medium Screen Categories Dropdown */}
            <div className="hidden md:block lg:hidden relative category-menu">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="flex items-center space-x-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
              >
                <Squares2X2Icon className="w-4 h-4" />
                <span>Categories</span>
                <svg className={`w-3 h-3 transition-transform duration-200 ${showCategoryMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCategoryMenu && (
                <CategoryDropdown 
                  show={showCategoryMenu}
                  categories={categoriesList}
                  onClose={() => setShowCategoryMenu(false)}
                  desktop={false}
                  loading={loadingCategories}
                  error={false}
                />
              )}
            </div>
          </div>

          {/* Center Section - Categories and Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
            
            {/* Categories Dropdown - More Prominent */}
            <div className="relative mr-4 category-menu">
              <button
                onMouseEnter={handleCategoryMouseEnter}
                onMouseLeave={handleCategoryMouseLeave}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                <Squares2X2Icon className="w-5 h-5" />
                <span>Categories</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${showCategoryMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    loading={loadingCategories}
                    error={false}
                  />
                </div>
              )}
            </div>

            {/* Enhanced Search Bar */}
            <EnhancedSearchBar className="flex-1 max-w-2xl" />

          </div>

          {/* Desktop Admin Links */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Admin Dashboard Link - Only for Admin Users */}
            {(user?.role === 'admin' || user?.role === 'shopkeeper' || user?.role === 'manager' || user?.role === 'warehouse_manager' || user?.role === 'store_manager') && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                <Cog6ToothIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">Admin</span>
              </Link>
            )}

            {/* POS Link - Only for Shopkeepers and Warehouse Managers */}
            {(user?.role === 'shopkeeper' || user?.role === 'warehouse_manager' || user?.role === 'admin') && (
              <Link
                to="/pos"
                className="flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">POS</span>
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Currency Selector */}
            <div className="hidden xl:block relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-slate-300"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
            </div>



            {/* Notifications */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 relative touch-target"
              >
                <BellIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
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
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 relative touch-target"
            >
              <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              {getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {getWishlistCount()}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 relative touch-target"
            >
              <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative user-menu">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 touch-target"
                >
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  <span className="hidden lg:block text-sm font-medium text-slate-700 max-w-24 truncate">
                    {user.name || user.email}
                  </span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        to="/profile#orders"
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
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold text-sm touch-target"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:block">Login</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 touch-target"
            >
              {showMobileMenu ? (
                <XMarkIcon className="w-5 h-5 text-slate-600" />
              ) : (
                <Bars3Icon className="w-5 h-5 text-slate-600" />
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
          
          onSearchClick={() => setShowSearch(true)}
          onNotificationsClick={() => setShowNotifications(true)}
          wishlistCount={getWishlistCount()}
        />
      )}
    </nav>
  );
};

export default Navbar;
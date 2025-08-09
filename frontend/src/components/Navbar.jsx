import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, ShoppingBagIcon, UserIcon, Bars3Icon, XMarkIcon, ChatBubbleLeftRightIcon, CreditCardIcon, Squares2X2Icon, HomeIcon, ArrowRightOnRectangleIcon, UserPlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Input, Select, Badge, Button } from 'antd';
import categoriesFallback from '../utils/categories';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const CategoryDropdown = React.lazy(() => import('./CategoryDropdown'));
const MobileMenu = React.lazy(() => import('./MobileMenu'));

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, currency, setCurrency } = useCart();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setShowCategoryMenu(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency && savedCurrency !== currency) {
      setCurrency(savedCurrency);
    }
  }, [currency, setCurrency]);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const [currencies, setCurrencies] = useState(['USD']);
  const [categoriesList, setCategoriesList] = useState(categoriesFallback);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await axios.get('/categories');
        const list = Array.isArray(res.data)
          ? res.data
          : (Array.isArray(res.data?.categories) ? res.data.categories : []);
        const mapped = list.map((c) => ({ id: c.id || c._id || c.name, name: c.name, subcategories: c.subcategories || [] }));
        if (!cancelled && mapped.length) setCategoriesList(mapped);
      } catch (e) {
        if (!cancelled) setCategoriesError('Failed to load categories');
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    };
    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }
    if (socketRef.current) return;
    let mounted = true;
    import('socket.io-client').then(({ io }) => {
      if (!mounted) return;
      const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://myshop-hhfv.onrender.com', {
        withCredentials: true,
        transports: ['websocket'],
      });
      socketRef.current = socket;
      socket.on('online_users', (users) => {
        setOnlineUsers(users);
      });
      socket.emit('get_online_users');
    });
    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    if (currencies.length > 1) return;
    axios.get('/payment/currency/list')
      .then(res => setCurrencies(res.data.currencies))
      .catch(() => setCurrencies(['USD']));
  }, [currencies]);

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
    localStorage.setItem('currency', e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onSearch = (value) => {
    const query = value?.trim();
    if (!query) {
      navigate('/products');
      return;
    }
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const cartItemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const posRoles = ['admin', 'shopkeeper', 'staff', 'cashier', 'manager'];

  const categoryProps = useMemo(() => ({
    categories: categoriesList,
    onClose: () => setShowCategoryMenu(false),
    show: showCategoryMenu,
    loading: loadingCategories,
    error: categoriesError,
  }), [categoriesList, showCategoryMenu, loadingCategories, categoriesError]);

  return (
    <>
            <nav className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16 w-full">
            {/* Left: Logo and Category */}
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 md:gap-3 min-w-0">
                <img src="/images/logo-footer.svg" alt="MyShopping Center official logo" className="h-10 w-10 rounded-xl bg-white" aria-label="MyShopping Center Logo" />
                <span className="hidden sm:inline font-heading text-xl sm:text-2xl font-bold text-secondary">MyShopping Center</span>
              </Link>
              {/* Category Button */}
              <div className="relative hidden md:block">
                <button
                  className="text-secondary hover:text-primary bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors flex items-center justify-center focus:outline-none border border-gray-200"
                  title="Categories"
                  aria-haspopup="true"
                  aria-expanded={showCategoryMenu}
                  tabIndex={0}
                  onClick={() => setShowCategoryMenu(v => !v)}
                >
                  <Squares2X2Icon className="h-6 w-6" />
                </button>
                <Suspense fallback={<div>Loading...</div>}>
                  {showCategoryMenu && (
                    <CategoryDropdown {...categoryProps} desktop id="category-menu-id" role="menu" />
                  )}
                </Suspense>
              </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 hidden md:block">
              <Input.Search
                placeholder="Search products, suppliers and more"
                allowClear
                size="large"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={onSearch}
                enterButton
              />
            </div>

            {/* Right: Icons and User Controls (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/" className="text-secondary hover:text-primary p-2 rounded-lg transition-colors" title="Home">
                <HomeIcon className="h-6 w-6" />
              </Link>
              <Link to="/products" className="text-secondary hover:text-primary p-2 rounded-lg transition-colors" title="Products">
                <ShoppingBagIcon className="h-6 w-6" />
              </Link>
              {user && (
                <Link to="/messages" className="text-secondary hover:text-primary p-2 rounded-lg transition-colors" title="Messages">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </Link>
              )}
              {user && posRoles.includes(user.role) && (
                <Link to="/pos" className="text-secondary hover:text-primary p-2 rounded-lg transition-colors" title="POS">
                  <CreditCardIcon className="h-6 w-6" />
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-secondary hover:text-primary p-2 rounded-lg transition-colors" title="Admin Dashboard">
                  <Cog6ToothIcon className="h-6 w-6" />
                </Link>
              )}
              <Select
                value={currency}
                onChange={(value) => handleCurrencyChange({ target: { value } })}
                size="middle"
                style={{ minWidth: 100 }}
                options={currencies.map(cur => ({ value: cur, label: cur }))}
              />
              <Link to="/cart" title="Cart">
                <Badge count={cartItemCount} size="small" color="#ff6600">
                  <ShoppingCartIcon className="h-6 w-6 text-secondary hover:text-primary transition-colors" />
                </Badge>
              </Link>
              {!user ? (
                <div className="flex items-center gap-2">
                  <Link to="/login" title="Login">
                    <Button type="text" className="text-secondary hover:text-primary p-2">
                      <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    </Button>
                  </Link>
                  <Link to="/register" title="Register">
                    <Button type="primary" className="rounded-lg">Sign up</Button>
                  </Link>
                </div>
              ) : (
                <div className="relative group ml-2">
                  <button className="flex items-center gap-2 p-2 rounded-lg text-secondary hover:text-primary focus:outline-none" title="Account">
                    <UserIcon className="h-6 w-6" />
                  </button>
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity">
                    <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-t-xl">Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-xl">Logout</button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="flex md:hidden items-center ml-auto">
              <Link to="/cart" className="relative group mr-2" title="Cart">
                <Badge count={cartItemCount} size="small" color="#ff6600">
                  <ShoppingCartIcon className="h-6 w-6 text-secondary" />
                </Badge>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <Input.Search
              placeholder="Search products"
              allowClear
              size="middle"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={onSearch}
              enterButton
            />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <Suspense fallback={<div>Loading...</div>}>
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          user={user}
          handleLogout={handleLogout}
          cartItemCount={cartItemCount}
          currency={currency}
          currencies={currencies}
          handleCurrencyChange={handleCurrencyChange}
          posRoles={posRoles}
        />
      </Suspense>
    </>
  );
};

export default Navbar;
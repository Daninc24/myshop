import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, ShoppingBagIcon, UserIcon, Bars3Icon, XMarkIcon, ChatBubbleLeftRightIcon, CreditCardIcon, Squares2X2Icon, HomeIcon, ArrowRightOnRectangleIcon, UserPlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import categories from '../utils/categories';
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

  const cartItemCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);

  const posRoles = ['admin', 'shopkeeper', 'staff', 'cashier', 'manager'];

  const categoryProps = useMemo(() => ({
    categories,
    onClose: () => setShowCategoryMenu(false),
    show: showCategoryMenu,
    loading: false,
    error: null,
  }), [categories, showCategoryMenu]);

  return (
    <>
            <nav className="bg-gradient-to-r from-blue-700 via-purple-700 to-yellow-400 shadow-2xl sticky top-0 z-50 border-b border-yellow-300 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 w-full">
            {/* Left: Logo and Category */}
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 md:gap-3 min-w-0">
                <img src="/images/logo-footer.svg" alt="MyShopping Center official logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white shadow-lg p-1" aria-label="MyShopping Center Logo" />
                <span className="hidden sm:inline font-heading text-xl sm:text-2xl font-bold text-yellow-400 drop-shadow">MyShopping Center</span>
              </Link>
              {/* Category Button */}
              <div className="relative">
                <button
                  className="text-yellow-400 hover:text-yellow-300 bg-blue-800 hover:bg-blue-700 p-2 rounded-xl transition-colors flex items-center justify-center focus:outline-none border border-blue-700 shadow"
                  title="Categories"
                  aria-haspopup="true"
                  aria-expanded={showCategoryMenu}
                  tabIndex={0}
                  onClick={() => setShowCategoryMenu(v => !v)}
                >
                  <Squares2X2Icon className="h-7 w-7" />
                </button>
              </div>
              <Suspense fallback={<div>Loading...</div>}>
                {showCategoryMenu && (
                  <CategoryDropdown {...categoryProps} desktop id="category-menu-id" role="menu" />
                )}
              </Suspense>
            </div>

            {/* Right: Icons and User Controls (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
               <Link to="/" className="text-white hover:text-primary p-2 rounded-xl transition-colors" title="Home">
                <HomeIcon className="h-7 w-7" />
              </Link>
              <Link to="/products" className="text-white hover:text-primary p-2 rounded-xl transition-colors" title="Products">
                <ShoppingBagIcon className="h-7 w-7" />
              </Link>
              {user && (
                <Link to="/messages" className="text-white hover:text-primary p-2 rounded-xl transition-colors" title="Messages">
                  <ChatBubbleLeftRightIcon className="h-7 w-7" />
                </Link>
              )}
              {user && posRoles.includes(user.role) && (
                <Link to="/pos" className="text-white hover:text-primary p-2 rounded-xl transition-colors" title="POS">
                  <CreditCardIcon className="h-7 w-7" />
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-white hover:text-primary p-2 rounded-xl transition-colors" title="Admin Dashboard">
                  <Cog6ToothIcon className="h-7 w-7" />
                </Link>
              )}
              <select
                value={currency}
                onChange={handleCurrencyChange}
                className="border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary bg-blue-900 text-yellow-400"
                style={{ minWidth: 100 }}
                title="Select currency"
              >
                {currencies.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
              <Link to="/cart" className="relative group" title="Cart">
                <ShoppingCartIcon className="h-7 w-7 text-white group-hover:text-primary transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow-soft">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              {!user ? (
                <>
                  <Link to="/login" className="text-white hover:text-primary p-2 rounded-xl transition-colors" title="Login">
                    <ArrowRightOnRectangleIcon className="h-7 w-7" />
                  </Link>
                  <Link to="/register" className="text-white hover:text-primary p-2 rounded-xl transition-colors" title="Register">
                    <UserPlusIcon className="h-7 w-7" />
                  </Link>
                </>
              ) : (
                <div className="relative group ml-2">
                  <button className="flex items-center gap-2 p-2 rounded-xl text-white hover:text-primary focus:outline-none" title="Account">
                    <UserIcon className="h-7 w-7" />
                  </button>
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity">
                    <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-t-xl">Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-b-xl">Logout</button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
               {/* Cart Icon for mobile */}
              <Link to="/cart" className="relative group mr-2" title="Cart">
                <ShoppingCartIcon className="h-7 w-7 text-white group-hover:text-primary transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow-soft">
                    {cartItemCount}
                  </span>
                )}
              </Link>
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
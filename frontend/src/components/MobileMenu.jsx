import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCartIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserPlusIcon,
  HomeIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  HeartIcon,
  MagnifyingGlassIcon,
  BellIcon,

  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const MobileMenu = ({
  isOpen,
  onClose,
  user,
  handleLogout,
  cartItemCount,
  currency,
  currencies,
  handleCurrencyChange,
  posRoles,
  categories = [],

  onSearchClick,
  onNotificationsClick,
  wishlistCount = 0
}) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!isOpen) {
    return null;
  }

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to products with search term
      window.location.href = `/products?search=${encodeURIComponent(searchTerm.trim())}`;
      onClose();
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 w-[280px] sm:w-80 h-full bg-gradient-to-b from-blue-900 to-blue-800 shadow-2xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex justify-between items-center p-6 border-b border-blue-700">
        <h2 className="text-2xl font-bold text-yellow-400">Menu</h2>
        <button onClick={onClose} className="text-white hover:text-yellow-400 transition-colors">
          <XMarkIcon className="h-8 w-8" />
        </button>
      </div>
      
      <div className="p-4 space-y-3 overflow-y-auto h-[calc(100vh-80px)]">
        {/* Search Bar */}
        <div className="mb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 pr-4 bg-blue-800 border border-blue-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-blue-300 transition-all duration-300"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-300 hover:text-yellow-400 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>

        {/* Currency Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-blue-200 mb-2">Currency</label>
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="w-full px-4 py-3 bg-blue-800 border border-blue-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white transition-all duration-300"
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code} className="bg-blue-800 text-white">
                {curr.symbol} {curr.code} - {curr.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {/* Home */}
          <Link
            to="/"
            className="flex flex-col items-center p-3 rounded-xl text-white hover:bg-blue-700/50 transition-all duration-200"
            onClick={onClose}
            title="Home"
          >
            <HomeIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">Home</span>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="flex flex-col items-center p-3 rounded-xl text-white hover:bg-blue-700/50 transition-all duration-200 relative"
            onClick={onClose}
            title="Wishlist"
          >
            <HeartIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="flex flex-col items-center p-3 rounded-xl text-white hover:bg-blue-700/50 transition-all duration-200 relative"
            onClick={onClose}
            title="Cart"
          >
            <ShoppingCartIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-blue-900 text-xs rounded-full px-1.5 py-0.5 font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <button
            onClick={() => {
              if (onNotificationsClick) onNotificationsClick();
              onClose();
            }}
            className="flex flex-col items-center p-3 rounded-xl text-white hover:bg-blue-700/50 transition-all duration-200 relative"
            title="Notifications"
          >
            <BellIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">Alerts</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>



        {/* Categories Section */}
        <div className="border-t border-blue-700 pt-4">
          <div className="flex items-center gap-3 px-4 py-2 mb-3">
            <Squares2X2Icon className="h-6 w-6 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-lg">Categories</span>
          </div>
          
          {categories.filter(c => c.id !== 'all').map(category => (
            <div key={category.id} className="mb-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-3 rounded-xl text-white hover:bg-blue-700/50 flex items-center justify-between transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">
                    {category.name.charAt(0)}
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {category.subcategories && category.subcategories.length > 0 && (
                    <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full">
                      {category.subcategories.length}
                    </span>
                  )}
                  {category.subcategories && category.subcategories.length > 0 && (
                    expandedCategories.has(category.id) ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )
                  )}
                </div>
              </button>
              
              {/* Subcategories */}
              {expandedCategories.has(category.id) && category.subcategories && category.subcategories.length > 0 && (
                <div className="ml-8 mt-2 space-y-1">
                  {category.subcategories.map(subcategory => (
                    <Link
                      key={subcategory.id}
                      to={`/products?category=${category.id}&subcategory=${subcategory.id}`}
                      onClick={onClose}
                      className="block px-4 py-2 rounded-lg text-blue-200 hover:bg-blue-700/30 hover:text-white transition-all duration-200 flex items-center gap-3"
                    >
                      <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-xs font-bold">
                        {subcategory.name.charAt(0)}
                      </div>
                      <span className="text-sm">{subcategory.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Admin/Staff Links */}
        <div className="border-t border-blue-700 pt-4">
          <div className="flex items-center gap-3 px-4 py-2 mb-3">
            <Cog6ToothIcon className="h-6 w-6 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-lg">Admin Tools</span>
          </div>
          
          {user?.role === 'admin' && (
            <Link
              to="/messages"
              className="block px-4 py-3 rounded-xl text-white hover:bg-blue-700/50 flex items-center gap-3 transition-all duration-200"
              onClick={onClose}
              title="Messages"
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <span className="font-medium">Messages</span>
            </Link>
          )}
          
          {(user?.role === 'shopkeeper' || user?.role === 'warehouse_manager' || user?.role === 'admin') && (
            <Link
              to="/pos"
              className="block px-4 py-3 rounded-xl text-white hover:bg-blue-700/50 flex items-center gap-3 transition-all duration-200"
              onClick={onClose}
              title="POS System"
            >
              <CreditCardIcon className="h-6 w-6" />
              <span className="font-medium">POS System</span>
            </Link>
          )}
          
          {(user?.role === 'admin' || user?.role === 'shopkeeper' || user?.role === 'manager' || user?.role === 'warehouse_manager' || user?.role === 'store_manager') && (
            <Link
              to="/admin"
              className="block px-4 py-3 rounded-xl text-white hover:bg-blue-700/50 flex items-center gap-3 transition-all duration-200"
              onClick={onClose}
              title="Admin Dashboard"
            >
              <Cog6ToothIcon className="h-6 w-6" />
              <span className="font-medium">Admin Dashboard</span>
            </Link>
          )}
        </div>

        {/* Currency Selector */}
        <div className="border-t border-blue-700 pt-4">
          <div className="flex items-center gap-3 px-4 py-2 mb-3">
            <span className="text-yellow-400 font-semibold text-lg">Currency</span>
          </div>
          <select
            value={currency}
            onChange={handleCurrencyChange}
            className="block w-full border border-blue-600 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-blue-800 text-white"
            style={{ minWidth: 100 }}
            title="Select currency"
          >
            {currencies.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>

        {/* User Actions */}
        <div className="border-t border-blue-700 pt-4">
          <div className="flex items-center gap-3 px-4 py-2 mb-3">
            <UserIcon className="h-6 w-6 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-lg">Account</span>
          </div>
          
          {!user ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                className="block text-center text-white hover:text-yellow-400 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                onClick={onClose}
                title="Login"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="font-medium">Login</span>
              </Link>
              <Link
                to="/register"
                className="block text-center text-white hover:text-yellow-400 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                onClick={onClose}
                title="Register"
              >
                <UserPlusIcon className="h-5 w-5" />
                <span className="font-medium">Register</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/profile"
                className="block px-4 py-3 rounded-xl text-white hover:bg-blue-700/50 flex items-center gap-3 transition-all duration-200"
                onClick={onClose}
                title="Profile"
              >
                <UserIcon className="h-6 w-6" />
                <span className="font-medium">Profile</span>
              </Link>
              <Link
                to="/orders"
                className="block px-4 py-3 rounded-xl text-white hover:bg-blue-700/50 flex items-center gap-3 transition-all duration-200"
                onClick={onClose}
                title="Orders"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                <span className="font-medium">Orders</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
                className="block w-full text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 flex items-center gap-3 transition-all duration-200"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;

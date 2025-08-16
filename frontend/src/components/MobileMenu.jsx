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
  Squares2X2Icon
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
}) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
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

  return (
    <div
      className={`fixed top-0 left-0 w-80 h-full bg-gradient-to-b from-blue-900 to-blue-800 shadow-2xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex justify-between items-center p-6 border-b border-blue-700">
        <h2 className="text-2xl font-bold text-yellow-400">Menu</h2>
        <button onClick={onClose} className="text-white hover:text-yellow-400 transition-colors">
          <XMarkIcon className="h-8 w-8" />
        </button>
      </div>
      
      <div className="p-4 space-y-3 overflow-y-auto h-[calc(100vh-80px)]">
        {/* Home Link */}
        <Link
          to="/"
          className="block px-4 py-3 rounded-xl text-white hover:bg-blue-700/50 flex items-center gap-3 transition-all duration-200"
          onClick={onClose}
          title="Home"
        >
          <HomeIcon className="h-6 w-6" />
          <span className="font-medium">Home</span>
        </Link>

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
        {user?.role === 'admin' && (
          <Link
            to="/messages"
            className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center"
            onClick={onClose}
            title="Messages"
          >
            <ChatBubbleLeftRightIcon className="h-7 w-7" />
          </Link>
        )}
        {(user?.role === 'shopkeeper' || user?.role === 'warehouse_manager' || user?.role === 'admin') && (
          <Link
            to="/pos"
            className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center"
            onClick={onClose}
            title="POS System"
          >
            <CreditCardIcon className="h-7 w-7" />
          </Link>
        )}
        {(user?.role === 'admin' || user?.role === 'shopkeeper' || user?.role === 'manager' || user?.role === 'warehouse_manager' || user?.role === 'store_manager') && (
          <Link
            to="/admin"
            className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center"
            onClick={onClose}
            title="Admin Dashboard"
          >
            <Cog6ToothIcon className="h-7 w-7" />
          </Link>
        )}
        <div className="border-t border-gray-100 pt-2">
          <select
            value={currency}
            onChange={handleCurrencyChange}
            className="block w-full border border-gray-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary bg-blue-900 text-yellow-400"
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
          onClick={onClose}
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
              onClick={onClose}
              title="Login"
            >
              <ArrowRightOnRectangleIcon className="h-7 w-7 mx-auto" />
            </Link>
            <Link
              to="/register"
              className="block w-full text-center text-white hover:text-primary px-3 py-2 rounded-xl flex items-center justify-center"
              onClick={onClose}
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
              onClick={onClose}
              title="Profile"
            >
              <UserIcon className="h-7 w-7 mx-auto" />
            </Link>
            <button
              onClick={() => {
                handleLogout();
                onClose();
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
  );
};

export default MobileMenu;

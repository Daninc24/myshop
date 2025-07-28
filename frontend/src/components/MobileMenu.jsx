import React from 'react';
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
  XMarkIcon
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
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 w-64 h-full bg-blue-900 shadow-2xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-yellow-400">Menu</h2>
        <button onClick={onClose} className="text-white">
          <XMarkIcon className="h-7 w-7" />
        </button>
      </div>
      <div className="p-4 space-y-2">
        <Link
          to="/"
          className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center"
          onClick={onClose}
          title="Home"
        >
          <HomeIcon className="h-7 w-7" />
        </Link>
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
        {user && posRoles.includes(user.role) && (
          <Link
            to="/pos"
            className="block px-3 py-2 rounded-xl text-white hover:bg-primary/10 flex items-center justify-center"
            onClick={onClose}
            title="POS"
          >
            <CreditCardIcon className="h-7 w-7" />
          </Link>
        )}
        {user?.role === 'admin' && (
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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon, 
  HeartIcon, 
  UserIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const FloatingActionButton = ({ onSearchClick, onCategoriesClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();
  const { user } = useAuth();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    if (action === 'search' && onSearchClick) {
      onSearchClick();
    } else if (action === 'categories' && onCategoriesClick) {
      onCategoriesClick();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {/* Search Button */}
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              onClick={() => handleAction('search')}
              className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </motion.button>

            {/* Categories Button */}
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleAction('categories')}
              className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
            >
              <PlusIcon className="w-6 h-6" />
            </motion.button>

            {/* Wishlist Button */}
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              as={Link}
              to="/wishlist"
              className="flex items-center justify-center w-12 h-12 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-colors"
            >
              <HeartIcon className="w-6 h-6" />
            </motion.button>

            {/* Profile Button */}
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              as={Link}
              to={user ? "/profile" : "/login"}
              className="flex items-center justify-center w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-colors"
            >
              <UserIcon className="w-6 h-6" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <XMarkIcon className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="cart"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <ShoppingCartIcon className="w-7 h-7" />
              {cartItemCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;

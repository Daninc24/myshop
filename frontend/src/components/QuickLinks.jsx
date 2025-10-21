import React from 'react';
import { Link } from 'react-router-dom';

const QuickLinks = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-100 border-b border-gray-300 py-1 sm:py-2 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-center items-center gap-2 sm:gap-6">
          <span className="text-xs sm:text-sm font-medium text-gray-700 hidden xs:inline">Quick Links:</span>
          <div className="flex gap-2 sm:gap-4 md:gap-6 items-center overflow-x-auto scrollbar-hide">
            <Link 
              to="/" 
              className="text-xs sm:text-sm text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap px-1 sm:px-0"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-xs sm:text-sm text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap px-1 sm:px-0"
            >
              Products
            </Link>
            <Link 
              to="/about" 
              className="text-xs sm:text-sm text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap px-1 sm:px-0"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-xs sm:text-sm text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap px-1 sm:px-0"
            >
              Contact
            </Link>
            <Link 
              to="/faq" 
              className="text-xs sm:text-sm text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap px-1 sm:px-0"
            >
              FAQ
            </Link>
            <Link 
              to="/events" 
              className="text-xs sm:text-sm text-gray-700 hover:text-orange-500 transition-colors font-medium whitespace-nowrap px-1 sm:px-0"
            >
              Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickLinks;
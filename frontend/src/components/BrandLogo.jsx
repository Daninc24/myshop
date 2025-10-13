import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

const BrandLogo = ({ 
  size = 'md', 
  variant = 'full', 
  className = '',
  showTagline = true 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4 sm:w-6 sm:h-6',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl'
  };

  const taglineSizes = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  };

  if (variant === 'icon') {
    return (
      <Link to="/" className={`group ${className}`}>
        <div className={`bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 ${sizeClasses[size]}`}>
          <ShoppingBagIcon className={`text-white ${iconSizes[size]}`} />
        </div>
      </Link>
    );
  }

  return (
    <Link to="/" className={`flex items-center space-x-2 group ${className}`}>
      <div className={`bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 ${sizeClasses[size]}`}>
        <ShoppingBagIcon className={`text-white ${iconSizes[size]}`} />
      </div>
      {variant === 'full' && (
        <div className="flex flex-col">
          <span className={`font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${textSizes[size]}`}>
            LuxeCart
          </span>
          {showTagline && (
            <span className={`text-purple-600 font-medium hidden sm:block ${taglineSizes[size]}`}>
              Premium Shopping
            </span>
          )}
        </div>
      )}
      {variant === 'compact' && (
        <span className={`font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${textSizes[size]}`}>
          LuxeCart
        </span>
      )}
    </Link>
  );
};

export default BrandLogo;
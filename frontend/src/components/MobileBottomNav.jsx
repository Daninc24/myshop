import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  HeartIcon,
  ShoppingCartIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as MagnifyingGlassSolid,
  Squares2X2Icon as Squares2X2Solid,
  HeartIcon as HeartSolid,
  ShoppingCartIcon as ShoppingCartSolid,
  UserIcon as UserSolid
} from '@heroicons/react/24/solid';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { cart } = useCart();
  
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

  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const wishlistCount = getWishlistCount();

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: HomeIcon,
      activeIcon: HomeSolid,
      exact: true
    },
    {
      path: '/products',
      label: 'Search',
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassSolid,
      exact: false
    },
    {
      path: '/products',
      label: 'Categories',
      icon: Squares2X2Icon,
      activeIcon: Squares2X2Solid,
      exact: false,
      isCategory: true
    },
    {
      path: '/wishlist',
      label: 'Wishlist',
      icon: HeartIcon,
      activeIcon: HeartSolid,
      badge: wishlistCount,
      exact: true
    },
    {
      path: '/cart',
      label: 'Cart',
      icon: ShoppingCartIcon,
      activeIcon: ShoppingCartSolid,
      badge: cartItemCount,
      exact: true
    }
  ];

  // Don't show on certain pages
  const hiddenPaths = ['/login', '/register', '/checkout', '/admin'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));
  
  if (shouldHide) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden">
      <div className="grid grid-cols-5 py-1">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-1 relative transition-all duration-200 ${
                isActive 
                  ? 'text-brand-primary' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                isActive ? 'text-brand-primary' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-brand-gradient rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  );
};

export default MobileBottomNav;
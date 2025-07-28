import React from 'react';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import categories from '../utils/categories';

const CategoryDropdown = ({ onClose, show, desktop }) => {
  // Keyboard navigation: close on Escape
  React.useEffect(() => {
    if (!show) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show, onClose]);

  return (
    <div
      className={desktop
        ? 'fixed left-0 top-[64px] w-screen bg-white border-b border-blue-400 shadow-2xl z-[9999] transition-opacity max-h-[350px] overflow-y-auto rounded-none'
        : 'absolute right-0 mt-2 w-full bg-white border border-blue-400 rounded-xl shadow-2xl z-50 transition-opacity max-h-80 overflow-y-auto'}
      role="menu"
      aria-label="Categories"
      tabIndex={-1}
    >
      {categories.length === 0 && (
        <div className="px-4 py-2 text-gray-400">No categories</div>
      )}
      {categories.map(cat =>
        cat.subcategories && cat.subcategories.length > 0 ? (
          <div key={cat.id} className="group relative">
            <button
              className="flex justify-between items-center w-full px-4 py-2 text-gray-900 hover:bg-blue-100 hover:text-blue-800 focus:bg-yellow-100 focus:text-yellow-700 rounded-xl text-sm transition-colors"
              type="button"
              tabIndex={0}
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span>{cat.name}</span>
              <svg className="ml-2 h-4 w-4 text-gray-400 group-hover:text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {/* Subcategories flyout */}
            <div className="absolute left-full top-0 min-w-[180px] bg-white border border-blue-300 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50">
              {cat.subcategories.map(sub => (
                <Link
                  key={sub.id}
                  to={`/category/${cat.id}/${sub.id}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-800 rounded-xl text-sm"
                  tabIndex={0}
                  onClick={onClose}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="block px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-800 rounded-xl text-sm"
            tabIndex={0}
            onClick={onClose}
          >
            {cat.name}
          </Link>
        )
      )}
    </div>
  );
};

export default CategoryDropdown;

import React from 'react';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import categories from '../utils/categories';

const CategoryDropdown = ({
  show,
  categories,
  onClose,
  desktop,
  loading,
  error,
}) => {
  const [openCategoryId, setOpenCategoryId] = React.useState(null);

  const handleToggleSubcategories = (categoryId) => {
    setOpenCategoryId(prevId => (prevId === categoryId ? null : categoryId));
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`absolute z-50 ${desktop ? 'top-12' : 'top-0 left-0 w-full h-screen'} bg-white p-4 shadow-xl`}>
        <p className="text-gray-500 text-center">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`absolute z-50 ${desktop ? 'top-12' : 'top-0 left-0 w-full h-screen'} bg-white p-4 shadow-xl`}>
        <p className="text-red-500 text-center">Failed to load categories</p>
      </div>
    );
  }

  // Keyboard navigation: close on Escape
  React.useEffect(() => {
    if (!show) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show, onClose]);

  const renderDesktopMenu = () => (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5'>
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-6'>
        {categories.map(cat => (
          <div key={cat.id} className='space-y-3'>
            <Link
              to={`/category/${cat.id}`}
              onClick={onClose}
              className='font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-150 text-base border-b-2 border-transparent hover:border-blue-500 pb-1 inline-block'
            >
              {cat.name}
            </Link>
            {cat.subcategories && cat.subcategories.length > 0 && (
              <ul className='space-y-1.5'>
                {cat.subcategories.map(sub => (
                  <li key={sub.id}>
                    <Link
                      to={`/category/${cat.id}/${sub.id}`}
                      className='block text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md py-1.5 px-2 text-sm transition-colors duration-150'
                      onClick={onClose}
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMobileMenu = () => (
    <div className='p-2'>
      {categories.map(cat => (
        <div key={cat.id} className='mb-2'>
          {cat.subcategories && cat.subcategories.length > 0 ? (
            <button
              className='flex justify-between items-center w-full text-left font-semibold text-gray-900 hover:text-blue-600 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150'
              onClick={() => handleToggleSubcategories(cat.id)}
              aria-expanded={openCategoryId === cat.id}
            >
              <span>{cat.name}</span>
              <svg
                className={`ml-2 h-5 w-5 text-gray-500 transition-transform ${openCategoryId === cat.id ? 'rotate-90' : ''}`}
                fill='none' stroke='currentColor' viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
              </svg>
            </button>
          ) : (
            <Link
              to={`/category/${cat.id}`}
              onClick={onClose}
              className='block w-full text-left font-semibold text-gray-900 hover:text-blue-600 p-2 rounded-md hover:bg-gray-100 transition-colors duration-150'
            >
              {cat.name}
            </Link>
          )}
          {openCategoryId === cat.id && cat.subcategories && (
            <ul className='space-y-1.5 mt-2 pl-4 border-l-2 border-blue-200'>
              {cat.subcategories.map(sub => (
                <li key={sub.id}>
                  <Link
                    to={`/category/${cat.id}/${sub.id}`}
                    className='block text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md py-1.5 px-2 text-sm transition-colors duration-150'
                    onClick={onClose}
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`z-[9999] transition-opacity ${desktop
        ? 'fixed left-0 top-[64px] w-screen bg-white border-b border-gray-200 shadow-lg'
        : 'absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto'}`}
      role='menu'
      aria-label='Categories'
      tabIndex={-1}
    >
      {categories.length === 0 && (
        <div className='px-4 py-3 text-gray-500'>No categories</div>
      )}
      {desktop ? renderDesktopMenu() : renderMobileMenu()}
    </div>
  );
};

export default CategoryDropdown;

import React from 'react';
import { Squares2X2Icon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// Categories are provided by parent via props; util fallback removed to avoid stale data

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

  const renderDesktopMenu = () => {
    const effectiveCategories = (categories || []).filter(c => c && c.id !== 'all');
    const activeCategory = effectiveCategories.find(c => c && c.id === openCategoryId) || effectiveCategories[0];
    
    if (!activeCategory) {
      return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20'>
          <div className='text-center text-gray-500'>No categories available</div>
        </div>
      );
    }
    
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20'>
        <div className='flex gap-8 h-96'>
          {/* Left side - Categories list (scrollable) */}
          <div className='w-72 flex-shrink-0 border-r border-gray-200 pr-4'>
            <div className='mb-4'>
              <h3 className='text-lg font-bold text-gray-900 mb-2'>Categories</h3>
              <p className='text-sm text-gray-600'>Browse our product categories</p>
            </div>
            <div className='overflow-y-auto h-80 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400'>
              <ul className='space-y-2 pr-2'>
                {effectiveCategories.map(cat => (
                  <li key={cat.id}>
                    <button
                      onMouseEnter={() => setOpenCategoryId(cat.id)}
                      onFocus={() => setOpenCategoryId(cat.id)}
                      onClick={() => { onClose && onClose(); }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                        ((openCategoryId || effectiveCategories[0]?.id) === cat.id) 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                          : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:shadow-md'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                          ((openCategoryId || effectiveCategories[0]?.id) === cat.id)
                            ? 'bg-white/20 text-white'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 group-hover:from-orange-100 group-hover:to-red-100'
                        }`}>
                          {cat.name.charAt(0)}
                        </div>
                        <span className='font-medium'>{cat.name}</span>
                      </div>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          ((openCategoryId || effectiveCategories[0]?.id) === cat.id)
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {cat.subcategories.length}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Right side - Subcategories (fixed, no scroll) */}
          <div className='flex-1 flex flex-col'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <Link
                  to={`/products?category=${activeCategory.id}`}
                  className='font-heading text-2xl font-bold text-gray-900 hover:text-orange-600 transition-colors'
                  onClick={onClose}
                >
                  {activeCategory.name}
                </Link>
                <p className='text-sm text-gray-600 mt-1'>
                  {activeCategory.subcategories ? `${activeCategory.subcategories.length} subcategories` : 'No subcategories'}
                </p>
              </div>
              <Link
                to={`/products?category=${activeCategory.id}`}
                className='btn-primary text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all duration-200'
                onClick={onClose}
              >
                View all
                <ArrowRightIcon className='w-4 h-4' />
              </Link>
            </div>
            
            {/* Subcategories grid (fixed height, no scroll) */}
            <div className='flex-1 overflow-hidden min-h-0'>
              {activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-full max-h-80'>
                  {activeCategory.subcategories.map(sub => (
                    <Link
                      key={sub.id}
                      to={`/products?category=${activeCategory.id}&subcategory=${sub.id}`}
                      onClick={onClose}
                      className='group block p-4 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 text-sm text-gray-700 hover:text-orange-700 transition-all duration-200 transform hover:scale-105 hover:shadow-md'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center text-xs font-bold text-orange-700 group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-200'>
                          {sub.name.charAt(0)}
                        </div>
                        <span className='font-medium'>{sub.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className='text-gray-500 text-sm flex items-center justify-center h-full'>
                  No subcategories
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMobileMenu = () => (
    <div className='p-2'>
      {(categories || []).map(cat => (
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
      className={`z-[9999] transition-all duration-300 ease-in-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'} ${desktop
        ? 'absolute left-0 top-full w-screen bg-white border-b border-gray-200 shadow-lg'
        : 'absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto'}`}
      role='menu'
      aria-label='Categories'
      tabIndex={-1}
      style={desktop ? { maxHeight: '50vh', overflowY: 'auto' } : {}}
    >
      {categories.length === 0 && (
        <div className='px-4 py-3 text-gray-500'>No categories</div>
      )}
      {desktop ? renderDesktopMenu() : renderMobileMenu()}
    </div>
  );
};

export default CategoryDropdown;

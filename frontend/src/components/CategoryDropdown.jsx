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

  // Category icons mapping
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Electronics': '📱',
      'Fashion': '👕',
      'Home & Garden': '🏠',
      'Sports & Outdoors': '⚽',
      'Books & Media': '📚',
      'Health & Beauty': '💄',
      'Toys & Games': '🎮',
      'Automotive': '🚗',
      'Food & Beverages': '🍕',
      'Jewelry': '💎',
      'Pet Supplies': '🐕',
      'Office Supplies': '📝'
    };
    return icons[categoryName] || '🛍️';
  };

  const renderDesktopMenu = () => {
    const effectiveCategories = (categories || []).filter(c => c && c.name && c.name !== 'all');
    const activeCategory = effectiveCategories.find(c => c && c._id === openCategoryId) || effectiveCategories[0];
    
    if (!effectiveCategories.length) {
      return (
        <div className='max-w-7xl mx-auto px-6 py-8 bg-white'>
          <div className='text-center text-gray-500'>
            <div className='text-4xl mb-4'>🛍️</div>
            <p className='text-lg font-medium'>No categories available</p>
            <p className='text-sm text-gray-400 mt-2'>Categories will appear here once they are added</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className='max-w-7xl mx-auto bg-white'>
        <div className='flex'>
          {/* Left side - Categories list (Alibaba style) */}
          <div className='w-64 bg-gray-50 border-r border-gray-200'>
            <ul className='py-2'>
              {effectiveCategories.map(cat => (
                <li key={cat._id || cat.id}>
                  <Link
                    to={`/products?category=${cat.name}`}
                    onMouseEnter={() => setOpenCategoryId(cat._id || cat.id)}
                    onFocus={() => setOpenCategoryId(cat._id || cat.id)}
                    onClick={() => { onClose && onClose(); }}
                    className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                      (openCategoryId || effectiveCategories[0]?._id) === (cat._id || cat.id)
                        ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500'
                        : 'text-gray-700 hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-xl'>{getCategoryIcon(cat.name)}</span>
                      <span className='font-medium'>{cat.name}</span>
                    </div>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <ArrowRightIcon className='w-4 h-4 text-gray-400' />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right side - Category details and subcategories */}
          <div className='flex-1 flex flex-col'>
            {activeCategory ? (
              <>
                <div className='mb-6 flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center text-2xl shadow-lg'>
                      {getCategoryIcon(activeCategory.name)}
                    </div>
                    <div>
                      <Link
                        to={`/products?category=${activeCategory.name}`}
                        className='text-3xl font-bold text-gray-900 hover:text-orange-600 transition-colors duration-300'
                        onClick={onClose}
                      >
                        {activeCategory.name}
                      </Link>
                      <p className='text-sm text-gray-600 mt-1 flex items-center gap-2'>
                        <span>{activeCategory.productCount || 0} products available</span>
                        {activeCategory.subcategories && activeCategory.subcategories.length > 0 && (
                          <span>• {activeCategory.subcategories.length} subcategories</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/products?category=${activeCategory.name}`}
                    className='bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold'
                    onClick={onClose}
                  >
                    Explore All
                    <ArrowRightIcon className='w-5 h-5' />
                  </Link>
                </div>
                
                {/* Subcategories or featured products */}
                <div className='flex-1 overflow-hidden'>
                  {activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
                    <div className='flex-1 p-6'>
                      <div>
                        {/* Category Header */}
                        <div className='mb-6'>
                          <div className='flex items-center gap-3 mb-2'>
                            <span className='text-3xl'>{getCategoryIcon(activeCategory.name)}</span>
                            <h4 className='text-xl font-bold text-gray-900'>{activeCategory.name}</h4>
                          </div>
                          <Link
                            to={`/products?category=${activeCategory.name}`}
                            onClick={() => onClose && onClose()}
                            className='text-sm text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1'
                          >
                            View all in {activeCategory.name}
                            <ArrowRightIcon className='w-3 h-3' />
                          </Link>
                        </div>

                        {/* Subcategories Grid */}
                        <div className='grid grid-cols-4 gap-x-8 gap-y-4'>
                          {activeCategory.subcategories.map(sub => (
                            <Link
                              key={sub._id || sub.id}
                              to={`/products?category=${activeCategory.name}&subcategory=${sub.name}`}
                              onClick={() => onClose && onClose()}
                              className='group flex items-center gap-2 text-sm text-gray-700 hover:text-orange-600 transition-colors'
                            >
                              <span className='w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-orange-500 transition-colors'></span>
                              <span className='truncate'>{sub.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-12'>
                      <div className='text-6xl mb-4'>{getCategoryIcon(activeCategory.name)}</div>
                      <h4 className='text-xl font-semibold text-gray-900 mb-2'>Explore {activeCategory.name}</h4>
                      <p className='text-gray-600 mb-6'>Discover amazing products in this category</p>
                      <Link
                        to={`/products?category=${activeCategory.name}`}
                        className='inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold'
                        onClick={onClose}
                      >
                        Start Shopping
                        <ArrowRightIcon className='w-5 h-5' />
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='text-6xl mb-4'>🛍️</div>
                  <p className='text-gray-500'>Select a category to explore</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMobileMenu = () => (
    <div className='p-4 bg-indigo-50'>
      {(categories || []).map(cat => (
        <div key={cat.id} className='mb-3'>
          {cat.subcategories && cat.subcategories.length > 0 ? (
            <button
              className='flex justify-between items-center w-full text-left font-semibold text-indigo-900 hover:text-purple-700 p-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 shadow-sm hover:shadow-md'
              onClick={() => handleToggleSubcategories(cat.id)}
              aria-expanded={openCategoryId === cat.id}
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold'>
                  {cat.name.charAt(0)}
                </div>
                <span>{cat.name}</span>
              </div>
              <svg
                className={`ml-2 h-5 w-5 text-indigo-600 transition-transform ${openCategoryId === cat.id ? 'rotate-90' : ''}`}
                fill='none' stroke='currentColor' viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
              </svg>
            </button>
          ) : (
            <Link
              to={`/products?category=${cat.name}`}
              onClick={onClose}
              className='flex items-center gap-3 w-full text-left font-semibold text-indigo-900 hover:text-purple-700 p-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 shadow-sm hover:shadow-md'
            >
              <div className='w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold'>
                {cat.name.charAt(0)}
              </div>
              <span>{cat.name}</span>
            </Link>
          )}
          {openCategoryId === cat.id && cat.subcategories && (
            <ul className='space-y-2 mt-3 ml-11 pl-4 border-l-2 border-indigo-200'>
              {cat.subcategories.map(sub => (
                <li key={sub.id}>
                  <Link
                    to={`/products?category=${cat.name}&subcategory=${sub.name}`}
                    className='block text-indigo-700 hover:text-purple-700 hover:bg-indigo-50 rounded-md py-2 px-3 text-sm transition-all duration-200 font-medium'
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
        : 'absolute right-0 mt-2 w-72 bg-white border-2 border-indigo-300 rounded-xl shadow-2xl max-h-96 overflow-y-auto'}`}
      role='menu'
      aria-label='Categories'
      tabIndex={-1}
      style={desktop ? { maxHeight: '50vh', overflowY: 'auto', backgroundColor: '#ffffff' } : { backgroundColor: '#ffffff' }}
    >
      {categories.length === 0 && (
        <div className='px-4 py-3 text-gray-500'>No categories</div>
      )}
      {desktop ? renderDesktopMenu() : renderMobileMenu()}
    </div>
  );
};

export default CategoryDropdown;

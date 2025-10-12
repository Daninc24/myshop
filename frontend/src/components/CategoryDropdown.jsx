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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white/98 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20'>
          <div className='text-center text-gray-500'>
            <div className='text-4xl mb-4'>🛍️</div>
            <p className='text-lg font-medium'>No categories available</p>
            <p className='text-sm text-gray-400 mt-2'>Categories will appear here once they are added</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white/98 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20'>
        <div className='flex gap-8 min-h-[400px]'>
          {/* Left side - Categories list */}
          <div className='w-80 flex-shrink-0 border-r border-gray-200 pr-6'>
            <div className='mb-6'>
              <h3 className='text-xl font-bold text-gray-900 mb-2 flex items-center gap-2'>
                <Squares2X2Icon className='w-6 h-6 text-orange-500' />
                Shop by Category
              </h3>
              <p className='text-sm text-gray-600'>Discover products in every category</p>
            </div>
            <div className='overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400'>
              <ul className='space-y-2 pr-2'>
                {effectiveCategories.map(cat => (
                  <li key={cat._id || cat.id}>
                    <button
                      onMouseEnter={() => setOpenCategoryId(cat._id || cat.id)}
                      onFocus={() => setOpenCategoryId(cat._id || cat.id)}
                      onClick={() => { onClose && onClose(); }}
                      className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-300 flex items-center justify-between group ${
                        ((openCategoryId || effectiveCategories[0]?._id || effectiveCategories[0]?.id) === (cat._id || cat.id)) 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105' 
                          : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:shadow-md hover:scale-102'
                      }`}
                    >
                      <div className='flex items-center gap-4'>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                          ((openCategoryId || effectiveCategories[0]?._id || effectiveCategories[0]?.id) === (cat._id || cat.id))
                            ? 'bg-white/20 text-white shadow-inner'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 group-hover:from-orange-100 group-hover:to-red-100 group-hover:shadow-md'
                        }`}>
                          {getCategoryIcon(cat.name)}
                        </div>
                        <div>
                          <span className='font-semibold text-base'>{cat.name}</span>
                          {cat.productCount && (
                            <p className={`text-xs mt-1 ${
                              ((openCategoryId || effectiveCategories[0]?._id || effectiveCategories[0]?.id) === (cat._id || cat.id))
                                ? 'text-white/80'
                                : 'text-gray-500'
                            }`}>
                              {cat.productCount} products
                            </p>
                          )}
                        </div>
                      </div>
                      <ArrowRightIcon className={`w-5 h-5 transition-transform duration-300 ${
                        ((openCategoryId || effectiveCategories[0]?._id || effectiveCategories[0]?.id) === (cat._id || cat.id))
                          ? 'text-white transform rotate-90'
                          : 'text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1'
                      }`} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
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
                    <div>
                      <h4 className='text-lg font-semibold text-gray-900 mb-4'>Subcategories</h4>
                      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-72 overflow-y-auto'>
                        {activeCategory.subcategories.map(sub => (
                          <Link
                            key={sub._id || sub.id}
                            to={`/products?category=${activeCategory.name}&subcategory=${sub.name}`}
                            onClick={onClose}
                            className='group block p-4 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 text-sm text-gray-700 hover:text-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg'
                          >
                            <div className='flex flex-col items-center text-center gap-3'>
                              <div className='w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center text-lg font-bold text-orange-700 group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-300 shadow-md'>
                                {sub.name.charAt(0)}
                              </div>
                              <div>
                                <span className='font-semibold block'>{sub.name}</span>
                                {sub.productCount && (
                                  <span className='text-xs text-gray-500 mt-1 block'>{sub.productCount} items</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
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

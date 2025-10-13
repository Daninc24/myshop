import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Squares2X2Icon, ChevronDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const CategoryBar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories');
      const cats = Array.isArray(res.data) ? res.data : [];
      setCategories(cats.filter(c => c && c.name && c.name !== 'all'));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  // Show first 8 categories, rest in "More" dropdown
  const visibleCategories = categories.slice(0, 8);
  const moreCategories = categories.slice(8);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* All Categories Button with Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg">
              <Squares2X2Icon className="w-5 h-5" />
              <span className="hidden sm:inline">All Categories</span>
              <span className="sm:hidden">All</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {/* Mega Menu Dropdown */}
            <div className="absolute left-0 mt-2 w-screen max-w-4xl bg-white rounded-lg shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div key={category._id} className="space-y-2">
                      <Link
                        to={`/products?category=${category.name}`}
                        className="flex items-center gap-2 text-base font-bold text-gray-900 hover:text-orange-600 transition-colors"
                      >
                        <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                        <span>{category.name}</span>
                      </Link>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <ul className="ml-8 space-y-1">
                          {category.subcategories.slice(0, 5).map((sub) => (
                            <li key={sub._id || sub.id}>
                              <Link
                                to={`/products?category=${category.name}&subcategory=${sub.name}`}
                                className="text-sm text-gray-600 hover:text-orange-600 transition-colors flex items-center gap-2"
                              >
                                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                          {category.subcategories.length > 5 && (
                            <li>
                              <Link
                                to={`/products?category=${category.name}`}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                              >
                                View all ({category.subcategories.length})
                              </Link>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Browse All Products
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Category Links */}
          <div className="hidden md:flex items-center gap-1 flex-1 ml-4 overflow-x-auto scrollbar-hide">
            {visibleCategories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category.name}`}
                onMouseEnter={() => setHoveredCategory(category._id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  hoveredCategory === category._id
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{getCategoryIcon(category.name)}</span>
                <span>{category.name}</span>
              </Link>
            ))}

            {/* More Categories Dropdown */}
            {moreCategories.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200">
                  <span>More</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {moreCategories.map((category) => (
                      <Link
                        key={category._id}
                        to={`/products?category=${category.name}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <span className="text-lg">{getCategoryIcon(category.name)}</span>
                        <span>{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: Show count */}
          <div className="md:hidden text-sm text-gray-600 font-medium">
            {categories.length} Categories
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;

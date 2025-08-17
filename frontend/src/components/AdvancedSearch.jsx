import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '../hooks/useDebounce';

const AdvancedSearch = ({ onSearch, onFiltersChange, categories = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 10000],
    inStock: false,
    sortBy: 'relevance'
  });
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Mock suggestions based on search term
  const suggestions = [
    'wireless headphones',
    'smart watch',
    'laptop stand',
    'phone case',
    'usb cable'
  ].filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    if (debouncedSearchTerm) {
      onSearch(debouncedSearchTerm, filters);
    }
  }, [debouncedSearchTerm, filters, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      priceRange: [0, 10000],
      inStock: false,
      sortBy: 'relevance'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto" ref={searchRef}>
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search products, categories, or brands..."
              className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-4 text-gray-600 hover:text-gray-900 border-l border-gray-200"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              ref={suggestionsRef}
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{suggestion}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleFilterChange('category', filters.category === category ? '' : category)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        filters.category === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  </span>
                </div>
              </div>

              {/* Stock Filter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                  In stock only
                </label>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Sort By</h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">Searching...</span>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const AdvancedSearch = ({ onSearch, placeholder = "Search for products, brands, or categories..." }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    rating: '',
    availability: '',
    delivery: '',
    brand: '',
    sortBy: 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchInputRef = useRef();
  const suggestionsRef = useRef();

  // AI-powered search suggestions
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`/products/search/suggestions?q=${encodeURIComponent(searchTerm)}`);
      
      // AI-enhanced suggestions with categories and brands
      const enhancedSuggestions = response.data.suggestions?.map(suggestion => ({
        ...suggestion,
        type: suggestion.type || 'product',
        relevance: suggestion.relevance || 0.8,
        aiBoosted: suggestion.aiBoosted || false
      })) || [];

      setSuggestions(enhancedSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch trending searches
  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const response = await axios.get('/analytics/trending-searches');
        setTrendingSearches(response.data.trending || []);
      } catch (error) {
        console.error('Error fetching trending searches:', error);
      }
    };

    fetchTrendingSearches();
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, fetchSuggestions]);

  // Handle search submission
  const handleSearch = useCallback((searchQuery = query, searchFilters = filters) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Build search URL with filters
    const params = new URLSearchParams();
    params.append('search', searchQuery);
    
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    // Navigate to products page with search
    navigate(`/products?${params.toString()}`);
    
    // Close suggestions
    setShowSuggestions(false);
    setQuery('');
    
    // Call parent callback if provided
    if (onSearch) {
      onSearch(searchQuery, searchFilters);
    }
  }, [query, filters, recentSearches, navigate, onSearch]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text || suggestion.name);
    handleSearch(suggestion.text || suggestion.name, filters);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters and search
  const applyFilters = () => {
    handleSearch(query, filters);
    setShowFilters(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      rating: '',
      availability: '',
      delivery: '',
      brand: '',
      sortBy: 'relevance'
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowFilters(false);
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto" ref={suggestionsRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-400">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-12 pr-20 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white shadow-sm"
          />
          
          <div className="absolute right-2 flex items-center gap-2">
            {/* AI Search Indicator */}
            {query.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full"
              >
                <SparklesIcon className="h-3 w-3" />
                <span>AI</span>
              </motion.div>
            )}
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                Object.values(filters).some(v => v) 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            
            {/* Search Button */}
            <button
              onClick={() => handleSearch()}
              className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="beauty">Beauty & Health</option>
                  <option value="books">Books & Media</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Any Price</option>
                  <option value="0-1000">Under KES 1,000</option>
                  <option value="1000-5000">KES 1,000 - 5,000</option>
                  <option value="5000-10000">KES 5,000 - 10,000</option>
                  <option value="10000-50000">KES 10,000 - 50,000</option>
                  <option value="50000+">Over KES 50,000</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Any Availability</option>
                  <option value="in-stock">In Stock</option>
                  <option value="same-day">Same Day Delivery</option>
                  <option value="next-day">Next Day Delivery</option>
                </select>
              </div>

              {/* Delivery */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery</label>
                <select
                  value={filters.delivery}
                  onChange={(e) => handleFilterChange('delivery', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Any Delivery</option>
                  <option value="free">Free Shipping</option>
                  <option value="same-day">Same Day</option>
                  <option value="next-day">Next Day</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear All Filters
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (query.length > 0 || recentSearches.length > 0 || trendingSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            {/* AI Suggestions */}
            {query.length > 0 && suggestions.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {suggestion.type === 'product' && <FireIcon className="h-4 w-4 text-orange-500" />}
                      {suggestion.type === 'category' && <StarIcon className="h-4 w-4 text-blue-500" />}
                      {suggestion.type === 'brand' && <ShieldCheckIcon className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{suggestion.text || suggestion.name}</div>
                      {suggestion.description && (
                        <div className="text-sm text-gray-500">{suggestion.description}</div>
                      )}
                    </div>
                    {suggestion.aiBoosted && (
                      <div className="flex-shrink-0">
                        <SparklesIcon className="h-3 w-3 text-orange-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                </div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{search}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trending Searches */}
            {trendingSearches.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FireIcon className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((trend, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(trend.text)}
                      className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm hover:bg-orange-100 transition-colors"
                    >
                      {trend.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query.length > 0 && suggestions.length === 0 && !isLoading && (
              <div className="p-4 text-center text-gray-500">
                No results found for "{query}"
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;

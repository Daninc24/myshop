import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  MicrophoneIcon,
  CameraIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ClockIcon,
  FireIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import VoiceSearch from './VoiceSearch';
import { useDebounce } from '../hooks/useDebounce';

const EnhancedSearch = ({ 
  onSearch, 
  placeholder = "Search products, brands, or categories...",
  showVoiceSearch = true,
  showVisualSearch = true,
  showSuggestions = true,
  maxSuggestions = 8
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 10000],
    rating: 0,
    inStock: false,
    sortBy: 'relevance'
  });
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Generate trending searches (simulated)
  useEffect(() => {
    const trending = [
      'smartphone', 'laptop', 'headphones', 'smartwatch',
      'gaming', 'fitness', 'home decor', 'kitchen'
    ];
    setTrendingSearches(trending);
  }, []);

  // Handle search suggestions
  useEffect(() => {
    if (debouncedQuery && showSuggestions) {
      generateSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, showSuggestions]);

  // Generate search suggestions
  const generateSuggestions = useCallback(async (searchTerm) => {
    setIsLoading(true);
    try {
      // Simulate API call for suggestions
      const mockSuggestions = [
        `${searchTerm} smartphone`,
        `${searchTerm} laptop`,
        `${searchTerm} accessories`,
        `${searchTerm} wireless`,
        `${searchTerm} premium`,
        `${searchTerm} budget`,
        `${searchTerm} gaming`,
        `${searchTerm} professional`
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setSuggestions(mockSuggestions.slice(0, maxSuggestions));
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [maxSuggestions]);

  // Handle search submission
  const handleSearch = useCallback((searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updatedRecent = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // Track search in analytics
    trackSearch(searchQuery);

    // Perform search
    onSearch(searchQuery, filters);
    setShowSuggestionsPanel(false);
  }, [query, recentSearches, filters, onSearch]);

  // Track search analytics
  const trackSearch = useCallback((searchTerm) => {
    // Track in analytics
    if (window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm,
        search_filters: filters
      });
    }

    // Save to search history
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const updatedHistory = [
      { term: searchTerm, timestamp: Date.now(), filters },
      ...history.filter(h => h.term !== searchTerm)
    ].slice(0, 50); // Keep last 50 searches
    
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    setSearchHistory(updatedHistory);
  }, [filters]);

  // Handle voice search
  const handleVoiceSearch = useCallback((transcript) => {
    setQuery(transcript);
    handleSearch(transcript);
  }, [handleSearch]);

  // Handle visual search
  const handleVisualSearch = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Simulate visual search
        console.log('Visual search with image:', file.name);
        // In a real app, you would upload the image and get search results
        setQuery(`Visual search: ${file.name}`);
        handleSearch(`Visual search: ${file.name}`);
      }
    };
    
    input.click();
  }, [handleSearch]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  }, [handleSearch]);

  // Handle recent search click
  const handleRecentSearchClick = useCallback((searchTerm) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  }, [handleSearch]);

  // Handle trending search click
  const handleTrendingSearchClick = useCallback((searchTerm) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  }, [handleSearch]);

  // Remove recent search
  const removeRecentSearch = useCallback((searchTerm) => {
    const updated = recentSearches.filter(s => s !== searchTerm);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestionsPanel(false);
    inputRef.current?.focus();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestionsPanel(false);
      inputRef.current?.blur();
    }
  }, [handleSearch]);

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestionsPanel(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          
          {showVoiceSearch && (
            <VoiceSearch
              onSearch={handleVoiceSearch}
              isListening={isListening}
              setIsListening={setIsListening}
            />
          )}
          
          {showVisualSearch && (
            <button
              onClick={handleVisualSearch}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Visual search"
              title="Visual search"
            >
              <CameraIcon className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full transition-colors ${
              showFilters 
                ? 'bg-orange-100 text-orange-600' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            aria-label="Search filters"
            title="Search filters"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search suggestions panel */}
      <AnimatePresence>
        {showSuggestionsPanel && (query || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Search suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Suggestions</span>
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Recent searches</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((searchTerm, index) => (
                    <div key={index} className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                      <button
                        onClick={() => handleRecentSearchClick(searchTerm)}
                        className="flex-1 text-left"
                      >
                        {searchTerm}
                      </button>
                      <button
                        onClick={() => removeRecentSearch(searchTerm)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Remove from recent searches"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending searches */}
            {trendingSearches.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FireIcon className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Trending</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((searchTerm, index) => (
                    <button
                      key={index}
                      onClick={() => handleTrendingSearchClick(searchTerm)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {searchTerm}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports</option>
                </select>
              </div>

              {/* Price range filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] 
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <span className="flex items-center text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: [prev.priceRange[0], parseInt(e.target.value) || 10000] 
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Rating filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={2}>2+ Stars</option>
                </select>
              </div>

              {/* Stock filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleSearch()}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={() => setFilters({
                  category: '',
                  priceRange: [0, 10000],
                  rating: 0,
                  inStock: false,
                  sortBy: 'relevance'
                })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSearch;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  MicrophoneIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { debounce } from '../utils/performance';
import axios from 'axios';

const EnhancedSearchBar = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Debounced search suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`/products/search/suggestions?q=${encodeURIComponent(query)}`);
        setSuggestions(response.data || []);
      } catch (error) {
        console.error('Search suggestions error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    debouncedGetSuggestions(value);
  };

  // Handle search submission
  const handleSearch = (query = searchTerm) => {
    if (!query.trim()) return;

    // Add to recent searches
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Navigate to search results
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  // Voice search functionality
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search for products, brands, categories..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          className="w-full px-4 py-3 pl-12 pr-20 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-slate-700 placeholder-slate-400 transition-all duration-200"
        />
        
        {/* Search Icon */}
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        
        {/* Right Side Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          
          {/* Voice Search */}
          <button
            onClick={handleVoiceSearch}
            className={`p-1 transition-colors ${
              isListening 
                ? 'text-red-500 animate-pulse' 
                : 'text-slate-400 hover:text-brand-primary'
            }`}
            title="Voice search"
          >
            <MicrophoneIcon className="w-4 h-4" />
          </button>
          
          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 transition-colors ${
              showFilters 
                ? 'text-brand-primary' 
                : 'text-slate-400 hover:text-brand-primary'
            }`}
            title="Search filters"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Searching...</p>
            </div>
          )}

          {/* Recent Searches */}
          {!isLoading && searchTerm.length === 0 && recentSearches.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                Recent Searches
              </h4>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                <FireIcon className="w-4 h-4 mr-2" />
                Suggestions
              </h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion.title || suggestion)}
                    className="flex items-center w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        {suggestion.title || suggestion}
                      </p>
                      {suggestion.category && (
                        <p className="text-xs text-slate-500">
                          in {suggestion.category}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && searchTerm.length > 0 && suggestions.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-500">No suggestions found</p>
              <button
                onClick={() => handleSearch()}
                className="mt-2 text-sm text-brand-primary hover:text-brand-primary-dark"
              >
                Search for "{searchTerm}"
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-40 p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Quick Filters</h4>
          <div className="flex flex-wrap gap-2">
            {['Electronics', 'Fashion', 'Home', 'Sports', 'Books'].map((category) => (
              <button
                key={category}
                onClick={() => navigate(`/products?category=${category}`)}
                className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
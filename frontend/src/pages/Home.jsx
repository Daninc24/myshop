import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { getSEOTitle, getSEODescription, getSEOKeywords, getSEOImage, getSEOUrl, getBrandName } from '../config/branding';
import {
  getSectionConfig,
  getSectionTitle,
  getSectionMaxDisplay,
  shouldShowViewAll,
  getViewAllLink
} from '../config/sections';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

// Icons
import {
  ArrowRightIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowPathIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: showError } = useToast();
  
  // State management
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const [loadingBestSelling, setLoadingBestSelling] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // UI states
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Refs
  const searchInputRef = useRef();

  // Enhanced features configuration
  const features = useMemo(() => [
    {
      icon: TruckIcon,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping',
      gradient: 'from-blue-500 to-cyan-500',
      enabled: true
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payment',
      description: '100% secure payment processing',
      gradient: 'from-green-500 to-emerald-500',
      enabled: true
    },
    {
      icon: ArrowPathIcon,
      title: 'Easy Returns',
      description: 'Hassle-free return policy',
      gradient: 'from-purple-500 to-pink-500',
      enabled: true
    },
    {
      icon: CreditCardIcon,
      title: 'Flexible Payment',
      description: 'Multiple payment options',
      gradient: 'from-orange-500 to-red-500',
      enabled: true
    }
  ], []);

  // Stats for social proof
  const stats = useMemo(() => [
    { number: '10K+', label: 'Happy Customers', icon: UserGroupIcon, enabled: true },
    { number: '50K+', label: 'Products Available', icon: ShoppingBagIcon, enabled: true },
    { number: '24/7', label: 'Customer Support', icon: HeartIcon, enabled: true },
    { number: '99%', label: 'Satisfaction Rate', icon: StarIcon, enabled: true }
  ], []);

  // Event handlers
  const handleShopNow = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  const handleViewDeals = useCallback(() => {
    navigate('/products?sort=discount');
  }, [navigate]);

  const handleSearch = useCallback((searchTerm) => {
    setSearch(searchTerm);
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  }, [navigate]);

  // Data fetching functions
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get('/products?limit=8');
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchNewArrivals = useCallback(async () => {
    try {
      setLoadingNewArrivals(true);
      const response = await axios.get('/products?sort=newest&limit=4');
      setNewArrivals(response.data?.products || []);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      setNewArrivals([]);
    } finally {
      setLoadingNewArrivals(false);
    }
  }, []);

  const fetchBestSelling = useCallback(async () => {
    try {
      setLoadingBestSelling(true);
      const response = await axios.get('/products/best-selling?limit=4');
      setBestSelling(response.data?.products || []);
    } catch (error) {
      console.error('Error fetching best selling:', error);
      setBestSelling([]);
    } finally {
      setLoadingBestSelling(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get('/categories');
      setCategoriesList(response.data?.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesList([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchTrendingProducts = useCallback(async () => {
    try {
      const response = await axios.get('/products?sort=trending&limit=6');
      setTrendingProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error fetching trending products:', error);
      setTrendingProducts([]);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      try {
        await Promise.allSettled([
          fetchProducts(),
          fetchCategories()
        ]);
        
        setLoading(false);
        
        // Fetch secondary data in background
        setTimeout(() => {
          Promise.allSettled([
            fetchNewArrivals(),
            fetchBestSelling(),
            fetchTrendingProducts()
          ]);
        }, 100);
      } catch (error) {
        console.error('Error initializing data:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchProducts, fetchCategories, fetchNewArrivals, fetchBestSelling, fetchTrendingProducts]);

  // Search suggestions
  useEffect(() => {
    if (search.trim()) {
      const fetchSuggestions = async () => {
        try {
          const response = await axios.get(`/products/search/suggestions?q=${encodeURIComponent(search)}`);
          setSearchSuggestions(response.data?.suggestions || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
          setSearchSuggestions([]);
        }
      };
      fetchSuggestions();
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search]);

  // SEO structured data
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": getBrandName(),
    "description": getSEODescription(),
    "url": getSEOUrl('/'),
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": getSEOUrl('/products?search={search_term_string}')
      },
      "query-input": "required name=search_term_string"
    }
  }), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  // Safety check for all arrays
  const safeProducts = Array.isArray(products) ? products : [];
  const safeNewArrivals = Array.isArray(newArrivals) ? newArrivals : [];
  const safeBestSelling = Array.isArray(bestSelling) ? bestSelling : [];
  const safeCategoriesList = Array.isArray(categoriesList) ? categoriesList : [];
  const safeTrendingProducts = Array.isArray(trendingProducts) ? trendingProducts : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* SEO */}
      <Helmet>
        <title>{getSEOTitle('Home')}</title>
        <meta name="description" content={getSEODescription()} />
        <meta name="keywords" content={getSEOKeywords()} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content={getBrandName()} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph */}
        <meta property="og:title" content={getSEOTitle('Home')} />
        <meta property="og:description" content={getSEODescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getSEOUrl('/')} />
        <meta property="og:image" content={getSEOImage()} />
        <meta property="og:site_name" content={getBrandName()} />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getSEOTitle('Home')} />
        <meta name="twitter:description" content={getSEODescription()} />
        <meta name="twitter:image" content={getSEOImage()} />
        
        {/* Additional SEO */}
        <link rel="canonical" href={getSEOUrl('/')} />
        <meta name="theme-color" content="#ff6600" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to {getBrandName()}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover premium products with confidence. Shop the latest trends and enjoy fast delivery!
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-6 py-4 text-gray-900 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  onClick={() => handleSearch(search)}
                  className="absolute right-2 top-2 bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </button>
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-900 border-b border-gray-200 last:border-b-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleShopNow}
                className="bg-white text-orange-500 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Shop Now
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleViewDeals}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-orange-500 transition-colors"
              >
                View Deals
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} text-white mb-4`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {safeCategoriesList.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600">Browse our wide range of categories</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {safeCategoriesList.slice(0, 8).map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <ShoppingBagIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  {category.productCount && (
                    <p className="text-sm text-gray-500 mt-1">{category.productCount} products</p>
                  )}
                </Link>
              ))}
            </div>
            
            {safeCategoriesList.length > 8 && (
              <div className="text-center mt-8">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  View All Categories
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {safeProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600">Handpicked products just for you</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {safeProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                View All Products
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {safeNewArrivals.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">New Arrivals</h2>
              <p className="text-gray-600">Latest products added to our collection</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {safeNewArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Selling */}
      {safeBestSelling.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Best Selling</h2>
              <p className="text-gray-600">Most popular products our customers love</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {safeBestSelling.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
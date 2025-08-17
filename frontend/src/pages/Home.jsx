import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
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

// Components
import ProductCard from '../components/ProductCard';
import PremiumHero from '../components/PremiumHero';
import PremiumFeatures from '../components/PremiumFeatures';
import RecommendationEngine from '../components/RecommendationEngine';
import FloatingActionButton from '../components/FloatingActionButton';
import MobileSearchModal from '../components/MobileSearchModal';
import LoadingSpinner from '../components/LoadingSpinner';

// Advertisement Components
import {
  TopBannerAd,
  HeroAd,
  CategoryAd,
  FeaturedAd,
  NewArrivalsAd,
  BestSellingAd,
  BottomBannerAd,
  SidebarAd
} from '../components/AdvertisementSection';

// Configuration
import { 
  getSEOTitle, 
  getSEODescription, 
  getSEOKeywords, 
  getSEOImage, 
  getSEOUrl, 
  getBrandName 
} from '../config/branding';
import { 
  getSectionConfig, 
  getSectionTitle, 
  getSectionMaxDisplay, 
  shouldShowViewAll, 
  getViewAllLink 
} from '../config/sections';

// Assets
import gambiaMarket from '../assets/gambia-market.jpg';

// Custom hooks
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// API utility with retry logic
const fetchWithRetry = async (url, options = {}) => {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await axios.get(url, { timeout: 10000, ...options });
    } catch (error) {
      lastError = error;
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

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
  const [assurances, setAssurances] = useState([]);
  
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
  
  // Debounced search
  const debouncedSearch = useDebounce(search, 350);
  
  // Refs
  const searchInputRef = useRef();

  // Enhanced features configuration
  const features = useMemo(() => [
    {
      icon: TruckIcon,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50',
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
      description: '30-day return policy',
      gradient: 'from-purple-500 to-pink-500',
      enabled: true
    },
    {
      icon: CreditCardIcon,
      title: 'Flexible Payment',
      description: 'Pay in installments',
      gradient: 'from-orange-500 to-red-500',
      enabled: true
    }
  ], []);

  // Enhanced stats for social proof
  const stats = useMemo(() => [
    { number: '50K+', label: 'Happy Customers', icon: UserGroupIcon, enabled: true },
    { number: '100K+', label: 'Products Sold', icon: ShoppingBagIcon, enabled: true },
    { number: '24/7', label: 'Customer Support', icon: HeartIcon, enabled: true },
    { number: '150+', label: 'Countries Served', icon: GlobeAltIcon, enabled: true }
  ], []);

  // Hero content
  const heroContent = useMemo(() => ({
    title: getBrandName(),
    subtitle: getSectionConfig('hero').subtitle || `Discover ${products.length > 0 ? products.length : 'thousands of'} premium products with confidence. Shop the latest trends and enjoy lightning-fast delivery!`,
    highlights: [
      "🎯 Premium Quality Products",
      "⚡ Same Day Delivery",
      "🛡️ 100% Secure Shopping",
      `💎 ${products.length > 0 ? products.length : '15,000'}+ Premium Products`,
      "🌟 World-Class Service"
    ],
    cta: {
      primary: "Shop Now",
      secondary: "View Deals"
    }
  }), [products.length]);

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
      const response = await fetchWithRetry('/products?limit=8');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  }, [showError]);

  const fetchNewArrivals = useCallback(async () => {
    try {
      setLoadingNewArrivals(true);
      const response = await fetchWithRetry('/products?sort=newest&limit=4');
      setNewArrivals(response.data.products || []);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoadingNewArrivals(false);
    }
  }, []);

  const fetchBestSelling = useCallback(async () => {
    try {
      setLoadingBestSelling(true);
      const response = await fetchWithRetry('/products/best-selling?limit=4');
      setBestSelling(response.data.products || []);
    } catch (error) {
      console.error('Error fetching best selling:', error);
    } finally {
      setLoadingBestSelling(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await fetchWithRetry('/categories');
      if (Array.isArray(response.data)) {
        setCategoriesList(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchTrendingProducts = useCallback(async () => {
    try {
      const response = await fetchWithRetry('/products?sort=trending&limit=3');
      setTrendingProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching trending products:', error);
    }
  }, []);

  const fetchAssurances = useCallback(async () => {
    try {
      const response = await fetchWithRetry('/site/assurances');
      setAssurances(response.data.assurances || []);
    } catch (error) {
      console.error('Error fetching assurances:', error);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Fetch critical data first
      await Promise.allSettled([
        fetchProducts(),
        fetchCategories(),
        fetchAssurances()
      ]);
      
      // Fetch secondary data
      Promise.allSettled([
        fetchNewArrivals(),
        fetchBestSelling(),
        fetchTrendingProducts()
      ]);
      
      setLoading(false);
    };

    initializeData();
  }, [fetchProducts, fetchCategories, fetchAssurances, fetchNewArrivals, fetchBestSelling, fetchTrendingProducts]);

  // Search suggestions
  useEffect(() => {
    if (debouncedSearch.trim()) {
      const fetchSuggestions = async () => {
        try {
          const response = await axios.get(`/products/search/suggestions?q=${encodeURIComponent(debouncedSearch)}`);
          setSearchSuggestions(response.data.suggestions || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
        }
      };
      fetchSuggestions();
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearch]);

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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced SEO */}
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

      {/* Top Banner Advertisement */}
      <TopBannerAd />

      {/* Premium Hero Section */}
      <PremiumHero
        heroContent={heroContent}
        trendingProducts={trendingProducts}
        onShopNow={handleShopNow}
        onViewDeals={handleViewDeals}
        backgroundImage={gambiaMarket}
      />

      {/* Premium Features Section */}
      <PremiumFeatures />

      {/* Hero Advertisement */}
      <HeroAd />

      {/* Enhanced Assurance Strip */}
      <section className="max-w-7xl mx-auto -mt-8 mb-16 px-4 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {features.filter(f => f.enabled).slice(0, 4).map((feature, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 md:gap-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex-shrink-0">
                <feature.icon className="h-10 w-10 text-gray-700" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{feature.title}</div>
                <div className="text-xs text-gray-600 hidden sm:block">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <GlobeAltIcon className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{getSectionTitle('categories')}</h2>
            </div>
            {shouldShowViewAll('categories') && (
              <Link to={getViewAllLink('categories')} className="sm:ml-auto text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base">
                View all
              </Link>
            )}
          </div>
          {loadingCategories ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-16 md:h-24 mb-2"></div>
                  <div className="bg-gray-200 rounded h-3 md:h-4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {categoriesList.slice(0, getSectionMaxDisplay('categories')).map((category, index) => (
                <Link
                  key={category.id || category._id || index}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-3 md:p-4 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-sm md:text-lg">
                      {(category.name || 'C')[0].toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-xs md:text-sm">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category Advertisement */}
      <CategoryAd />

      {/* Featured Products Advertisement */}
      <FeaturedAd />

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <FireIcon className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{getSectionTitle('featuredProducts')}</h2>
            </div>
            {shouldShowViewAll('featuredProducts') && (
              <Link to={getViewAllLink('featuredProducts')} className="sm:ml-auto text-orange-600 hover:text-orange-700 font-semibold text-sm md:text-base">
                View all
              </Link>
            )}
          </div>
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
                  <div className="bg-gray-200 rounded h-4 mb-2"></div>
                  <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.slice(0, getSectionMaxDisplay('featuredProducts')).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Advertisement */}
      <NewArrivalsAd />

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-6 w-6 text-green-500" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{getSectionTitle('newArrivals')}</h2>
            </div>
            {shouldShowViewAll('newArrivals') && (
              <Link to={getViewAllLink('newArrivals')} className="sm:ml-auto text-green-600 hover:text-green-700 font-semibold text-sm md:text-base">
                View all
              </Link>
            )}
          </div>
          {loadingNewArrivals ? (
            <div className="overflow-x-auto flex gap-4 md:gap-6 pb-4 scrollbar-hide">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[180px] sm:min-w-[220px] max-w-[240px] flex-shrink-0 animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-36 md:h-48 mb-3 md:mb-4"></div>
                  <div className="bg-gray-200 rounded h-3 md:h-4 mb-2"></div>
                  <div className="bg-gray-200 rounded h-3 md:h-4 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto flex gap-4 md:gap-6 pb-4 scrollbar-hide">
              {newArrivals.slice(0, getSectionMaxDisplay('newArrivals')).map(product => (
                <div key={product._id} className="min-w-[180px] sm:min-w-[220px] max-w-[240px] flex-shrink-0">
                  <ProductCard product={product} small />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Selling Advertisement */}
      <BestSellingAd />

      {/* Best Selling Section */}
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <StarIcon className="h-6 w-6 text-yellow-500 fill-current" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{getSectionTitle('bestSelling')}</h2>
            </div>
            {shouldShowViewAll('bestSelling') && (
              <Link to={getViewAllLink('bestSelling')} className="sm:ml-auto text-purple-600 hover:text-purple-700 font-semibold text-sm md:text-base">
                View all
              </Link>
            )}
          </div>
          {loadingBestSelling ? (
            <div className="overflow-x-auto flex gap-4 md:gap-6 pb-4 scrollbar-hide">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-[180px] sm:min-w-[220px] max-w-[240px] flex-shrink-0 animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-36 md:h-48 mb-3 md:mb-4"></div>
                  <div className="bg-gray-200 rounded h-3 md:h-4 mb-2"></div>
                  <div className="bg-gray-200 rounded h-3 md:h-4 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto flex gap-4 md:gap-6 pb-4 scrollbar-hide">
              {bestSelling.slice(0, getSectionMaxDisplay('bestSelling')).map(product => (
                <div key={product._id} className="min-w-[180px] sm:min-w-[220px] max-w-[240px] flex-shrink-0">
                  <ProductCard product={product} small />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Recommendations Section */}
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <RecommendationEngine
          userId={user?.id || null}
          type="personalized"
        />
      </section>

      {/* Bottom Banner Advertisement */}
      <BottomBannerAd />
      
      {/* Floating Action Button for Mobile */}
      <FloatingActionButton 
        onSearchClick={() => setShowMobileSearch(true)}
        onCategoriesClick={() => navigate('/products')}
      />

      {/* Mobile Search Modal */}
      <MobileSearchModal 
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
      />
    </div>
  );
};

export default Home;
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
import PremiumFeatures from '../components/PremiumFeatures';
import PremiumHero from '../components/PremiumHero';
import ProductCard from '../components/ProductCard';
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

// Assets
import gambiaMarket from '../assets/gambia-market.jpg';

// Advanced Components
import AIRecommendationEngine from '../components/AIRecommendationEngine';
import WishlistWithPriceAlerts from '../components/WishlistWithPriceAlerts';
import SocialMediaSharing from '../components/SocialMediaSharing';
import ReferralSystem from '../components/ReferralSystem';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: showError } = useToast();
  
  // State management - Initialize with empty arrays to prevent undefined errors
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
    subtitle: getSectionConfig('hero').subtitle || `Discover ${safeProducts.length > 0 ? safeProducts.length : 'thousands of'} premium products with confidence. Shop the latest trends and enjoy lightning-fast delivery!`,
    highlights: [
      "🎯 Premium Quality Products",
      "⚡ Same Day Delivery",
      "🛡️ 100% Secure Shopping",
      `💎 ${safeProducts.length > 0 ? safeProducts.length : '15,000'}+ Premium Products`,
      "🌟 World-Class Service"
    ],
    cta: {
      primary: "Shop Now",
      secondary: "View Deals"
    }
  }), [safeProducts.length]);

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
      setProducts([]); // Ensure we always have an array
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
      setNewArrivals([]); // Ensure we always have an array
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
      setBestSelling([]); // Ensure we always have an array
    } finally {
      setLoadingBestSelling(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get('/categories');
      if (Array.isArray(response.data)) {
        setCategoriesList(response.data);
      } else {
        setCategoriesList([]); // Ensure we always have an array
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesList([]); // Ensure we always have an array
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchTrendingProducts = useCallback(async () => {
    try {
      const response = await axios.get('/products?sort=trending&limit=3');
      setTrendingProducts(response.data?.products || []);
    } catch (error) {
      console.error('Error fetching trending products:', error);
      setTrendingProducts([]); // Ensure we always have an array
    }
  }, []);

  const fetchAssurances = useCallback(async () => {
    try {
      const response = await axios.get('/site/assurances');
      setAssurances(response.data.assurances || []);
    } catch (error) {
      console.error('Error fetching assurances:', error);
    }
  }, []);

  // Initialize data with optimized loading
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 10000); // 10 second timeout

      try {
        // Fetch critical data first (products and categories)
        await Promise.allSettled([
          fetchProducts(),
          fetchCategories()
        ]);

        // Clear timeout and set loading to false
        clearTimeout(timeoutId);
        setLoading(false);

        // Fetch secondary data in background
        setTimeout(() => {
          Promise.allSettled([
            fetchNewArrivals(),
            fetchBestSelling(),
            fetchTrendingProducts(),
            fetchAssurances()
          ]);
        }, 100);

      } catch (error) {
        console.error('Error initializing data:', error);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchProducts, fetchCategories, fetchAssurances, fetchNewArrivals, fetchBestSelling, fetchTrendingProducts]);

  // Search suggestions
  useEffect(() => {
    if (search.trim()) {
      const fetchSuggestions = async () => {
        try {
          const response = await axios.get(`/products/search/suggestions?q=${encodeURIComponent(search)}`);
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
          <p className="mt-4 text-text-secondary">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  // Safety check for all arrays to prevent undefined errors
  const safeProducts = products || [];
  const safeNewArrivals = newArrivals || [];
  const safeBestSelling = bestSelling || [];
  const safeCategoriesList = categoriesList || [];
  const safeTrendingProducts = trendingProducts || [];

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

      {/* Premium Hero Section */}
      <PremiumHero
        heroContent={heroContent}
        trendingProducts={safeTrendingProducts}
        onShopNow={handleShopNow}
        onViewDeals={handleViewDeals}
        backgroundImage={gambiaMarket}
      />

      {/* Premium Features - What Makes Us Different */}
      <PremiumFeatures />

      {/* AI Recommendation Engine */}
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <AIRecommendationEngine 
          userId={user?._id}
          limit={4}
          showTitle={true}
          title="AI-Powered Recommendations"
          subtitle="Discover products tailored just for you with 95% accuracy"
        />
      </section>



      {/* Top Banner Advertisement */}
      <TopBannerAd />

      {/* Hero Advertisement */}
      <HeroAd />

      {/* Enhanced Assurance Strip */}
      <section className="max-w-7xl mx-auto -mt-8 mb-16 px-4 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {features.filter(f => f.enabled).slice(0, 4).map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 md:gap-4 bg-surface/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-border/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex-shrink-0">
                <feature.icon className="h-10 w-10 text-text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-text-primary">{feature.title}</div>
                <div className="text-xs text-text-secondary hidden sm:block">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section - Compact Mobile Design */}
      <section className="max-w-7xl mx-auto mb-8 md:mb-16 px-4">
        <div className="bg-gradient-to-br from-secondary/5 to-accent/5 rounded-2xl md:rounded-3xl p-3 md:p-6 lg:p-8 border border-secondary/20">
          <div className="flex flex-col sm:flex-row sm:items-center mb-4 md:mb-6 gap-2 md:gap-4 sm:gap-0">
            <div className="flex items-center gap-2 md:gap-3">
              <GlobeAltIcon className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-text-primary">{getSectionTitle('categories')}</h2>
            </div>
            {shouldShowViewAll('categories') && (
              <Link to={getViewAllLink('categories')} className="sm:ml-auto text-secondary hover:text-secondary-dark font-semibold text-xs md:text-sm lg:text-base">
                View all
              </Link>
            )}
          </div>
          {loadingCategories ? (
            <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex-shrink-0">
                  <div className="bg-surface-hover rounded-lg h-12 md:h-16 lg:h-20 mb-1 md:mb-2 w-20 md:w-24 lg:w-32"></div>
                  <div className="bg-surface-hover rounded h-2 md:h-3 lg:h-4 w-16 md:w-20 lg:w-24"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4">
              {safeCategoriesList.slice(0, getSectionMaxDisplay('categories') || 4).map((category, index) => (
                <Link
                  key={category.id || category._id || index}
                  to={`/products?category=${encodeURIComponent(category.id || category.name)}`}
                  className="group bg-surface/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-3 lg:p-4 text-center hover:shadow-lg md:hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 md:hover:-translate-y-2 flex-shrink-0 w-20 md:w-24 lg:w-32"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-1 md:mb-2 lg:mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-xs md:text-sm lg:text-lg">
                      {(category.name || 'C')[0].toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors text-xs md:text-sm lg:text-base leading-tight">
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

      {/* Product Sections - Alibaba Style Layout */}
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Featured Products */}
          <div className="bg-gradient-to-br from-primary/5 to-error/5 rounded-2xl p-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FireIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-text-primary">{getSectionTitle('featuredProducts')}</h3>
              </div>
              {shouldShowViewAll('featuredProducts') && (
                <Link to={getViewAllLink('featuredProducts')} className="text-primary hover:text-primary-dark font-semibold text-sm">
                  View all
                </Link>
              )}
            </div>
            {loadingProducts ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-surface-hover rounded-lg h-32 mb-2"></div>
                    <div className="bg-surface-hover rounded h-3 mb-1"></div>
                    <div className="bg-surface-hover rounded h-3 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {safeProducts.slice(0, 3).map(product => (
                  <ProductCard key={product._id} product={product} compact={true} />
                ))}
              </div>
            )}
          </div>

          {/* New Arrivals */}
          <div className="bg-gradient-to-br from-success/5 to-accent/5 rounded-2xl p-6 border border-success/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-success" />
                <h3 className="text-lg font-bold text-text-primary">{getSectionTitle('newArrivals')}</h3>
              </div>
              {shouldShowViewAll('newArrivals') && (
                <Link to={getViewAllLink('newArrivals')} className="text-success hover:text-success-dark font-semibold text-sm">
                  View all
                </Link>
              )}
            </div>
            {loadingNewArrivals ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-surface-hover rounded-lg h-32 mb-2"></div>
                    <div className="bg-surface-hover rounded h-3 mb-1"></div>
                    <div className="bg-surface-hover rounded h-3 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {safeNewArrivals.slice(0, 3).map(product => (
                  <ProductCard key={product._id} product={product} compact={true} />
                ))}
              </div>
            )}
          </div>

          {/* Best Selling */}
          <div className="bg-gradient-to-br from-accent/5 to-secondary/5 rounded-2xl p-6 border border-accent/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-bold text-text-primary">{getSectionTitle('bestSelling')}</h3>
              </div>
              {shouldShowViewAll('bestSelling') && (
                <Link to={getViewAllLink('bestSelling')} className="text-accent hover:text-accent-dark font-semibold text-sm">
                  View all
                </Link>
              )}
            </div>
            {loadingBestSelling ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-surface-hover rounded-lg h-32 mb-2"></div>
                    <div className="bg-surface-hover rounded h-3 mb-1"></div>
                    <div className="bg-surface-hover rounded h-3 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {safeBestSelling.slice(0, 3).map(product => (
                  <ProductCard key={product._id} product={product} compact={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Banner Advertisement */}
      <BottomBannerAd />

      {/* Social Proof Section */}
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <div className="bg-gradient-to-br from-surface to-surface-hover rounded-3xl p-4 md:p-8 border border-border">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
              Trusted by Thousands of Customers
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Join our growing community of satisfied customers who trust LuxeCart for their shopping needs.
            </p>
          </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.filter(s => s.enabled).map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-text-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral System Section */}
      {user && (
        <section className="max-w-7xl mx-auto mb-16 px-4">
          <ReferralSystem user={user} />
        </section>
      )}

      {/* Social Media Sharing */}
      <SocialMediaSharing 
        title="Discover Amazing Products on LuxeCart!"
        description="Premium shopping experience with lightning-fast delivery and exceptional customer service."
        hashtags={["LuxeCart", "PremiumShopping", "FastDelivery", "Kenya", "OnlineShopping"]}
        showFloating={true}
        position="bottom-right"
      />
    </div>
  );
};

export default Home;
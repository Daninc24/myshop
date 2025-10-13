import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
const PremiumFeatures = lazy(() => import('../components/PremiumFeatures'));
const PremiumHero = lazy(() => import('../components/PremiumHero'));
const AdvertisementSection = lazy(() => import('../components/AdvertisementSection'));
const AIRecommendationEngine = lazy(() => import('../components/AIRecommendationEngine'));
const WishlistWithPriceAlerts = lazy(() => import('../components/WishlistWithPriceAlerts'));
const SocialMediaSharing = lazy(() => import('../components/SocialMediaSharing'));
const ReferralSystem = lazy(() => import('../components/ReferralSystem'));
import ErrorBoundary from '../components/ErrorBoundary';
import CategoryBar from '../components/CategoryBar';

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
  const [heroContent, setHeroContent] = useState({
    title: `Welcome to ${getBrandName()}`,
    subtitle: 'Discover premium products with confidence. Shop the latest trends and enjoy fast delivery!',
    highlights: [
      'Premium Quality Products',
      'Fast & Secure Delivery',
      '24/7 Customer Support',
      'Easy Returns & Exchanges'
    ],
    cta: {
      primary: 'Shop Now',
      secondary: 'View Deals'
    },
    ctaButtons: [
      {
        text: 'Shop Now',
        link: '/products',
        variant: 'primary',
        enabled: true
      },
      {
        text: 'View Deals',
        link: '/products?sort=discount',
        variant: 'secondary',
        enabled: true
      }
    ]
  });

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
      gradient: 'from-indigo-500 to-purple-500',
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

  // Safe data getters with fallbacks
  const safeProducts = useMemo(() => products.slice(0, 8), [products]);
  const safeNewArrivals = useMemo(() => newArrivals.slice(0, 4), [newArrivals]);
  const safeBestSelling = useMemo(() => bestSelling.slice(0, 4), [bestSelling]);
  const safeCategoriesList = useMemo(() => categoriesList.slice(0, 8), [categoriesList]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get('/products?limit=20&featured=true');
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to mock data if API is not available
      setProducts([
        {
          _id: '1',
          name: 'Sample Product 1',
          price: 99.99,
          description: 'A high-quality sample product',
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'],
          rating: 4.5,
          inStock: true
        },
        {
          _id: '2',
          name: 'Sample Product 2',
          price: 149.99,
          description: 'Another amazing sample product',
          category: 'Fashion',
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'],
          rating: 4.8,
          inStock: true
        }
      ]);
    } finally {
      setLoadingProducts(false);
    }
  }, [showError]);

  // Fetch new arrivals
  const fetchNewArrivals = useCallback(async () => {
    try {
      setLoadingNewArrivals(true);
      const response = await axios.get('/products?sort=createdAt&order=desc&limit=8');
      setNewArrivals(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      // Fallback to mock data
      setNewArrivals([
        {
          _id: '3',
          name: 'New Arrival 1',
          price: 79.99,
          description: 'Latest arrival in our collection',
          category: 'Home & Garden',
          images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&h=300&fit=crop'],
          rating: 4.2,
          inStock: true
        }
      ]);
    } finally {
      setLoadingNewArrivals(false);
    }
  }, []);

  // Fetch best selling (fallback to featured products if endpoint doesn't exist)
  const fetchBestSelling = useCallback(async () => {
    try {
      setLoadingBestSelling(true);
      const response = await axios.get('/products?featured=true&limit=8');
      setBestSelling(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching best selling:', error);
      // Fallback to mock data
      setBestSelling([
        {
          _id: '4',
          name: 'Best Seller 1',
          price: 199.99,
          description: 'Our most popular product',
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'],
          rating: 4.9,
          inStock: true
        }
      ]);
    } finally {
      setLoadingBestSelling(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get('/categories');
      setCategoriesList(response.data.categories || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to mock categories
      setCategoriesList([
        {
          _id: '1',
          name: 'Electronics',
          productCount: 150
        },
        {
          _id: '2',
          name: 'Fashion',
          productCount: 200
        },
        {
          _id: '3',
          name: 'Home & Garden',
          productCount: 100
        },
        {
          _id: '4',
          name: 'Sports & Outdoors',
          productCount: 80
        },
        {
          _id: '5',
          name: 'Books & Media',
          productCount: 120
        },
        {
          _id: '6',
          name: 'Health & Beauty',
          productCount: 90
        },
        {
          _id: '7',
          name: 'Toys & Games',
          productCount: 75
        },
        {
          _id: '8',
          name: 'Automotive',
          productCount: 60
        }
      ]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch trending products (fallback to new arrivals if endpoint doesn't exist)
  const fetchTrendingProducts = useCallback(async () => {
    try {
      const response = await axios.get('/products?sort=createdAt&order=desc&limit=6');
      setTrendingProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching trending products:', error);
      // Fallback to mock trending products
      setTrendingProducts([
        {
          _id: '5',
          name: 'Trending Product 1',
          price: 129.99,
          description: 'Hot trending product',
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop'],
          rating: 4.7,
          inStock: true
        },
        {
          _id: '6',
          name: 'Trending Product 2',
          price: 89.99,
          description: 'Popular trending item',
          category: 'Fashion',
          images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop'],
          rating: 4.6,
          inStock: true
        }
      ]);
    }
  }, []);

  // Search functionality
  const handleSearch = useCallback((searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearch('');
      setShowSuggestions(false);
    }
  }, [navigate]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    handleSearch(search);
  }, [handleSearch, search]);

  // Search suggestions
  const fetchSearchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(`/products/search/suggestions?q=${encodeURIComponent(query)}`);
      setSearchSuggestions(response.data || []);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSearchSuggestions([]);
    }
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search) {
        fetchSearchSuggestions(search);
      } else {
        setSearchSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, fetchSearchSuggestions]);

  // Navigation handlers
  const handleShopNow = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  const handleViewDeals = useCallback(() => {
    navigate('/products?sort=discount');
  }, [navigate]);

  // Optimized progressive loading for better performance
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Phase 1: Load critical data first (products and categories)
        await Promise.allSettled([
          fetchProducts(),
          fetchCategories()
        ]);
        
        // Show page immediately with critical content
        setLoading(false);
        
        // Phase 2: Load secondary data in background (non-blocking)
        setTimeout(() => {
          Promise.allSettled([
            fetchNewArrivals(),
            fetchBestSelling(),
            fetchTrendingProducts()
          ]);
        }, 100);
        
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
      
      // Timeout protection - ensure loading stops after 10 seconds
      setTimeout(() => {
        setLoading(false);
      }, 10000);
    };

    loadData();
  }, [fetchProducts, fetchNewArrivals, fetchBestSelling, fetchCategories, fetchTrendingProducts]);

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{getSEOTitle('home')}</title>
        <meta name="description" content={getSEODescription('home')} />
        <meta name="keywords" content={getSEOKeywords('home')} />
        <meta property="og:title" content={getSEOTitle('home')} />
        <meta property="og:description" content={getSEODescription('home')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getSEOUrl('home')} />
        <meta property="og:image" content={getSEOImage()} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getSEOTitle('home')} />
        <meta name="twitter:description" content={getSEODescription('home')} />
        <meta name="twitter:image" content={getSEOImage()} />
        <link rel="canonical" href={getSEOUrl('home')} />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "${getBrandName()}",
            "description": "${getSEODescription('home')}",
            "url": "${getSEOUrl('home')}",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "${getSEOUrl('products')}?search={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          }
        `}</script>
      </Helmet>

      {/* Category Bar - Above Hero */}
      <CategoryBar />

      {/* Premium Hero Section */}
      <ErrorBoundary>
        <Suspense fallback={<div className="h-[60vh]" />}> 
          <PremiumHero
            heroContent={heroContent}
            trendingProducts={trendingProducts}
            onShopNow={handleShopNow}
            onViewDeals={handleViewDeals}
            backgroundImage={getSEOImage()}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Advertisement Section - Top */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <AdvertisementSection 
            sectionName="hero-bottom"
            className="my-8"
          />
        </Suspense>
      </ErrorBoundary>

      {/* Premium Features Section */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <PremiumFeatures />
        </Suspense>
      </ErrorBoundary>

      {/* Categories Section - Removed since we now have CategoryBar above hero */}
      {/* Advertisement sections reduced for cleaner homepage */}
      
      {/* Categories grid removed - users can access via CategoryBar */}
      {false && safeCategoriesList.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  Shop by <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Category</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Discover amazing products across all our carefully curated categories
                </p>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {safeCategoriesList.slice(0, 8).map((category, index) => {
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

                return (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group"
                  >
                    <Link
                      to={`/products?category=${category.name}`}
                      className="block bg-white rounded-2xl shadow-lg p-6 md:p-8 text-center hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-orange-200"
                    >
                      <div className="relative mb-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                          {getCategoryIcon(category.name)}
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100">
                          {index + 1}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      
                      {category.productCount && (
                        <p className="text-sm md:text-base text-gray-500 mb-4">
                          {category.productCount} products
                        </p>
                      )}
                      
                      <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                        <span>Explore</span>
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            
            {safeCategoriesList.length > 8 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
                >
                  <ShoppingBagIcon className="w-6 h-6" />
                  View All Categories
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Advertisement Section - Categories - Removed for cleaner homepage */}

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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold"
              >
                View All Products
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* AI Recommendation Engine */}
      {user && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <Suspense fallback={null}>
                <AIRecommendationEngine
                  userId={user._id}
                  limit={8}
                  title="Recommended for You"
                  subtitle="AI-powered suggestions based on your preferences"
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {safeNewArrivals.length > 0 && (
        <section className="py-16 bg-white">
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

      {/* Advertisement Section - New Arrivals - Removed for cleaner homepage */}

      {/* Best Selling */}
      {safeBestSelling.length > 0 && (
        <section className="py-16 bg-gray-50">
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

      {/* Wishlist with Price Alerts (for authenticated users) */}
      {user && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <Suspense fallback={null}>
                <WishlistWithPriceAlerts />
              </Suspense>
            </ErrorBoundary>
          </div>
        </section>
      )}

      {/* Referral System */}
      {user && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <Suspense fallback={null}>
                <ReferralSystem userId={user._id} />
              </Suspense>
            </ErrorBoundary>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
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

      {/* Advertisement Section - Bottom */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <AdvertisementSection 
            sectionName="bottom"
            className="my-8"
          />
        </Suspense>
      </ErrorBoundary>

      {/* Social Media Sharing */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <SocialMediaSharing 
            showFloating={true}
            position="bottom-right"
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default Home;
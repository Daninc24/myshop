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
import PremiumFeatures from '../components/PremiumFeatures';
import PremiumHero from '../components/PremiumHero';
import AdvertisementSection from '../components/AdvertisementSection';
import AIRecommendationEngine from '../components/AIRecommendationEngine';
import WishlistWithPriceAlerts from '../components/WishlistWithPriceAlerts';
import SocialMediaSharing from '../components/SocialMediaSharing';
import ReferralSystem from '../components/ReferralSystem';
import ErrorBoundary from '../components/ErrorBoundary';

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

  // Safe data getters with fallbacks
  const safeProducts = useMemo(() => products.slice(0, 8), [products]);
  const safeNewArrivals = useMemo(() => newArrivals.slice(0, 4), [newArrivals]);
  const safeBestSelling = useMemo(() => bestSelling.slice(0, 4), [bestSelling]);
  const safeCategoriesList = useMemo(() => categoriesList.slice(0, 8), [categoriesList]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get('/api/products?limit=20&featured=true');
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
          images: ['https://via.placeholder.com/300x300?text=Product+1'],
          rating: 4.5,
          inStock: true
        },
        {
          _id: '2',
          name: 'Sample Product 2',
          price: 149.99,
          description: 'Another amazing sample product',
          category: 'Fashion',
          images: ['https://via.placeholder.com/300x300?text=Product+2'],
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
      const response = await axios.get('/api/products?sort=newest&limit=8');
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
          images: ['https://via.placeholder.com/300x300?text=New+1'],
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
      const response = await axios.get('/api/products?featured=true&limit=8');
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
          images: ['https://via.placeholder.com/300x300?text=Best+1'],
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
      const response = await axios.get('/api/categories');
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
      const response = await axios.get('/api/products?sort=newest&limit=6');
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
          images: ['https://via.placeholder.com/300x300?text=Trending+1'],
          rating: 4.7,
          inStock: true
        },
        {
          _id: '6',
          name: 'Trending Product 2',
          price: 89.99,
          description: 'Popular trending item',
          category: 'Fashion',
          images: ['https://via.placeholder.com/300x300?text=Trending+2'],
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
      const response = await axios.get(`/api/products/search-suggestions?q=${encodeURIComponent(query)}`);
      setSearchSuggestions(response.data.suggestions || []);
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

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.allSettled([
        fetchProducts(),
        fetchNewArrivals(),
        fetchBestSelling(),
        fetchCategories(),
        fetchTrendingProducts()
      ]);
      setLoading(false);
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
        <meta property="og:image" content={getSEOImage('home')} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getSEOTitle('home')} />
        <meta name="twitter:description" content={getSEODescription('home')} />
        <meta name="twitter:image" content={getSEOImage('home')} />
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

      {/* Premium Hero Section */}
      <ErrorBoundary>
        <PremiumHero
          heroContent={heroContent}
          trendingProducts={trendingProducts}
          onShopNow={handleShopNow}
          onViewDeals={handleViewDeals}
        />
      </ErrorBoundary>

      {/* Advertisement Section - Top */}
      <ErrorBoundary>
        <AdvertisementSection 
          sectionName="hero-bottom"
          className="my-8"
        />
      </ErrorBoundary>

      {/* Premium Features Section */}
      <ErrorBoundary>
        <PremiumFeatures />
      </ErrorBoundary>

      {/* Advertisement Section - Features */}
      <ErrorBoundary>
        <AdvertisementSection 
          sectionName="features-bottom"
          className="my-8"
        />
      </ErrorBoundary>

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

      {/* Advertisement Section - Categories */}
      <ErrorBoundary>
        <AdvertisementSection 
          sectionName="categories-bottom"
          className="my-8"
        />
      </ErrorBoundary>

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

      {/* AI Recommendation Engine */}
      {user && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <AIRecommendationEngine
                userId={user._id}
                limit={8}
                title="Recommended for You"
                subtitle="AI-powered suggestions based on your preferences"
              />
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

      {/* Advertisement Section - New Arrivals */}
      <ErrorBoundary>
        <AdvertisementSection 
          sectionName="new-arrivals-bottom"
          className="my-8"
        />
      </ErrorBoundary>

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
              <WishlistWithPriceAlerts />
            </ErrorBoundary>
          </div>
        </section>
      )}

      {/* Referral System */}
      {user && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <ReferralSystem userId={user._id} />
            </ErrorBoundary>
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

      {/* Advertisement Section - Bottom */}
      <ErrorBoundary>
        <AdvertisementSection 
          sectionName="bottom"
          className="my-8"
        />
      </ErrorBoundary>

      {/* Social Media Sharing */}
      <ErrorBoundary>
        <SocialMediaSharing 
          showFloating={true}
          position="bottom-right"
        />
      </ErrorBoundary>
    </div>
  );
};

export default Home;
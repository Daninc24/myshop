import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import AdvancedProductCard from '../components/AdvancedProductCard';
import SmartSearch from '../components/SmartSearch';
import RecommendationEngine from '../components/RecommendationEngine';
import LoadingSpinner from '../components/LoadingSpinner';
import DynamicPerformanceMonitor from '../components/DynamicPerformanceMonitor';
import PremiumHero from '../components/PremiumHero';
import PremiumFeatures from '../components/PremiumFeatures';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowRightIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { io } from 'socket.io-client';
import { Helmet } from 'react-helmet';
import gambiaMarket from '../assets/gambia-market.jpg';

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

import { getOptimizedImageUrl } from '../utils/imageUtils';
import { advertTemplates } from '../components/AdvertTemplates';

const HERO_IMAGE = gambiaMarket;

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const [loadingBestSelling, setLoadingBestSelling] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const { error, info, success, warning } = useToast();
  const { user } = useAuth();
  const socketRef = React.useRef(null);
  const [adverts, setAdverts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const searchInputRef = useRef();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dealCountdown, setDealCountdown] = useState(3600); // 1 hour in seconds
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerIntervalRef = useRef();
  
  // Dynamic data states
  const [categoriesList, setCategoriesList] = useState([]);
  const [assurances, setAssurances] = useState([]);



  // Enhanced features with better icons and descriptions
  const features = [
    {
      icon: TruckIcon,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payment',
      description: '100% secure payment processing',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: ArrowPathIcon,
      title: 'Easy Returns',
      description: '30-day return policy',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: CreditCardIcon,
      title: 'Flexible Payment',
      description: 'Pay in installments',
      gradient: 'from-orange-500 to-red-500'
    }
  ];



  // World-class hero content with dynamic data
  const heroContent = {
    title: "MyShopping Center",
    subtitle: `Discover ${products.length > 0 ? products.length : 'thousands of'} amazing products with confidence. Shop the latest trends and enjoy lightning-fast delivery!`,
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
  };

  // Trending products for hero section
  const [trendingProducts, setTrendingProducts] = useState([]);

  // Handler functions for premium hero
  const handleShopNow = () => {
    navigate('/products');
  };

  const handleViewDeals = () => {
    navigate('/products?sort=discount');
  };

  // Fetch trending products for hero
  const fetchTrendingProducts = async () => {
    try {
      const response = await axios.get('/products?sort=trending&limit=3');
      setTrendingProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching trending products:', error);
    }
  };

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  // Enhanced stats for social proof
  const stats = [
    { number: '50K+', label: 'Happy Customers', icon: UserGroupIcon },
    { number: '100K+', label: 'Products Sold', icon: ShoppingBagIcon },
    { number: '24/7', label: 'Customer Support', icon: HeartIcon },
    { number: '150+', label: 'Countries Served', icon: GlobeAltIcon }
  ];

  // Split adverts function
  const splitAdverts = (adverts) => {
    // Ensure adverts is an array
    if (!Array.isArray(adverts)) {
      return { top: [], middle: [], bottom: [] };
    }
    
    if (adverts.length <= 3) return { top: adverts, middle: [], bottom: [] };
    return {
      top: adverts.slice(0, 2),
      middle: adverts.slice(2, 4),
      bottom: adverts.slice(4)
    };
  };

  // Fetch categories from backend for dynamic Source by Category
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetchWithRetry('/categories', {
        timeout: 10000 // Increased timeout for better reliability
      });
      if (Array.isArray(response.data)) {
        setCategoriesList(response.data);
      }
    } catch (err) {
      setCategoriesList([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch assurances from backend for dynamic Assurance Strip (optional endpoint)
  const fetchAssurances = async () => {
    try {
      const res = await fetchWithRetry('/site/assurances', {
        timeout: 10000
      });
      if (Array.isArray(res.data)) {
        setAssurances(res.data);
      }
    } catch (e) {
      // Fallback to default assurances already set
    }
  };

  // Fetch data functions with retry logic
  const fetchWithRetry = async (url, options, maxRetries = 2) => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await axios.get(url, options);
        return response;
      } catch (error) {
        if (i === maxRetries) throw error;
        // Wait before retrying (exponential backoff)
        const delay = 1000 * (i + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const fetchProducts = async (searchTerm = '', category = 'all') => {
    try {
      setLoadingProducts(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category && category !== 'all') params.category = category;
      
      const response = await fetchWithRetry('/products', { 
        params,
        timeout: 10000 // Increased timeout for better reliability
      });
      
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.products || []);
      
      // Process images field - handle multiple formats (same as New Arrivals)
      const processedList = list.map(product => {
        let processedImages = [];
        
        if (typeof product.images === 'string') {
          // Handle space-separated string
          processedImages = product.images.split(' ').filter(img => img.trim());
        } else if (Array.isArray(product.images)) {
          // Handle array format
          processedImages = product.images.filter(img => img);
        }
        
        // Process images and ensure they're valid (same logic as New Arrivals)
        processedImages = processedImages.filter(img => {
          if (!img || !img.trim()) return false;
          return true;
        });
        
        // Add fallback images only if no images exist at all (same as New Arrivals)
        if (processedImages.length === 0) {
          const fallbackImages = {
            'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            'Fashion': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            'Home & Garden': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop',
            'Sports & Outdoors': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
            'Books & Media': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
            'Health & Beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
            'Toys & Games': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
            'Automotive': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop',
            'Baby Products': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop',
            'Pet Supplies': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=400&fit=crop',
            'default': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
          };
          
          processedImages = [fallbackImages[product.category] || fallbackImages.default];
        }
        
        return {
          ...product,
          images: processedImages
        };
      });
      
      setProducts(processedList);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      setLoadingNewArrivals(true);
      const response = await fetchWithRetry('/products', { 
        params: { sort: 'newest', limit: 8 },
        timeout: 10000 // Increased timeout for better reliability
      });
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.products || []);
      
      // Process images field - handle multiple formats
      const processedList = list.map(product => {
        let processedImages = [];
        
        if (typeof product.images === 'string') {
          // Handle space-separated string
          processedImages = product.images.split(' ').filter(img => img.trim());
        } else if (Array.isArray(product.images)) {
          // Handle array format
          processedImages = product.images.filter(img => img);
        }
        
        // Process images and ensure they're valid
        processedImages = processedImages.filter(img => {
          if (!img || !img.trim()) return false;
          return true;
        });
        
        // Add fallback images only if no images exist at all
        if (processedImages.length === 0) {
          const fallbackImages = {
            'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            'Fashion': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            'Home & Garden': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop',
            'Sports & Outdoors': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
            'Books & Media': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
            'Health & Beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
            'Toys & Games': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
            'Automotive': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop',
            'Baby Products': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop',
            'Pet Supplies': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=400&fit=crop',
            'default': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
          };
          
          processedImages = [fallbackImages[product.category] || fallbackImages.default];
        }
        
        return {
          ...product,
          images: processedImages
        };
      });
      
      setNewArrivals(processedList);
    } catch (err) {
      setNewArrivals([]);
    } finally {
      setLoadingNewArrivals(false);
    }
  };

  const fetchBestSelling = async () => {
    try {
      setLoadingBestSelling(true);
      const response = await fetchWithRetry('/products/best-selling', { 
        params: { limit: 8 },
        timeout: 10000 // Increased timeout for better reliability
      });
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.products || []);
      
      // Process images field - handle multiple formats
      const processedList = list.map(product => {
        let processedImages = [];
        
        if (typeof product.images === 'string') {
          // Handle space-separated string
          processedImages = product.images.split(' ').filter(img => img.trim());
        } else if (Array.isArray(product.images)) {
          // Handle array format
          processedImages = product.images.filter(img => img);
        }
        
        // Process images and ensure they're valid
        processedImages = processedImages.filter(img => {
          if (!img || !img.trim()) return false;
          return true;
        });
        
        // Add fallback images only if no images exist at all
        if (processedImages.length === 0) {
          const fallbackImages = {
            'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            'Fashion': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            'Home & Garden': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop',
            'Sports & Outdoors': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
            'Books & Media': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
            'Health & Beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
            'Toys & Games': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
            'Automotive': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop',
            'Baby Products': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop',
            'Pet Supplies': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=400&fit=crop',
            'default': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
          };
          
          processedImages = [fallbackImages[product.category] || fallbackImages.default];
        }
        
        return {
          ...product,
          images: processedImages
        };
      });
      
      setBestSelling(processedList);
    } catch (err) {
      setBestSelling([]);
    } finally {
      setLoadingBestSelling(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetchWithRetry('/events', { 
        params: { upcoming: true },
        timeout: 10000
      });
      const eventsData = Array.isArray(response.data) ? response.data : [];
      setEvents(eventsData);
    } catch (err) {
      setEvents([]);
    }
  };

  const fetchAdverts = async () => {
    try {
      const response = await fetchWithRetry('/adverts/active', { 
        timeout: 10000
      });
      // Ensure we always set an array
      const advertsData = Array.isArray(response.data) ? response.data : [];
      setAdverts(advertsData);
    } catch (err) {
      setAdverts([]);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await fetchWithRetry('/testimonials', { 
        timeout: 10000
      });
      const testimonialsData = Array.isArray(response.data) ? response.data : [];
      setTestimonials(testimonialsData);
    } catch (err) {
      setTestimonials([]);
    }
  };

  // Load data on component mount - OPTIMIZED for faster loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Show hero section immediately
      setLoading(false);
      
      // Load only critical data first (products only)
      try {
        await fetchProducts();
          } catch (err) {
      // Error loading products
    }
      
      // Load categories after a short delay
      setTimeout(async () => {
        try {
          await fetchCategories();
            } catch (err) {
      // Error loading categories
    }
      }, 200);
      
      // Load secondary data much later
      setTimeout(async () => {
        try {
          await Promise.all([
            fetchNewArrivals(),
            fetchBestSelling()
          ]);
            } catch (err) {
      // Error loading secondary data
    }
      }, 1000);
      
      // Load non-critical data last
      setTimeout(async () => {
        try {
          await Promise.all([
            fetchEvents(),
            fetchAdverts(),
            fetchTestimonials(),
            fetchAssurances()
          ]);
            } catch (err) {
      // Error loading non-critical data
    }
      }, 2000);
    };
    
    loadData();
  }, []);

  // Debounced search effect
  useEffect(() => {
    fetchProducts(debouncedSearch, selectedCategory);
  }, [debouncedSearch, selectedCategory]);

  // Autocomplete suggestions
  useEffect(() => {
    if (!search) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    let cancelled = false;
    const fetchSuggestions = async () => {
      try {
        const res = await fetchWithRetry('/products', { 
          params: { search },
          timeout: 5000
        });
        if (!cancelled) {
          const data = res.data;
          const list = Array.isArray(data) ? data : (data.products || []);
          
          // Process images field - convert space-separated string to array
          const processedList = list.map(product => ({
            ...product,
            images: typeof product.images === 'string' ? product.images.split(' ').filter(img => img.trim()) : product.images || []
          }));
          
          setSearchSuggestions(processedList.slice(0, 8));
          setShowSuggestions(true);
        }
              } catch (err) {
          if (!cancelled) {
            setSearchSuggestions([]);
            setShowSuggestions(false);
          }
        }
    };
    const timeout = setTimeout(fetchSuggestions, 200);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [search]);

  // Hide suggestions on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Countdown timer for flash deals
  useEffect(() => {
    const interval = setInterval(() => {
      setDealCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format countdown as HH:MM:SS
  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Recently viewed products from localStorage
  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(viewed);
  }, [products]);

  // Add a sample flash deals array
  const flashDeals = products.filter(p => p.isDeal || p.price < 20).slice(0, 6);

  const nextEvent = events.length > 0 ? events[0] : null;

  // Recommended for You: products from the same category as the most recently viewed
  let recommended = [];
  if (recentlyViewed.length > 0) {
    const lastViewed = recentlyViewed[0];
    recommended = products.filter(p =>
      p.category === lastViewed.category &&
      !recentlyViewed.some(rv => rv._id === p._id)
    ).slice(0, 8);
    if (recommended.length < 8) {
      const bestFill = bestSelling.filter(p => !recentlyViewed.some(rv => rv._id === p._id) && !recommended.some(r => r._id === p._id)).slice(0, 8 - recommended.length);
      recommended = recommended.concat(bestFill);
    }
  }

  // Split adverts
  const { top: topAdverts, middle: middleAdverts, bottom: bottomAdverts } = splitAdverts(adverts);
  const banners = topAdverts;

  // Banner carousel functions
  const handleNextBanner = () => {
    setBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length > 1) {
      bannerIntervalRef.current = setInterval(handleNextBanner, 5000);
      return () => clearInterval(bannerIntervalRef.current);
    }
  }, [banners.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Helmet>
        <title>MyShopping Center - Your Premium Shopping Destination</title>
        <meta name="description" content="Discover amazing products, exclusive deals, and premium shopping experience at MyShopping Center. Fast delivery, secure payments, and exceptional customer service." />
        <meta name="keywords" content="premium shopping, exclusive deals, fast delivery, secure payments, online store, ecommerce" />
        <meta property="og:title" content="MyShopping Center - Your Premium Shopping Destination" />
        <meta property="og:description" content="Discover amazing products, exclusive deals, and premium shopping experience at MyShopping Center." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://myshoppingcenter.com/" />
        <meta property="og:image" content="https://myshoppingcenter.com/logo.png" />
      </Helmet>

      {/* Premium Hero Section */}
      <PremiumHero
        heroContent={heroContent}
        trendingProducts={trendingProducts}
        onShopNow={handleShopNow}
        onViewDeals={handleViewDeals}
        backgroundImage={HERO_IMAGE}
      />

      {/* Premium Features Section */}
      <PremiumFeatures />

      {/* Enhanced Assurance Strip */}
      <section className="max-w-7xl mx-auto -mt-8 mb-16 px-4 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {assurances.slice(0, 4).map((a, idx) => (
            <div 
              key={a.key || idx} 
              className={`${idx === 3 ? 'hidden md:flex' : 'flex'} items-center gap-4 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex-shrink-0">
                {a.icon === 'shield' && <ShieldCheckIcon className="h-10 w-10 text-green-500" />}
                {a.icon === 'truck' && <TruckIcon className="h-10 w-10 text-blue-500" />}
                {a.icon === 'card' && <CreditCardIcon className="h-10 w-10 text-purple-500" />}
                {a.icon === 'refresh' && <ArrowPathIcon className="h-10 w-10 text-orange-500" />}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{a.title}</div>
                <div className="text-xs text-gray-600">{a.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Progressive Loading Content */}
      {!loading && (
        <>
          {/* Categories Section */}
          <section className="max-w-7xl mx-auto mb-16 px-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="flex items-center gap-3 mr-4">
                  <GlobeAltIcon className="h-6 w-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                </div>
                <Link to="/categories" className="ml-auto text-blue-600 hover:text-blue-700 font-semibold">
                  View all
                </Link>
              </div>
              {loadingCategories ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-24 mb-2"></div>
                      <div className="bg-gray-200 rounded h-4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categoriesList.slice(0, 6).map((category, index) => (
                    <Link
                      key={category.id || category._id || index}
                      to={`/products?category=${encodeURIComponent(category.name)}`}
                      className="group bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-lg">
                          {(category.name || 'C')[0].toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Products Section */}
          <section className="max-w-7xl mx-auto mb-16 px-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="flex items-center gap-3 mr-4">
                  <ShoppingBagIcon className="h-6 w-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                </div>
                <Link to="/products" className="ml-auto text-orange-600 hover:text-orange-700 font-semibold">
                  View all
                </Link>
              </div>
              {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                      <div className="bg-gray-200 rounded h-4 mb-2"></div>
                      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.slice(0, 4).map(product => (
                    <AdvancedProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* New Arrivals Section */}
          <section className="max-w-7xl mx-auto mb-16 px-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="flex items-center gap-3 mr-4">
                  <FireIcon className="h-6 w-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
                </div>
                <Link to="/products?sort=newest" className="ml-auto text-green-600 hover:text-green-700 font-semibold">
                  View all
                </Link>
              </div>
              {loadingNewArrivals ? (
                <div className="overflow-x-auto flex gap-6 pb-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="min-w-[220px] max-w-[240px] flex-shrink-0 animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                      <div className="bg-gray-200 rounded h-4 mb-2"></div>
                      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto flex gap-6 pb-4">
                  {newArrivals.map(product => (
                    <div key={product._id} className="min-w-[220px] max-w-[240px] flex-shrink-0">
                      <ProductCard product={product} small />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Best Selling Section */}
          <section className="max-w-7xl mx-auto mb-16 px-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="flex items-center gap-3 mr-4">
                  <StarIcon className="h-6 w-6 text-yellow-500 fill-current" />
                  <h2 className="text-2xl font-bold text-gray-900">Best Selling</h2>
                </div>
                <Link to="/products?sort=popular" className="ml-auto text-purple-600 hover:text-purple-700 font-semibold">
                  View all
                </Link>
              </div>
              {loadingBestSelling ? (
                <div className="overflow-x-auto flex gap-6 pb-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="min-w-[220px] max-w-[240px] flex-shrink-0 animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                      <div className="bg-gray-200 rounded h-4 mb-2"></div>
                      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto flex gap-6 pb-4">
                  {bestSelling.map(product => (
                    <div key={product._id} className="min-w-[220px] max-w-[240px] flex-shrink-0">
                      <ProductCard product={product} small />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* AI Recommendations Section - Load separately */}
      <section className="max-w-7xl mx-auto mb-16 px-4">
        <RecommendationEngine
          userId={user?.id || null}
          type="personalized"
        />
      </section>
      
      {/* Dynamic Performance Monitor */}
      {/* Temporarily disabled for faster loading
      <DynamicPerformanceMonitor />
      */}
    </div>
  );
};

export default Home;
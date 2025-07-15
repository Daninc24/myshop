import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { io, Socket } from 'socket.io-client';
import { Helmet } from 'react-helmet';
import gambiaMarket from '../assets/gambia-market.jpg';
import ErrorBoundary from '../components/ErrorBoundary';

// Constants moved outside component
const ADVERT_TEMPLATES = [
  // ... (same template definitions as original)
];

const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'Electronics', name: 'Electronics' },
  // ... (other categories same as original)
];

const FEATURES = [
  {
    icon: TruckIcon,
    title: 'Free Shipping',
    description: 'Free shipping on orders over $50'
  },
  // ... (other features same as original)
];

const HERO_IMAGE = gambiaMarket;

const getAdvertImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('/uploads')) {
    return `https://myshop-hhfv.onrender.com${image}`;
  }
  return image;
};

const formatCountdown = (seconds) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const Home = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adverts, setAdverts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [search, setSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dealCountdown, setDealCountdown] = useState(3600);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  
  const { error, info, success, warning } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const bannerIntervalRef = useRef(null);

  // Memoized computations
  const { top: topAdverts, middle: middleAdverts, bottom: bottomAdverts } = useMemo(
    () => {
      if (adverts.length <= 3) return { top: adverts, middle: [], bottom: [] };
      return {
        top: adverts.slice(0, 2),
        middle: adverts.slice(2, 4),
        bottom: adverts.slice(4)
      };
    },
    [adverts]
  );

  const banners = useMemo(
    () => topAdverts.length > 0 ? topAdverts : adverts.slice(0, 3),
    [topAdverts, adverts]
  );

  const flashDeals = useMemo(
    () => products.filter(p => p.isDeal || p.price < 20).slice(0, 6),
    [products]
  );

  const recommended = useMemo(() => {
    if (recentlyViewed.length === 0) return [];
    const lastViewed = recentlyViewed[0];
    const recommended = products.filter(p =>
      p.category === lastViewed.category &&
      !recentlyViewed.some(rv => rv._id === p._id)
    ).slice(0, 8);
    
    if (recommended.length < 8) {
      const bestFill = bestSelling.filter(p => 
        !recentlyViewed.some(rv => rv._id === p._id) && 
        !recommended.some(r => r._id === p._id)
        .slice(0, 8 - recommended.length));
      
      return recommended.concat(bestFill);
    }
    return recommended;
  }, [recentlyViewed, products, bestSelling]);

  // Data fetching
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        productsRes, 
        newArrivalsRes, 
        bestSellingRes, 
        eventsRes, 
        advertsRes, 
        testimonialsRes
      ] = await Promise.all([
        axios.get('/products'),
        axios.get('/products?sort=newest&limit=4'),
        axios.get('/products/best-selling'),
        axios.get('/events?upcoming=true'),
        axios.get('/adverts/active'),
        axios.get('/testimonials')
      ]);

      setProducts(productsRes.data || []);
      setNewArrivals(newArrivalsRes.data || []);
      setBestSelling(bestSellingRes.data || []);
      setEvents(eventsRes.data || []);
      setAdverts(advertsRes.data?.adverts || []);
      setTestimonials(testimonialsRes.data?.testimonials || []);

      // Get recently viewed from localStorage
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(viewed);
    } catch (err) {
      error('Failed to load initial data');
      console.error('Initial data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [error]);

  const fetchProducts = useCallback(async (searchTerm = '', category = 'all') => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category && category !== 'all') params.category = category;
      
      const response = await axios.get('/products', { params });
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        throw new Error('Invalid products response');
      }
    } catch (err) {
      setProducts([]);
      error('Failed to load products');
    }
  }, [error]);

  // Effects
  useEffect(() => {
    fetchInitialData();

    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://myshop-hhfv.onrender.com';
    const socket = io(socketUrl, { 
      transports: ['websocket'],
      withCredentials: true
    });
    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      error('Real-time connection failed. Some live features may not work.');
    });

    socket.on('event_created', (event) => {
      setEvents(prev => [...prev, event]);
      success(`New event: ${event.title}`);
    });

    socket.on('event_updated', (updatedEvent) => {
      setEvents(prev => prev.map(e => 
        e._id === updatedEvent._id ? updatedEvent : e
      ));
      info(`Event updated: ${updatedEvent.title}`);
    });

    socket.on('event_deleted', (eventId) => {
      setEvents(prev => prev.filter(e => e._id !== eventId));
      warning('An event was deleted');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [error, info, success, warning, fetchInitialData]);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setDealCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Banner carousel auto-advance
    if (banners.length <= 1) return;
    
    bannerIntervalRef.current = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    
    return () => {
      if (bannerIntervalRef.current) {
        clearInterval(bannerIntervalRef.current);
      }
    };
  }, [banners.length]);

  useEffect(() => {
    // Debounced search
    setLoading(true);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts(search, selectedCategory);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, selectedCategory, fetchProducts]);

  // Event handlers
  const handlePrevBanner = () => 
    setBannerIndex(prev => (prev - 1 + banners.length) % banners.length);

  const handleNextBanner = () => 
    setBannerIndex(prev => (prev + 1) % banners.length);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (!e.target.value) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion.title || suggestion.name);
    setShowSuggestions(false);
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MyShopping Center - Home</title>
        {/* ... (same meta tags as original) */}
      </Helmet>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto px-4 pt-8 relative z-20">
        <div className="relative" ref={searchInputRef}>
          <input
            type="text"
            className="w-full rounded-full border border-gray-300 px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            placeholder="Search for products, brands, or categories..."
            value={search}
            onChange={handleSearchChange}
            onFocus={() => search && setShowSuggestions(true)}
            aria-label="Search products"
            autoComplete="off"
          />
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          
          {showSuggestions && searchSuggestions.length > 0 && (
            <ul 
              className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-72 overflow-y-auto"
              role="listbox"
            >
              {searchSuggestions.map(suggestion => (
                <li
                  key={suggestion._id}
                  role="option"
                  className="px-4 py-2 hover:bg-orange-100 cursor-pointer flex items-center gap-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.images?.[0] && (
                    <img 
                      src={suggestion.images[0]} 
                      alt="" 
                      className="w-8 h-8 object-cover rounded mr-2" 
                    />
                  )}
                  <span>{suggestion.title || suggestion.name}</span>
                  {suggestion.category && (
                    <span className="ml-auto text-xs text-gray-400">
                      {suggestion.category}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full h-[350px] md:h-[420px] flex items-center justify-center mb-8 bg-gradient-to-br from-orange-100 to-orange-200 hidden md:flex">
        <img
          src={HERO_IMAGE}
          alt="Colorful market with various products"
          className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-60"
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-orange-900 drop-shadow mb-4 animate-fade-in">
            Welcome to MyShopping Center
          </h1>
          <p className="text-lg md:text-2xl text-gray-900 mb-6 max-w-2xl animate-fade-in">
            Discover the best products, unbeatable deals, and a vibrant marketplace experience.
          </p>
          <Link 
            to="/products" 
            className="btn-primary text-lg px-8 py-3 animate-bounce-in"
            aria-label="Browse all products"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <div className="md:grid md:grid-cols-5 gap-8">
        {/* Sidebar - Categories */}
        <aside className="md:col-span-1 hidden md:block">
          <div className="bg-white rounded-2xl shadow-lg p-4 h-fit sticky top-24 self-start">
            <h3 className="text-lg font-bold text-orange-700 mb-4">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.map(category => (
                <li key={category.id}>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-orange-600 text-white' 
                        : 'text-gray-900 hover:bg-orange-100'
                    }`}
                    aria-current={selectedCategory === category.id}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="md:col-span-4 flex flex-col gap-8">
          {/* Mobile Category Bar */}
          <div className="md:hidden w-full overflow-x-auto flex gap-2 py-2 mb-4 sticky top-0 z-20 bg-white shadow-sm border-b border-orange-100">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium border transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-orange-100 text-gray-900 border-orange-200 hover:bg-orange-200'
                }`}
                aria-current={selectedCategory === category.id}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Flash Deals */}
          {flashDeals.length > 0 && (
            <ErrorBoundary fallback={<div className="text-red-500">Flash deals failed to load</div>}>
              <section 
                className="bg-gradient-to-r from-orange-400 to-yellow-200 rounded-2xl p-6 mb-4 shadow-lg"
                aria-label="Flash deals"
              >
                <div className="flex items-center mb-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold mr-3">
                    Flash Deals
                  </span>
                  <span className="text-lg font-bold text-orange-900 mr-4">
                    Limited Time Offers
                  </span>
                  <span className="ml-auto bg-white text-orange-700 px-3 py-1 rounded-full text-xs font-mono font-bold shadow">
                    {formatCountdown(dealCountdown)}
                  </span>
                </div>
                <div className="overflow-x-auto flex gap-4 pb-2">
                  {flashDeals.map(product => (
                    <div 
                      key={`flash-${product._id}`}
                      className="min-w-[180px] max-w-[200px] flex-shrink-0"
                    >
                      <ProductCard 
                        product={{...product, isDeal: true}} 
                        small 
                      />
                    </div>
                  ))}
                </div>
              </section>
            </ErrorBoundary>
          )}

          {/* Top Adverts */}
          {topAdverts.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topAdverts.map(ad => {
                const Template = ADVERT_TEMPLATES.find(t => t.id === (ad.template || 'classic'))?.render;
                return Template ? (
                  <div key={ad._id}>
                    {Template({
                      title: ad.title,
                      message: ad.message,
                      image: ad.image,
                      product: ad.product?.title || ad.product?.name,
                      productId: ad.product?._id || ad.product
                    })}
                  </div>
                ) : null;
              })}
            </section>
          )}

          {/* Features Section */}
          <section className="bg-gray-50 rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((feature, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 text-white rounded-full mb-4"
                    aria-hidden="true"
                  >
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Product Grid */}
          <ErrorBoundary fallback={<div className="text-red-500">Products failed to load</div>}>
            <section aria-labelledby="products-heading">
              <div className="flex items-center justify-between mb-6">
                <h2 id="products-heading" className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' 
                    ? 'Featured Products' 
                    : CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                </h2>
                <Link 
                  to="/products" 
                  className="text-orange-600 hover:underline font-medium"
                  aria-label="View all products"
                >
                  View All
                </Link>
              </div>
              
              {/* Mobile: Horizontal scroll */}
              <div className="md:hidden overflow-x-auto flex gap-4 pb-2">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div 
                      key={`mobile-${product._id}`}
                      className="min-w-[180px] max-w-[200px] flex-shrink-0"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 w-full">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </div>
              
              {/* Desktop: Grid */}
              <div className="hidden md:grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </div>
            </section>
          </ErrorBoundary>

          {/* Middle Adverts */}
          {middleAdverts.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {middleAdverts.map(ad => {
                const Template = ADVERT_TEMPLATES.find(t => t.id === (ad.template || 'classic'))?.render;
                return Template ? (
                  <div key={ad._id}>
                    {Template({
                      title: ad.title,
                      message: ad.message,
                      image: ad.image,
                      product: ad.product?.title || ad.product?.name,
                      productId: ad.product?._id || ad.product
                    })}
                  </div>
                ) : null;
              })}
            </section>
          )}

          {/* New Arrivals & Best Selling */}
          <section className="flex flex-col gap-8">
            <ErrorBoundary fallback={null}>
              <div>
                <div className="flex items-center mb-4">
                  <ArrowRightIcon className="h-6 w-6 text-orange-500 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">New Arrivals</h2>
                </div>
                <div className="overflow-x-auto flex gap-4 pb-2">
                  {newArrivals.map(product => (
                    <div 
                      key={`new-${product._id}`}
                      className="min-w-[180px] max-w-[200px] flex-shrink-0"
                    >
                      <ProductCard product={product} small />
                    </div>
                  ))}
                </div>
              </div>
            </ErrorBoundary>

            <ErrorBoundary fallback={null}>
              <div>
                <div className="flex items-center mb-4">
                  <StarIcon className="h-6 w-6 text-orange-500 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Best Selling</h2>
                </div>
                <div className="overflow-x-auto flex gap-4 pb-2">
                  {bestSelling.map(product => (
                    <div 
                      key={`best-${product._id}`}
                      className="min-w-[180px] max-w-[200px] flex-shrink-0"
                    >
                      <ProductCard product={product} small />
                    </div>
                  ))}
                </div>
              </div>
            </ErrorBoundary>
          </section>

          {/* Bottom Adverts */}
          {bottomAdverts.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bottomAdverts.map(ad => {
                const Template = ADVERT_TEMPLATES.find(t => t.id === (ad.template || 'classic'))?.render;
                return Template ? (
                  <div key={ad._id}>
                    {Template({
                      title: ad.title,
                      message: ad.message,
                      image: ad.image,
                      product: ad.product?.title || ad.product?.name,
                      productId: ad.product?._id || ad.product
                    })}
                  </div>
                ) : null;
              })}
            </section>
          )}

          {/* Live Events */}
          {events.length > 0 && (
            <ErrorBoundary fallback={null}>
              <section className="py-8 bg-purple-50 border-b border-purple-200 rounded-2xl">
                <h2 className="text-xl font-bold text-purple-800 mb-4">Upcoming Live Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.slice(0, 3).map(event => (
                    <div key={event._id} className="bg-white rounded shadow p-4 flex flex-col">
                      {event.image && (
                        <img 
                          src={event.image} 
                          alt={`Event: ${event.title}`} 
                          className="w-full h-40 object-cover rounded mb-3" 
                        />
                      )}
                      <h3 className="text-lg font-bold mb-1">{event.title}</h3>
                      <div className="text-gray-500 text-sm mb-2">
                        {new Date(event.date).toLocaleString()}
                      </div>
                      <p className="mb-2 line-clamp-2">{event.description}</p>
                      {event.link && (
                        <a 
                          href={event.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline"
                        >
                          Join/More Info
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-right mt-4">
                  <Link 
                    to="/events" 
                    className="text-purple-700 hover:underline font-medium"
                    aria-label="View all events"
                  >
                    See all events
                  </Link>
                </div>
              </section>
            </ErrorBoundary>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <ErrorBoundary fallback={null}>
              <section className="py-12 bg-gray-50 rounded-2xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    What Our Customers Say
                  </h2>
                  <p className="text-lg text-gray-600">
                    Don't just take our word for it
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex items-center mb-4" aria-label={`Rating: ${testimonial.rating} stars`}>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4">"{testimonial.message}"</p>
                      <p className="font-semibold text-gray-900">
                        {testimonial.name || 'Anonymous'}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </ErrorBoundary>
          )}
        </main>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <ErrorBoundary fallback={null}>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex items-center mb-4">
                <ArrowRightIcon className="h-6 w-6 text-orange-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
              </div>
              <div className="overflow-x-auto flex gap-4 pb-2">
                {recentlyViewed.map(product => (
                  <div 
                    key={`recent-${product._id}`}
                    className="min-w-[180px] max-w-[200px] flex-shrink-0"
                  >
                    <ProductCard product={product} small />
                  </div>
                ))}
              </div>
            </section>
          </ErrorBoundary>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <ErrorBoundary fallback={null}>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="flex items-center mb-4">
                <StarIcon className="h-6 w-6 text-orange-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
              </div>
              <div className="overflow-x-auto flex gap-4 pb-2">
                {recommended.map(product => (
                  <div 
                    key={`recommended-${product._id}`}
                    className="min-w-[180px] max-w-[200px] flex-shrink-0"
                  >
                    <ProductCard product={product} small />
                  </div>
                ))}
              </div>
            </section>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default Home;
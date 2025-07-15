import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../contexts/ToastContext';
import { 
  ArrowRightIcon, 
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { io } from 'socket.io-client';
import { Helmet } from 'react-helmet';
import gambiaMarket from '../assets/gambia-market.jpg';

const getAdvertImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('/uploads')) {
    return `https://myshop-hhfv.onrender.com${image}`;
  }
  return image;
};

const advertTemplates = [
  {
    id: 'classic',
    render: ({ title, message, image, product, productId }) => (
      productId ? (
        <Link to={`/products/${productId}`} className="block group">
          <div className="card flex gap-6 items-center mb-6 animate-fade-in group-hover:shadow-lg transition-shadow">
            {image && <img src={getAdvertImageUrl(image)} alt="Advert" className="w-28 h-28 object-cover rounded-2xl shadow-soft" />}
            <div>
              <h2 className="text-2xl font-heading font-bold text-secondary mb-1 group-hover:text-primary transition-colors">{title}</h2>
              <p className="text-gray-700 mb-2">{message}</p>
              {product && <span className="text-primary underline text-sm mt-2 block font-medium">View Product</span>}
            </div>
          </div>
        </Link>
      ) : (
        <div className="card flex gap-6 items-center mb-6 animate-fade-in">
          {image && <img src={getAdvertImageUrl(image)} alt="Advert" className="w-28 h-28 object-cover rounded-2xl shadow-soft" />}
          <div>
            <h2 className="text-2xl font-heading font-bold text-secondary mb-1">{title}</h2>
            <p className="text-gray-700 mb-2">{message}</p>
          </div>
        </div>
      )
    )
  },
  {
    id: 'banner',
    render: ({ title, message, image }) => (
      <div className="relative h-36 flex items-center justify-center bg-primary-light rounded-2xl overflow-hidden mb-6 animate-slide-in">
        {image && <img src={getAdvertImageUrl(image)} alt="Advert" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-heading font-bold text-primary drop-shadow mb-1">{title}</h2>
          <p className="text-primary-dark text-lg">{message}</p>
        </div>
      </div>
    )
  },
  {
    id: 'card',
    render: ({ title, message, image }) => (
      <div className="bg-gradient-to-br from-primary-light to-accent-light rounded-2xl p-6 flex flex-col items-center mb-6 animate-bounce-in">
        {image && <img src={getAdvertImageUrl(image)} alt="Advert" className="w-24 h-24 object-cover rounded-full mb-3 shadow-soft" />}
        <h2 className="text-xl font-heading font-bold text-primary mb-1">{title}</h2>
        <p className="text-base text-secondary mb-1">{message}</p>
      </div>
    )
  },
  {
    id: 'left-image',
    render: ({ title, message, image, product }) => (
      <div className="flex items-center bg-gradient-to-r from-accent to-primary text-white rounded-2xl p-6 gap-6 mb-6 animate-slide-in">
        {image && <img src={getAdvertImageUrl(image)} alt="Advert" className="w-32 h-32 object-cover rounded-2xl shadow-strong" />}
        <div>
          <h2 className="text-2xl font-heading font-bold mb-1">{title}</h2>
          <p className="text-white mb-2">{message}</p>
          {product && <span className="text-xs bg-white/20 px-3 py-1 rounded-xl">{product}</span>}
        </div>
      </div>
    )
  },
  {
    id: 'cta-card',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-surface border-2 border-primary rounded-2xl p-8 flex flex-col items-center shadow-strong mb-6 animate-fade-in">
        {image && <img src={getAdvertImageUrl(image)} alt="Advert" className="w-28 h-28 object-cover rounded-full border-4 border-primary-light mb-3" />}
        <h2 className="text-2xl font-heading font-bold text-primary mb-1">{title}</h2>
        <p className="text-secondary mb-2">{message}</p>
        {product && <span className="text-xs text-primary mb-2">{product}</span>}
        {productId ? (
          <Link to={`/products/${productId}`} className="btn-primary mt-2">Shop Now</Link>
        ) : (
          <button className="btn-primary mt-2" disabled>Shop Now</button>
        )}
      </div>
    )
  },
];

const HERO_IMAGE = gambiaMarket;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const { error, info, success, warning } = useToast();
  const socketRef = React.useRef(null);
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'Electronics', name: 'Electronics' },
    { id: 'Computers & Laptops', name: 'Computers & Laptops' },
    { id: 'Mobile Phones', name: 'Mobile Phones' },
    { id: 'Accessories', name: 'Accessories' },
    { id: 'Home & Kitchen', name: 'Home & Kitchen' },
    { id: 'Sports', name: 'Sports' },
    { id: 'Fashion', name: 'Fashion' },
    { id: 'Beauty', name: 'Beauty & Personal Care' },
    { id: 'Toys', name: 'Toys & Games' },
    { id: 'Books', name: 'Books' },
    { id: 'Automotive', name: 'Automotive' },
    { id: 'Groceries', name: 'Groceries' },
    { id: 'Health', name: 'Health & Wellness' },
    { id: 'Office', name: 'Office Supplies' },
    { id: 'Garden', name: 'Garden & Outdoors' },
    { id: 'Pets', name: 'Pet Supplies' },
    { id: 'Baby', name: 'Baby & Kids' },
    { id: 'Music', name: 'Music & Instruments' },
    { id: 'Art', name: 'Art & Craft' },
    { id: 'Jewelry', name: 'Jewelry' },
    { id: 'Shoes', name: 'Shoes' },
    { id: 'Bags', name: 'Bags & Luggage' },
    { id: 'Watches', name: 'Watches' },
    { id: 'Phones', name: 'Phones & Tablets' },
    { id: 'Cameras', name: 'Cameras & Photography' },
    { id: 'Gaming', name: 'Gaming' },
    { id: 'Stationery', name: 'Stationery' },
    { id: 'Food', name: 'Food & Beverages' },
    { id: 'Tools', name: 'Tools & Hardware' },
    { id: 'Travel', name: 'Travel' },
    { id: 'Fitness', name: 'Fitness & Exercise' }
  ];
  const [adverts, setAdverts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const searchInputRef = useRef();
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dealCountdown, setDealCountdown] = useState(3600); // 1 hour in seconds
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerIntervalRef = useRef();
  // Use topAdverts as banners for now
  const splitAdverts = (adverts) => {
    if (adverts.length <= 3) return { top: adverts, middle: [], bottom: [] };
    return {
      top: adverts.slice(0, 2),
      middle: adverts.slice(2, 4),
      bottom: adverts.slice(4)
    };
  };

  const { top: topAdverts, middle: middleAdverts, bottom: bottomAdverts } = splitAdverts(adverts);
  const banners = topAdverts.length > 0 ? topAdverts : adverts.slice(0, 3);
  // Carousel auto-advance
  useEffect(() => {
    if (banners.length <= 1) return;
    bannerIntervalRef.current = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(bannerIntervalRef.current);
  }, [banners.length]);
  const handlePrevBanner = () => setBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  const handleNextBanner = () => setBannerIndex((prev) => (prev + 1) % banners.length);

  // Fetch new arrivals
  const fetchNewArrivals = async () => {
    try {
      const response = await axios.get('/products');
      setNewArrivals((response.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4));
    } catch (err) {
      setNewArrivals([]);
    }
  };

  // Fetch best selling
  const fetchBestSelling = async () => {
    try {
      const response = await axios.get('/products/best-selling');
      setBestSelling(response.data || []);
    } catch (err) {
      setBestSelling([]);
    }
  };

  useEffect(() => {
    fetchNewArrivals();
    fetchBestSelling();
    fetchEvents();
    fetchAdverts();
    axios.get('/testimonials')
      .then(res => setTestimonials(res.data.testimonials || []))
      .catch(() => setTestimonials([]));
    // Simulate fetching testimonials
    // setTestimonials([
    //   {
    //     name: 'Sarah Johnson',
    //     rating: 5,
    //     comment: 'Amazing quality products and fast delivery. Highly recommended!'
    //   },
    //   {
    //     name: 'Mike Chen',
    //     rating: 5,
    //     comment: 'Great customer service and competitive prices. Will shop again!'
    //   },
    //   {
    //     name: 'Emily Davis',
    //     rating: 5,
    //     comment: 'Love the variety of products and easy checkout process.'
    //   }
    // ]);
    // Real-time events
    if (!socketRef.current) {
      const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://myshop-hhfv.onrender.com';
      socketRef.current = io(socketUrl, { 
        transports: ['websocket'],
        withCredentials: true
      });
      socketRef.current.on('event_created', (event) => {
        fetchEvents();
        success(`New event: ${event.title}`);
      });
      socketRef.current.on('event_updated', (event) => {
        fetchEvents();
        info(`Event updated: ${event.title}`);
      });
      socketRef.current.on('event_deleted', (eventId) => {
        fetchEvents();
        warning('An event was deleted');
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line
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

  // Fetch products from backend with search and category
  const fetchProducts = async (searchTerm = '', category = 'all') => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category && category !== 'all') params.category = category;
      const response = await axios.get('/products', { params });
      setProducts(response.data || []);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when search or category changes
  useEffect(() => {
    setLoading(true);
    fetchProducts(search, selectedCategory);
    // eslint-disable-next-line
  }, [search, selectedCategory]);

  // Add a sample flash deals array (could be improved to fetch from backend)
  const flashDeals = products.filter(p => p.isDeal || p.price < 20).slice(0, 6);

  const features = [
    {
      icon: TruckIcon,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payment',
      description: '100% secure payment processing'
    },
    {
      icon: ArrowPathIcon,
      title: 'Easy Returns',
      description: '30-day return policy'
    },
    {
      icon: CreditCardIcon,
      title: 'Multiple Payment',
      description: 'Credit card, PayPal, and more'
    }
  ];

  const nextEvent = events.length > 0 ? events[0] : null;

  if (loading) return <LoadingSpinner />;

  // Recommended for You: products from the same category as the most recently viewed, excluding already viewed
  let recommended = [];
  if (recentlyViewed.length > 0) {
    const lastViewed = recentlyViewed[0];
    recommended = products.filter(p =>
      p.category === lastViewed.category &&
      !recentlyViewed.some(rv => rv._id === p._id)
    ).slice(0, 8);
    // If not enough, fill with best sellers not already viewed
    if (recommended.length < 8) {
      const bestFill = bestSelling.filter(p => !recentlyViewed.some(rv => rv._id === p._id) && !recommended.some(r => r._id === p._id)).slice(0, 8 - recommended.length);
      recommended = recommended.concat(bestFill);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MyShopping Center - Home</title>
        <meta name="description" content="Shop the best products, discover deals, and enjoy fast delivery at MyShopping Center. Electronics, fashion, home, and more!" />
        <meta name="keywords" content="shopping, ecommerce, deals, electronics, fashion, home, delivery, online store" />
        <meta property="og:title" content="MyShopping Center - Your One-Stop Shopping Destination" />
        <meta property="og:description" content="Shop the best products, discover deals, and enjoy fast delivery at MyShopping Center." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://myshoppingcenter.com/" />
        <meta property="og:image" content="https://myshoppingcenter.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MyShopping Center - Your One-Stop Shopping Destination" />
        <meta name="twitter:description" content="Shop the best products, discover deals, and enjoy fast delivery at MyShopping Center." />
        <meta name="twitter:image" content="https://myshoppingcenter.com/logo.png" />
        <link rel="canonical" href="https://myshoppingcenter.com/" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MyShopping Center",
            "url": "https://myshoppingcenter.com/",
            "logo": "https://myshoppingcenter.com/logo.png",
            "sameAs": [
              "https://www.facebook.com/myshoppingcenter",
              "https://twitter.com/myshoppingcenter"
            ]
          }
        `}</script>
      </Helmet>
      {/* Top Search Bar (always visible, sticky on mobile) */}
      <div className="w-full bg-white shadow sticky top-0 z-30 px-2 py-2 md:hidden flex items-center gap-2">
        <MagnifyingGlassIcon className="h-6 w-6 text-orange-600 ml-2" />
        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for products, brands, categories..."
          className="flex-1 px-4 py-2 bg-transparent outline-none text-base text-gray-900"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-orange-600 px-2">
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {/* Hero Section with Search (desktop only) */}
      <section className="relative w-full h-[350px] md:h-[420px] flex items-center justify-center mb-8 bg-gradient-to-br from-orange-100 to-orange-200 hidden md:flex">
        <img
          src={HERO_IMAGE}
          alt="Market Hero"
          className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-60"
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-orange-900 drop-shadow mb-4 animate-fade-in">Welcome to MyShopping Center</h1>
          <p className="text-lg md:text-2xl text-gray-900 mb-6 max-w-2xl animate-fade-in">Discover the best products, unbeatable deals, and a vibrant marketplace experience. Shop with confidence and enjoy fast delivery!</p>
          {/* Search Bar (desktop only) */}
          <div className="w-full max-w-2xl flex items-center bg-white rounded-2xl shadow-lg p-2 mb-4 animate-slide-in">
            <MagnifyingGlassIcon className="h-6 w-6 text-orange-600 ml-2" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for products, brands, categories..."
              className="flex-1 px-4 py-2 bg-transparent outline-none text-lg text-gray-900"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-orange-600 px-2">
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <Link to="/products" className="btn-primary text-lg px-8 py-3 animate-bounce-in">Shop Now</Link>
        </div>
      </section>
      {/* Main Banner Carousel (below search/hero) */}
      {banners.length > 0 && (
        <section className="max-w-5xl mx-auto mb-8 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            {banners.map((ad, idx) => {
              const Template = advertTemplates.find(t => t.id === (ad.template || 'banner'))?.render;
              return (
                <div
                  key={ad._id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${idx === bannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                >
                  {Template ? Template({
                    title: ad.title,
                    message: ad.message,
                    image: ad.image,
                    product: ad.product?.title || ad.product?.name,
                    productId: ad.product?._id || ad.product
                  }) : null}
                </div>
              );
            })}
            {/* Carousel Controls */}
            {banners.length > 1 && (
              <>
                <button onClick={handlePrevBanner} className="absolute left-2 top-1/2 -translate-y-1/2 bg-orange-200/90 hover:bg-orange-300 text-orange-900 rounded-full p-2 shadow z-20 border border-orange-400"><ArrowRightIcon className="h-6 w-6 rotate-180" /></button>
                <button onClick={handleNextBanner} className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-200/90 hover:bg-orange-300 text-orange-900 rounded-full p-2 shadow z-20 border border-orange-400"><ArrowRightIcon className="h-6 w-6" /></button>
              </>
            )}
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIndex(i)}
                  className={`w-3 h-3 rounded-full border-2 ${i === bannerIndex ? 'bg-orange-600 border-orange-600' : 'bg-orange-200 border-orange-400'}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Responsive Grid: Sidebar + Main Content */}
      <div className="md:grid md:grid-cols-5 gap-8">
        {/* Sidebar: Categories (desktop only) */}
        <aside className="md:col-span-1 hidden md:block">
          <div className="bg-white rounded-2xl shadow-lg p-4 h-fit sticky top-24 self-start">
            <h3 className="text-lg font-bold text-orange-700 mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category.id}>
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${selectedCategory === category.id ? 'bg-orange-600 text-white' : 'text-gray-900 hover:bg-orange-100'}`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Main Content */}
        <main className="md:col-span-4 flex flex-col gap-8">
          {/* Mobile: Horizontal Category Bar (improved) */}
          <div className="md:hidden w-full overflow-x-auto flex gap-2 py-2 mb-4 sticky top-0 z-20 bg-white shadow-sm border-b border-orange-100">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium border transition-colors whitespace-nowrap ${selectedCategory === category.id ? 'bg-orange-600 text-white border-orange-600' : 'bg-orange-100 text-gray-900 border-orange-200 hover:bg-orange-200'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
          {/* Flash Deals Section */}
          {flashDeals.length > 0 && (
            <section className="bg-gradient-to-r from-orange-400 to-yellow-200 rounded-2xl p-6 mb-4 shadow-lg">
              <div className="flex items-center mb-4">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold mr-3">Flash Deals</span>
                <span className="text-lg font-bold text-orange-900 mr-4">Limited Time Offers</span>
                <span className="ml-auto bg-white text-orange-700 px-3 py-1 rounded-full text-xs font-mono font-bold shadow">{formatCountdown(dealCountdown)}</span>
              </div>
              <div className="overflow-x-auto flex gap-4 pb-2">
                {flashDeals.map(product => (
                  <div className="min-w-[180px] max-w-[200px] flex-shrink-0">
                    <ProductCard key={product._id} product={{...product, isDeal: true}} small />
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Top Adverts Section */}
          {topAdverts.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topAdverts.map(ad => {
                const Template = advertTemplates.find(t => t.id === (ad.template || 'classic'))?.render;
                return Template ? (
                  <div key={ad._id}>{Template({
                    title: ad.title,
                    message: ad.message,
                    image: ad.image,
                    product: ad.product?.title || ad.product?.name,
                    productId: ad.product?._id || ad.product
                  })}</div>
                ) : null;
              })}
            </section>
          )}
          {/* Features Section */}
          <section className="bg-gray-50 rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 text-white rounded-full mb-4">
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
          {/* Product Grid Section - Responsive/Scrollable */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCategory === 'all' ? 'Featured Products' : categories.find(cat => cat.id === selectedCategory)?.name}</h2>
              <Link to="/products" className="text-orange-600 hover:underline font-medium">View All</Link>
            </div>
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden overflow-x-auto flex gap-4 pb-2">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <div className="min-w-[180px] max-w-[200px] flex-shrink-0" key={product._id}>
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 w-full">
                  <p className="text-gray-500">No products found. Try a different search or category.</p>
                </div>
              )}
            </div>
            {/* Desktop: Grid */}
            <div className="hidden md:grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No products found. Try a different search or category.</p>
                </div>
              )}
            </div>
          </section>
          {/* Middle Adverts Section */}
          {middleAdverts.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {middleAdverts.map(ad => {
                const Template = advertTemplates.find(t => t.id === (ad.template || 'classic'))?.render;
                return Template ? (
                  <div key={ad._id}>{Template({
                    title: ad.title,
                    message: ad.message,
                    image: ad.image,
                    product: ad.product?.title || ad.product?.name,
                    productId: ad.product?._id || ad.product
                  })}</div>
                ) : null;
              })}
            </section>
          )}
          {/* New Arrivals & Best Selling (as horizontal carousels) */}
          <section className="flex flex-col gap-8">
            <div>
              <div className="flex items-center mb-4">
                <ArrowRightIcon className="h-6 w-6 text-orange-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">New Arrivals</h2>
              </div>
              <div className="overflow-x-auto flex gap-4 pb-2">
                {newArrivals.map(product => (
                  <div className="min-w-[180px] max-w-[200px] flex-shrink-0">
                    <ProductCard key={product._id} product={product} small />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center mb-4">
                <StarIcon className="h-6 w-6 text-orange-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Best Selling</h2>
              </div>
              <div className="overflow-x-auto flex gap-4 pb-2">
                {bestSelling.map(product => (
                  <div className="min-w-[180px] max-w-[200px] flex-shrink-0">
                    <ProductCard key={product._id} product={product} small />
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* Bottom Adverts Section */}
          {bottomAdverts.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bottomAdverts.map(ad => {
                const Template = advertTemplates.find(t => t.id === (ad.template || 'classic'))?.render;
                return Template ? (
                  <div key={ad._id}>{Template({
                    title: ad.title,
                    message: ad.message,
                    image: ad.image,
                    product: ad.product?.title || ad.product?.name,
                    productId: ad.product?._id || ad.product
                  })}</div>
                ) : null;
              })}
            </section>
          )}
          {/* Live Events Section */}
          {events.length > 0 && (
            <section className="py-8 bg-purple-50 border-b border-purple-200 rounded-2xl">
              <h2 className="text-xl font-bold text-purple-800 mb-4">Upcoming Live Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.slice(0, 3).map(event => (
                  <div key={event._id} className="bg-white rounded shadow p-4 flex flex-col">
                    {event.image && <img src={event.image} alt={event.title} className="w-full h-40 object-cover rounded mb-3" />}
                    <h3 className="text-lg font-bold mb-1">{event.title}</h3>
                    <div className="text-gray-500 text-sm mb-2">{new Date(event.date).toLocaleString()}</div>
                    <p className="mb-2 line-clamp-2">{event.description}</p>
                    {event.link && <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Join/More Info</a>}
                  </div>
                ))}
              </div>
              <div className="text-right mt-4">
                <Link to="/events" className="text-purple-700 hover:underline font-medium">See all events</Link>
              </div>
            </section>
          )}
          {/* Testimonials Section */}
          {testimonials.length > 0 && (
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
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">"{testimonial.message}"</p>
                    <p className="font-semibold text-gray-900">{testimonial.name || 'Anonymous'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center mb-4">
              <ArrowRightIcon className="h-6 w-6 text-orange-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
            </div>
            <div className="overflow-x-auto flex gap-4 pb-2">
              {recentlyViewed.map(product => (
                <div className="min-w-[180px] max-w-[200px] flex-shrink-0" key={product._id}>
                  <ProductCard product={product} small />
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Recommended for You Section */}
        {recommended.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center mb-4">
              <StarIcon className="h-6 w-6 text-orange-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            </div>
            <div className="overflow-x-auto flex gap-4 pb-2">
              {recommended.map(product => (
                <div className="min-w-[180px] max-w-[200px] flex-shrink-0" key={product._id}>
                  <ProductCard product={product} small />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home; 
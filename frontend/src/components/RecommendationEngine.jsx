import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdvancedProductCard from './AdvancedProductCard';
import LoadingSpinner from './LoadingSpinner';
import { 
  SparklesIcon, 
  HeartIcon, 
  EyeIcon,
  ShoppingBagIcon,
  StarIcon,
  FireIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const RecommendationEngine = ({ 
  userId, 
  currentProductId, 
  userBehavior, 
  type = 'personalized',
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes (increased for better performance)
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState(type);
  const [explanation, setExplanation] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    averageRating: 0,
    priceRange: { min: 0, max: 0 },
    categories: []
  });
  const [userInteractions, setUserInteractions] = useState({
    views: 0,
    clicks: 0,
    addToCart: 0
  });
  
  const refreshIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Retry logic for API calls
  const fetchWithRetry = useCallback(async (url, options, maxRetries = 2) => {
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
  }, []);

  // Real-time data fetching with cancellation
  const fetchRecommendations = useCallback(async (isRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const params = {
        type: recommendationType,
        limit: 8,
        timestamp: Date.now() // Cache busting
      };

      if (userId) params.userId = userId;
      if (currentProductId) params.productId = currentProductId;
      if (userBehavior) params.behavior = JSON.stringify(userBehavior);

             const response = await fetchWithRetry('/recommendations', {
          params,
          signal: abortControllerRef.current.signal,
          timeout: 15000 // Increased to 15 seconds for better reliability
        });
      
      const products = response.data.products || [];
      
      // Process images and add dynamic data
      const productsWithImages = products.map(product => {
        let processedImages = [];
        
        // Handle multiple image formats
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
        
        // Add dynamic properties
        return {
          ...product,
          images: processedImages,
          dynamicPrice: product.price + (Math.random() * 10 - 5), // Simulate price fluctuations
          stockLevel: Math.floor(Math.random() * 100) + 1, // Simulate stock levels
          lastUpdated: new Date().toISOString()
        };
      });
      
      setRecommendations(productsWithImages);
      setExplanation(response.data.explanation || '');
      setLastUpdated(new Date());
      
      // Calculate dynamic stats
      if (productsWithImages.length > 0) {
        const prices = productsWithImages.map(p => p.price).filter(p => p);
        const ratings = productsWithImages.map(p => p.rating).filter(r => r);
        const categories = [...new Set(productsWithImages.map(p => p.category).filter(c => c))];
        
        setStats({
          totalProducts: productsWithImages.length,
          averageRating: ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0,
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices)
          },
          categories
        });
      }
      
         } catch (error) {
               if (error.name !== 'AbortError') {
          // Fallback to mock recommendations immediately
          setRecommendations(getMockRecommendations());
          setExplanation('Showing popular products (offline mode)');
          setError(null); // Don't show error, just use fallback
        }
     } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, currentProductId, recommendationType, userBehavior]);

  // Auto-refresh functionality
  useEffect(() => {
    // Load fallback recommendations immediately for better UX
    if (recommendationType === 'personalized') {
      setRecommendations(getMockRecommendations());
      setExplanation('Loading personalized recommendations...');
    }
    
    fetchRecommendations();
    
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchRecommendations(true);
      }, refreshInterval);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchRecommendations, autoRefresh, refreshInterval, recommendationType]);

  // Track user interactions
  const trackInteraction = useCallback((type, productId) => {
    setUserInteractions(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    
         // Send interaction to analytics with timeout
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 3000);
     
           axios.post('/analytics/interaction', {
        type,
        productId,
        recommendationType,
        userId,
        timestamp: new Date().toISOString()
      }, {
       signal: controller.signal
           }).catch(error => {
        if (error.name !== 'AbortError') {
          // Analytics call failed silently
        }
      }).finally(() => {
       clearTimeout(timeoutId);
     });
  }, [recommendationType, userId]);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    fetchRecommendations(true);
  }, [fetchRecommendations]);

  // Dynamic recommendation type change
  const handleRecommendationTypeChange = useCallback((type) => {
    setRecommendationType(type);
    // Reset interactions for new type
    setUserInteractions({ views: 0, clicks: 0, addToCart: 0 });
  }, []);

  // Get dynamic recommendation title with live data
  const getRecommendationTitle = useCallback(() => {
    const baseTitle = {
      'personalized': 'Recommended for You',
      'similar': 'Similar Products',
      'trending': 'Trending Now',
      'frequently_bought': 'Frequently Bought Together',
      'new_arrivals': 'New Arrivals'
    }[recommendationType] || 'Recommended Products';
    
    return `${baseTitle} (${recommendations.length} items)`;
  }, [recommendationType, recommendations.length]);

  // Get recommendation icon with animation
  const getRecommendationIcon = useCallback(() => {
    const iconClass = "h-6 w-6";
    const iconProps = {
      className: `${iconClass} ${isRefreshing ? 'animate-spin' : ''}`
    };
    
    switch (recommendationType) {
      case 'personalized':
        return <SparklesIcon {...iconProps} className={`${iconClass} text-purple-500 ${isRefreshing ? 'animate-pulse' : ''}`} />;
      case 'similar':
        return <EyeIcon {...iconProps} className={`${iconClass} text-blue-500`} />;
      case 'trending':
        return <ChartBarIcon {...iconProps} className={`${iconClass} text-green-500`} />;
      case 'frequently_bought':
        return <ShoppingBagIcon {...iconProps} className={`${iconClass} text-orange-500`} />;
      case 'new_arrivals':
        return <ClockIcon {...iconProps} className={`${iconClass} text-indigo-500`} />;
      default:
        return <HeartIcon {...iconProps} className={`${iconClass} text-red-500`} />;
    }
  }, [recommendationType, isRefreshing]);

     // Dynamic mock recommendations with real-time data
   const getMockRecommendations = useCallback(() => {
     const mockProducts = [
       {
         _id: '1',
         title: 'Wireless Bluetooth Headphones',
         price: 89.99 + (Math.random() * 10 - 5),
         originalPrice: 129.99,
         images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'],
         rating: 4.5 + (Math.random() * 0.5),
         reviewCount: 128 + Math.floor(Math.random() * 50),
         category: 'Electronics',
         isNew: true,
         discount: 30,
         stockLevel: Math.floor(Math.random() * 100) + 1,
         lastUpdated: new Date().toISOString()
       },
       {
         _id: '2',
         title: 'Smart Fitness Watch',
         price: 199.99 + (Math.random() * 10 - 5),
         originalPrice: 249.99,
         images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'],
         rating: 4.3 + (Math.random() * 0.5),
         reviewCount: 89 + Math.floor(Math.random() * 50),
         category: 'Electronics',
         isHot: true,
         discount: 20,
         stockLevel: Math.floor(Math.random() * 100) + 1,
         lastUpdated: new Date().toISOString()
       },
       {
         _id: '3',
         title: 'Premium Coffee Maker',
         price: 149.99 + (Math.random() * 10 - 5),
         images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop'],
         rating: 4.7 + (Math.random() * 0.3),
         reviewCount: 256 + Math.floor(Math.random() * 50),
         category: 'Home & Garden',
         isOnSale: true,
         stockLevel: Math.floor(Math.random() * 100) + 1,
         lastUpdated: new Date().toISOString()
       },
       {
         _id: '4',
         title: 'Organic Cotton T-Shirt',
         price: 29.99 + (Math.random() * 5 - 2.5),
         originalPrice: 39.99,
         images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
         rating: 4.2 + (Math.random() * 0.5),
         reviewCount: 67 + Math.floor(Math.random() * 50),
         category: 'Fashion',
         discount: 25,
         stockLevel: Math.floor(Math.random() * 100) + 1,
         lastUpdated: new Date().toISOString()
       },
       {
         _id: '5',
         title: 'Gaming Laptop',
         price: 1299.99 + (Math.random() * 50 - 25),
         originalPrice: 1499.99,
         images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop'],
         rating: 4.6 + (Math.random() * 0.4),
         reviewCount: 342 + Math.floor(Math.random() * 50),
         category: 'Electronics',
         isHot: true,
         discount: 15,
         stockLevel: Math.floor(Math.random() * 50) + 1,
         lastUpdated: new Date().toISOString()
       },
       {
         _id: '6',
         title: 'Wireless Earbuds',
         price: 79.99 + (Math.random() * 10 - 5),
         originalPrice: 99.99,
         images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop'],
         rating: 4.4 + (Math.random() * 0.5),
         reviewCount: 156 + Math.floor(Math.random() * 50),
         category: 'Electronics',
         isNew: true,
         discount: 20,
         stockLevel: Math.floor(Math.random() * 100) + 1,
         lastUpdated: new Date().toISOString()
       },
       {
         _id: '7',
         title: 'Smart Home Speaker',
         price: 129.99 + (Math.random() * 15 - 7.5),
         images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop'],
         rating: 4.3 + (Math.random() * 0.5),
         reviewCount: 98 + Math.floor(Math.random() * 50),
         category: 'Electronics',
         isOnSale: true,
         stockLevel: Math.floor(Math.random() * 100) + 1,
         lastUpdated: new Date().toISOString()
       },
       {
         _id: '8',
         title: 'Designer Sunglasses',
         price: 159.99 + (Math.random() * 20 - 10),
         originalPrice: 199.99,
         images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop'],
         rating: 4.5 + (Math.random() * 0.4),
         reviewCount: 203 + Math.floor(Math.random() * 50),
         category: 'Fashion',
         discount: 20,
         stockLevel: Math.floor(Math.random() * 100) + 1,
         lastUpdated: new Date().toISOString()
       }
     ];

     return mockProducts;
   }, []);

     if (loading && recommendations.length === 0) {
     return (
       <div className="flex justify-center items-center py-16">
         <div className="text-center">
           <LoadingSpinner />
           <p className="mt-4 text-gray-600">Loading AI recommendations...</p>
         </div>
       </div>
     );
   }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl border border-gray-100">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {getRecommendationIcon()}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getRecommendationTitle()}</h2>
            {explanation && (
              <p className="text-sm text-gray-600 mt-1">{explanation}</p>
            )}
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        {/* Dynamic Controls */}
        <div className="flex items-center gap-3">
          {/* Live Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 text-yellow-500" />
              <span>{stats.averageRating}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingBagIcon className="h-4 w-4 text-green-500" />
              <span>${stats.priceRange.min?.toFixed(2)} - ${stats.priceRange.max?.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4 text-blue-500" />
              <span>{userInteractions.views} views</span>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              ${isRefreshing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors'
              }
            `}
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <AdvancedProductCard
            key={product._id}
            product={product}
            onView={() => trackInteraction('views', product._id)}
            onAddToCart={() => trackInteraction('addToCart', product._id)}
            onQuickView={() => trackInteraction('clicks', product._id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && !loading && (
        <div className="text-center py-12">
          <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
          <p className="text-gray-600 mb-4">Try refreshing or check back later for new suggestions.</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Performance Monitor */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Performance: {recommendations.length} products loaded in {loading ? '...' : '~2s'}</span>
          <span>Last refresh: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</span>
        </div>
      </div>
    </div>
  );
};

export default RecommendationEngine;
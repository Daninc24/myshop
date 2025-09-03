import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  BellIcon,
  TrashIcon,
  ShoppingCartIcon,
  EyeIcon,
  ShareIcon,
  SparklesIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

const WishlistWithPriceAlerts = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { success, error: showError } = useToast();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState({});
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [alertPrice, setAlertPrice] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('date'); // date, price, name, rating

  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/wishlist');
      const items = response.data.items || [];
      
      // Enhance items with price tracking data
      const enhancedItems = items.map(item => ({
        ...item,
        priceHistory: item.priceHistory || [],
        lowestPrice: item.lowestPrice || item.price,
        priceDrop: item.priceDrop || 0,
        daysInWishlist: Math.floor((Date.now() - new Date(item.addedAt).getTime()) / (1000 * 60 * 60 * 24))
      }));
      
      setWishlistItems(enhancedItems);
      
      // Fetch price alerts
      const alertsResponse = await axios.get('/wishlist/price-alerts');
      const alerts = {};
      alertsResponse.data.alerts?.forEach(alert => {
        alerts[alert.productId] = alert.targetPrice;
      });
      setPriceAlerts(alerts);
      
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      showError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Fetch AI recommendations for wishlist
  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await axios.get('/recommendations');
      setRecommendations(response.data.products || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchWishlist();
    fetchRecommendations();
  }, [fetchWishlist, fetchRecommendations]);

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`/wishlist/${productId}`);
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
      success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showError('Failed to remove item');
    }
  };

  // Add to cart from wishlist
  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      success('Added to cart');
    } catch (error) {
      showError('Failed to add to cart');
    }
  };

  // Set price alert
  const handleSetPriceAlert = async () => {
    if (!alertPrice || !selectedProduct) return;

    try {
      await axios.post('/wishlist/price-alerts', {
        productId: selectedProduct._id,
        targetPrice: parseFloat(alertPrice)
      });
      
      setPriceAlerts(prev => ({
        ...prev,
        [selectedProduct._id]: parseFloat(alertPrice)
      }));
      
      setShowPriceAlertModal(false);
      setSelectedProduct(null);
      setAlertPrice('');
      success('Price alert set successfully');
    } catch (error) {
      console.error('Error setting price alert:', error);
      showError('Failed to set price alert');
    }
  };

  // Share wishlist
  const shareWishlist = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Wishlist',
          text: 'Check out my wishlist on LuxeCart',
          url: `${window.location.origin}/wishlist`
        });
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(`${window.location.origin}/wishlist`);
        success('Wishlist URL copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing wishlist:', error);
    }
  };

  // Sort wishlist items
  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'date':
      default:
        return new Date(b.addedAt) - new Date(a.addedAt);
    }
  });

  // Calculate price drop percentage
  const getPriceDropPercentage = (currentPrice, originalPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HeartSolidIcon className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                {wishlistItems.length} items
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={shareWishlist}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <HeartIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-xl font-bold text-gray-900">{wishlistItems.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-green-100 rounded-lg">
                   <ArrowTrendingDownIcon className="h-5 w-5 text-green-600" />
                 </div>
                <div>
                  <p className="text-sm text-gray-600">Price Drops</p>
                  <p className="text-xl font-bold text-gray-900">
                    {wishlistItems.filter(item => item.priceDrop > 0).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BellIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price Alerts</p>
                  <p className="text-xl font-bold text-gray-900">
                    {Object.keys(priceAlerts).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    KES {wishlistItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
              </select>
              
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-1 w-4 h-4">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="space-y-1 w-4 h-4">
                    <div className="bg-current rounded-sm h-1"></div>
                    <div className="bg-current rounded-sm h-1"></div>
                    <div className="bg-current rounded-sm h-1"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="h-16 w-16 text-text-muted mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-text-primary mb-2">Your wishlist is empty</h3>
              <p className="text-text-secondary mb-6">Start adding products you love to your wishlist</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
            >
              <EyeIcon className="h-5 w-5" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {sortedItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Product Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Price Drop Badge */}
                  {item.priceDrop > 0 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      -{getPriceDropPercentage(item.price, item.originalPrice)}%
                    </div>
                  )}
                  
                  {/* Price Alert Badge */}
                  {priceAlerts[item._id] && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <BellIcon className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-gray-900">
                      KES {item.price.toLocaleString()}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through">
                        KES {item.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(item.rating || 0) ? 'text-yellow-400 fill-current' : 'text-text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({item.reviews || 0})</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
                    >
                      <ShoppingCartIcon className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedProduct(item);
                        setAlertPrice(priceAlerts[item._id]?.toString() || '');
                        setShowPriceAlertModal(true);
                      }}
                      className={`p-2 rounded-xl border transition-colors ${
                        priceAlerts[item._id]
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <BellIcon className="h-4 w-4" />
                    </button>
                    
                    <Link
                      to={`/products/${item._id}`}
                      className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Price History */}
                  {item.priceHistory && item.priceHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Lowest price: KES {item.lowestPrice?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">You Might Also Like</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.slice(0, 4).map((product) => (
                <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        KES {product.price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                      >
                        <ShoppingCartIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Alert Modal */}
      <AnimatePresence>
        {showPriceAlertModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPriceAlertModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Set Price Alert</h3>
              <p className="text-gray-600 mb-4">
                Get notified when "{selectedProduct.name}" drops to your target price.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Price (KES)
                </label>
                <input
                  type="number"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  placeholder="Enter target price"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPriceAlertModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetPriceAlert}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Set Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishlistWithPriceAlerts;

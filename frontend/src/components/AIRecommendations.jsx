import React, { useState, useEffect, useMemo } from 'react';
import { SparklesIcon, EyeIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from './ProductCard';

const AIRecommendations = ({ currentProduct, userBehavior, maxItems = 4 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Simulate AI recommendation algorithm
  const generateRecommendations = useMemo(() => {
    return (products, userData, currentProduct) => {
      if (!products || products.length === 0) return [];

      let scoredProducts = products.map(product => {
        let score = 0;

        // Category similarity (40% weight)
        if (currentProduct && product.category === currentProduct.category) {
          score += 40;
        }

        // Price range similarity (25% weight)
        if (currentProduct) {
          const priceDiff = Math.abs(product.price - currentProduct.price);
          const priceSimilarity = Math.max(0, 25 - (priceDiff / currentProduct.price) * 25);
          score += priceSimilarity;
        }

        // User preferences (20% weight)
        if (userData && userData.preferences) {
          if (userData.preferences.categories?.includes(product.category)) {
            score += 10;
          }
          if (userData.preferences.priceRange) {
            const [min, max] = userData.preferences.priceRange;
            if (product.price >= min && product.price <= max) {
              score += 10;
          }
          }
        }

        // Popularity (10% weight)
        score += (product.rating || 0) * 2;

        // Recency (5% weight)
        const daysSinceCreated = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 5 - daysSinceCreated * 0.1);

        return { ...product, score };
      });

      // Sort by score and return top recommendations
      return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, maxItems);
    };
  }, [maxItems]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Fetch all products (in a real app, this would be an API call)
        const response = await fetch('/products');
        const products = await response.json();

        // Get user behavior data
        const userBehaviorData = {
          preferences: user?.preferences || {},
          recentViews: JSON.parse(localStorage.getItem('recentViews') || '[]'),
          cartItems: JSON.parse(localStorage.getItem('cart') || '[]'),
          wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]')
        };

        // Generate recommendations
        const recommendedProducts = generateRecommendations(
          products,
          userBehaviorData,
          currentProduct
        );

        setRecommendations(recommendedProducts);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProduct, user, generateRecommendations]);

  const handleProductView = (product) => {
    // Track product view for future recommendations
    const recentViews = JSON.parse(localStorage.getItem('recentViews') || '[]');
    const updatedViews = [
      { id: product._id, timestamp: Date.now() },
      ...recentViews.filter(view => view.id !== product._id)
    ].slice(0, 10); // Keep last 10 views
    
    localStorage.setItem('recentViews', JSON.stringify(updatedViews));
  };

  const handleAddToWishlist = (product) => {
    // Track wishlist addition
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!wishlist.find(item => item.id === product._id)) {
      wishlist.push({ id: product._id, timestamp: Date.now() });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: maxItems }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center text-gray-500">
          <SparklesIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Unable to load recommendations</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <SparklesIcon className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Recommended for You
        </h3>
        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
          AI Powered
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div key={product._id} className="group relative">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-square">
                <img
                  src={product.images?.[0] || '/placeholder-image.jpg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProductView(product)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      title="Quick view"
                    >
                      <EyeIcon className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleAddToWishlist(product)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      title="Add to wishlist"
                    >
                      <HeartIcon className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => addToCart(product._id, 1)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      title="Add to cart"
                    >
                      <ShoppingCartIcon className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                  {product.title}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-orange-600">
                    ${product.price}
                  </span>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-xs text-gray-600">{product.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI confidence indicator */}
            <div className="absolute top-2 right-2">
              <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                {Math.round((product.score / 100) * 100)}% match
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Recommendations are personalized based on your preferences and behavior
      </div>
    </div>
  );
};

export default AIRecommendations;

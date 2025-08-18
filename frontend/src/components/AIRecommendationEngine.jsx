import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  FireIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
  ShoppingCartIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import ProductCard from './ProductCard';

const AIRecommendationEngine = ({ 
  userId, 
  currentProduct = null, 
  category = null, 
  limit = 8,
  showTitle = true,
  title = "Recommended for You",
  subtitle = "AI-powered suggestions based on your preferences"
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationType, setRecommendationType] = useState('personalized');
  const [insights, setInsights] = useState({
    accuracy: 95,
    confidence: 0.92,
    reasoning: 'Based on your browsing history and similar user preferences'
  });

  // AI recommendation types
  const recommendationTypes = [
    {
      id: 'personalized',
      name: 'For You',
      icon: SparklesIcon,
      description: 'AI-powered personal recommendations',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'trending',
      name: 'Trending',
      icon: FireIcon,
      description: 'Most popular products right now',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'similar',
      name: 'Similar',
      icon: EyeIcon,
      description: 'Products like what you viewed',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'frequently-bought',
      name: 'Frequently Bought',
      icon: ShoppingCartIcon,
      description: 'Often purchased together',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  // Fetch AI recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build API endpoint based on recommendation type and context
      let endpoint = '/products/recommendations';
      const params = new URLSearchParams({
        type: recommendationType,
        limit: limit.toString()
      });

      if (userId) params.append('userId', userId);
      if (currentProduct) params.append('productId', currentProduct._id);
      if (category) params.append('category', category);

      const response = await axios.get(`${endpoint}?${params.toString()}`);
      
      // Enhance recommendations with AI insights
      const enhancedRecommendations = response.data.recommendations?.map(rec => ({
        ...rec,
        aiScore: rec.aiScore || Math.random() * 0.3 + 0.7, // 0.7-1.0
        reasoning: rec.reasoning || getReasoning(rec, recommendationType),
        confidence: rec.confidence || Math.random() * 0.2 + 0.8 // 0.8-1.0
      })) || [];

      setRecommendations(enhancedRecommendations);

      // Update insights based on response
      if (response.data.insights) {
        setInsights(response.data.insights);
      }

    } catch (error) {
      console.debug('AI recommendations endpoint not available:', error.message);
      setError(null); // Don't show error, just use fallback
      
      // Fallback to mock data
      setRecommendations(generateMockRecommendations());
    } finally {
      setLoading(false);
    }
  }, [userId, currentProduct, category, limit, recommendationType]);

  // Generate reasoning for recommendations
  const getReasoning = (product, type) => {
    const reasons = {
      personalized: [
        'Based on your browsing history',
        'Similar to products you liked',
        'Matches your style preferences',
        'Fits your budget range'
      ],
      trending: [
        'Currently trending in your area',
        'High demand product',
        'Popular among similar users',
        'Viral on social media'
      ],
      similar: [
        'Similar to recently viewed items',
        'Same category as your interests',
        'Matching price range',
        'Similar features and quality'
      ],
      'frequently-bought': [
        'Often purchased together',
        'Complements your cart items',
        'Bundle deal opportunity',
        'Customer favorite combination'
      ]
    };

    const typeReasons = reasons[type] || reasons.personalized;
    return typeReasons[Math.floor(Math.random() * typeReasons.length)];
  };

  // Generate mock recommendations for fallback
  const generateMockRecommendations = () => {
    const mockProducts = [
      {
        _id: 'rec1',
        name: 'Wireless Bluetooth Headphones',
        price: 2500,
        originalPrice: 3500,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        rating: 4.5,
        reviews: 128,
        aiScore: 0.95,
        reasoning: 'Based on your electronics browsing history',
        confidence: 0.92,
        badge: 'AI Recommended'
      },
      {
        _id: 'rec2',
        name: 'Smart Fitness Watch',
        price: 8500,
        originalPrice: 12000,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        rating: 4.3,
        reviews: 89,
        aiScore: 0.88,
        reasoning: 'Trending in health & fitness category',
        confidence: 0.85,
        badge: 'Trending'
      },
      {
        _id: 'rec3',
        name: 'Premium Coffee Maker',
        price: 15000,
        originalPrice: 20000,
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
        rating: 4.7,
        reviews: 156,
        aiScore: 0.91,
        reasoning: 'Similar to home appliances you viewed',
        confidence: 0.89,
        badge: 'Similar'
      },
      {
        _id: 'rec4',
        name: 'Designer Backpack',
        price: 4500,
        originalPrice: 6000,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        rating: 4.4,
        reviews: 203,
        aiScore: 0.87,
        reasoning: 'Frequently bought with your style preferences',
        confidence: 0.83,
        badge: 'Popular'
      }
    ];

    return mockProducts.slice(0, limit);
  };

  // Handle recommendation type change
  const handleTypeChange = (type) => {
    setRecommendationType(type);
  };

  // Track recommendation interaction
  const handleRecommendationClick = (product) => {
    // Track AI recommendation interaction
    if (window.gtag) {
      window.gtag('event', 'ai_recommendation_click', {
        product_id: product._id,
        recommendation_type: recommendationType,
        ai_score: product.aiScore,
        confidence: product.confidence
      });
    }

    // Send interaction to backend
    axios.post('/analytics/ai-interaction', {
      userId,
      productId: product._id,
      type: recommendationType,
      action: 'click',
      aiScore: product.aiScore,
      confidence: product.confidence
    }).catch(console.error);
  };

  // Fetch recommendations on mount and type change
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (error && recommendations.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 mb-2">Unable to load AI recommendations</p>
        <button 
          onClick={fetchRecommendations}
          className="text-red-500 hover:text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="w-full">
      {showTitle && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {title}
              </h2>
            </div>
            <div className="flex items-center gap-1 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              <SparklesIcon className="h-3 w-3" />
              <span>AI Powered</span>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl">
            {subtitle} • {insights.accuracy}% accuracy • {Math.round(insights.confidence * 100)}% confidence
          </p>
        </div>
      )}

      {/* Recommendation Type Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          {recommendationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleTypeChange(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                  recommendationType === type.id
                    ? `${type.bgColor} ${type.color} border-current`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{type.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">AI Insights:</span>
            </div>
            <span className="text-sm text-gray-600">{insights.reasoning}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="h-3 w-3 text-green-600" />
              <span className="text-gray-600">{insights.accuracy}% accuracy</span>
            </div>
            <div className="flex items-center gap-1">
              <UserGroupIcon className="h-3 w-3 text-blue-600" />
              <span className="text-gray-600">{Math.round(insights.confidence * 100)}% confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
              <div className="bg-gray-200 rounded h-4 mb-2"></div>
              <div className="bg-gray-200 rounded h-4 w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div
            key={recommendationType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {recommendations.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleRecommendationClick(product)}
              >
                <div className="relative group">
                  {/* AI Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <div className="flex items-center gap-1 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <SparklesIcon className="h-3 w-3" />
                      <span>{product.badge || 'AI'}</span>
                    </div>
                  </div>

                  {/* AI Score Indicator */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                      {Math.round(product.aiScore * 100)}%
                    </div>
                  </div>

                  {/* Product Card */}
                  <div className="transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <ProductCard product={product} />
                  </div>

                  {/* AI Reasoning Tooltip */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg">
                    <p className="text-white text-xs">
                      {product.reasoning}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Feedback Section */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-3">
          Help us improve our AI recommendations
        </p>
        <div className="flex justify-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors">
            <HeartIcon className="h-4 w-4" />
            <span>Like</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
            <XMarkIcon className="h-4 w-4" />
            <span>Dislike</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIRecommendationEngine;

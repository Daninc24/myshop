const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const PageView = require('../models/PageView');

// Simple in-memory cache for recommendations
const recommendationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// AI-powered recommendation algorithm with caching
const getRecommendations = async (userId, productId, type, limit = 8) => {
  try {
    // Create cache key
    const cacheKey = `${userId || 'anonymous'}-${type}-${limit}-${productId || 'none'}`;
    const now = Date.now();
    
    // Check cache first
    const cached = recommendationCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    let recommendations = [];
    let explanation = '';

    switch (type) {
      case 'personalized':
        recommendations = await getPersonalizedRecommendations(userId, limit);
        explanation = 'Based on your browsing and purchase history';
        break;
      
      case 'similar':
        recommendations = await getSimilarProducts(productId, limit);
        explanation = 'Similar to what you\'re viewing';
        break;
      
      case 'trending':
        recommendations = await getTrendingProducts(limit);
        explanation = 'Popular products this week';
        break;
      
      case 'frequently_bought':
        recommendations = await getFrequentlyBoughtTogether(productId, limit);
        explanation = 'Frequently bought together';
        break;
      
      case 'new_arrivals':
        recommendations = await getNewArrivals(limit);
        explanation = 'Latest products added';
        break;
      
      case 'collaborative':
        recommendations = await getCollaborativeFiltering(userId, limit);
        explanation = 'Based on similar users\' preferences';
        break;
      
      default:
        recommendations = await getPopularProducts(limit);
        explanation = 'Most popular products';
    }

    const result = { products: recommendations, explanation };
    
    // Cache the result
    recommendationCache.set(cacheKey, {
      data: result,
      timestamp: now
    });

    return result;
  } catch (error) {
    console.error('Recommendation error:', error);
    return { products: [], explanation: 'Unable to generate recommendations' };
  }
};

// Personalized recommendations based on user behavior (optimized)
const getPersonalizedRecommendations = async (userId, limit) => {
  if (!userId) return await getPopularProducts(limit);

  try {
    // Simplified approach: get popular products from user's recent categories
    const recentViews = await PageView.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('productId', 'category');

    // Get unique categories from recent views
    const categories = [...new Set(
      recentViews
        .filter(view => view.productId?.category)
        .map(view => view.productId.category)
    )];

    // If no categories, fall back to popular products
    if (categories.length === 0) {
      return await getPopularProducts(limit);
    }

    // Get products from user's recent categories
    const recommendations = await Product.find({
      category: { $in: categories },
      stock: { $gt: 0 }
    })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit);

    // If not enough products, fill with popular products
    if (recommendations.length < limit) {
      const remainingLimit = limit - recommendations.length;
      const popularProducts = await Product.find({
        _id: { $nin: recommendations.map(p => p._id) },
        stock: { $gt: 0 }
      })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(remainingLimit);
      
      recommendations.push(...popularProducts);
    }

    return recommendations;
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    return await getPopularProducts(limit);
  }
};

// Similar products based on category, price range, and features
const getSimilarProducts = async (productId, limit) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return await getPopularProducts(limit);

    const similarProducts = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      price: {
        $gte: product.price * 0.7,
        $lte: product.price * 1.3
      },
      stock: { $gt: 0 }
    })
    .sort({ rating: -1 })
    .limit(limit);

    return similarProducts;
  } catch (error) {
    console.error('Similar products error:', error);
    return [];
  }
};

// Trending products based on recent views and sales
const getTrendingProducts = async (limit) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Get products with high recent activity
    const trendingProducts = await Product.aggregate([
      {
        $lookup: {
          from: 'pageviews',
          localField: '_id',
          foreignField: 'productId',
          as: 'recentViews'
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'recentOrders'
        }
      },
      {
        $addFields: {
          recentViewCount: {
            $size: {
              $filter: {
                input: '$recentViews',
                cond: { $gte: ['$$this.createdAt', oneWeekAgo] }
              }
            }
          },
          recentOrderCount: {
            $size: {
              $filter: {
                input: '$recentOrders',
                cond: { 
                  $and: [
                    { $gte: ['$$this.createdAt', oneWeekAgo] },
                    { $eq: ['$$this.status', 'completed'] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $match: {
          stock: { $gt: 0 },
          $or: [
            { recentViewCount: { $gt: 0 } },
            { recentOrderCount: { $gt: 0 } }
          ]
        }
      },
      {
        $sort: {
          recentViewCount: -1,
          recentOrderCount: -1,
          rating: -1
        }
      },
      { $limit: limit }
    ]);

    return trendingProducts;
  } catch (error) {
    console.error('Trending products error:', error);
    return await getPopularProducts(limit);
  }
};

// Frequently bought together (market basket analysis)
const getFrequentlyBoughtTogether = async (productId, limit) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return await getPopularProducts(limit);

    // Find orders that contain this product
    const ordersWithProduct = await Order.find({
      'items.product': productId,
      status: 'completed'
    });

    // Get other products frequently bought with this one
    const relatedProducts = {};
    ordersWithProduct.forEach(order => {
      order.items.forEach(item => {
        if (item.product.toString() !== productId.toString()) {
          const productIdStr = item.product.toString();
          relatedProducts[productIdStr] = (relatedProducts[productIdStr] || 0) + 1;
        }
      });
    });

    // Get top related products
    const topRelatedIds = Object.keys(relatedProducts)
      .sort((a, b) => relatedProducts[b] - relatedProducts[a])
      .slice(0, limit);

    const recommendations = await Product.find({
      _id: { $in: topRelatedIds },
      stock: { $gt: 0 }
    });

    return recommendations;
  } catch (error) {
    console.error('Frequently bought together error:', error);
    return await getSimilarProducts(productId, limit);
  }
};

// New arrivals
const getNewArrivals = async (limit) => {
  try {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return await Product.find({
      createdAt: { $gte: oneMonthAgo },
      stock: { $gt: 0 }
    })
    .sort({ createdAt: -1 })
    .limit(limit);
  } catch (error) {
    console.error('New arrivals error:', error);
    return [];
  }
};

// Collaborative filtering (users who bought this also bought)
const getCollaborativeFiltering = async (userId, limit) => {
  try {
    if (!userId) return await getPopularProducts(limit);

    // Get user's purchase history
    const userOrders = await Order.find({
      user: userId,
      status: 'completed'
    }).populate('items.product');

    const userProducts = userOrders
      .flatMap(order => order.items)
      .map(item => item.product._id.toString());

    if (userProducts.length === 0) return await getPopularProducts(limit);

    // Find users with similar purchase patterns
    const similarUsers = await Order.aggregate([
      {
        $match: {
          'items.product': { $in: userProducts },
          user: { $ne: userId },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$user',
          commonProducts: { $sum: 1 }
        }
      },
      {
        $sort: { commonProducts: -1 }
      },
      { $limit: 10 }
    ]);

    const similarUserIds = similarUsers.map(u => u._id);

    // Get products bought by similar users
    const recommendations = await Order.aggregate([
      {
        $match: {
          user: { $in: similarUserIds },
          status: 'completed'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.product',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      { $limit: limit }
    ]);

    const productIds = recommendations.map(r => r._id);
    const products = await Product.find({
      _id: { $in: productIds },
      stock: { $gt: 0 }
    });

    return products;
  } catch (error) {
    console.error('Collaborative filtering error:', error);
    return await getPopularProducts(limit);
  }
};

// Popular products (fallback)
const getPopularProducts = async (limit) => {
  try {
    return await Product.find({ stock: { $gt: 0 } })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Popular products error:', error);
    return [];
  }
};

// Routes
router.get('/', async (req, res) => {
  try {
    const { type = 'personalized', limit = 8, productId, behavior } = req.query;
    const userId = req.user?.id || null;
    
    const result = await getRecommendations(userId, productId, type, parseInt(limit));
    
    res.json(result);
  } catch (error) {
    console.error('Recommendations route error:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      products: [],
      explanation: 'Unable to generate recommendations'
    });
  }
});

// Get recommendation insights for admin
router.get('/insights', async (req, res) => {
  try {
    const insights = {
      totalRecommendations: await Product.countDocuments(),
      popularCategories: await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      trendingProducts: await getTrendingProducts(5),
      newArrivals: await getNewArrivals(5)
    };

    res.json(insights);
  } catch (error) {
    console.error('Recommendation insights error:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

module.exports = router;

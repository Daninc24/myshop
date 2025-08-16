const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellingProducts,
  getInventoryLogs
} = require('../controllers/productController');

// Upload middleware to process Cloudinary URLs
const processUpload = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      // Add Cloudinary URLs to request body
      req.body.images = req.files.map(file => file.path);
    }
    next();
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ error: 'Failed to process uploaded files' });
  }
};

// Advanced search with AI-powered suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 8 } = req.query;
    
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const Product = require('../models/Product');
    
    // Text search with multiple fields
    const suggestions = await Product.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ],
      stock: { $gt: 0 }
    })
    .select('title category price images rating reviewCount')
    .sort({ rating: -1, reviewCount: -1 })
    .limit(parseInt(limit));

    // Add relevance score and format response
    const formattedSuggestions = suggestions.map(product => ({
      title: product.title,
      category: product.category,
      price: product.price,
      image: product.images?.[0],
      rating: product.rating,
      reviewCount: product.reviewCount,
      relevanceScore: calculateRelevanceScore(product, query)
    }));

    // Sort by relevance score
    formattedSuggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json(formattedSuggestions);
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
});

// Calculate relevance score for search suggestions
const calculateRelevanceScore = (product, query) => {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Title match (highest weight)
  if (product.title.toLowerCase().includes(queryLower)) {
    score += 10;
    if (product.title.toLowerCase().startsWith(queryLower)) {
      score += 5; // Bonus for prefix match
    }
  }
  
  // Category match
  if (product.category?.toLowerCase().includes(queryLower)) {
    score += 3;
  }
  
  // Rating and review count (social proof)
  score += (product.rating || 0) * 0.5;
  score += Math.min((product.reviewCount || 0) / 100, 2); // Cap at 2 points
  
  return score;
};

// Advanced product search with filters
router.get('/search', async (req, res) => {
  try {
    const {
      q: query,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort = 'relevance',
      page = 1,
      limit = 20,
      inStock = false,
      onSale = false,
      isNew = false
    } = req.query;

    const Product = require('../models/Product');
    
    // Build search query
    const searchQuery = {};
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }
    
    // Filters
    if (category) searchQuery.category = category;
    if (brand) searchQuery.brand = brand;
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }
    if (rating) searchQuery.rating = { $gte: parseFloat(rating) };
    if (inStock === 'true') searchQuery.stock = { $gt: 0 };
    if (onSale === 'true') searchQuery.isOnSale = true;
    if (isNew === 'true') searchQuery.isNew = true;

    // Build sort object
    let sortObject = {};
    switch (sort) {
      case 'price_low':
        sortObject = { price: 1 };
        break;
      case 'price_high':
        sortObject = { price: -1 };
        break;
      case 'rating':
        sortObject = { rating: -1 };
        break;
      case 'newest':
        sortObject = { createdAt: -1 };
        break;
      case 'popular':
        sortObject = { reviewCount: -1 };
        break;
      case 'relevance':
      default:
        // Custom relevance scoring
        break;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute search
    let products;
    if (sort === 'relevance' && query) {
      // Use aggregation for relevance scoring
      products = await Product.aggregate([
        { $match: searchQuery },
        {
          $addFields: {
            relevanceScore: {
              $add: [
                { $multiply: [{ $indexOfCP: [{ $toLower: '$title' }, query.toLowerCase()] }, -1] },
                { $multiply: ['$rating', 0.5] },
                { $multiply: [{ $min: ['$reviewCount', 100] }, 0.01] }
              ]
            }
          }
        },
        { $sort: { relevanceScore: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ]);
    } else {
      products = await Product.find(searchQuery)
        .sort(sortObject)
        .skip(skip)
        .limit(parseInt(limit));
    }

    // Get total count for pagination
    const total = await Product.countDocuments(searchQuery);
    
    // Get facets for filters
    const facets = await Product.aggregate([
      { $match: searchQuery },
      {
        $facet: {
          categories: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          brands: [
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          priceRanges: [
            {
              $bucket: {
                groupBy: '$price',
                boundaries: [0, 25, 50, 100, 200, 500, 1000],
                default: '1000+',
                output: { count: { $sum: 1 } }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      facets: facets[0]
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Public routes
router.get('/', getAllProducts);
router.get('/best-selling', getBestSellingProducts);

// Admin/manager: Get inventory logs
router.get('/logs/:productId?', auth, admin, getInventoryLogs);

// Get single product
router.get('/:id', getProduct);

// Admin routes
router.post(
  '/',
  auth,
  admin,
  uploadMultiple.array('images', 5),
  processUpload,
  createProduct
);

router.put(
  '/:id',
  auth,
  admin,
  uploadMultiple.array('images', 5),
  processUpload,
  updateProduct
);

router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;
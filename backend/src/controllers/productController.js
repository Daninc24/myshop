const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { v4: uuidv4 } = require('uuid');
const { productCache, apiCache } = require('../utils/cache');

// Helper function to process image URLs - Cloudinary only
const processImageUrls = (images) => {
  if (!images) return [];
  
  // Handle legacy 'image' field
  if (!Array.isArray(images)) {
    images = images ? [images] : [];
  }
  
  // Process image URLs - Cloudinary URLs only
  return images.map(img => {
    if (!img) return null;
    
    // If it's already a full URL (Cloudinary or other), return as is
    if (img.startsWith('http') || img.startsWith('data:')) {
      return img;
    }
    
    // Skip any local upload paths - we only use Cloudinary
    if (img.startsWith('/uploads/') || !img.includes('/')) {
      console.warn('Skipping local image path:', img, '- Cloudinary URLs only');
      return null;
    }
    
    return img;
  }).filter(img => img); // Remove empty/null images
};

// Helper function to generate SKU
const generateSKU = (title, variantOptions = []) => {
  const base = title.substring(0, 3).toUpperCase().replace(/\s+/g, '');
  const variantCode = variantOptions
    .map(opt => (opt.value || '').substring(0, 2).toUpperCase())
    .join('');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${variantCode || 'STD'}-${random}`;
};

// Simple in-memory cache for facets (keyed by filters)
const facetsCache = new Map();
const FACETS_TTL_MS = 90 * 1000; // 90 seconds

// Simple in-memory cache for product list responses
const listCache = new Map();
const LIST_TTL_MS = 60 * 1000; // 60 seconds

// Get all products with optimized queries
const getAllProducts = async (req, res) => {
  try {
    let { search, category, subcategory, page = 1, limit = 12, sort = 'createdAt', order = 'desc', minPrice, maxPrice, inStock } = req.query;
    
    // Optimize pagination limits
    page = Math.max(1, parseInt(page));
    limit = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50 items per page
    
    // Handle legacy sort parameters
    const sortMapping = {
      'newest': 'createdAt',
      'oldest': 'createdAt',
      'price_low': 'price',
      'price_high': 'price',
      'rating': 'rating',
      'popular': 'reviewCount',
      'name': 'title'
    };
    
    // Map sort parameter and adjust order if needed
    if (sortMapping[sort]) {
      if (sort === 'oldest') order = 'asc';
      if (sort === 'price_low') order = 'asc';
      if (sort === 'price_high') order = 'desc';
      sort = sortMapping[sort];
    }
    // Extract option filters: any query param starting with opt_ maps to an option name
    const optionFilters = Object.entries(req.query)
      .filter(([k, v]) => k.startsWith('opt_') && v !== undefined && v !== '')
      .map(([k, v]) => ({ name: k.replace(/^opt_/, ''), value: v }));
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (subcategory && subcategory !== 'all') {
      query.subcategory = subcategory;
    }
    // Price range filters
    if (typeof minPrice !== 'undefined' || typeof maxPrice !== 'undefined') {
      query.price = {};
      if (typeof minPrice !== 'undefined' && !isNaN(parseFloat(minPrice))) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (typeof maxPrice !== 'undefined' && !isNaN(parseFloat(maxPrice))) {
        query.price.$lte = parseFloat(maxPrice);
      }
      if (Object.keys(query.price).length === 0) delete query.price;
    }
    // In-stock filter
    if (typeof inStock !== 'undefined') {
      const inStockBool = (typeof inStock === 'string') ? (inStock === 'true') : !!inStock;
      if (inStockBool) {
        query.stock = { $gt: 0 };
      }
    }

    // Apply variant option filters by requiring a single variant match all option pairs
    if (optionFilters.length > 0) {
      const andOptionMatches = optionFilters.map(of => ({ options: { $elemMatch: { name: of.name, value: of.value } } }));
      const variantMatch = { $and: andOptionMatches };
      // If filtering in-stock, ensure variant has quantity > 0
      if (query.stock && query.stock.$gt === 0) {
        variantMatch.quantity = { $gt: 0 };
        // Do not require simple product stock for variant filter (remove top-level stock constraint to avoid excluding variant-only products)
        delete query.stock;
      }
      query.variants = { $elemMatch: variantMatch };
    }

    // Calculate pagination values
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Prepare sort options with validation
    const validSortFields = ['createdAt', 'updatedAt', 'price', 'title', 'rating', 'reviewCount'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    const sortOptions = {};
    sortOptions[sortField] = order === 'desc' ? -1 : 1;
    
    // Execute optimized queries in parallel
    const [products, total] = await Promise.all([
      Product.find(query)
        .select('title price compareAtPrice images category subcategory stock updatedAt createdAt rating reviewCount')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean() // Use lean for better performance
        .hint({ [sortField]: order === 'desc' ? -1 : 1 }), // Use index hint for better performance
      
      // Use estimatedDocumentCount for better performance on large collections
      page === 1 && !search && !category && !subcategory && !minPrice && !maxPrice && !inStock
        ? Product.estimatedDocumentCount()
        : Product.countDocuments(query)
    ]);
    
    // Process images and ensure they're properly formatted
    const processedProducts = products.map(product => {
      let images = product.images || [];
      
      // Handle legacy 'image' field
      if (product.image && !images.length) {
        images = [product.image];
      }
      
      return {
        ...product,
        images: processImageUrls(images)
      };
    });
    
    // Facets (category and subcategory counts) based on current filters except the facet dimension
    // Base match includes search, price, and stock filters but not category/subcategory
    const baseMatch = {};
    if (search) {
      baseMatch.$or = [
        { title: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    if (typeof minPrice !== 'undefined' || typeof maxPrice !== 'undefined') {
      baseMatch.price = {};
      if (typeof minPrice !== 'undefined' && !isNaN(parseFloat(minPrice))) baseMatch.price.$gte = parseFloat(minPrice);
      if (typeof maxPrice !== 'undefined' && !isNaN(parseFloat(maxPrice))) baseMatch.price.$lte = parseFloat(maxPrice);
      if (Object.keys(baseMatch.price).length === 0) delete baseMatch.price;
    }
    if (typeof inStock !== 'undefined') {
      const inStockBool = (typeof inStock === 'string') ? (inStock === 'true') : !!inStock;
      if (inStockBool) baseMatch.stock = { $gt: 0 };
    }

    const categoryCountsPromise = Product.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { id: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    const subcategoryMatch = { ...baseMatch };
    if (category && category !== 'all') subcategoryMatch.category = category;
    const subcategoryCountsPromise = Product.aggregate([
      { $match: subcategoryMatch },
      { $group: { _id: '$subcategory', count: { $sum: 1 } } },
      { $project: { id: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    const [categoryCounts, subcategoryCounts] = await Promise.all([categoryCountsPromise, subcategoryCountsPromise]);

    // Compute additional facets (price ranges and variant options) with short-term caching
    // Cache key includes the inputs that affect facet results
    const cacheKey = JSON.stringify({
      baseMatch,
      category: category && category !== 'all' ? category : undefined,
      subcategory: subcategory && subcategory !== 'all' ? subcategory : undefined,
      inStock: typeof inStock !== 'undefined' ? ((typeof inStock === 'string') ? (inStock === 'true') : !!inStock) : undefined,
    });
    let cached = facetsCache.get(cacheKey);
    let priceRangesFacet;
    let optionsFacet;
    const now = Date.now();
    if (cached && (now - cached.timestamp) < FACETS_TTL_MS) {
      ({ priceRangesFacet, optionsFacet } = cached.value);
    } else {
      // Use baseMatch for facets (search/price/stock) and then apply category/subcategory filter
      const facetMatch = { ...baseMatch };
      if (category && category !== 'all') facetMatch.category = category;
      if (subcategory && subcategory !== 'all') facetMatch.subcategory = subcategory;
      const facetProducts = await Product.find(facetMatch)
        .select('price variants options stock')
        .sort({ updatedAt: -1 })
        .limit(1000) // reduce sampling cap
        .lean();

    // Price buckets (USD-like for now). You can adjust thresholds as needed.
    const priceBuckets = [
      { id: 'under_25', label: 'Under $25', min: 0, max: 25 },
      { id: '25_50', label: '$25 to $50', min: 25, max: 50 },
      { id: '50_100', label: '$50 to $100', min: 50, max: 100 },
      { id: '100_200', label: '$100 to $200', min: 100, max: 200 },
      { id: '200_plus', label: '$200 & Above', min: 200, max: Infinity }
    ];
    const priceCounts = priceBuckets.reduce((acc, b) => { acc[b.id] = 0; return acc; }, {});

    // Options facets map: { [optionName]: Map<optionValue, count> }
    const optionsMap = new Map();
    const considerOnlyInStockVariants = (typeof inStock !== 'undefined') && ((typeof inStock === 'string') ? (inStock === 'true') : !!inStock);

    for (const p of facetProducts) {
      // Determine effective price for product: if variants exist, use min variant price among variants considered
      let effectivePrices = [];
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        const vs = p.variants.filter(v => typeof v.price === 'number' && (!considerOnlyInStockVariants || (v.quantity || 0) > 0));
        effectivePrices = vs.map(v => v.price);
      } else if (typeof p.price === 'number') {
        effectivePrices = [p.price];
      }
      // Use min price per product for bucketing
      if (effectivePrices.length > 0) {
        const minPrice = Math.min(...effectivePrices);
        const bucket = priceBuckets.find(b => minPrice >= b.min && minPrice < b.max);
        if (bucket) priceCounts[bucket.id] += 1;
      }

      // Options facets (from variants)
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        const variantsToCount = p.variants.filter(v => !considerOnlyInStockVariants || (v.quantity || 0) > 0);
        for (const v of variantsToCount) {
          if (Array.isArray(v.options)) {
            for (const opt of v.options) {
              if (!opt || !opt.name || !opt.value) continue;
              const name = String(opt.name);
              const value = String(opt.value);
              if (!optionsMap.has(name)) optionsMap.set(name, new Map());
              const valuesMap = optionsMap.get(name);
              valuesMap.set(value, (valuesMap.get(value) || 0) + 1);
            }
          }
        }
      }
    }

      priceRangesFacet = priceBuckets.map(b => ({ id: b.id, label: b.label, count: priceCounts[b.id] }));
      optionsFacet = {};
      for (const [name, valuesMap] of optionsMap.entries()) {
        optionsFacet[name] = Array.from(valuesMap.entries()).map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count);
      }

      facetsCache.set(cacheKey, { timestamp: now, value: { priceRangesFacet, optionsFacet } });
    }

    // Standardized response with pagination and facets
    const payload = {
      products: processedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      facets: {
        categories: categoryCounts,
        subcategories: subcategoryCounts,
        priceRanges: priceRangesFacet,
        options: optionsFacet
      }
    };
    res.set('Cache-Control', 'public, max-age=30');
    res.json(payload);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If no variants, return simple product
    if (!product.variants || product.variants.length === 0) {
      return res.json(product);
    }
    
    // For products with variants, include available options
    const variantOptions = {};
    
    // Group variants by their options
    product.variants.forEach(variant => {
      variant.options.forEach(option => {
        if (!variantOptions[option.name]) {
          variantOptions[option.name] = new Set();
        }
        variantOptions[option.name].add(option.value);
      });
    });
    
    // Convert sets to arrays
    const availableOptions = Object.entries(variantOptions).map(([name, values]) => ({
      name,
      values: Array.from(values)
    }));
    
    res.json({
      ...product.toObject(),
      availableOptions
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Create product (admin only)
const createProduct = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      price, 
      category, 
      subcategory, 
      stock,
      options,
      variants: variantsData,
      status = 'draft'
    } = req.body;
    
    // Handle image upload
    let images = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      images = files.map(file => file.filename);
    }

    // Process variants if any
    let variants = [];
    let rawVariants = variantsData;
    if (typeof rawVariants === 'string') {
      try {
        rawVariants = JSON.parse(rawVariants);
      } catch (e) {
        console.error('Error parsing variants JSON:', e);
        rawVariants = [];
      }
    }
    if (rawVariants && Array.isArray(rawVariants)) {
      variants = rawVariants.map(variant => ({
        ...variant,
        sku: variant.sku || generateSKU(title, variant.options || []),
        quantity: parseInt(variant.quantity) || 0,
        price: parseFloat(variant.price) || parseFloat(price) || 0
      }));
    }

    // Process options
    let productOptions = [];
    if (options && typeof options === 'string') {
      try {
        productOptions = JSON.parse(options);
      } catch (e) {
        console.error('Error parsing options:', e);
      }
    } else if (Array.isArray(options)) {
      productOptions = options;
    }

    const product = new Product({
      title,
      description,
      price: parseFloat(price) || 0,
      images,
      category,
      subcategory,
      stock: variants.length > 0 ? 
        variants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0) : 
        parseInt(stock) || 0,
      options: productOptions,
      variants,
      status
    });

    await product.save();
    
    // Log inventory change for simple products
    if (variants.length === 0 && stock > 0) {
      await InventoryLog.create({
        product: product._id,
        type: 'initial',
        quantity: stock,
        note: 'Initial stock'
      });
    }
    // Log inventory for variants
    else if (variants.length > 0) {
      await Promise.all(variants.map(variant => 
        InventoryLog.create({
          product: product._id,
          variant: variant.sku,
          type: 'initial',
          quantity: variant.quantity || 0,
          note: 'Initial stock for variant'
        })
      ));
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// Update product (admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      variants: variantsData, 
      options,
      ...updates 
    } = req.body;
    
    // Handle image upload
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      updates.images = files.map(file => file.filename);
    }

    // Process variants if provided
    if (typeof variantsData !== 'undefined') {
      let parsed = variantsData;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch (e) {
          console.error('Error parsing variants JSON:', e);
          parsed = [];
        }
      }
      if (Array.isArray(parsed)) {
        const titleForSku = updates.title || (currentProduct && currentProduct.title) || '';
        updates.variants = parsed.map(variant => ({
          ...variant,
          sku: variant.sku || generateSKU(titleForSku, variant.options || []),
          quantity: parseInt(variant.quantity) || 0,
          price: parseFloat(variant.price) || parseFloat(updates.price) || 0
        }));
      }
    }

    // Process options if provided
    if (options) {
      try {
        updates.options = typeof options === 'string' ? JSON.parse(options) : options;
      } catch (e) {
        console.error('Error parsing options:', e);
        updates.options = [];
      }
    }

    // Get current product to calculate stock changes
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Log inventory changes for variants
    if (variantsData && currentProduct.variants) {
      const currentVariants = new Map(currentProduct.variants.map(v => [v.sku, v]));
      
      await Promise.all(
        product.variants.map(async variant => {
          const currentVariant = currentVariants.get(variant.sku);
          if (currentVariant && currentVariant.quantity !== variant.quantity) {
            const quantityChange = variant.quantity - currentVariant.quantity;
            if (quantityChange !== 0) {
              await InventoryLog.create({
                product: product._id,
                variant: variant.sku,
                type: quantityChange > 0 ? 'stock_in' : 'stock_out',
                quantity: Math.abs(quantityChange),
                note: 'Stock adjustment'
              });
            }
          }
        })
      );
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete product (admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBestSellingProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const limitNum = parseInt(limit);
    
    // Use a more reliable sorting method - by rating and review count
    const products = await Product.find()
      .select('title price images category rating reviewCount createdAt')
      .sort({ 
        rating: -1, 
        reviewCount: -1,
        createdAt: -1 
      })
      .limit(limitNum)
      .lean();
      
    // Process images and ensure they're properly formatted
    const processedProducts = products.map(product => {
      let images = product.images || [];
      
      // Handle legacy 'image' field
      if (product.image && !images.length) {
        images = [product.image];
      }
      
      return {
        ...product,
        images: processImageUrls(images)
      };
    });
    
    // Return in the same format as getAllProducts for consistency
    const payload = {
      products: processedProducts,
      pagination: {
        page: 1,
        limit: limitNum,
        total: processedProducts.length,
        pages: 1
      },
      facets: {
        categories: [],
        subcategories: [],
        priceRanges: [],
        options: {}
      }
    };
    
    res.json(payload);
  } catch (error) {
    console.error('Best selling products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getInventoryLogs = async (req, res) => {
  try {
    const { productId } = req.params;
    const logs = await InventoryLog.find(productId ? { product: productId } : {})
      .populate('user', 'name email role')
      .populate('product', 'title')
      .sort({ createdAt: -1 });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory logs', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellingProducts,
  getInventoryLogs
};
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    trim: true,
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Variant price is required'],
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  quantity: {
    type: Number,
    required: [true, 'Variant quantity is required'],
    min: 0,
    default: 0
  },
  barcode: String,
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['g', 'kg', 'oz', 'lb'],
      default: 'g'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['mm', 'cm', 'm', 'in', 'ft'],
      default: 'cm'
    }
  },
  options: [{
    name: {
      type: String,
      required: [true, 'Option name is required'],
      trim: true
    },
    value: {
      type: String,
      required: [true, 'Option value is required'],
      trim: true
    }
  }],
  image: String
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  // Base price (can be overridden by variants)
  price: {
    type: Number,
    min: 0,
    index: true,
    default: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  images: {
    type: [String],
    required: [true, 'At least one product image is required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    index: true
  },
  // Total stock across all variants
  stock: {
    type: Number,
    min: 0,
    default: 0,
    index: true
  },
  // Product options (e.g., Size, Color, Material)
  options: [{
    name: {
      type: String,
      required: [true, 'Option name is required'],
      trim: true
    },
    values: [{
      type: String,
      required: [true, 'Option value is required'],
      trim: true
    }]
  }],
  // Product variants
  variants: [variantSchema],
  // Track total sales
  salesCount: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  // SEO fields
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  // Product status
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'out_of_stock'],
    default: 'draft'
  },
  // Delivery and shipping information
  delivery: {
    freeShipping: {
      type: Boolean,
      default: false
    },
    deliveryTime: {
      type: String,
      enum: ['same_day', 'next_day', '2_3_days', '3_5_days', '5_7_days'],
      default: 'next_day'
    },
    expressDelivery: {
      type: Boolean,
      default: false
    },
    expressDeliveryFee: {
      type: Number,
      min: 0,
      default: 0
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['g', 'kg', 'oz', 'lb'],
        default: 'g'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['mm', 'cm', 'm', 'in', 'ft'],
        default: 'cm'
      }
    }
  },
  // Product specifications
  specifications: {
    brand: String,
    model: String,
    material: String,
    color: String,
    size: String,
    warranty: String,
    countryOfOrigin: String
  },
  // SEO and marketing
  seo: {
    title: String,
    description: String,
    keywords: [String],
    canonicalUrl: String
  },
  // Product tags for better search and categorization
  tags: [String],
  // Featured and promotional flags
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  salePercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total stock from variants
productSchema.virtual('totalStock').get(function() {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
  }
  return this.stock || 0;
});

// Update total stock before saving
productSchema.pre('save', function(next) {
  if (this.variants && this.variants.length > 0) {
    this.stock = this.totalStock;
  }
  next();
});

// Update status based on stock
productSchema.pre('save', function(next) {
  if (this.variants && this.variants.length > 0) {
    const hasStock = this.variants.some(v => v.quantity > 0);
    if (this.status === 'active' && !hasStock) {
      this.status = 'out_of_stock';
    } else if (this.status === 'out_of_stock' && hasStock) {
      this.status = 'active';
    }
  } else {
    if (this.status === 'active' && this.stock <= 0) {
      this.status = 'out_of_stock';
    } else if (this.status === 'out_of_stock' && this.stock > 0) {
      this.status = 'active';
    }
  }
  next();
});

// Performance indexes (must be defined BEFORE compiling the model)
// Text index for search across title and description
productSchema.index({ title: 'text', description: 'text' });
// Compound index to speed up listing queries
productSchema.index({ category: 1, subcategory: 1, price: 1, createdAt: -1 });
// Indexes to accelerate variant option filtering and stock checks
productSchema.index({ 'variants.options.name': 1, 'variants.options.value': 1 });
productSchema.index({ 'variants.quantity': 1 });
// Sparse index for variant SKUs to allow null values
productSchema.index({ 'variants.sku': 1 }, { sparse: true });

module.exports = mongoose.model('Product', productSchema);
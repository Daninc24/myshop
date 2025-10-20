// Image utility functions for MyShop

// Default placeholder images by category
const CATEGORY_PLACEHOLDERS = {
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
  'Food & Beverages': 'https://images.unsplash.com/photo-1504674900240-9a9049b7d63c?w=400&h=400&fit=crop',
  'Jewelry & Watches': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
  'default': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
};

// Enhanced optimized image URL with Cloudinary transformations
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return null;

  const {
    width = 400,
    height = 400,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    progressive = true,
    dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  } = options;

  // If it's already a Cloudinary URL, add transformations
  if (imageUrl.includes('cloudinary.com')) {
    const transformations = [];
    
    // Add format optimization
    if (format === 'auto') {
      transformations.push('f_auto');
    } else if (format !== 'original') {
      transformations.push(`f_${format}`);
    }
    
    // Add quality optimization
    if (quality === 'auto') {
      transformations.push('q_auto');
    } else if (quality !== 'original') {
      transformations.push(`q_${quality}`);
    }
    
    // Add device pixel ratio for high-DPI displays
    if (dpr > 1) {
      transformations.push(`dpr_${Math.min(Math.round(dpr), 3)}`); // Cap at 3x for performance
    }
    
    // Add dimensions
    if (width && height) {
      transformations.push(`w_${Math.round(width)}`, `h_${Math.round(height)}`, `c_${crop}`, `g_${gravity}`);
    } else if (width) {
      transformations.push(`w_${Math.round(width)}`, 'c_scale');
    } else if (height) {
      transformations.push(`h_${Math.round(height)}`, 'c_scale');
    }
    
    // Add progressive JPEG loading
    if (progressive) {
      transformations.push('fl_progressive');
    }
    
    if (transformations.length > 0) {
      return imageUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }
  }

  // If it's a local image, return as is
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // If it's an external image (not Cloudinary), return as is
  if (imageUrl.startsWith('http') && !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  return imageUrl;
};

// Get the best available image for a product
export const getProductImage = (product, options = {}) => {
  if (!product) return CATEGORY_PLACEHOLDERS.default;

  let images = [];

  // Handle different image formats
  if (product.images) {
    if (Array.isArray(product.images)) {
      images = product.images.filter(img => img && img.trim());
    } else if (typeof product.images === 'string') {
      images = product.images.split(' ').filter(img => img && img.trim());
    }
  }

  // Fallback to legacy 'image' field
  if (images.length === 0 && product.image) {
    images = [product.image];
  }

  // If we have images, return the first one optimized
  if (images.length > 0) {
    return getOptimizedImageUrl(images[0], options);
  }

  // If no images, return category-specific placeholder
  const category = product.category || 'default';
  return CATEGORY_PLACEHOLDERS[category] || CATEGORY_PLACEHOLDERS.default;
};

// Get all product images with fallbacks
export const getProductImages = (product, options = {}) => {
  if (!product) return [CATEGORY_PLACEHOLDERS.default];

  let images = [];

  // Handle different image formats
  if (product.images) {
    if (Array.isArray(product.images)) {
      images = product.images.filter(img => img && img.trim());
    } else if (typeof product.images === 'string') {
      images = product.images.split(' ').filter(img => img && img.trim());
    }
  }

  // Fallback to legacy 'image' field
  if (images.length === 0 && product.image) {
    images = [product.image];
  }

  // If we have images, return them optimized
  if (images.length > 0) {
    return images.map(img => getOptimizedImageUrl(img, options));
  }

  // If no images, return category-specific placeholder
  const category = product.category || 'default';
  return [CATEGORY_PLACEHOLDERS[category] || CATEGORY_PLACEHOLDERS.default];
};

// Enhanced lazy loading props for images with WebP support
export const getLazyImageProps = (imageUrl, alt = '', options = {}) => {
  const { width, height, quality = 'auto' } = options;
  const optimizedUrl = getOptimizedImageUrl(imageUrl, { width, height, quality });
  
  return {
    src: optimizedUrl,
    alt,
    loading: 'lazy',
    decoding: 'async',
    onError: (e) => {
      e.target.src = CATEGORY_PLACEHOLDERS.default;
    },
    // Add srcSet for responsive images if dimensions provided
    ...(width && {
      srcSet: [
        `${getOptimizedImageUrl(imageUrl, { width: Math.round(width * 0.5), height: height ? Math.round(height * 0.5) : undefined, quality })} 0.5x`,
        `${optimizedUrl} 1x`,
        `${getOptimizedImageUrl(imageUrl, { width: Math.round(width * 1.5), height: height ? Math.round(height * 1.5) : undefined, quality })} 1.5x`,
        `${getOptimizedImageUrl(imageUrl, { width: Math.round(width * 2), height: height ? Math.round(height * 2) : undefined, quality })} 2x`
      ].join(', ')
    })
  };
};

// Validate image URL
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative path
    return url.startsWith('/') || url.startsWith('./');
  }
};

// Get image dimensions (placeholder function for future implementation)
export const getImageDimensions = async (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve({ width: 400, height: 400 }); // Default fallback
    };
    img.src = imageUrl;
  });
};

// Preload image
export const preloadImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(imageUrl);
    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    img.src = imageUrl;
  });
};

// Get category placeholder
export const getCategoryPlaceholder = (category) => {
  return CATEGORY_PLACEHOLDERS[category] || CATEGORY_PLACEHOLDERS.default;
};

// Generate responsive image srcSet
export const generateSrcSet = (imageUrl, widths = [400, 600, 800, 1200]) => {
  if (!imageUrl) return '';
  
  return widths
    .map(width => {
      const optimizedSrc = getOptimizedImageUrl(imageUrl, { width });
      return `${optimizedSrc} ${width}w`;
    })
    .join(', ');
};

// Get WebP version of image (for modern browsers)
export const getWebPImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return null;
  
  return getOptimizedImageUrl(imageUrl, { ...options, format: 'webp' });
};

// Preload multiple images with progress tracking
export const preloadImages = async (imageUrls, onProgress) => {
  const results = [];
  let loaded = 0;
  
  for (const url of imageUrls) {
    try {
      await preloadImage(url);
      results.push({ url, success: true });
    } catch (error) {
      results.push({ url, success: false, error });
    }
    
    loaded++;
    if (onProgress) {
      onProgress(loaded, imageUrls.length, (loaded / imageUrls.length) * 100);
    }
  }
  
  return results;
};

// Get image blur placeholder (for progressive loading)
export const getBlurPlaceholder = (imageUrl, options = {}) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return null;
  
  return getOptimizedImageUrl(imageUrl, {
    ...options,
    width: 40,
    height: 40,
    quality: 10,
    format: 'jpg'
  });
};
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  EyeIcon,
  StarIcon,
  FireIcon,
  TagIcon,
  ShareIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  ShoppingCartIcon as ShoppingCartSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import { getProductImage } from '../utils/imageUtils';
import axios from 'axios';

const EnhancedProductCard = ({ 
  product, 
  showQuickView = true, 
  showWishlist = true, 
  showCompare = true,
  showShare = true,
  variant = 'default' // default, compact, featured
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);

  const { addToCart, currency, convertPrice, formatPrice } = useCart();
  const { success, error } = useToast();
  const { user } = useAuth();

  const {
    _id,
    title,
    price,
    originalPrice,
    images = [],
    category,
    rating = 0,
    reviewCount = 0,
    stock = 0,
    discount = 0,
    isNew = false,
    isHot = false,
    isOnSale = false,
    brand,
    description,
    features = []
  } = product;

  const displayPrice = formatPrice(price);
  const displayOriginalPrice = originalPrice ? formatPrice(originalPrice) : null;
  const discountPercentage = discount || (originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  // Check wishlist status
  useEffect(() => {
    if (user) {
      try {
        const wishlistKey = `wishlist_${user._id}`;
        const stored = localStorage.getItem(wishlistKey);
        const wishlistItems = stored ? JSON.parse(stored) : [];
        const isInList = wishlistItems.some(item => item._id === _id);
        setIsInWishlist(isInList);
      } catch (err) {
        console.error('Error checking wishlist:', err);
      }
    }
  }, [user, _id]);

  // Load price history for featured variant
  useEffect(() => {
    if (variant === 'featured') {
      // Simulate price history - in real app, fetch from API
      setPriceHistory([
        { date: '2024-01-01', price: price * 1.2 },
        { date: '2024-01-15', price: price * 1.1 },
        { date: '2024-02-01', price: price }
      ]);
    }
  }, [price, variant]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      error('Please login to add items to cart');
      return;
    }

    if (stock <= 0) {
      error('Product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      const result = await addToCart(_id, 1);
      if (result.success) {
        success('Added to cart successfully!');
      } else {
        error(result.error || 'Failed to add to cart');
      }
    } catch (err) {
      error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      error('Please login to manage wishlist');
      return;
    }

    try {
      const wishlistKey = `wishlist_${user._id}`;
      const stored = localStorage.getItem(wishlistKey);
      let wishlistItems = stored ? JSON.parse(stored) : [];
      
      if (!isInWishlist) {
        wishlistItems.push(product);
        localStorage.setItem(wishlistKey, JSON.stringify(wishlistItems));
        setIsInWishlist(true);
        success('Added to wishlist!');
      } else {
        wishlistItems = wishlistItems.filter(item => item._id !== _id);
        localStorage.setItem(wishlistKey, JSON.stringify(wishlistItems));
        setIsInWishlist(false);
        success('Removed from wishlist');
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      error('Failed to update wishlist');
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this product: ${title}`,
          url: `${window.location.origin}/product/${_id}`
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/product/${_id}`);
        success('Product link copied to clipboard!');
      } catch (err) {
        error('Failed to copy link');
      }
    }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to comparison list in localStorage
    try {
      const compareKey = 'compareProducts';
      const stored = localStorage.getItem(compareKey);
      let compareItems = stored ? JSON.parse(stored) : [];
      
      if (compareItems.length >= 4) {
        error('You can compare up to 4 products at a time');
        return;
      }
      
      if (compareItems.some(item => item._id === _id)) {
        error('Product already in comparison');
        return;
      }
      
      compareItems.push(product);
      localStorage.setItem(compareKey, JSON.stringify(compareItems));
      success('Added to comparison');
    } catch (err) {
      error('Failed to add to comparison');
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarSolid key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />
        );
      } else {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-slate-300" />
        );
      }
    }
    return stars;
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-brand transition-all duration-300"
      >
        <Link to={`/product/${_id}`} className="block">
          <div className="flex gap-3 p-3">
            <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={getProductImage(product)}
                alt={title}
                className="w-full h-full object-cover"
                onLoad={() => setIsImageLoaded(true)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1">
                {title}
              </h3>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-brand-primary font-bold text-sm">
                  {displayPrice}
                </span>
                {displayOriginalPrice && (
                  <span className="text-slate-400 line-through text-xs">
                    {displayOriginalPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {renderRatingStars(rating)}
                <span className="text-slate-400 text-xs">({reviewCount})</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-brand-lg transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Enhanced Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {isNew && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              NEW
            </span>
          )}
          {isHot && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <FireIcon className="w-3 h-3" />
              HOT
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {showWishlist && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                isInWishlist 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-white/80 text-slate-600 hover:text-red-500 hover:bg-white'
              }`}
            >
              {isInWishlist ? (
                <HeartSolid className="w-5 h-5" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </motion.button>
          )}
          
          {showShare && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-600 hover:text-brand-primary hover:bg-white transition-all duration-300"
            >
              <ShareIcon className="w-5 h-5" />
            </motion.button>
          )}
          
          {showCompare && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCompare}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-600 hover:text-brand-primary hover:bg-white transition-all duration-300"
            >
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Enhanced Image Container */}
        <div className="relative overflow-hidden">
          <Link to={`/product/${_id}`}>
            <div className="aspect-square bg-slate-100 relative">
              <img
                src={getProductImage(product, { width: 400, height: 400 })}
                alt={title}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'scale-110' : 'scale-100'}`}
                onLoad={() => setIsImageLoaded(true)}
              />
              
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer" />
              )}
            </div>
          </Link>

          {/* Quick Actions Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || stock <= 0}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    stock <= 0 
                      ? 'bg-slate-400 text-white cursor-not-allowed' 
                      : 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-brand-glow'
                  }`}
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCartIcon className="w-5 h-5" />
                  )}
                </motion.button>
                
                {showQuickView && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowQuickViewModal(true);
                    }}
                    className="p-3 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Content */}
        <div className="p-4">
          {/* Brand & Category */}
          <div className="flex items-center justify-between mb-2">
            {brand && (
              <span className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full">
                {brand}
              </span>
            )}
            {category && (
              <span className="text-xs text-slate-500 uppercase tracking-wide">
                {category}
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/product/${_id}`}>
            <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 hover:text-brand-primary transition-colors duration-200">
              {title}
            </h3>
          </Link>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {renderRatingStars(rating)}
              </div>
              <span className="text-sm text-slate-500">
                ({reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-bold text-brand-primary">
              {displayPrice}
            </span>
            {displayOriginalPrice && displayOriginalPrice > displayPrice && (
              <span className="text-sm text-slate-400 line-through">
                {displayOriginalPrice}
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="text-sm font-medium text-green-600">
                Save {discountPercentage}%
              </span>
            )}
          </div>

          {/* Stock & Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                stock > 10 ? 'bg-green-500' : stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-medium ${
                stock > 10 ? 'text-green-600' : stock > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {stock > 10 ? 'In Stock' : stock > 0 ? `${stock} left` : 'Out of Stock'}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={isAddingToCart || stock <= 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                stock <= 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-brand-gradient text-white hover:shadow-brand transform hover:-translate-y-0.5'
              }`}
            >
              {isAddingToCart ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="w-4 h-4" />
                  Add to Cart
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant (enhanced version of current ProductCard)
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-brand transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rest of the default implementation with enhancements */}
      {/* ... (similar structure to featured but simpler) */}
    </motion.div>
  );
};

export default EnhancedProductCard;
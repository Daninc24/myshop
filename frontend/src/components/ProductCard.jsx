import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  EyeIcon,
  StarIcon,
  FireIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  ShoppingCartIcon as ShoppingCartSolid
} from '@heroicons/react/24/solid';
import { getLazyImageProps, getOptimizedImageUrl, getProductImage } from '../utils/imageUtils';
import useResponsiveLayout from '../hooks/useResponsiveLayout';
import CompactProductCard from './CompactProductCard';
import axios from 'axios';

const ProductCard = React.memo(({ product, showQuickView = true, showWishlist = true, compact = false, variant = 'auto' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addToCart, currency, convertPrice } = useCart();
  const { success, error } = useToast();
  const { user } = useAuth();
  const { isMobile } = useResponsiveLayout();

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
    sku,
    weight,
    dimensions,
    warranty,
    shippingInfo
  } = product;

  const displayPrice = convertPrice(price);
  const displayOriginalPrice = originalPrice ? convertPrice(originalPrice) : null;
  const discountPercentage = discount || (originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  // Check if item is in wishlist on component mount
  useEffect(() => {
    if (user) {
      // Always use localStorage for now to avoid 401 errors
      // TODO: Implement proper backend wishlist when authentication is stable
      try {
        const wishlistKey = `wishlist_${user._id}`;
        const stored = localStorage.getItem(wishlistKey);
        const wishlistItems = stored ? JSON.parse(stored) : [];
        const isInList = wishlistItems.some(item => item._id === _id);
        setIsInWishlist(isInList);
      } catch (err) {
        console.error('Error checking localStorage wishlist:', err);
        setIsInWishlist(false);
      }
    } else {
      // For non-authenticated users, always false
      setIsInWishlist(false);
    }
  }, [user, _id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Adding to cart:', { productId: _id, title, stock, user: !!user });
    
    if (stock <= 0) {
      error('Product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      const result = await addToCart(_id, 1);
      console.log('Add to cart result:', result);
      
      if (result.success) {
        success(result.message || 'Added to cart successfully!');
      } else {
        console.error('Add to cart failed:', result.error);
        error(result.error || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
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
        // Add to wishlist
        wishlistItems.push(product);
        localStorage.setItem(wishlistKey, JSON.stringify(wishlistItems));
        setIsInWishlist(true);
        success('Added to wishlist!');
      } else {
        // Remove from wishlist
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

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const getCurrencySymbol = (cur) => {
    const currencySymbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'GMD': 'D',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
      'BRL': 'R$',
      'MXN': '$',
      'SGD': 'S$',
      'HKD': 'HK$',
      'NZD': 'NZ$',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RUB': '₽',
      'TRY': '₺',
      'ZAR': 'R',
      'KRW': '₩',
      'THB': '฿',
      'MYR': 'RM',
      'IDR': 'Rp',
      'PHP': '₱',
      'VND': '₫',
      'EGP': 'E£',
      'NGN': '₦',
      'KES': 'KSh',
      'UGX': 'USh',
      'TZS': 'TSh',
      'GHS': 'GH₵',
      'XOF': 'CFA',
      'XAF': 'FCFA'
    };
    return currencySymbols[cur] || cur + ' ';
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-warning fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-warning fill-current opacity-50" />
        );
      } else {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-text-muted" />
        );
      }
    }
    return stars;
  };

  // Determine which variant to use
  const shouldUseCompact = variant === 'compact' || (variant === 'auto' && isMobile) || compact;
  
  // Use CompactProductCard for mobile or when explicitly requested
  if (shouldUseCompact) {
    return <CompactProductCard product={product} showWishlist={showWishlist} />;
  }

  // Full mode render
  return (
    <div
      className="group relative bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-large transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {isNew && (
          <span className="bg-info text-white text-xs font-semibold px-2 py-1 rounded-lg">
            NEW
          </span>
        )}
        {isHot && (
          <span className="bg-error text-white text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
            <FireIcon className="w-3 h-3" />
            HOT
          </span>
        )}
        {isOnSale && (
          <span className="bg-success text-white text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
            <TagIcon className="w-3 h-3" />
            SALE
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded-lg">
            -{discountPercentage}%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      {showWishlist && (
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 p-2 sm:p-2.5 rounded-full transition-all duration-300 min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px] ${
            isInWishlist 
              ? 'bg-error text-white shadow-glow' 
              : 'bg-surface/80 backdrop-blur-sm text-text-secondary hover:text-error hover:bg-surface'
          }`}
        >
          {isInWishlist ? (
            <HeartSolid className="w-5 h-5" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Image Container */}
      <div className="block relative overflow-hidden">
        <Link to={`/product/${_id}`} className="block">
          <div className="aspect-square bg-surface-hover relative w-full h-24 sm:h-32 md:h-40 lg:h-48">
            {/* Main Image */}
            <img
              src={getProductImage(product, { width: 200, height: 200 })}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-110' : 'scale-100'}`}
              onLoad={handleImageLoad}
              onError={(e) => {
                console.log('Image failed to load:', e.target.src);
                // Fallback to a reliable placeholder
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';
                setIsImageLoaded(true);
              }}
            />
            
            {/* Loading Skeleton */}
            {!isImageLoaded && (
              <div className="absolute inset-0 shimmer" />
            )}
          </div>
        </Link>

        {/* Image Gallery on Hover */}
        {images.length > 1 && isHovered && (
          <div className="absolute bottom-2 left-2 right-2 flex gap-1">
            {images.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedImageIndex(index);
                }}
                className={`flex-1 h-8 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === selectedImageIndex 
                    ? 'border-primary' 
                    : 'border-white/50 hover:border-primary/50'
                }`}
              >
                <img
                  src={getOptimizedImageUrl(image)}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || stock <= 0}
            className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
              stock <= 0 
                ? 'bg-text-muted text-surface cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-dark shadow-glow'
            }`}
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCartIcon className="w-5 h-5" />
            )}
          </button>
          
          {showQuickView && (
            <Link
              to={`/product/${_id}`}
              className="p-3 rounded-full bg-surface/80 backdrop-blur-sm text-text-primary hover:bg-surface hover:shadow-glow transition-all duration-300 transform hover:scale-110"
            >
              <EyeIcon className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-1.5 sm:p-2 md:p-3">
        {/* Category */}
        {category && (
          <p className="text-xs text-text-muted mb-1 font-medium uppercase tracking-wide">
            {category}
          </p>
        )}

        {/* Title */}
        <Link to={`/product/${_id}`}>
          <h3 className="font-semibold text-text-primary mb-1 line-clamp-2 hover:text-primary transition-colors duration-200 text-xs sm:text-sm md:text-base">
            {title}
          </h3>
        </Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
            <div className="flex items-center gap-0.5">
              {renderRatingStars(rating)}
            </div>
            <span className="text-xs text-text-muted">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
          <span className="text-xs sm:text-sm md:text-base font-bold text-primary">
            {getCurrencySymbol(currency)}{displayPrice}
          </span>
          {displayOriginalPrice && displayOriginalPrice > displayPrice && (
            <span className="text-xs text-text-muted line-through">
              {getCurrencySymbol(currency)}{displayOriginalPrice}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              stock > 10 ? 'bg-success' : stock > 0 ? 'bg-warning' : 'bg-error'
            }`} />
            <span className={`text-xs font-medium ${
              stock > 10 ? 'text-success' : stock > 0 ? 'text-warning' : 'text-error'
            }`}>
              {stock > 10 ? 'In Stock' : stock > 0 ? `${stock} left` : 'Out of Stock'}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || stock <= 0}
            className={`px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 min-h-[28px] sm:min-h-[36px] ${
              stock <= 0 
                ? 'bg-surface-hover text-text-muted cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-dark hover:shadow-glow transform hover:-translate-y-0.5'
            }`}
          >
            {isAddingToCart ? (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden xs:inline">Adding...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Add</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

});

export default ProductCard;
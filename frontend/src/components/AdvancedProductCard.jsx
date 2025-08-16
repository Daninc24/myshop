import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  TagIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  ShoppingCartIcon as ShoppingCartSolid
} from '@heroicons/react/24/solid';
import { getLazyImageProps, getOptimizedImageUrl } from '../utils/imageUtils';

const AdvancedProductCard = ({ 
  product, 
  showQuickView = true, 
  showWishlist = true,
  variant = 'default', // 'default', 'compact', 'featured'
  onQuickView,
  onWishlistToggle,
  className = ''
}) => {
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

  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Ensure selectedImageIndex is valid
  useEffect(() => {
    if (images && images.length > 0 && selectedImageIndex >= images.length) {
      setSelectedImageIndex(0);
    }
  }, [images, selectedImageIndex]);
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState(price);
  const [stockLevel, setStockLevel] = useState(stock);
  const [viewCount, setViewCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [priceHistory, setPriceHistory] = useState([]);
  const [isPriceUpdating, setIsPriceUpdating] = useState(false);
  
  const cardRef = useRef(null);
  const imageRef = useRef(null);

  const { addToCart, currency, convertPrice } = useCart();
  const { success, error } = useToast();
  const { user } = useAuth();

  const displayPrice = convertPrice(dynamicPrice);
  const displayOriginalPrice = originalPrice ? convertPrice(originalPrice) : null;
  const discountPercentage = discount || (originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Preload next image on hover
  useEffect(() => {
    if (isHovered && images.length > 1) {
      const nextIndex = (selectedImageIndex + 1) % images.length;
      const img = new Image();
      img.src = getOptimizedImageUrl(images[nextIndex]) || images[nextIndex];
    }
  }, [isHovered, selectedImageIndex, images]);

  // Dynamic price updates and real-time features
  useEffect(() => {
    // Simulate dynamic price fluctuations
    const priceUpdateInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of price update
        setIsPriceUpdating(true);
        const priceChange = (Math.random() - 0.5) * 10; // ±$5 change
        const newPrice = Math.max(price * 0.8, price + priceChange); // Don't go below 80% of original
        
        setDynamicPrice(newPrice);
        setPriceHistory(prev => [...prev.slice(-4), { price: newPrice, timestamp: Date.now() }]);
        
        setTimeout(() => setIsPriceUpdating(false), 1000);
      }
    }, 300000); // Update every 5 minutes (increased for better performance)

    // Simulate stock level changes
    const stockUpdateInterval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance of stock update
        const stockChange = Math.floor(Math.random() * 5) - 2; // ±2 stock change
        setStockLevel(prev => Math.max(0, prev + stockChange));
      }
    }, 600000); // Update every 10 minutes (increased for better performance)

    // Track view count
    const viewInterval = setInterval(() => {
      if (Math.random() > 0.9) { // 10% chance of new view
        setViewCount(prev => prev + 1);
      }
    }, 900000); // Update every 15 minutes (increased for better performance)

    return () => {
      clearInterval(priceUpdateInterval);
      clearInterval(stockUpdateInterval);
      clearInterval(viewInterval);
    };
  }, [price]);

     // Track product view when card becomes visible
   useEffect(() => {
     if (isVisible && _id) {
       // Send view analytics with timeout and error handling
       const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

       fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/analytics/interaction`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           type: 'view',
           productId: _id,
           timestamp: Date.now()
         }),
         signal: controller.signal
               }).catch(error => {
          if (error.name !== 'AbortError') {
            // Analytics call failed silently
          }
        }).finally(() => {
         clearTimeout(timeoutId);
       });
     }
   }, [isVisible, _id]);

  const handleAddToCart = useCallback(async (e) => {
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
  }, [user, stock, _id, addToCart, success, error]);

  const handleWishlistToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      error('Please login to manage wishlist');
      return;
    }

    setIsInWishlist(!isInWishlist);
    onWishlistToggle?.(product, !isInWishlist);
    
    if (!isInWishlist) {
      success('Added to wishlist!');
    } else {
      success('Removed from wishlist');
    }
  }, [user, isInWishlist, product, onWishlistToggle, success, error]);

  const handleQuickView = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  }, [product, onQuickView]);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsImageLoaded(true);
  }, []);

  const handleShare = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: title,
      text: `Check out this amazing product: ${title}`,
      url: `${window.location.origin}/product/${_id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        success('Product link copied to clipboard!');
      }
    } catch (err) {
      // Share failed silently
    }
  }, [title, _id, success]);

  const nextImage = useCallback(() => {
    if (images.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }, [images.length]);

  // Card variants
  const getCardClasses = () => {
    const baseClasses = 'group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden';
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} p-3`;
      case 'featured':
        return `${baseClasses} p-6 border-2 border-orange-200`;
      default:
        return `${baseClasses} p-4`;
    }
  };

  const getImageClasses = () => {
    const baseClasses = 'w-full object-cover transition-all duration-300';
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} h-32`;
      case 'featured':
        return `${baseClasses} h-64`;
      default:
        return `${baseClasses} h-48`;
    }
  };

  if (!isVisible) {
    return (
      <div ref={cardRef} className={`${getCardClasses()} ${className}`}>
        <div className="animate-pulse">
          <div className={`bg-gray-200 ${getImageClasses()}`}></div>
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className={`${getCardClasses()} ${className} transform hover:-translate-y-1`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isNew && (
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            NEW
          </div>
        )}
        {isHot && (
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <FireIcon className="h-3 w-3" />
            HOT
          </div>
        )}
        {isOnSale && (
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            SALE
          </div>
        )}
        {discountPercentage > 0 && (
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            -{discountPercentage}%
          </div>
        )}
      </div>

      {/* Dynamic Stock Status */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        {stockLevel <= 0 && (
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            OUT OF STOCK
          </div>
        )}
        {stockLevel > 0 && stockLevel <= 5 && (
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
            LOW STOCK
          </div>
        )}
        {stockLevel > 5 && stockLevel <= 20 && (
          <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            LIMITED
          </div>
        )}
        
        {/* Dynamic Price Indicator */}
        {isPriceUpdating && (
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-bounce">
            PRICE UPDATED
          </div>
        )}
        
        {/* Live View Count */}
        {viewCount > 0 && (
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <EyeIcon className="h-3 w-3" />
            {viewCount}
          </div>
        )}
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${_id}`} className="block">
          <img
            ref={imageRef}
            src={getOptimizedImageUrl(images[selectedImageIndex] || images[0]) || '/placeholder-image.svg'}
            alt={title}
            className={`${getImageClasses()} ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
          
          {/* Loading placeholder */}
          {!isImageLoaded && !imageError && (
            <div className={`absolute inset-0 bg-gray-200 animate-pulse ${getImageClasses()}`}></div>
          )}
          
          {/* Error placeholder */}
          {imageError && (
            <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${getImageClasses()}`}>
              <div className="text-gray-400 text-center">
                <TagIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs">Image unavailable</p>
              </div>
            </div>
          )}
        </Link>

        {/* Image Navigation (for multiple images) */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transform -translate-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transform translate-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {showWishlist && (
            <button
              onClick={handleWishlistToggle}
              className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
              title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isInWishlist ? (
                <HeartSolid className="h-4 w-4 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 text-gray-600" />
              )}
            </button>
          )}
          
          {showQuickView && (
            <button
              onClick={handleQuickView}
              className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
              title="Quick view"
            >
              <EyeIcon className="h-4 w-4 text-gray-600" />
            </button>
          )}
          
          <button
            onClick={handleShare}
            className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
            title="Share product"
          >
            <ShareIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        {brand && (
          <div className="text-xs text-gray-500 mb-1 font-medium">{brand}</div>
        )}

        {/* Title */}
        <Link to={`/product/${_id}`} className="block">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
            {title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        {/* Dynamic Price */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <span className={`text-lg font-bold ${isPriceUpdating ? 'text-green-600 animate-pulse' : 'text-gray-900'}`}>
              {displayPrice}
            </span>
            {isPriceUpdating && (
              <span className="text-xs text-green-600 font-medium">LIVE</span>
            )}
          </div>
          {displayOriginalPrice && (
            <span className="text-sm text-gray-500 line-through">{displayOriginalPrice}</span>
          )}
          
          {/* Price History Indicator */}
          {priceHistory.length > 1 && (
            <div className="flex items-center gap-1 text-xs">
              {priceHistory[priceHistory.length - 1].price > priceHistory[priceHistory.length - 2].price ? (
                <span className="text-red-600">↗</span>
              ) : (
                <span className="text-green-600">↘</span>
              )}
            </div>
          )}
        </div>
        
        {/* Stock Level */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Stock: {stockLevel} units</span>
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {shippingInfo?.freeShipping && (
            <div className="flex items-center gap-1">
              <TruckIcon className="h-3 w-3" />
              <span>Free Shipping</span>
            </div>
          )}
          {warranty && (
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="h-3 w-3" />
              <span>{warranty}</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={stockLevel <= 0 || isAddingToCart}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            stockLevel <= 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isAddingToCart
              ? 'bg-orange-400 text-white cursor-wait'
              : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {isAddingToCart ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : stockLevel <= 0 ? (
            <>
              <ShoppingCartIcon className="h-4 w-4" />
              Out of Stock
            </>
          ) : (
            <>
              <ShoppingCartIcon className="h-4 w-4" />
              Add to Cart ({stockLevel} left)
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdvancedProductCard;

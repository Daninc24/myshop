import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  StarIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';
import { getProductImage } from '../utils/imageUtils';

const CompactProductCard = React.memo(({ product, showWishlist = true }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addToCart, currency, convertPrice } = useCart();
  const { success, error } = useToast();
  const { user } = useAuth();

  const {
    _id,
    title,
    price,
    originalPrice,
    category,
    rating = 0,
    reviewCount = 0,
    stock = 0,
    discount = 0
  } = product;

  const displayPrice = convertPrice(price);
  const displayOriginalPrice = originalPrice ? convertPrice(originalPrice) : null;
  const discountPercentage = discount || (originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  // Check if item is in wishlist on component mount
  useEffect(() => {
    if (user) {
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
      setIsInWishlist(false);
    }
  }, [user, _id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stock <= 0) {
      error('Product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      const result = await addToCart(_id, 1);
      
      if (result.success) {
        success(result.message || 'Added to cart successfully!');
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
      error('Failed to update wishlist');
    }
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
          <StarIcon key={i} className="w-3 h-3 text-warning fill-current" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarIcon key={i} className="w-3 h-3 text-warning fill-current opacity-50" />
        );
      } else {
        stars.push(
          <StarIcon key={i} className="w-3 h-3 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="card-compact group relative bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
      <Link to={`/product/${_id}`} className="flex items-center gap-3 p-3 h-full">
        {/* Product Image */}
        <div className="card-compact-image relative">
          <img
            src={getProductImage(product, { width: 80, height: 80 })}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop';
            }}
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
              -{discountPercentage}%
            </span>
          )}
        </div>
        
        {/* Product Content */}
        <div className="card-compact-content">
          {/* Category */}
          {category && (
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
              {category}
            </p>
          )}
          
          {/* Title */}
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 leading-tight">
            {title}
          </h3>
          
          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5">
                {renderRatingStars(rating)}
              </div>
              <span className="text-xs text-gray-500">
                ({reviewCount})
              </span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-red-600">
              {getCurrencySymbol(currency)}{displayPrice}
            </span>
            {displayOriginalPrice && displayOriginalPrice > displayPrice && (
              <span className="text-xs text-gray-500 line-through">
                {getCurrencySymbol(currency)}{displayOriginalPrice}
              </span>
            )}
          </div>
          
          {/* Stock Status & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${
                stock > 10 ? 'bg-green-500' : stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className={`text-xs font-medium ${
                stock > 10 ? 'text-green-600' : stock > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {stock > 10 ? 'In Stock' : stock > 0 ? `${stock} left` : 'Out of Stock'}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Wishlist Button */}
              {showWishlist && (
                <button
                  onClick={handleWishlistToggle}
                  className={`p-1.5 rounded-full transition-all duration-300 touch-target-sm ${
                    isInWishlist 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  {isInWishlist ? (
                    <HeartSolid className="w-3 h-3" />
                  ) : (
                    <HeartIcon className="w-3 h-3" />
                  )}
                </button>
              )}
              
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || stock <= 0}
                className={`p-1.5 rounded-full transition-all duration-300 touch-target-sm ${
                  stock <= 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                {isAddingToCart ? (
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCartIcon className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

});

export default CompactProductCard;
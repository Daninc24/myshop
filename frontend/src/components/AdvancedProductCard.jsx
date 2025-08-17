import React, { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, EyeIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const AdvancedProductCard = memo(({ product, onQuickView, onWishlistToggle, isWishlisted = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  const cardRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
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

  const handleAddToCart = async () => {
    if (!user) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  };

  const discount = calculateDiscount();
  const isOutOfStock = product.stock <= 0;

  if (!isInView) {
    return (
      <div ref={cardRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="animate-pulse">
          <div className="aspect-square bg-gray-200"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.images && product.images.length > 0 ? (
          <img
            src={getOptimizedImageUrl(product.images[currentImageIndex], 'medium')}
            alt={product.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full"
          >
            -{discount}%
          </motion.div>
        )}

        {/* Action Buttons */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-2 left-2 right-2 flex gap-1 md:gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onQuickView && onQuickView(product)}
                className="flex-1 bg-white text-gray-700 p-1.5 md:p-2 rounded-lg shadow-md hover:bg-gray-50"
              >
                <EyeIcon className="w-3 h-3 md:w-4 md:h-4 mx-auto" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onWishlistToggle && onWishlistToggle(product._id)}
                className={`p-1.5 md:p-2 rounded-lg shadow-md ${
                  isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
                }`}
              >
                {isWishlisted ? <HeartSolidIcon className="w-3 h-3 md:w-4 md:h-4" /> : <HeartIcon className="w-3 h-3 md:w-4 md:h-4" />}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-gray-900 text-xs md:text-sm mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-base md:text-lg text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs md:text-sm text-gray-500 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
          className={`w-full py-2 px-3 md:px-4 rounded-lg font-medium text-sm md:text-base ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isAddingToCart ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
});

AdvancedProductCard.displayName = 'AdvancedProductCard';

export default AdvancedProductCard;

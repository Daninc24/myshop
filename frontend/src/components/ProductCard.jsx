import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { memo } from 'react';

const ProductCard = ({ product, small, viewMode = 'grid' }) => {
  const { addToCart, currency, convertPrice } = useCart();
  const { success } = useToast();

  // Utility for currency symbols
  const getCurrencySymbol = (cur) => {
    switch (cur) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'GMD': return 'D';
      default: return cur + ' '; 
    }
  };

  return (
    <Link to={`/products/${product._id}`} className={`card relative animate-fade-in focus:outline-none focus:ring-2 focus:ring-primary group ${viewMode === 'grid' ? 'flex flex-col items-center p-8 transition-transform duration-200 hover:scale-105 hover:shadow-strong' : 'flex flex-row items-center p-4 transition-shadow duration-200 hover:shadow-strong'}`} tabIndex={0}>
      {/* Deal Badge */}
      {product.isDeal && (
        <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow">Deal</span>
      )}
      <img
        src={getOptimizedImageUrl(product.images && product.images[0])}
        alt={product.title}
        loading="lazy"
        srcSet={
                      (product.images && product.images[0] && product.images[0].startsWith('data:image'))
                        ? getOptimizedImageUrl(product.images[0])
                        : `${getOptimizedImageUrl(product.images && product.images[0])}?size=small 100w, ${getOptimizedImageUrl(product.images && product.images[0])}?size=medium 200w, ${getOptimizedImageUrl(product.images && product.images[0])}?size=large 400w`
                    }
        sizes="(max-width: 600px) 100px, 200px"
        className={`${viewMode === 'grid' ? (small ? 'w-16 h-16' : 'w-24 h-24 mb-4') : 'w-20 h-20 mr-4'} rounded-2xl object-cover object-center group-hover:shadow-lg group-hover:ring-2 group-hover:ring-orange-400 transition-all`}
      />
      <div className={`${viewMode === 'grid' ? 'text-center' : 'flex-grow'}`}>
        <h3 className={`font-heading font-bold text-secondary ${viewMode === 'grid' ? 'text-lg mb-1 line-clamp-2' : 'text-base mb-0.5 line-clamp-1'} group-hover:text-orange-600 transition-colors`}>{product.title}</h3>
        <p className={`text-primary font-semibold ${viewMode === 'grid' ? 'text-xl mb-2' : 'text-lg'}`}>{getCurrencySymbol(currency)}{convertPrice(product.price).toFixed(2)}</p>
      </div>
      <div className={`${viewMode === 'grid' ? 'w-full' : 'flex flex-col items-end gap-2'}`}>
        <span className="btn-primary w-full mt-2 text-center">View Details</span>

      </div>
    </Link>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(ProductCard, (prevProps, nextProps) => {
  // Only re-render if product ID changes or small prop changes
  return prevProps.product._id === nextProps.product._id && prevProps.small === nextProps.small && prevProps.viewMode === nextProps.viewMode;
});
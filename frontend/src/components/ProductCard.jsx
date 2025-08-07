import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { ShoppingCartIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { memo, useState } from 'react';

const ProductCard = ({ product, small, viewMode = 'grid' }) => {
  const { addToCart, currency, convertPrice } = useCart();
  const { success } = useToast();
  const [hovered, setHovered] = useState(false);

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

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    const res = await addToCart(product._id, 1);
    if (res.success) success('Added to cart');
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className={`card relative animate-fade-in focus:outline-none focus:ring-2 focus:ring-primary group ${viewMode === 'grid' ? 'flex flex-col items-center p-6 transition-transform duration-200 hover:shadow-strong' : 'flex flex-row items-center p-4 transition-shadow duration-200 hover:shadow-strong'}`}
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
        <h3 className={`font-heading font-bold text-secondary ${viewMode === 'grid' ? 'text-base mb-1 line-clamp-2' : 'text-base mb-0.5 line-clamp-1'} group-hover:text-orange-600 transition-colors`}>{product.title}</h3>
        <p className={`text-primary font-semibold ${viewMode === 'grid' ? 'text-lg mb-2' : 'text-lg'}`}>{getCurrencySymbol(currency)}{convertPrice(product.price).toFixed(2)}</p>
        {product.rating && (
          <div className="flex items-center justify-center gap-1 text-xs text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < Math.round(product.rating) ? '★' : '☆'}</span>
            ))}
            <span className="text-gray-500 ml-1">({product.reviewsCount || 0})</span>
          </div>
        )}
      </div>
      <div className={`${viewMode === 'grid' ? 'w-full' : 'flex flex-col items-end gap-2'}`}>
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-2 w-full mt-2' : 'flex gap-2'}`}>
          <span className="btn-primary text-center">View details</span>
          <span className="btn-secondary text-center">Chat</span>
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-xl transition-colors`}></div>
      )}
      {viewMode === 'grid' && (
        <div className={`absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <button onClick={handleQuickAdd} className="bg-white rounded-full p-2 shadow hover:text-primary" title="Add to cart">
            <ShoppingCartIcon className="w-5 h-5" />
          </button>
          <Link to={`/products/${product._id}`} className="bg-white rounded-full p-2 shadow hover:text-primary" title="Quick view">
            <EyeIcon className="w-5 h-5" />
          </Link>
        </div>
      )}
    </Link>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(ProductCard, (prevProps, nextProps) => {
  // Only re-render if product ID changes or small prop changes
  return prevProps.product._id === nextProps.product._id && prevProps.small === nextProps.small && prevProps.viewMode === nextProps.viewMode;
});
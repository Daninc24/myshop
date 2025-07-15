import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product, small }) => {
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product._id, 1);
    success(`${product.title} added to cart!`);
  };

  return (
    <Link to={`/products/${product._id}`} className={`card flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-strong ${small ? 'p-4' : 'p-8'} animate-fade-in focus:outline-none focus:ring-2 focus:ring-primary`} tabIndex={0}>
      <img
        src={product.images && product.images[0]}
        alt={product.title}
        className={`rounded-2xl object-cover object-center mb-4 ${small ? 'w-16 h-16' : 'w-24 h-24'}`}
      />
      <h3 className="text-lg font-heading font-bold text-secondary mb-1 text-center line-clamp-2">{product.title}</h3>
      <p className="text-primary font-semibold text-xl mb-2">{getCurrencySymbol(currency)}{convertPrice(product.price).toFixed(2)}</p>
      <span className="btn-primary w-full mt-2 text-center">View Details</span>
    </Link>
  );
};

export default ProductCard; 
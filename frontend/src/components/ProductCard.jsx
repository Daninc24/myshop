import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product, small }) => {
  const { addToCart, currency, convertPrice } = useCart();
  const { success } = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product._id, 1);
    success(`${product.title} added to cart!`);
  };

  return (
    <div className={`card flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-strong ${small ? 'p-4' : 'p-8'} animate-fade-in`}>
      <img
        src={product.images && product.images[0]}
        alt={product.title}
        className={`rounded-2xl object-cover mb-4 ${small ? 'w-24 h-24' : 'w-40 h-40'}`}
      />
      <h3 className="text-lg font-heading font-bold text-secondary mb-1 text-center line-clamp-2">{product.title}</h3>
      <p className="text-primary font-semibold text-xl mb-2">${product.price}</p>
      <button className="btn-primary w-full mt-auto">View Details</button>
    </div>
  );
};

export default ProductCard; 
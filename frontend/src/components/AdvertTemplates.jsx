import React from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { 
  ShoppingBagIcon, 
  StarIcon, 
  FireIcon, 
  SparklesIcon,
  ArrowRightIcon,
  TagIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Helper to safely get image URL
const imgSrc = (image) => image ? getOptimizedImageUrl(image) : '/images/placeholder-advert.png';

// Enhanced CTA button with animations
const CtaButton = ({ to, children, variant = 'primary' }) => {
  const baseClasses = "inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-orange-600 border-2 border-orange-500 hover:bg-orange-50",
    dark: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border-2 border-white text-white hover:bg-white hover:text-gray-900"
  };

  const buttonContent = (
    <span className={baseClasses + " " + variants[variant]}>
      {children || 'Shop Now'}
      <ArrowRightIcon className="w-4 h-4" />
    </span>
  );

  return to ? (
    <Link to={to}>{buttonContent}</Link>
  ) : (
    <button className={baseClasses + " " + variants[variant]} disabled>
      {children || 'Shop Now'}
    </button>
  );
};

export const advertTemplates = [
  // Premium Hero Template
  {
    id: 'premium-hero',
    name: 'Premium Hero',
    category: 'hero',
    description: 'Large hero banner with gradient overlay',
    render: ({ title, message, image, product, productId }) => (
      <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
        <img 
          loading="lazy" 
          decoding="async" 
          src={imgSrc(image)} 
          alt={title || 'Advert'} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative h-full flex flex-col justify-center pl-8 pr-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">FEATURED</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">{title}</h2>
          <p className="text-lg text-white/90 mb-4 max-w-md">{message}</p>
          {product && (
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400 font-medium">{product}</span>
            </div>
          )}
          <CtaButton to={productId ? `/products/${productId}` : undefined} variant="primary" />
        </div>
      </div>
    ),
  },

  // Modern Card Template
  {
    id: 'modern-card',
    name: 'Modern Card',
    category: 'card',
    description: 'Clean card design with hover effects',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer">
        <div className="relative h-48 overflow-hidden">
          <img 
            loading="lazy" 
            decoding="async" 
            src={imgSrc(image)} 
            alt={title || 'Advert'} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            SALE
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          {product && (
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBagIcon className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-600 font-medium">{product}</span>
            </div>
          )}
          <CtaButton to={productId ? `/products/${productId}` : undefined} variant="primary" />
        </div>
      </div>
    ),
  },

  // Gradient Banner Template
  {
    id: 'gradient-banner',
    name: 'Gradient Banner',
    category: 'banner',
    description: 'Colorful gradient background with modern typography',
    render: ({ title, message, image, product, productId }) => (
      <div className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <img 
          loading="lazy" 
          decoding="async" 
          src={imgSrc(image)} 
          alt={title || 'Advert'} 
          className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300" 
        />
        <div className="relative h-full flex flex-col justify-center pl-8 pr-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FireIcon className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium text-yellow-300">HOT DEAL</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
          <p className="text-white/90 mb-4 max-w-sm">{message}</p>
          <CtaButton to={productId ? `/products/${productId}` : undefined} variant="outline" />
        </div>
      </div>
    ),
  },

  // Product Showcase Template
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    category: 'showcase',
    description: 'Product-focused design with large image',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <img 
              loading="lazy" 
              decoding="async" 
              src={imgSrc(image)} 
              alt={title || 'Advert'} 
              className="w-32 h-32 rounded-2xl object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              NEW
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-3">{message}</p>
            {product && (
              <div className="flex items-center gap-2 mb-4">
                <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-700 font-medium">{product}</span>
              </div>
            )}
            <CtaButton to={productId ? `/products/${productId}` : undefined} variant="primary" />
          </div>
        </div>
      </div>
    ),
  },

  // Minimalist Template
  {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'minimal',
    description: 'Clean, simple design with focus on content',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors duration-300 group cursor-pointer">
        <div className="flex items-start gap-4">
          <img 
            loading="lazy" 
            decoding="async" 
            src={imgSrc(image)} 
            alt={title || 'Advert'} 
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0" 
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-600 text-sm mb-3">{message}</p>
            {product && (
              <div className="text-xs text-orange-600 font-medium mb-3">{product}</div>
            )}
            <CtaButton to={productId ? `/products/${productId}` : undefined} variant="secondary" />
          </div>
        </div>
      </div>
    ),
  },

  // Split Layout Template
  {
    id: 'split-layout',
    name: 'Split Layout',
    category: 'split',
    description: 'Split design with image and content side by side',
    render: ({ title, message, image, product, productId }) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <EyeIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">FEATURED</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          {product && (
            <div className="flex items-center gap-2 mb-4">
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 font-medium">{product}</span>
            </div>
          )}
          <CtaButton to={productId ? `/products/${productId}` : undefined} variant="primary" />
        </div>
        <div className="relative h-64 md:h-auto">
          <img 
            loading="lazy" 
            decoding="async" 
            src={imgSrc(image)} 
            alt={title || 'Advert'} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </div>
      </div>
    ),
  },

  // Overlay Template
  {
    id: 'overlay',
    name: 'Overlay',
    category: 'overlay',
    description: 'Image with text overlay and gradient',
    render: ({ title, message, image, product, productId }) => (
      <div className="relative h-56 rounded-2xl overflow-hidden group cursor-pointer">
        <img 
          loading="lazy" 
          decoding="async" 
          src={imgSrc(image)} 
          alt={title || 'Advert'} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-white/90 mb-3 text-sm">{message}</p>
          {product && (
            <div className="text-xs text-orange-400 font-medium mb-3">{product}</div>
          )}
          <CtaButton to={productId ? `/products/${productId}` : undefined} variant="outline" />
        </div>
      </div>
    ),
  },

  // Classic Template (Enhanced)
  {
    id: 'classic',
    name: 'Classic',
    category: 'classic',
    description: 'Traditional layout with modern styling',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group cursor-pointer">
        <div className="flex items-center gap-6">
          <img 
            loading="lazy" 
            decoding="async" 
            src={imgSrc(image)} 
            alt={title || 'Advert'} 
            className="w-28 h-28 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300" 
          />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-3">{message}</p>
            {product && (
              <div className="text-sm text-orange-600 font-medium mb-3">{product}</div>
            )}
            <CtaButton to={productId ? `/products/${productId}` : undefined} variant="primary" />
          </div>
        </div>
      </div>
    ),
  },

  // Compact Template
  {
    id: 'compact',
    name: 'Compact',
    category: 'compact',
    description: 'Small, efficient design for limited space',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer">
        <div className="flex items-center gap-4">
          <img 
            loading="lazy" 
            decoding="async" 
            src={imgSrc(image)} 
            alt={title || 'Advert'} 
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0" 
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 truncate">{title}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{message}</p>
            {product && (
              <div className="text-xs text-orange-600 font-medium mb-2">{product}</div>
            )}
            <CtaButton to={productId ? `/products/${productId}` : undefined} variant="secondary" />
          </div>
        </div>
      </div>
    ),
  }
];

// Template categories for organization
export const templateCategories = [
  { id: 'hero', name: 'Hero Banners', description: 'Large, prominent displays' },
  { id: 'banner', name: 'Banners', description: 'Standard banner formats' },
  { id: 'card', name: 'Cards', description: 'Card-based layouts' },
  { id: 'showcase', name: 'Showcases', description: 'Product-focused designs' },
  { id: 'minimal', name: 'Minimal', description: 'Clean, simple designs' },
  { id: 'split', name: 'Split Layouts', description: 'Divided content areas' },
  { id: 'overlay', name: 'Overlays', description: 'Image with text overlay' },
  { id: 'classic', name: 'Classic', description: 'Traditional layouts' },
  { id: 'compact', name: 'Compact', description: 'Space-efficient designs' }
];

// Helper functions
export const getAdvertTemplateById = (id) => 
  advertTemplates.find(t => t.id === id) || advertTemplates[0];

export const getTemplatesByCategory = (category) => 
  advertTemplates.filter(t => t.category === category);

export const getTemplatePreview = (templateId, data) => {
  const template = getAdvertTemplateById(templateId);
  return template ? template.render(data) : null;
};

export default advertTemplates;



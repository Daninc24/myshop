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

// Compact CTA button for small banners
const CompactCtaButton = ({ to, children, variant = 'primary' }) => {
  const baseClasses = "inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 transform hover:scale-105";

  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600",
    secondary: "bg-white text-orange-600 border border-orange-500 hover:bg-orange-50",
    dark: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border border-white text-white hover:bg-white hover:text-gray-900"
  };

  const buttonContent = (
    <span className={baseClasses + " " + variants[variant]}>
      {children || 'Shop Now'}
      <ArrowRightIcon className="w-3 h-3" />
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
  // Compact Banner Template (40px height)
  {
    id: 'compact-banner',
    name: 'Compact Banner',
    category: 'banner',
    description: 'Small 80px height banner for minimal space',
    render: ({ title, message, image, product, productId }) => (
      <div className="relative h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg overflow-hidden group cursor-pointer">
        {/* Background image if provided */}
        {image && (
          <img 
            src={image} 
            alt={title || 'Advertisement'} 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative h-full flex items-center justify-between px-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <FireIcon className="w-3 h-3 text-yellow-300" />
              <span className="text-xs font-medium text-yellow-300">SALE</span>
            </div>
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            {message && <p className="text-xs opacity-90 hidden sm:block truncate">{message}</p>}
          </div>
          <CompactCtaButton to={productId ? `/product/${productId}` : undefined} variant="outline" />
        </div>
      </div>
    ),
  },

  // Compact Image Banner Template (40px height with image)
  {
    id: 'compact-image-banner',
    name: 'Compact Image Banner',
    category: 'banner',
    description: '80px height banner with background image',
    render: ({ title, message, image, product, productId }) => (
      <div className="relative h-20 rounded-lg overflow-hidden group cursor-pointer">
        {/* Background image */}
        {image ? (
          <img 
            src={image} 
            alt={title || 'Advertisement'} 
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        <div className="relative h-full flex items-center justify-between px-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <SparklesIcon className="w-3 h-3 text-yellow-300" />
              <span className="text-xs font-medium text-yellow-300">FEATURED</span>
            </div>
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            {message && <p className="text-xs opacity-90 hidden sm:block truncate">{message}</p>}
          </div>
          <CompactCtaButton to={productId ? `/product/${productId}` : undefined} variant="outline" />
        </div>
      </div>
    ),
  },

  // Compact Card Template
  {
    id: 'compact-card',
    name: 'Compact Card',
    category: 'card',
    description: 'Small card design with minimal content',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
        <div className="h-20 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            {image ? (
              <img 
                src={image} 
                alt={title || 'Advertisement'} 
                className="w-6 h-6 rounded object-cover flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-6 h-6 rounded bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <ShoppingBagIcon className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
              {message && <p className="text-xs text-gray-600 truncate">{message}</p>}
            </div>
          </div>
          <CompactCtaButton to={productId ? `/product/${productId}` : undefined} variant="primary" />
        </div>
      </div>
    ),
  },

  // Compact Gradient Template
  {
    id: 'compact-gradient',
    name: 'Compact Gradient',
    category: 'gradient',
    description: 'Small gradient banner with modern design',
    render: ({ title, message, image, product, productId }) => (
      <div className="relative h-20 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-lg overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="relative h-full flex items-center justify-between px-4 text-white">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-3 h-3 text-yellow-300" />
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            {message && <p className="text-xs opacity-90 hidden sm:block truncate">{message}</p>}
          </div>
          <CompactCtaButton to={productId ? `/product/${productId}` : undefined} variant="outline" />
        </div>
      </div>
    ),
  },

  // Compact Minimal Template
  {
    id: 'compact-minimal',
    name: 'Compact Minimal',
    category: 'minimal',
    description: 'Clean minimal design with focus on content',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-gray-50 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors duration-200 group cursor-pointer">
        <div className="h-20 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center">
              <TagIcon className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
              {message && <p className="text-xs text-gray-600 truncate">{message}</p>}
            </div>
          </div>
          <CompactCtaButton to={productId ? `/product/${productId}` : undefined} variant="secondary" />
        </div>
      </div>
    ),
  },

  // Compact Featured Template
  {
    id: 'compact-featured',
    name: 'Compact Featured',
    category: 'featured',
    description: 'Featured style with prominent branding',
    render: ({ title, message, image, product, productId }) => (
      <div className="relative h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-transparent" />
        <div className="relative h-full flex items-center justify-between px-4 text-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <EyeIcon className="w-3 h-3 text-blue-200" />
              <span className="text-xs font-medium text-blue-200">FEATURED</span>
            </div>
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            {message && <p className="text-xs opacity-90 hidden sm:block truncate">{message}</p>}
          </div>
          <CompactCtaButton to={productId ? `/product/${productId}` : undefined} variant="outline" />
        </div>
      </div>
    ),
  },

  // Compact Sale Template
  {
    id: 'compact-sale',
    name: 'Compact Sale',
    category: 'sale',
    description: 'Sale-focused design with urgency',
    render: ({ title, message, image, product, productId }) => (
      <div className="relative h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative h-full flex items-center justify-between px-4 text-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <HeartIcon className="w-3 h-3 text-red-200" />
              <span className="text-xs font-medium text-red-200">HOT DEAL</span>
            </div>
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            {message && <p className="text-xs opacity-90 hidden sm:block truncate">{message}</p>}
          </div>
          <CompactCtaButton to={productId ? `/product/${productId}` : undefined} variant="outline" />
        </div>
      </div>
    ),
  },

  // Compact New Template
  {
    id: 'compact-new',
    name: 'Compact New',
    category: 'new',
    description: 'New product announcement style',
    render: ({ title, message, image, product, productId }) => (
      <div className="relative h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-transparent" />
        <div className="relative h-full flex items-center justify-between px-4 text-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <StarIcon className="w-3 h-3 text-green-200" />
              <span className="text-xs font-medium text-green-200">NEW</span>
            </div>
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            {message && <p className="text-xs opacity-90 hidden sm:block truncate">{message}</p>}
          </div>
          <CompactCtaButton to={productId ? `/product/${productId}` : undefined} variant="outline" />
        </div>
      </div>
    ),
  },

  // Compact Classic Template
  {
    id: 'compact-classic',
    name: 'Compact Classic',
    category: 'classic',
    description: 'Traditional banner style in compact form',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-white border-2 border-orange-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
        <div className="h-20 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
              <ShoppingBagIcon className="w-3 h-3 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
              {message && <p className="text-xs text-gray-600 truncate">{message}</p>}
            </div>
          </div>
          <CompactCtaButton to={productId ? `/product/${productId}` : undefined} variant="primary" />
        </div>
      </div>
    ),
  },

  // Compact Premium Template
  {
    id: 'compact-premium',
    name: 'Compact Premium',
    category: 'premium',
    description: 'Premium design with gold accents',
    render: ({ title, message, image, product, productId }) => (
      <div className="relative h-20 bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 rounded-lg overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="relative h-full flex items-center justify-between px-4 text-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <SparklesIcon className="w-3 h-3 text-yellow-200" />
              <span className="text-xs font-medium text-yellow-200">PREMIUM</span>
            </div>
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            {message && <p className="text-xs opacity-90 hidden sm:block truncate">{message}</p>}
          </div>
          <CompactCtaButton to={productId ? `/products/${productId}` : undefined} variant="outline" />
        </div>
      </div>
    ),
  },

  // Compact Simple Template
  {
    id: 'compact-simple',
    name: 'Compact Simple',
    category: 'simple',
    description: 'Simple and clean design',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 group cursor-pointer">
        <div className="h-20 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gray-600 flex items-center justify-center">
              <TagIcon className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-gray-800 truncate">{title}</h3>
              {message && <p className="text-xs text-gray-600 truncate">{message}</p>}
            </div>
          </div>
          <CompactCtaButton to={productId ? `/product/${productId}` : undefined} variant="dark" />
        </div>
      </div>
    ),
  }
];

// Template categories for organization
export const templateCategories = [
  { id: 'banner', name: 'Banners', description: 'Standard banner formats' },
  { id: 'card', name: 'Cards', description: 'Card-based layouts' },
  { id: 'gradient', name: 'Gradients', description: 'Gradient background designs' },
  { id: 'minimal', name: 'Minimal', description: 'Clean, simple designs' },
  { id: 'featured', name: 'Featured', description: 'Featured product styles' },
  { id: 'sale', name: 'Sales', description: 'Sale and promotion styles' },
  { id: 'new', name: 'New', description: 'New product announcements' },
  { id: 'classic', name: 'Classic', description: 'Traditional layouts' },
  { id: 'premium', name: 'Premium', description: 'Premium product styles' },
  { id: 'simple', name: 'Simple', description: 'Basic, clean designs' }
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


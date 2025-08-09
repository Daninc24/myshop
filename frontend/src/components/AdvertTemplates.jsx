import React from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageUtils';

// Helper to safely get image URL
const imgSrc = (image) => image ? getOptimizedImageUrl(image) : '/images/placeholder-advert.png';

// Reusable CTA button
const CtaButton = ({ to, children }) => (
  to ? (
    <Link to={to} className="btn-primary mt-2">{children || 'Shop Now'}</Link>
  ) : (
    <button className="btn-primary mt-2" disabled>{children || 'Shop Now'}</button>
  )
);

export const advertTemplates = [
  {
    id: 'classic',
    name: 'Classic',
    render: ({ title, message, image, product, productId }) => (
      <div className="card flex gap-6 items-center p-4">
        <img loading="lazy" decoding="async" src={imgSrc(image)} alt={title ? `Advert: ${title}` : 'Advert'} className="w-28 h-28 object-cover rounded-2xl shadow-soft" />
        <div>
          <h2 className="text-2xl font-heading font-bold text-secondary mb-1">{title}</h2>
          <p className="text-gray-700 mb-2">{message}</p>
          {product && <span className="text-primary text-sm">{product}</span>}
          <div>
            <CtaButton to={productId ? `/products/${productId}` : undefined} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'banner',
    name: 'Banner',
    render: ({ title, message, image, productId }) => (
      <div className="relative h-36 flex items-center justify-center bg-primary-light rounded-2xl overflow-hidden">
        <img loading="lazy" decoding="async" src={imgSrc(image)} alt={title ? `Advert: ${title}` : 'Advert'} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-10 text-center px-4">
          <h2 className="text-3xl font-heading font-bold text-primary drop-shadow mb-1">{title}</h2>
          <p className="text-primary-dark text-lg">{message}</p>
          <div className="mt-2"><CtaButton to={productId ? `/products/${productId}` : undefined} /></div>
        </div>
      </div>
    ),
  },
  {
    id: 'card',
    name: 'Card',
    render: ({ title, message, image }) => (
      <div className="bg-gradient-to-br from-primary-light to-accent-light rounded-2xl p-6 flex flex-col items-center">
        <img loading="lazy" decoding="async" src={imgSrc(image)} alt={title ? `Advert: ${title}` : 'Advert'} className="w-24 h-24 object-cover rounded-full mb-3 shadow-soft" />
        <h2 className="text-xl font-heading font-bold text-primary mb-1">{title}</h2>
        <p className="text-base text-secondary mb-1 text-center">{message}</p>
      </div>
    ),
  },
  {
    id: 'left-image',
    name: 'Left Image',
    render: ({ title, message, image, product }) => (
      <div className="flex items-center bg-gradient-to-r from-accent to-primary text-white rounded-2xl p-6 gap-6">
        <img loading="lazy" decoding="async" src={imgSrc(image)} alt={title ? `Advert: ${title}` : 'Advert'} className="w-32 h-32 object-cover rounded-2xl shadow-strong" />
        <div>
          <h2 className="text-2xl font-heading font-bold mb-1">{title}</h2>
          <p className="text-white/95 mb-2">{message}</p>
          {product && <span className="text-xs bg-white/20 px-3 py-1 rounded-xl">{product}</span>}
        </div>
      </div>
    ),
  },
  {
    id: 'cta-card',
    name: 'CTA Card',
    render: ({ title, message, image, product, productId }) => (
      <div className="bg-surface border-2 border-primary rounded-2xl p-8 flex flex-col items-center shadow-strong">
        {image && <img loading="lazy" decoding="async" src={imgSrc(image)} alt={title ? `Advert: ${title}` : 'Advert'} className="w-28 h-28 object-cover rounded-full border-4 border-primary-light mb-3" />}
        <h2 className="text-2xl font-heading font-bold text-primary mb-1">{title}</h2>
        <p className="text-secondary mb-2 text-center">{message}</p>
        {product && <span className="text-xs text-primary mb-2">{product}</span>}
        <CtaButton to={productId ? `/products/${productId}` : undefined} />
      </div>
    ),
  },
  // New templates
  {
    id: 'minimal',
    name: 'Minimal',
    render: ({ title, message, image }) => (
      <div className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-white">
        <img loading="lazy" decoding="async" src={imgSrc(image)} alt={title || 'Advert'} className="w-20 h-20 object-cover rounded-xl" />
        <div>
          <div className="text-lg font-semibold text-gray-900">{title}</div>
          <div className="text-gray-600">{message}</div>
        </div>
      </div>
    ),
  },
  {
    id: 'overlay-gradient',
    name: 'Overlay Gradient',
    render: ({ title, message, image, productId }) => (
      <div className="relative h-44 rounded-2xl overflow-hidden">
        <img loading="lazy" decoding="async" src={imgSrc(image)} alt={title || 'Advert'} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="relative h-full flex flex-col justify-center pl-5 pr-4 text-white">
          <div className="text-2xl font-bold">{title}</div>
          <div className="text-sm text-white/90">{message}</div>
          <div className="mt-2"><CtaButton to={productId ? `/products/${productId}` : undefined}>View</CtaButton></div>
        </div>
      </div>
    ),
  },
  {
    id: 'split',
    name: 'Split',
    render: ({ title, message, image, product }) => (
      <div className="grid grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-200">
        <div className="p-5 bg-white flex flex-col justify-center">
          <div className="text-xl font-bold text-gray-900 mb-1">{title}</div>
          <div className="text-gray-600 mb-2">{message}</div>
          {product && <div className="text-sm text-primary">{product}</div>}
        </div>
        <img loading="lazy" decoding="async" src={imgSrc(image)} alt={title || 'Advert'} className="w-full h-full object-cover" />
      </div>
    ),
  },
  {
    id: 'product-highlight',
    name: 'Product Highlight',
    render: ({ title, message, image, productId }) => (
      <div className="flex items-center justify-between rounded-2xl p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100">
        <div>
          <div className="text-2xl font-heading font-bold text-orange-700">{title}</div>
          <div className="text-orange-800/90">{message}</div>
          <CtaButton to={productId ? `/products/${productId}` : undefined}>Buy Now</CtaButton>
        </div>
        <img loading="lazy" decoding="async" src={imgSrc(image)} alt={title || 'Advert'} className="w-28 h-28 object-cover rounded-xl shadow" />
      </div>
    ),
  },
  {
    id: 'vertical-card',
    name: 'Vertical Card',
    render: ({ title, message, image }) => (
      <div className="flex flex-col items-center text-center rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
        <img loading="lazy" decoding="async" src={imgSrc(image)} alt={title || 'Advert'} className="w-24 h-24 object-cover rounded-full mb-3" />
        <div className="text-lg font-semibold text-gray-900">{title}</div>
        <div className="text-gray-600">{message}</div>
      </div>
    ),
  },
];

export const getAdvertTemplateById = (id) => advertTemplates.find(t => t.id === id) || advertTemplates[0];



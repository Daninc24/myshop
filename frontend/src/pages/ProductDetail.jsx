import { useState, useEffect } from 'react';

import { useParams, Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { Helmet } from 'react-helmet';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);

  const { addToCart, currency, convertPrice } = useCart();
  const { error: showError } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        showError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      // Add to recently viewed in localStorage
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      // Remove if already present
      const filtered = viewed.filter(p => p._id !== product._id);
      // Add to front
      filtered.unshift({ ...product, images: product.images });
      // Keep max 12
      localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 12)));
    }
  }, [product]);

  // When product or selected options change, find matching variant
  useEffect(() => {
    if (!product) return;
    if (!Array.isArray(product.variants) || product.variants.length === 0) {
      setSelectedVariant(null);
      return;
    }
    const match = product.variants.find(v => {
      if (!Array.isArray(v.options)) return false;
      return v.options.every(opt => selectedOptions[opt.name] === opt.value);
    });
    setSelectedVariant(match || null);
  }, [product, selectedOptions]);

  // Determine if an option value is available given current partial selections
  const isValueAvailable = (optionName, value) => {
    if (!product || !Array.isArray(product.variants)) return true;
    return product.variants.some(v => {
      if (!Array.isArray(v.options) || (v.quantity || 0) <= 0) return false;
      // Check this option value matches
      const hasThis = v.options.find(o => o.name === optionName && o.value === value);
      if (!hasThis) return false;
      // Ensure other selected options (except this one) match the variant
      return Object.entries(selectedOptions).every(([name, val]) => {
        if (name === optionName || !val) return true;
        return v.options.some(o => o.name === name && o.value === val);
      });
    });
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const variantSku = selectedVariant ? selectedVariant.sku : null;
    const result = await addToCart(product._id, quantity, variantSku);
    if (result.success) {
      setQuantity(1);
    } else {
      showError(result.error || 'Failed to add product to cart.');
    }
    setAddingToCart(false);
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
        <Link to="/products" className="btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  // Determine displayed price/stock
  const displayPrice = hasVariants && selectedVariant ? selectedVariant.price : product.price;
  const availableStock = hasVariants && selectedVariant ? (selectedVariant.quantity || 0) : product.stock;
  const canAdd = hasVariants ? !!selectedVariant && availableStock > 0 : product.stock > 0;

  return (
    <>
      <Helmet>
        <title>{product ? `${product.title} - MyShop` : 'Product - MyShop'}</title>
        <meta name="description" content={product ? product.description : 'View product details, images, price, and stock at MyShop.'} />
        <meta property="og:title" content={product ? `${product.title} - MyShop` : 'Product - MyShop'} />
        <meta property="og:description" content={product ? product.description : 'View product details, images, price, and stock at MyShop.'} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://myshop.com/product/${product ? product._id : ''}`} />
        <meta property="og:image" content={getOptimizedImageUrl(product && product.images && product.images[0]) || 'https://myshop.com/logo.png'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product ? `${product.title} - MyShop` : 'Product - MyShop'} />
        <meta name="twitter:description" content={product ? product.description : 'View product details, images, price, and stock at MyShop.'} />
        <meta name="twitter:image" content={getOptimizedImageUrl(product && product.images && product.images[0]) || 'https://myshop.com/logo.png'} />
        <link rel="canonical" href={`https://myshop.com/product/${product ? product._id : ''}`} />
        {product && (
          <script type="application/ld+json">{`
            {
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": "${product.title}",
              "image": [
                "${getOptimizedImageUrl(product.images && product.images[0]) || 'https://luxecart.com/logo.png'}"
              ],
              "description": "${product.description}",
              "sku": "${product._id}",
              "offers": {
                "@type": "Offer",
                "url": "https://myshop.com/product/${product._id}",
                "priceCurrency": "KES",
                "price": "${displayPrice}",
                "availability": "${availableStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}"
              }
            }
          `}</script>
        )}
        {product && product.faq && (
          <script type="application/ld+json">{`
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                ${product.faq.map(q => `{
                  "@type": "Question",
                  "name": "${q.question}",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "${q.answer}"
                  }
                }`).join(',')}
              ]
            }
          `}</script>
        )}
      </Helmet>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-20 sm:pb-24">
        {/* Breadcrumb */}
        <nav className="text-xs sm:text-sm text-gray-500 px-3 xxs:px-4 sm:px-0">
          <div className="flex items-center flex-wrap gap-1">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-1">/</span>
            <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-800 truncate max-w-[120px] xxs:max-w-[150px] sm:max-w-none" title={product.title}>
              {product.title}
            </span>
          </div>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Product Image */}
          <div className="flex flex-col items-center px-3 xxs:px-4 sm:px-0">
            {/* Main Image */}
            <div className="relative w-full mb-3 sm:mb-4">
              <img
                src={getOptimizedImageUrl(product.images && product.images[selectedImage]) || 'https://myshop.com/logo.png'}
                alt={product.title + ' main image'}
                className="w-full max-w-xs xxs:max-w-sm sm:max-w-md mx-auto h-44 xxs:h-48 sm:h-64 lg:h-80 object-contain rounded-xl sm:rounded-2xl bg-white shadow-lg"
                loading="lazy"
              />
            </div>
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center gap-1 sm:gap-2 max-w-full overflow-x-auto pb-2">
                <div className="flex gap-1 sm:gap-2 px-2">
                  {product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={getOptimizedImageUrl(img)}
                      alt={product.title + ' thumbnail ' + (idx + 1)}
                      className={`flex-shrink-0 w-10 h-10 xxs:w-12 xxs:h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-cover rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedImage === idx ? 'border-orange-500 scale-105' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setSelectedImage(idx)}
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6 px-3 xxs:px-4 sm:px-0">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 leading-tight">{product.title}</h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <span className="text-2xl sm:text-3xl font-bold text-blue-600">{convertPrice(displayPrice)}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500">Stock:</span>
                <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${availableStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {availableStock > 0 ? `${availableStock} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Variant Option Selectors */}
            {hasVariants && (
              <div className="space-y-3 sm:space-y-4">
                {(product.options || []).map((opt) => (
                  <div key={opt.name} className="flex flex-col">
                    <label className="font-medium mb-2 text-sm sm:text-base">{opt.name}</label>
                    <select
                      value={selectedOptions[opt.name] || ''}
                      onChange={(e) => setSelectedOptions(prev => ({ ...prev, [opt.name]: e.target.value }))}
                      className="input-field w-full sm:max-w-xs text-sm sm:text-base"
                    >
                      <option value="" disabled>Select {opt.name}</option>
                      {(opt.values || []).map((val) => {
                        const available = isValueAvailable(opt.name, val);
                        return (
                          <option key={val} value={val} disabled={!available}>
                            {val}{!available ? ' (unavailable)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ))}
                {!selectedVariant && (
                  <p className="text-xs sm:text-sm text-red-500 bg-red-50 p-2 rounded-lg">Select all options to see availability.</p>
                )}
              </div>
            )}

            {/* Desktop Actions */}
            <div className="hidden sm:block space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="quantity" className="text-sm font-medium">Qty:</label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="input-field w-20 text-sm"
                    disabled={availableStock === 0}
                  >
                    {[...Array(Math.min(10, availableStock || 0))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!canAdd || addingToCart}
                  className="flex-1 sm:flex-none btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[140px]"
                >
                  <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`I'm interested in your product: ${product.title} (ID: ${product._id})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-sm sm:text-base">Chat on WhatsApp</span>
              </a>

              {(!canAdd && hasVariants && selectedVariant && availableStock === 0) && (
                <p className="text-red-500 text-center text-sm bg-red-50 p-2 rounded-lg">This variant is out of stock</p>
              )}
            </div>

            <div className="border-t pt-4 sm:pt-6">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Product Details</h3>
              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SKU:</span>
                  <span className="font-mono text-xs">{selectedVariant ? selectedVariant.sku : product._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Products */}
        <div className="border-t pt-4 sm:pt-6 lg:pt-8 px-3 xxs:px-4 sm:px-0">
          <Link to="/products" className="text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base transition-colors inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
        </div>
      </div>

      {/* Mobile Sticky Add-to-Cart Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 p-3 safe-area-inset-bottom">
        <div className="flex flex-col gap-3">
          {/* Price and Stock Info */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-blue-600">{convertPrice(displayPrice)}</span>
              <span className="text-xs text-gray-500">
                {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="mobile-quantity" className="text-xs text-gray-600">Qty:</label>
              <select
                id="mobile-quantity"
                aria-label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="input-field w-16 text-sm py-1"
                disabled={availableStock === 0}
              >
                {[...Array(Math.min(10, availableStock || 0))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!canAdd || addingToCart}
              className="flex-1 btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 py-3 text-sm font-medium"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
            </button>
            
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`I'm interested in your product: ${product.title} (ID: ${product._id})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn-secondary flex items-center justify-center space-x-2 py-3 text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
          
          {/* Error Messages */}
          {(!canAdd && hasVariants && selectedVariant && availableStock === 0) && (
            <p className="text-red-500 text-center text-xs bg-red-50 p-2 rounded-lg">This variant is out of stock</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
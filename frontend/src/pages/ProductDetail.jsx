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
        <title>{product ? `${product.title} - MyShopping Center` : 'Product - MyShopping Center'}</title>
        <meta name="description" content={product ? product.description : 'View product details, images, price, and stock at MyShopping Center.'} />
        <meta property="og:title" content={product ? `${product.title} - MyShopping Center` : 'Product - MyShopping Center'} />
        <meta property="og:description" content={product ? product.description : 'View product details, images, price, and stock at MyShopping Center.'} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://myshoppingcenter.com/products/${product ? product._id : ''}`} />
        <meta property="og:image" content={getOptimizedImageUrl(product && product.images && product.images[0]) || 'https://myshoppingcenter.com/logo.png'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product ? `${product.title} - MyShopping Center` : 'Product - MyShopping Center'} />
        <meta name="twitter:description" content={product ? product.description : 'View product details, images, price, and stock at MyShopping Center.'} />
        <meta name="twitter:image" content={getOptimizedImageUrl(product && product.images && product.images[0]) || 'https://myshoppingcenter.com/logo.png'} />
        <link rel="canonical" href={`https://myshoppingcenter.com/products/${product ? product._id : ''}`} />
        {product && (
          <script type="application/ld+json">{`
            {
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": "${product.title}",
              "image": [
                "${getOptimizedImageUrl(product.images && product.images[0]) || 'https://myshoppingcenter.com/logo.png'}"
              ],
              "description": "${product.description}",
              "sku": "${product._id}",
              "offers": {
                "@type": "Offer",
                "url": "https://myshoppingcenter.com/products/${product._id}",
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
      <div className="space-y-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-blue-600">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.title}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="flex flex-col items-center">
            {/* Main Image */}
            <div className="relative w-full mb-4">
              <img
                src={getOptimizedImageUrl(product.images && product.images[selectedImage]) || 'https://myshoppingcenter.com/logo.png'}
                alt={product.title + ' main image'}
                className="w-full h-96 object-contain rounded-2xl bg-white"
                loading="lazy"
              />
            </div>
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={getOptimizedImageUrl(img)}
                    alt={product.title + ' thumbnail ' + (idx + 1)}
                    className={`w-20 h-20 object-cover rounded-lg border-2 cursor-pointer ${selectedImage === idx ? 'border-orange-500' : 'border-gray-200'}`}
                    onClick={() => setSelectedImage(idx)}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-blue-600">{getCurrencySymbol(currency)}{convertPrice(displayPrice).toFixed(2)}</span>
              <span className="text-sm text-gray-500">Stock: {availableStock}</span>
            </div>

            {/* Variant Option Selectors */}
            {hasVariants && (
              <div className="space-y-4">
                {(product.options || []).map((opt) => (
                  <div key={opt.name} className="flex flex-col max-w-xs">
                    <label className="font-medium mb-1">{opt.name}</label>
                    <select
                      value={selectedOptions[opt.name] || ''}
                      onChange={(e) => setSelectedOptions(prev => ({ ...prev, [opt.name]: e.target.value }))}
                      className="input-field"
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
                  <p className="text-sm text-red-500">Select all options to see availability.</p>
                )}
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="quantity" className="sr-only">Quantity</label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="input-field w-24"
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
                className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`I'm interested in your product: ${product.title} (ID: ${product._id})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center space-x-2 w-full mt-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.408 3.481 2.241 2.24 3.481 5.226 3.481 8.407 0 6.556-5.334 11.891-11.891 11.891h-.003zm.78-1.858l1.413-5.183c-.733-1.328-1.141-2.818-1.14-4.343.003-5.275 4.306-9.578 9.58-9.578 2.515.001 4.867.974 6.657 2.762 1.791 1.791 2.762 4.143 2.762 6.656 0 5.275-4.305 9.579-9.579 9.579l-.004-.001s-3.295-1.18-4.244-1.543zm6.597-1.889c-1.176-2.365-2.917-4.107-5.28-5.276l-.48-.236c-.96-.472-1.54-.957-1.54-1.54s.58-1.068 1.54-1.54l.48-.236c2.365-1.176 4.107-2.917 5.276-5.28l.236-.48c.472-.96.957-1.54 1.54-1.54s1.068.58 1.54 1.54l.236.48c1.176 2.365 2.917 4.107 5.28 5.276l.48.236c.96.472 1.54.957 1.54 1.54s-.58 1.068-1.54 1.54l-.48-.236c-2.365 1.176-4.107 2.917-5.276 5.28l-.236.48c-.472.96-.957 1.54-1.54 1.54s-1.068-.58-1.54-1.54l-.236-.48z"/>
                </svg>
                <span>Chat on WhatsApp</span>
              </a>

              {(!canAdd && hasVariants && selectedVariant && availableStock === 0) && (
                <p className="text-red-500 text-center">Out of Stock</p>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-2">Product Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>SKU:</span>
                  <span>{selectedVariant ? selectedVariant.sku : product._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Products */}
        <div className="border-t pt-8">
          <Link to="/products" className="text-blue-600 hover:text-blue-700 font-semibold">
            ← Back to Products
          </Link>
        </div>
      </div>

      {/* Sticky Add-to-Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t z-40 p-3 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-lg sm:text-2xl font-bold text-blue-600">{getCurrencySymbol(currency)}{convertPrice(displayPrice).toFixed(2)}</span>
          <span className="text-xs sm:text-sm text-gray-500">{availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="input-field w-20"
            disabled={availableStock === 0}
          >
            {[...Array(Math.min(10, availableStock || 0))].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <button
            onClick={handleAddToCart}
            disabled={!canAdd || addingToCart}
            className="btn-primary whitespace-nowrap"
          >
            {addingToCart ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
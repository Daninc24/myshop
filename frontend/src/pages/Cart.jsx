import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, currency, convertPrice } = useCart();
  const { user } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch product details for cart items with improved error handling
  useEffect(() => {
    const fetchCartProducts = async () => {
      if (!cart || cart.length === 0) {
        setCartProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get unique product IDs from cart
        const productIds = cart
          .map(item => item.productId || item._id)
          .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates

        if (productIds.length === 0) {
          setCartProducts([]);
          setLoading(false);
          return;
        }

        // Fetch products with retry logic
        let products = [];
        try {
          const response = await axios.get('/products');
          products = Array.isArray(response.data) ? response.data : (response.data.products || []);
        } catch (fetchError) {
          console.error('Error fetching products:', fetchError);
          // Fallback: create basic product objects from cart data
          products = cart.map(item => ({
            _id: item.productId || item._id,
            title: item.title || 'Product',
            price: item.price || 0,
            images: item.images || ['/placeholder-image.jpg'],
            category: item.category || 'Unknown'
          }));
        }

        // Map cart items with product details
        const cartWithProducts = cart.map(cartItem => {
          const productId = cartItem.productId || cartItem._id;
          const product = products.find(p => p._id === productId);
          
          if (product) {
            return {
              ...cartItem,
              ...product,
              price: product.price || 0,
              title: product.title || 'Unknown Product',
              image: product.images?.[0] || product.image || '/placeholder-image.jpg',
              category: product.category || 'Unknown Category'
            };
          } else {
            // Fallback for missing products
            return {
              ...cartItem,
              price: cartItem.price || 0,
              title: cartItem.title || 'Product Not Available',
              image: cartItem.image || '/placeholder-image.jpg',
              category: cartItem.category || 'Unknown Category'
            };
          }
        });

        setCartProducts(cartWithProducts);
      } catch (err) {
        console.error('Error processing cart items:', err);
        error('Error loading cart items. Please try refreshing the page.');
        
        // Fallback: use cart data as is
        const fallbackCart = cart.map(item => ({
          ...item,
          price: item.price || 0,
          title: item.title || 'Product',
          image: item.image || '/placeholder-image.jpg',
          category: item.category || 'Unknown'
        }));
        setCartProducts(fallbackCart);
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [cart, error]);

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

  const subtotal = cartProducts.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleCheckout = () => {
    if (!user) {
      error('Please login to checkout');
      navigate('/login');
      return;
    }
    
    if (cartProducts.length === 0) {
      error('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Helmet>
          <title>Loading Cart - LuxeCart</title>
        </Helmet>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Cart - LuxeCart</title>
        <meta name="description" content="Review your shopping cart items and proceed to checkout." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/products" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          
          {cartProducts.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cart Items ({cartProducts.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartProducts.map((item) => (
                    <div key={item.productId || item._id} className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <p className="text-lg font-semibold text-orange-600 mt-1">
                            {getCurrencySymbol(currency)}{convertPrice ? convertPrice(item.price) : item.price}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId || item._id, (item.quantity || 1) - 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          
                          <span className="w-12 text-center font-medium">{item.quantity || 1}</span>
                          
                          <button
                            onClick={() => handleQuantityChange(item.productId || item._id, (item.quantity || 1) + 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.productId || item._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{getCurrencySymbol(currency)}{convertPrice ? convertPrice(subtotal) : subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `${getCurrencySymbol(currency)}${convertPrice ? convertPrice(shipping) : shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{getCurrencySymbol(currency)}{convertPrice ? convertPrice(tax) : tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold text-orange-600">
                        {getCurrencySymbol(currency)}{convertPrice ? convertPrice(total) : total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center"
                >
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </button>
                
                {!user && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    <Link to="/login" className="text-orange-600 hover:text-orange-700">
                      Sign in
                    </Link> to save your cart and get personalized recommendations
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 
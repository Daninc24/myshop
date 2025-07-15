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
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch product details for cart items
  useEffect(() => {
    const fetchCartProducts = async () => {
      if (cart.length === 0) {
        setCartProducts([]);
        setLoading(false);
        return;
      }

      try {
        const productIds = cart.map(item => item.productId || item._id);
        const response = await axios.get('/products');
        const products = response.data.filter(product => 
          productIds.includes(product._id)
        );

        const cartWithProducts = cart.map(cartItem => {
          const product = products.find(p => p._id === (cartItem.productId || cartItem._id));
          return {
            ...cartItem,
            ...product,
            price: product?.price || 0,
            title: product?.title || 'Unknown Product',
            image: product?.images?.[0] || product?.image || '/placeholder-image.jpg',
            category: product?.category || 'Unknown Category'
          };
        });

        setCartProducts(cartWithProducts);
      } catch (err) {
        error('Error loading cart items');
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [cart, error]);

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
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="space-y-3">
              <Link
                to="/products"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cart - MyShopping Center</title>
        <meta name="description" content="View and manage your shopping cart at MyShopping Center. Ready for checkout!" />
        <meta property="og:title" content="Cart - MyShopping Center" />
        <meta property="og:description" content="View and manage your shopping cart at MyShopping Center. Ready for checkout!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://myshoppingcenter.com/cart" />
        <meta property="og:image" content="https://myshoppingcenter.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cart - MyShopping Center" />
        <meta name="twitter:description" content="View and manage your shopping cart at MyShopping Center. Ready for checkout!" />
        <meta name="twitter:image" content="https://myshoppingcenter.com/logo.png" />
        <link rel="canonical" href="https://myshoppingcenter.com/cart" />
      </Helmet>
      {/* Modernize cart container and summary */}
      <div className="max-w-4xl mx-auto py-10 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-secondary mb-8">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2">
              <div className="space-y-6">
                {cart.map(item => (
                  <div key={item.product} className="card flex items-center gap-6 animate-slide-in">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl shadow-soft" />
                    <div className="flex-1">
                      <h2 className="text-xl font-heading font-bold text-secondary mb-1">{item.name}</h2>
                      <p className="text-gray-500 mb-1">${item.price} x {item.quantity}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.product, item.quantity - 1)} className="btn-secondary px-3 py-1">-</button>
                        <span className="font-medium text-secondary">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product, item.quantity + 1)} className="btn-secondary px-3 py-1">+</button>
                        <button onClick={() => removeFromCart(item.product)} className="btn-danger px-3 py-1 ml-4">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Cart Summary */}
            <div className="card flex flex-col gap-6">
              <h2 className="text-2xl font-heading font-bold text-secondary mb-2">Order Summary</h2>
              <div className="flex justify-between text-lg font-medium">
                <span>Subtotal:</span>
                <span>${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
              </div>
              <button className="btn-primary w-full mt-4" onClick={handleCheckout}>Proceed to Checkout</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart; 
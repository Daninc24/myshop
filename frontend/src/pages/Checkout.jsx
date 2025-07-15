import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../config/stripe';
import PaymentForm from '../components/PaymentForm';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const Checkout = () => {
  const { cart, clearCart, currency, convertPrice } = useCart();
  const { success, error } = useToast();
  const [cartProducts, setCartProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartProducts = async () => {
      if (cart.length === 0) {
        navigate('/cart');
        return;
      }

      try {
        const productIds = cart.map(item => item.productId);
        const response = await axios.get('/products');
        const products = response.data.filter(product => 
          productIds.includes(product._id)
        );

        const cartWithProducts = cart.map(cartItem => {
          const product = products.find(p => p._id === cartItem.productId);
          return {
            ...cartItem,
            product
          };
        });

        setCartProducts(cartWithProducts);
        
        const totalAmount = cartWithProducts.reduce((sum, item) => {
          return sum + (item.product?.price * item.quantity);
        }, 0);
        
        setTotal(totalAmount);
      } catch (err) {
        error('Error loading cart items');
      }
    };

    fetchCartProducts();
  }, [cart, navigate, error]);

  const handlePaymentSuccess = (order) => {
    success('Order placed successfully!');
    navigate('/profile');
  };

  const handlePaymentError = (err) => {
    error('Payment failed. Please try again.');
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

  return (
    <>
      <Helmet>
        <title>Checkout - MyShopping Center</title>
        <meta name="description" content="Complete your purchase at MyShopping Center. Secure payment and fast delivery!" />
        <meta property="og:title" content="Checkout - MyShopping Center" />
        <meta property="og:description" content="Complete your purchase at MyShopping Center. Secure payment and fast delivery!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://myshoppingcenter.com/checkout" />
        <meta property="og:image" content="https://myshoppingcenter.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Checkout - MyShopping Center" />
        <meta name="twitter:description" content="Complete your purchase at MyShopping Center. Secure payment and fast delivery!" />
        <meta name="twitter:image" content="https://myshoppingcenter.com/logo.png" />
        <link rel="canonical" href="https://myshoppingcenter.com/checkout" />
      </Helmet>
      {/* Modernize checkout container and form */}
      <div className="max-w-4xl mx-auto py-10 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-secondary mb-8">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <form className="card flex flex-col gap-6">
            <h2 className="text-xl font-heading font-bold text-secondary mb-2">Shipping Details</h2>
            <input type="text" placeholder="Full Name" className="input-field" required />
            <input type="email" placeholder="Email Address" className="input-field" required />
            <input type="text" placeholder="Address" className="input-field" required />
            <input type="text" placeholder="City" className="input-field" required />
            <input type="text" placeholder="State" className="input-field" required />
            <input type="text" placeholder="Zip Code" className="input-field" required />
            <input type="text" placeholder="Country" className="input-field" required />
            <button type="submit" className="btn-primary mt-4">Continue to Payment</button>
          </form>
          {/* Order Summary & Payment */}
          <div className="card flex flex-col gap-6">
            <h2 className="text-xl font-heading font-bold text-secondary mb-2">Order Summary</h2>
            {/* List of products and total */}
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product} className="flex justify-between items-center">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{getCurrencySymbol(currency)}{convertPrice(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-lg font-medium mt-4">
              <span>Total:</span>
              <span>{getCurrencySymbol(currency)}{convertPrice(cart.reduce((sum, item) => sum + item.price * item.quantity, 0)).toFixed(2)}</span>
            </div>
            {/* PaymentForm component can be placed here */}
            <div className="mt-4">
              <Elements stripe={stripePromise}>
                <PaymentForm onPaymentSuccess={handlePaymentSuccess} onPaymentError={handlePaymentError} />
              </Elements>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout; 
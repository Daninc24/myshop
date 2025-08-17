import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../config/stripe';
import PaymentForm from '../components/PaymentForm';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Form, Input, Button, Card, Typography } from 'antd';

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
        <title>Checkout - LuxeCart</title>
<meta name="description" content="Complete your purchase at LuxeCart. Secure payment and fast delivery!" />
<meta property="og:title" content="Checkout - LuxeCart" />
<meta property="og:description" content="Complete your purchase at LuxeCart. Secure payment and fast delivery!" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://luxecart.com/checkout" />
<meta property="og:image" content="https://luxecart.com/logo.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Checkout - LuxeCart" />
<meta name="twitter:description" content="Complete your purchase at LuxeCart. Secure payment and fast delivery!" />
<meta name="twitter:image" content="https://luxecart.com/logo.png" />
<link rel="canonical" href="https://luxecart.com/checkout" />
      </Helmet>
      {/* Ant Design checkout container and form */}
      <div className="max-w-4xl mx-auto py-10 animate-fade-in">
        <Typography.Title level={2} style={{ marginBottom: 24 }}>Checkout</Typography.Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <Typography.Title level={4}>Shipping Details</Typography.Title>
            <Form layout="vertical">
              <Form.Item label="Full Name" required>
                <Input placeholder="Full Name" />
              </Form.Item>
              <Form.Item label="Email Address" required>
                <Input type="email" placeholder="Email Address" />
              </Form.Item>
              <Form.Item label="Address" required>
                <Input placeholder="Address" />
              </Form.Item>
              <Form.Item label="City" required>
                <Input placeholder="City" />
              </Form.Item>
              <Form.Item label="State" required>
                <Input placeholder="State" />
              </Form.Item>
              <Form.Item label="Zip Code" required>
                <Input placeholder="Zip Code" />
              </Form.Item>
              <Form.Item label="Country" required>
                <Input placeholder="Country" />
              </Form.Item>
              <Button type="primary" block>Continue to Payment</Button>
            </Form>
          </Card>
          <Card>
            <Typography.Title level={4}>Order Summary</Typography.Title>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product} className="flex justify-between items-center">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{convertPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-lg font-medium mt-4">
              <span>Total:</span>
                              <span>{convertPrice(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
            </div>
            <div className="mt-4">
              <Elements stripe={stripePromise}>
                <PaymentForm onPaymentSuccess={handlePaymentSuccess} onPaymentError={handlePaymentError} />
              </Elements>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Checkout; 
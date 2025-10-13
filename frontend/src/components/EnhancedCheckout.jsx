import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getProductImage } from '../utils/imageUtils';
import {
  CheckIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const CheckoutProgress = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Cart Review', icon: ShoppingCartIcon },
    { id: 2, name: 'Shipping', icon: TruckIcon },
    { id: 3, name: 'Payment', icon: CreditCardIcon },
    { id: 4, name: 'Confirmation', icon: CheckIcon }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isActive 
                    ? 'bg-brand-primary border-brand-primary text-white' 
                    : 'border-slate-300 text-slate-400'
              }`}>
                {isCompleted ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  isActive ? 'text-brand-primary' : isCompleted ? 'text-green-600' : 'text-slate-500'
                }`}>
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ShippingForm = ({ shippingInfo, setShippingInfo, errors }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center">
        <TruckIcon className="w-5 h-5 mr-2 text-brand-primary" />
        Shipping Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <UserIcon className="w-4 h-4 inline mr-1" />
            Full Name
          </label>
          <input
            type="text"
            value={shippingInfo.fullName || ''}
            onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all ${
              errors.fullName ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <PhoneIcon className="w-4 h-4 inline mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            value={shippingInfo.phone || ''}
            onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all ${
              errors.phone ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter your phone number"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <EnvelopeIcon className="w-4 h-4 inline mr-1" />
            Email Address
          </label>
          <input
            type="email"
            value={shippingInfo.email || ''}
            onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all ${
              errors.email ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPinIcon className="w-4 h-4 inline mr-1" />
            Street Address
          </label>
          <input
            type="text"
            value={shippingInfo.address || ''}
            onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all ${
              errors.address ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter your street address"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
          <input
            type="text"
            value={shippingInfo.city || ''}
            onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all ${
              errors.city ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter your city"
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Postal Code</label>
          <input
            type="text"
            value={shippingInfo.postalCode || ''}
            onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all ${
              errors.postalCode ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Enter postal code"
          />
          {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
        </div>
      </div>

      {/* Shipping Options */}
      <div className="mt-6">
        <h4 className="text-md font-medium text-slate-900 mb-4">Shipping Options</h4>
        <div className="space-y-3">
          {[
            { id: 'standard', name: 'Standard Delivery', time: '5-7 business days', price: 0 },
            { id: 'express', name: 'Express Delivery', time: '2-3 business days', price: 15 },
            { id: 'overnight', name: 'Overnight Delivery', time: 'Next business day', price: 25 }
          ].map((option) => (
            <label key={option.id} className="flex items-center p-4 border border-slate-200 rounded-xl hover:border-brand-primary cursor-pointer transition-all">
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={shippingInfo.shippingMethod === option.id}
                onChange={(e) => setShippingInfo({...shippingInfo, shippingMethod: e.target.value})}
                className="text-brand-primary focus:ring-brand-primary"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{option.name}</p>
                    <p className="text-sm text-slate-500">{option.time}</p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {option.price === 0 ? 'Free' : `$${option.price}`}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const PaymentForm = ({ paymentInfo, setPaymentInfo, errors }) => {
  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCardIcon },
    { id: 'paypal', name: 'PayPal', icon: '💳' },
    { id: 'apple', name: 'Apple Pay', icon: '🍎' },
    { id: 'google', name: 'Google Pay', icon: '🔵' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center">
        <CreditCardIcon className="w-5 h-5 mr-2 text-brand-primary" />
        Payment Information
      </h3>

      {/* Payment Methods */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setPaymentInfo({...paymentInfo, method: method.id})}
            className={`p-4 border-2 rounded-xl transition-all duration-200 ${
              paymentInfo.method === method.id
                ? 'border-brand-primary bg-brand-primary/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-center">
              {typeof method.icon === 'string' ? (
                <span className="text-2xl">{method.icon}</span>
              ) : (
                <method.icon className="w-6 h-6 mx-auto text-slate-600" />
              )}
              <p className="text-sm font-medium text-slate-700 mt-2">{method.name}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Card Details */}
      {paymentInfo.method === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
            <input
              type="text"
              value={paymentInfo.cardNumber || ''}
              onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="1234 5678 9012 3456"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
              <input
                type="text"
                value={paymentInfo.expiryDate || ''}
                onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
              <input
                type="text"
                value={paymentInfo.cvv || ''}
                onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="123"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
            <input
              type="text"
              value={paymentInfo.cardholderName || ''}
              onChange={(e) => setPaymentInfo({...paymentInfo, cardholderName: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="John Doe"
            />
          </div>
        </div>
      )}

      {/* Security Badges */}
      <div className="flex items-center justify-center space-x-6 py-4 bg-slate-50 rounded-xl">
        <div className="flex items-center text-sm text-slate-600">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-500" />
          SSL Secured
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <LockClosedIcon className="w-5 h-5 mr-2 text-green-500" />
          256-bit Encryption
        </div>
        <div className="text-sm text-slate-600">
          🔒 PCI Compliant
        </div>
      </div>
    </div>
  );
};

const OrderSummary = ({ cart, shippingCost = 0, tax = 0 }) => {
  const { formatPrice } = useCart();
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + shippingCost + tax;

  return (
    <div className="bg-slate-50 rounded-2xl p-6 sticky top-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-4">
        {cart.map((item) => (
          <div key={item._id} className="flex items-center space-x-3">
            <img
              src={getProductImage(item)}
              alt={item.title}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="font-medium text-slate-900 text-sm">{item.title}</p>
              <p className="text-slate-500 text-sm">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-slate-900">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-4 space-y-2">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="border-t border-slate-200 pt-2">
          <div className="flex justify-between text-lg font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center text-sm text-slate-600 mb-2">
          <ShieldCheckIcon className="w-4 h-4 mr-2 text-green-500" />
          30-day money-back guarantee
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <TruckIcon className="w-4 h-4 mr-2 text-blue-500" />
          Free returns within 30 days
        </div>
      </div>
    </div>
  );
};

const EnhancedCheckout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({});
  const [paymentInfo, setPaymentInfo] = useState({ method: 'card' });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingInfo.fullName) newErrors.fullName = 'Full name is required';
    if (!shippingInfo.email) newErrors.email = 'Email is required';
    if (!shippingInfo.phone) newErrors.phone = 'Phone number is required';
    if (!shippingInfo.address) newErrors.address = 'Address is required';
    if (!shippingInfo.city) newErrors.city = 'City is required';
    if (!shippingInfo.postalCode) newErrors.postalCode = 'Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 2 && !validateShipping()) {
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success('Order placed successfully!');
      clearCart();
      setCurrentStep(4);
    } catch (err) {
      error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && currentStep !== 4) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
        <p className="text-slate-600 mb-6">Add some products to your cart to continue with checkout.</p>
        <Link to="/products" className="btn-brand">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <CheckoutProgress currentStep={currentStep} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="cart-review"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-slate-900">Review Your Order</h2>
                {/* Cart items display */}
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-slate-200">
                      <img
                        src={getProductImage(item)}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        <p className="text-slate-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ShippingForm 
                  shippingInfo={shippingInfo}
                  setShippingInfo={setShippingInfo}
                  errors={errors}
                />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <PaymentForm 
                  paymentInfo={paymentInfo}
                  setPaymentInfo={setPaymentInfo}
                  errors={errors}
                />
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
                <p className="text-slate-600 mb-6">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
                <div className="space-x-4">
                  <Link to="/profile#orders" className="btn-brand">
                    View Orders
                  </Link>
                  <Link to="/products" className="btn-outline">
                    Continue Shopping
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              
              {currentStep === 3 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="px-8 py-3 bg-brand-gradient text-white rounded-xl hover:shadow-brand disabled:opacity-50 transition-all"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    'Place Order'
                  )}
                </motion.button>
              ) : (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-brand-gradient text-white rounded-xl hover:shadow-brand transition-all"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {currentStep < 4 && (
          <div className="lg:col-span-1">
            <OrderSummary cart={cart} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCheckout;
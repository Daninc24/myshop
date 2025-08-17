import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'USD');
  const [rates, setRates] = useState({ 
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    GMD: 50.25,
    CAD: 1.35,
    AUD: 1.52,
    JPY: 110.5,
    CHF: 0.92,
    CNY: 6.45,
    INR: 74.5,
    BRL: 5.25,
    MXN: 20.1,
    SGD: 1.35,
    HKD: 7.78,
    NZD: 1.42,
    SEK: 8.65,
    NOK: 8.85,
    DKK: 6.25,
    PLN: 3.85,
    CZK: 21.5,
    HUF: 305.5,
    RUB: 73.5,
    TRY: 8.65,
    ZAR: 14.85,
    KRW: 1185.5,
    THB: 33.25,
    MYR: 4.15,
    IDR: 14250,
    PHP: 50.5,
    VND: 23000,
    EGP: 15.65,
    NGN: 410.5,
    KES: 108.5,
    UGX: 3550,
    TZS: 2300,
    GHS: 5.85,
    XOF: 550,
    XAF: 550
  });

  // Persist currency to localStorage
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Load cart from server when user is authenticated, or from localStorage when not
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      loadGuestCart();
    }
  }, [isAuthenticated]);

  // Sync guest cart to server when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      syncGuestCartToServer();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    axios.get('/payment/currency/rates')
      .then(res => {
        const ratesData = res.data.rates || res.data;
        setRates(ratesData);
      })
      .catch(() => setRates({ USD: 1 }));
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data.cart || []);
    } catch (error) {
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const loadGuestCart = () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(localCart);
    } catch (error) {
      setCart([]);
    }
  };

  const syncGuestCartToServer = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        // Merge guest cart with server cart
        for (const item of localCart) {
          await addToCart(item.productId, item.quantity, item.variantSku);
        }
        // Clear local cart after successful sync
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Failed to sync guest cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1, variantSku = null) => {
    try {
      if (!isAuthenticated) {
        // For non-authenticated users, store in localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = localCart.find(item => 
          item.productId === productId && 
          (item.variantSku || null) === (variantSku || null)
        );
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          localCart.push({ 
            productId, 
            quantity, 
            variantSku: variantSku || null,
            addedAt: new Date().toISOString()
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(localCart));
        setCart(localCart);
        return { success: true, message: 'Added to cart successfully!' };
      }

      // For authenticated users, save to server
      const response = await axios.post('/api/cart', { productId, quantity, variantSku });
      setCart(response.data.cart);
      return { success: true, message: 'Added to cart successfully!' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add to cart' 
      };
    }
  };

  const removeFromCart = async (productId, variantSku = null) => {
    try {
      if (!isAuthenticated) {
        // For non-authenticated users, remove from localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = localCart.filter(item => 
          !(item.productId === productId && (item.variantSku || null) === (variantSku || null))
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCart(updatedCart);
        return { success: true, message: 'Removed from cart successfully!' };
      }

      // For authenticated users, remove from server
      const response = await axios.delete(`/api/cart/${productId}`, { params: { variantSku } });
      setCart(response.data.cart);
      return { success: true, message: 'Removed from cart successfully!' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to remove from cart' 
      };
    }
  };

  const updateQuantity = async (productId, quantity, variantSku = null) => {
    try {
      if (!isAuthenticated) {
        // For non-authenticated users, update in localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const item = localCart.find(item => 
          item.productId === productId && (item.variantSku || null) === (variantSku || null)
        );
        if (item) {
          item.quantity = Math.max(1, quantity); // Ensure quantity is at least 1
          localStorage.setItem('cart', JSON.stringify(localCart));
          setCart(localCart);
        }
        return { success: true, message: 'Quantity updated successfully!' };
      }

      // For authenticated users, update on server
      const response = await axios.put(`/api/cart/${productId}`, { quantity, variantSku });
      setCart(response.data.cart);
      return { success: true, message: 'Quantity updated successfully!' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update quantity' 
      };
    }
  };

  const clearCart = async () => {
    try {
      if (!isAuthenticated) {
        localStorage.removeItem('cart');
        setCart([]);
        return { success: true, message: 'Cart cleared successfully!' };
      }

      await axios.delete('/api/cart');
      setCart([]);
      return { success: true, message: 'Cart cleared successfully!' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to clear cart' 
      };
    }
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const convertPrice = (usdAmount) => {
    if (!usdAmount || isNaN(usdAmount)) return 0;
    const rate = rates[currency] || 1;
    return usdAmount * rate;
  };

  const formatPrice = (amount, currencyCode = currency) => {
    const convertedAmount = convertPrice(amount);
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      GMD: 'D',
      CAD: 'C$',
      AUD: 'A$',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
      BRL: 'R$',
      SGD: 'S$',
      HKD: 'HK$',
      ZAR: 'R',
      NGN: '₦',
      KES: 'KSh',
      GHS: 'GH₵'
    };

    const symbol = currencySymbols[currencyCode] || currencyCode;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
  };

  const isCartEmpty = () => {
    return cart.length === 0;
  };

  const getCartItem = (productId, variantSku = null) => {
    return cart.find(item => 
      item.productId === productId && (item.variantSku || null) === (variantSku || null)
    );
  };

  const value = {
    cart,
    loading,
    currency,
    setCurrency,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
    convertPrice,
    formatPrice,
    isCartEmpty,
    getCartItem,
    isAuthenticated
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 
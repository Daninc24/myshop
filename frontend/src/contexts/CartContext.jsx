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
  const { isAuthenticated } = useContext(AuthContext);
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

  // Load cart from server when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
              axios.get('/payment/currency/rates')
      .then(res => {
        // Handle both formats: direct rates object or nested rates object
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

  const addToCart = async (productId, quantity = 1, variantSku = null) => {
    try {
      if (!isAuthenticated) {
        // For non-authenticated users, store in localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = localCart.find(item => item.productId === productId && (item.variantSku || null) === (variantSku || null));
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          localCart.push({ productId, quantity, variantSku: variantSku || null });
        }
        
        localStorage.setItem('cart', JSON.stringify(localCart));
        setCart(localCart);
        return { success: true };
      }

      // For authenticated users, save to server
              const response = await axios.post('/api/cart', { productId, quantity, variantSku });
      setCart(response.data.cart);
      return { success: true };
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
        const updatedCart = localCart.filter(item => !(item.productId === productId && (item.variantSku || null) === (variantSku || null)));
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCart(updatedCart);
        return { success: true };
      }

      // For authenticated users, remove from server
      const response = await axios.delete(`/api/cart/${productId}`, { params: { variantSku } });
      setCart(response.data.cart);
      return { success: true };
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
        const item = localCart.find(item => item.productId === productId && (item.variantSku || null) === (variantSku || null));
        if (item) {
          item.quantity = quantity;
          localStorage.setItem('cart', JSON.stringify(localCart));
          setCart(localCart);
        }
        return { success: true };
      }

      // For authenticated users, update on server
      const response = await axios.put(`/cart/${productId}`, { quantity, variantSku });
      setCart(response.data.cart);
      return { success: true };
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
        return { success: true };
      }

              await axios.delete('/api/cart');
      setCart([]);
      return { success: true };
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

  const convertPrice = (usdAmount) => {
    if (!usdAmount || isNaN(usdAmount)) return 0;
    if (!rates || !rates[currency]) return usdAmount;
    
    const converted = usdAmount * rates[currency];
    
    // Format based on currency
    const currencyFormatters = {
      USD: (val) => `$${val.toFixed(2)}`,
      EUR: (val) => `€${val.toFixed(2)}`,
      GBP: (val) => `£${val.toFixed(2)}`,
      GMD: (val) => `D${val.toFixed(2)}`,
      CAD: (val) => `C$${val.toFixed(2)}`,
      AUD: (val) => `A$${val.toFixed(2)}`,
      JPY: (val) => `¥${Math.round(val)}`,
      CHF: (val) => `CHF ${val.toFixed(2)}`,
      CNY: (val) => `¥${val.toFixed(2)}`,
      INR: (val) => `₹${val.toFixed(2)}`,
      BRL: (val) => `R$${val.toFixed(2)}`,
      MXN: (val) => `$${val.toFixed(2)}`,
      SGD: (val) => `S$${val.toFixed(2)}`,
      HKD: (val) => `HK$${val.toFixed(2)}`,
      NZD: (val) => `NZ$${val.toFixed(2)}`,
      SEK: (val) => `${val.toFixed(2)} kr`,
      NOK: (val) => `${val.toFixed(2)} kr`,
      DKK: (val) => `${val.toFixed(2)} kr`,
      PLN: (val) => `${val.toFixed(2)} zł`,
      CZK: (val) => `${val.toFixed(2)} Kč`,
      HUF: (val) => `${Math.round(val)} Ft`,
      RUB: (val) => `${val.toFixed(2)} ₽`,
      TRY: (val) => `${val.toFixed(2)} ₺`,
      ZAR: (val) => `R ${val.toFixed(2)}`,
      KRW: (val) => `₩${Math.round(val)}`,
      THB: (val) => `฿${val.toFixed(2)}`,
      MYR: (val) => `RM${val.toFixed(2)}`,
      IDR: (val) => `Rp${Math.round(val)}`,
      PHP: (val) => `₱${val.toFixed(2)}`,
      VND: (val) => `₫${Math.round(val)}`,
      EGP: (val) => `E£${val.toFixed(2)}`,
      NGN: (val) => `₦${val.toFixed(2)}`,
      KES: (val) => `KSh${val.toFixed(2)}`,
      UGX: (val) => `USh${Math.round(val)}`,
      TZS: (val) => `TSh${Math.round(val)}`,
      GHS: (val) => `GH₵${val.toFixed(2)}`,
      XOF: (val) => `${Math.round(val)} CFA`,
      XAF: (val) => `${Math.round(val)} FCFA`
    };
    
    const formatter = currencyFormatters[currency];
    return formatter ? formatter(converted) : `${converted.toFixed(2)}`;
  };

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    cartItemCount: getCartItemCount(),
    currency,
    setCurrency,
    rates,
    convertPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 
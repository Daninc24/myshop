import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiCache } from '../utils/performance';

export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cacheKey = `product_${productId}`;
        const cached = apiCache.get(cacheKey);
        
        if (cached) {
          setProduct(cached);
          setLoading(false);
          return;
        }

        const response = await axios.get(`/products/${productId}`);
        const productData = response.data;
        
        // Cache the result
        apiCache.set(cacheKey, productData);
        setProduct(productData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
        console.error('Product fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const refetch = () => {
    if (productId) {
      apiCache.clear();
      fetchProduct();
    }
  };

  return { product, loading, error, refetch };
};

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        
        // Add filters to query
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value) && value.length > 0) {
              queryParams.append(key, value.join(','));
            } else if (!Array.isArray(value)) {
              queryParams.append(key, value);
            }
          }
        });

        const cacheKey = `products_${queryParams.toString()}`;
        const cached = apiCache.get(cacheKey);
        
        if (cached) {
          setProducts(cached.products);
          setPagination(cached.pagination);
          setLoading(false);
          return;
        }

        const response = await axios.get(`/products?${queryParams}`);
        const data = response.data;
        
        const productsData = Array.isArray(data) ? data : (data.products || []);
        const paginationData = data.pagination || {
          page: 1,
          limit: 20,
          total: productsData.length,
          totalPages: Math.ceil(productsData.length / 20)
        };

        // Cache the result
        apiCache.set(cacheKey, { products: productsData, pagination: paginationData });
        
        setProducts(productsData);
        setPagination(paginationData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products');
        console.error('Products fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const loadMore = async () => {
    if (pagination.page >= pagination.totalPages) return;

    try {
      const nextPage = pagination.page + 1;
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            queryParams.append(key, value.join(','));
          } else if (!Array.isArray(value)) {
            queryParams.append(key, value);
          }
        }
      });
      
      queryParams.append('page', nextPage);

      const response = await axios.get(`/products?${queryParams}`);
      const data = response.data;
      const newProducts = Array.isArray(data) ? data : (data.products || []);

      setProducts(prev => [...prev, ...newProducts]);
      setPagination(prev => ({ ...prev, page: nextPage }));
    } catch (err) {
      console.error('Load more error:', err);
    }
  };

  return { 
    products, 
    loading, 
    error, 
    pagination, 
    loadMore,
    hasMore: pagination.page < pagination.totalPages
  };
};

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWishlist = (userId) => {
    if (!userId) return;
    
    try {
      const wishlistKey = `wishlist_${userId}`;
      const stored = localStorage.getItem(wishlistKey);
      const items = stored ? JSON.parse(stored) : [];
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    }
  };

  const addToWishlist = (userId, product) => {
    if (!userId || !product) return false;

    try {
      const wishlistKey = `wishlist_${userId}`;
      const stored = localStorage.getItem(wishlistKey);
      let items = stored ? JSON.parse(stored) : [];
      
      if (items.some(item => item._id === product._id)) {
        return false; // Already in wishlist
      }
      
      items.push(product);
      localStorage.setItem(wishlistKey, JSON.stringify(items));
      setWishlistItems(items);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = (userId, productId) => {
    if (!userId || !productId) return false;

    try {
      const wishlistKey = `wishlist_${userId}`;
      const stored = localStorage.getItem(wishlistKey);
      let items = stored ? JSON.parse(stored) : [];
      
      items = items.filter(item => item._id !== productId);
      localStorage.setItem(wishlistKey, JSON.stringify(items));
      setWishlistItems(items);
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const isInWishlist = (userId, productId) => {
    if (!userId || !productId) return false;
    return wishlistItems.some(item => item._id === productId);
  };

  const getWishlistCount = (userId) => {
    if (!userId) return 0;
    return wishlistItems.length;
  };

  return {
    wishlistItems,
    loading,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount
  };
};
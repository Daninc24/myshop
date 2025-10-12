import axios from 'axios';
import { performanceOptimizer } from '../utils/performanceOptimizer';

class OptimizedApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.requestQueue = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  // Get cached response or make API call
  async get(url, options = {}) {
    const cacheKey = `${url}${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this.getCachedResponse(cacheKey);
    if (cached && !options.skipCache) {
      return cached;
    }

    // Check if request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    // Make new request
    const requestPromise = this.makeRequest(url, options);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;
      
      // Cache successful response
      if (response && !options.skipCache) {
        this.setCachedResponse(cacheKey, response);
      }
      
      return response;
    } finally {
      // Remove from queue
      this.requestQueue.delete(cacheKey);
    }
  }

  // Make HTTP request with retry logic
  async makeRequest(url, options = {}) {
    const startTime = performance.now();
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout: 10000, // 10 second timeout
          ...options
        });

        const endTime = performance.now();
        console.log(`⚡ API ${url} completed in ${(endTime - startTime).toFixed(2)}ms`);

        return response.data;
      } catch (error) {
        console.warn(`🔄 API ${url} attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.retryAttempts) {
          // Last attempt failed, return fallback data
          console.error(`❌ API ${url} failed after ${this.retryAttempts} attempts`);
          return this.getFallbackData(url);
        }
        
        // Wait before retry
        await this.delay(this.retryDelay * attempt);
      }
    }
  }

  // Cache management
  getCachedResponse(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`📦 Using cached response for ${key}`);
      return cached.data;
    }
    return null;
  }

  setCachedResponse(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ API cache cleared');
  }

  // Fallback data for when API fails
  getFallbackData(url) {
    if (url.includes('/products')) {
      return {
        products: [
          {
            _id: 'fallback-1',
            title: 'Sample Product',
            price: 99.99,
            description: 'This is a sample product shown when the API is unavailable.',
            category: 'Electronics',
            images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'],
            rating: 4.5,
            inStock: true,
            isFallback: true
          }
        ],
        total: 1,
        page: 1,
        pages: 1
      };
    }

    if (url.includes('/categories')) {
      return {
        categories: [
          { _id: 'fallback-cat-1', name: 'Electronics', productCount: 0 },
          { _id: 'fallback-cat-2', name: 'Fashion', productCount: 0 },
          { _id: 'fallback-cat-3', name: 'Home & Garden', productCount: 0 }
        ]
      };
    }

    return { error: 'Service temporarily unavailable', fallback: true };
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch requests for better performance
  async batchRequests(requests) {
    const startTime = performance.now();
    
    try {
      const results = await Promise.allSettled(
        requests.map(({ url, options }) => this.get(url, options))
      );

      const endTime = performance.now();
      console.log(`⚡ Batch request completed in ${(endTime - startTime).toFixed(2)}ms`);

      return results.map(result => 
        result.status === 'fulfilled' ? result.value : this.getFallbackData('')
      );
    } catch (error) {
      console.error('❌ Batch request failed:', error);
      return requests.map(() => this.getFallbackData(''));
    }
  }

  // Preload critical data
  async preloadCriticalData() {
    console.log('🚀 Preloading critical data...');
    
    const criticalRequests = [
      { url: '/products?limit=8&featured=true', options: {} },
      { url: '/categories', options: {} }
    ];

    await this.batchRequests(criticalRequests);
    console.log('✅ Critical data preloaded');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await axios.get('/health', { timeout: 5000 });
      console.log('✅ API health check passed');
      return true;
    } catch (error) {
      console.warn('⚠️ API health check failed:', error.message);
      return false;
    }
  }

  // Initialize service
  init() {
    console.log('🚀 Optimized API Service initialized');
    
    // Clear expired cache every 5 minutes
    setInterval(() => {
      this.clearExpiredCache();
    }, 5 * 60 * 1000);

    // Preload critical data
    this.preloadCriticalData();
  }

  clearExpiredCache() {
    const now = Date.now();
    let cleared = 0;
    
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= this.cacheTimeout) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      console.log(`🗑️ Cleared ${cleared} expired cache entries`);
    }
  }
}

// Create singleton instance
export const apiService = new OptimizedApiService();
export default OptimizedApiService;
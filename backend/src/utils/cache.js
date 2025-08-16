// Redis-like caching system for better performance
class Cache {
  constructor() {
    this.store = new Map();
    this.expiry = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  // Set a key with optional expiry (in seconds)
  set(key, value, ttl = null) {
    this.store.set(key, value);
    this.stats.sets++;
    
    if (ttl) {
      const expiryTime = Date.now() + (ttl * 1000);
      this.expiry.set(key, expiryTime);
      
      // Auto-cleanup when expired
      setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);
    } else {
      this.expiry.delete(key);
    }
    
    return true;
  }

  // Get a key
  get(key) {
    // Check if key exists and is not expired
    if (!this.store.has(key)) {
      this.stats.misses++;
      return null;
    }
    
    const expiryTime = this.expiry.get(key);
    if (expiryTime && Date.now() > expiryTime) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return this.store.get(key);
  }

  // Delete a key
  delete(key) {
    const exists = this.store.has(key);
    this.store.delete(key);
    this.expiry.delete(key);
    
    if (exists) {
      this.stats.deletes++;
    }
    
    return exists;
  }

  // Check if key exists
  has(key) {
    if (!this.store.has(key)) {
      return false;
    }
    
    const expiryTime = this.expiry.get(key);
    if (expiryTime && Date.now() > expiryTime) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  // Set multiple keys
  mset(keyValuePairs) {
    for (const [key, value] of keyValuePairs) {
      this.set(key, value);
    }
    return true;
  }

  // Get multiple keys
  mget(keys) {
    return keys.map(key => this.get(key));
  }

  // Increment a numeric value
  incr(key, amount = 1) {
    const current = this.get(key);
    const newValue = (current || 0) + amount;
    this.set(key, newValue);
    return newValue;
  }

  // Decrement a numeric value
  decr(key, amount = 1) {
    return this.incr(key, -amount);
  }

  // Set with expiry (alias for set with ttl)
  setex(key, ttl, value) {
    return this.set(key, value, ttl);
  }

  // Get with expiry check
  getex(key) {
    const value = this.get(key);
    if (value !== null) {
      const expiryTime = this.expiry.get(key);
      return {
        value,
        expiry: expiryTime ? Math.ceil((expiryTime - Date.now()) / 1000) : null
      };
    }
    return null;
  }

  // Clear all keys
  clear() {
    this.store.clear();
    this.expiry.clear();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  // Get cache statistics
  getStats() {
    return {
      ...this.stats,
      size: this.store.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  // Get all keys matching a pattern
  keys(pattern = '*') {
    const keys = Array.from(this.store.keys());
    
    if (pattern === '*') {
      return keys;
    }
    
    // Simple pattern matching (can be enhanced)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  // Get cache size
  size() {
    return this.store.size;
  }

  // Clean expired keys
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, expiryTime] of this.expiry.entries()) {
      if (now > expiryTime) {
        this.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

// Session cache for user sessions
class SessionCache extends Cache {
  constructor() {
    super();
    this.sessionPrefix = 'session:';
  }

  // Set session data
  setSession(sessionId, data, ttl = 3600) { // Default 1 hour
    return this.set(this.sessionPrefix + sessionId, data, ttl);
  }

  // Get session data
  getSession(sessionId) {
    return this.get(this.sessionPrefix + sessionId);
  }

  // Delete session
  deleteSession(sessionId) {
    return this.delete(this.sessionPrefix + sessionId);
  }

  // Extend session expiry
  extendSession(sessionId, ttl = 3600) {
    const data = this.getSession(sessionId);
    if (data) {
      this.setSession(sessionId, data, ttl);
      return true;
    }
    return false;
  }
}

// API response cache
class ApiCache extends Cache {
  constructor() {
    super();
    this.apiPrefix = 'api:';
  }

  // Cache API response
  cacheResponse(endpoint, params, response, ttl = 300) { // Default 5 minutes
    const key = this.apiPrefix + this.generateKey(endpoint, params);
    return this.set(key, response, ttl);
  }

  // Get cached API response
  getCachedResponse(endpoint, params) {
    const key = this.apiPrefix + this.generateKey(endpoint, params);
    return this.get(key);
  }

  // Invalidate API cache by pattern
  invalidateApiCache(pattern = '*') {
    const keys = this.keys(this.apiPrefix + pattern);
    let invalidated = 0;
    
    for (const key of keys) {
      if (this.delete(key)) {
        invalidated++;
      }
    }
    
    return invalidated;
  }

  // Generate cache key from endpoint and params
  generateKey(endpoint, params) {
    const sortedParams = Object.keys(params || {})
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `${endpoint}?${sortedParams}`;
  }
}

// Product cache for frequently accessed products
class ProductCache extends Cache {
  constructor() {
    super();
    this.productPrefix = 'product:';
    this.categoryPrefix = 'category:';
  }

  // Cache product
  cacheProduct(productId, product, ttl = 1800) { // Default 30 minutes
    return this.set(this.productPrefix + productId, product, ttl);
  }

  // Get cached product
  getCachedProduct(productId) {
    return this.get(this.productPrefix + productId);
  }

  // Cache category products
  cacheCategoryProducts(categoryId, products, ttl = 900) { // Default 15 minutes
    return this.set(this.categoryPrefix + categoryId, products, ttl);
  }

  // Get cached category products
  getCachedCategoryProducts(categoryId) {
    return this.get(this.categoryPrefix + categoryId);
  }

  // Invalidate product cache
  invalidateProduct(productId) {
    return this.delete(this.productPrefix + productId);
  }

  // Invalidate category cache
  invalidateCategory(categoryId) {
    return this.delete(this.categoryPrefix + categoryId);
  }

  // Invalidate all product caches
  invalidateAllProducts() {
    return this.invalidateByPrefix(this.productPrefix);
  }

  // Invalidate all category caches
  invalidateAllCategories() {
    return this.invalidateByPrefix(this.categoryPrefix);
  }

  // Invalidate by prefix
  invalidateByPrefix(prefix) {
    const keys = this.keys(prefix + '*');
    let invalidated = 0;
    
    for (const key of keys) {
      if (this.delete(key)) {
        invalidated++;
      }
    }
    
    return invalidated;
  }
}

// Create cache instances
const sessionCache = new SessionCache();
const apiCache = new ApiCache();
const productCache = new ProductCache();
const generalCache = new Cache();

// Auto-cleanup expired keys every 5 minutes
setInterval(() => {
  sessionCache.cleanup();
  apiCache.cleanup();
  productCache.cleanup();
  generalCache.cleanup();
}, 5 * 60 * 1000);

// Export cache instances
module.exports = {
  sessionCache,
  apiCache,
  productCache,
  generalCache,
  Cache,
  SessionCache,
  ApiCache,
  ProductCache
};

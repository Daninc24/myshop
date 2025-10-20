// Caching middleware for performance optimization

const setCacheHeaders = (req, res, next) => {
  // Skip caching for authenticated requests or POST/PUT/DELETE
  if (req.method !== 'GET' || req.headers.authorization || req.cookies.token) {
    return next();
  }

  const path = req.path;
  
  // Static assets - long cache (1 year)
  if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'Expires': new Date(Date.now() + 31536000000).toUTCString()
    });
  }
  // API routes - short cache (5 minutes)
  else if (path.startsWith('/api/')) {
    // Different cache times for different endpoints
    if (path.includes('/products') || path.includes('/categories')) {
      // Product and category data - 5 minutes
      res.set({
        'Cache-Control': 'public, max-age=300, s-maxage=600', // 5 min client, 10 min CDN
        'Vary': 'Accept-Encoding'
      });
    } else if (path.includes('/events') || path.includes('/testimonials')) {
      // Events and testimonials - 2 minutes
      res.set({
        'Cache-Control': 'public, max-age=120, s-maxage=300', // 2 min client, 5 min CDN
        'Vary': 'Accept-Encoding'
      });
    } else if (path.includes('/analytics') || path.includes('/orders')) {
      // Analytics and orders - no cache
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    } else {
      // Default API cache - 1 minute
      res.set({
        'Cache-Control': 'public, max-age=60, s-maxage=120', // 1 min client, 2 min CDN
        'Vary': 'Accept-Encoding'
      });
    }
  }
  // HTML pages - short cache (1 minute)
  else if (path.endsWith('.html') || path === '/' || !path.includes('.')) {
    res.set({
      'Cache-Control': 'public, max-age=60, s-maxage=300', // 1 min client, 5 min CDN
      'Vary': 'Accept-Encoding'
    });
  }
  // Uploads - medium cache (1 day)
  else if (path.startsWith('/uploads/')) {
    res.set({
      'Cache-Control': 'public, max-age=86400, s-maxage=604800', // 1 day client, 1 week CDN
      'Expires': new Date(Date.now() + 86400000).toUTCString()
    });
  }

  next();
};

// ETag middleware for conditional requests
const setETagHeaders = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Only set ETag for GET requests and successful responses
    if (req.method === 'GET' && res.statusCode === 200 && data) {
      // Generate simple ETag based on content
      const etag = `"${Buffer.from(data).toString('base64').slice(0, 16)}"`;
      res.set('ETag', etag);
      
      // Check if client has matching ETag
      const clientETag = req.headers['if-none-match'];
      if (clientETag === etag) {
        res.status(304).end();
        return;
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Last-Modified headers for static content
const setLastModifiedHeaders = (req, res, next) => {
  // Set Last-Modified for API responses
  if (req.path.startsWith('/api/') && req.method === 'GET') {
    const lastModified = new Date().toUTCString();
    res.set('Last-Modified', lastModified);
    
    // Check If-Modified-Since header
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince) {
      const clientDate = new Date(ifModifiedSince);
      const serverDate = new Date(lastModified);
      
      // If content hasn't been modified in the last minute, return 304
      if (serverDate - clientDate < 60000) {
        res.status(304).end();
        return;
      }
    }
  }
  
  next();
};

// Vary headers for content negotiation
const setVaryHeaders = (req, res, next) => {
  // Set Vary header for API responses to enable proper caching
  if (req.path.startsWith('/api/')) {
    const varyHeaders = ['Accept-Encoding'];
    
    // Add User-Agent for mobile-specific responses
    if (req.headers['user-agent'] && req.headers['user-agent'].includes('Mobile')) {
      varyHeaders.push('User-Agent');
    }
    
    res.set('Vary', varyHeaders.join(', '));
  }
  
  next();
};

// Cache invalidation helper
const invalidateCache = (pattern) => {
  // This would integrate with a CDN or cache service
  // For now, just log the invalidation
  console.log(`Cache invalidation requested for pattern: ${pattern}`);
};

module.exports = {
  setCacheHeaders,
  setETagHeaders,
  setLastModifiedHeaders,
  setVaryHeaders,
  invalidateCache
};
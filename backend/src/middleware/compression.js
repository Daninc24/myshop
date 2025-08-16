const compression = require('compression');

// Compression middleware configuration
const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Compression level (0-9, higher = better compression but slower)
  level: 6,
  
  // Filter function to determine what to compress
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Don't compress already compressed content
    if (req.headers['content-encoding']) {
      return false;
    }
    
    // Don't compress images, videos, or other binary content
    const contentType = res.getHeader('content-type');
    if (contentType) {
      const noCompressTypes = [
        'image/',
        'video/',
        'audio/',
        'application/pdf',
        'application/zip',
        'application/gzip',
        'application/x-rar-compressed'
      ];
      
      if (noCompressTypes.some(type => contentType.includes(type))) {
        return false;
      }
    }
    
    // Use default compression
    return compression.filter(req, res);
  },
  
  // Customize compression for different content types
  contentType: [
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'application/xml',
    'application/xml+rss',
    'text/xml'
  ]
});

module.exports = compressionMiddleware;

const helmet = require('helmet');

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "*"],
      scriptSrc: ["'self'", "https://maps.googleapis.com", "https://maps.gstatic.com", "https://js.stripe.com", "https://www.paypal.com"],
      connectSrc: ["'self'", "https://maps.googleapis.com", "https://api.stripe.com", "https://www.paypal.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false, // Disable for payment integrations
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Add additional security headers
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  ieNoOpen: true,
  xssFilter: true
});

module.exports = securityHeaders; 
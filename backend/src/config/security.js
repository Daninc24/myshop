// Security configuration constants
const SECURITY_CONFIG = {
  // JWT Configuration
  JWT: {
    EXPIRY: '24h',
    REFRESH_EXPIRY: '7d',
    ALGORITHM: 'HS256',
    ISSUER: 'myshop-api',
    AUDIENCE: 'myshop-client'
  },

  // Password Policy
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
  },

  // Rate Limiting
  RATE_LIMITS: {
    GENERAL: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 100
    },
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 5
    },
    PAYMENT: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX_REQUESTS: 3
    },
    ADMIN: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX_REQUESTS: 100
    }
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_FILES: 10,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
  },

  // Session Configuration
  SESSION: {
    COOKIE_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    COOKIE_SECURE: process.env.NODE_ENV === 'production',
    COOKIE_HTTP_ONLY: true,
    COOKIE_SAME_SITE: 'strict'
  },

  // CORS Configuration
  CORS: {
    ALLOWED_ORIGINS: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5174',
      // Add production URLs
    ],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
    CREDENTIALS: true
  },

  // Content Security Policy
  CSP: {
    DEFAULT_SRC: ["'self'"],
    SCRIPT_SRC: [
      "'self'",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://js.stripe.com",
      "https://www.paypal.com",
      "https://www.google-analytics.com"
    ],
    STYLE_SRC: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com"
    ],
    FONT_SRC: [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    IMG_SRC: [
      "'self'",
      "data:",
      "https:",
      "http:"
    ],
    CONNECT_SRC: [
      "'self'",
      "https://maps.googleapis.com",
      "https://api.stripe.com",
      "https://www.paypal.com",
      "https://www.google-analytics.com"
    ],
    FRAME_SRC: [
      "'self'",
      "https://js.stripe.com",
      "https://www.paypal.com"
    ]
  },

  // Audit Configuration
  AUDIT: {
    LOG_SENSITIVE_ROUTES: true,
    LOG_FAILED_ATTEMPTS: true,
    LOG_ADMIN_ACTIONS: true,
    RETENTION_DAYS: 90
  },

  // Encryption
  ENCRYPTION: {
    BCRYPT_ROUNDS: 12,
    AES_ALGORITHM: 'aes-256-gcm'
  }
};

module.exports = SECURITY_CONFIG;
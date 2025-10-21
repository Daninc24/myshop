const fs = require('fs');
const path = require('path');

// Security audit logging middleware
const auditLogger = (req, res, next) => {
  const auditData = {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    requestId: req.id
  };

  // Log sensitive operations
  const sensitiveRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/users',
    '/api/payment',
    '/api/admin'
  ];

  const isSensitive = sensitiveRoutes.some(route => req.url.startsWith(route));
  
  if (isSensitive) {
    // Log to audit file (in production, use proper logging service)
    const logEntry = JSON.stringify(auditData) + '\n';
    const logPath = path.join(__dirname, '../../logs/security-audit.log');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(logPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.appendFileSync(logPath, logEntry);
  }

  next();
};

// Detect suspicious activity
const suspiciousActivityDetector = (req, res, next) => {
  const suspiciousPatterns = [
    // Common attack patterns
    /\.\.\//g,  // Directory traversal
    /<script/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /javascript:/gi, // JavaScript injection
    /vbscript:/gi, // VBScript injection
    /onload=/gi, // Event handler injection
    /onerror=/gi, // Event handler injection
  ];

  const checkSuspicious = (str) => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && checkSuspicious(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkObject(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  // Check URL, query params, and body for suspicious content
  if (checkSuspicious(req.url) || 
      (req.query && checkObject(req.query)) || 
      (req.body && checkObject(req.body))) {
    
    // Log suspicious activity
    console.warn('🚨 Suspicious activity detected:', {
      ip: req.ip,
      url: req.url,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({ 
      message: 'Request blocked due to suspicious content.' 
    });
  }

  next();
};

// Rate limiting by user ID (in addition to IP-based limiting)
const userRateLimiter = new Map();

const userBasedRateLimit = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const userId = req.user.id;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // per user per minute

  if (!userRateLimiter.has(userId)) {
    userRateLimiter.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const userLimit = userRateLimiter.get(userId);
  
  if (now > userLimit.resetTime) {
    userRateLimiter.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (userLimit.count >= maxRequests) {
    return res.status(429).json({
      message: 'Too many requests from this user. Please try again later.'
    });
  }

  userLimit.count++;
  next();
};

module.exports = {
  auditLogger,
  suspiciousActivityDetector,
  userBasedRateLimit
};
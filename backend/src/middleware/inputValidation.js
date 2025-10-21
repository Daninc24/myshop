const validator = require('validator');
const xss = require('xss');

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove XSS attempts
        obj[key] = xss(obj[key]);
        // Trim whitespace
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }
  
  if (req.query) {
    sanitizeObject(req.query);
  }
  
  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
};

// Email validation
const validateEmail = (email) => {
  return validator.isEmail(email) && email.length <= 254;
};

// Password strength validation
const validatePassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
};

// MongoDB ObjectId validation
const validateObjectId = (id) => {
  return validator.isMongoId(id);
};

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (req.files) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    for (const file of req.files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
          message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' 
        });
      }
      
      if (file.size > maxSize) {
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 5MB.' 
        });
      }
    }
  }
  
  next();
};

// SQL injection prevention (additional layer)
const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /('|(\\')|(;)|(\\;)|(\|)|(\*)|(%)|(<)|(>)|(\{)|(\})|(\[)|(\]))/gi
  ];
  
  const checkForSQL = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(obj[key])) {
            return true;
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForSQL(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (req.body && checkForSQL(req.body)) {
    return res.status(400).json({ message: 'Invalid input detected.' });
  }
  
  if (req.query && checkForSQL(req.query)) {
    return res.status(400).json({ message: 'Invalid input detected.' });
  }
  
  next();
};

module.exports = {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateObjectId,
  validateFileUpload,
  preventSQLInjection
};
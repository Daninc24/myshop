const logger = (req, res, next) => {
  const shouldLog = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production';
  if (!shouldLog) return next();

  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = logger; 
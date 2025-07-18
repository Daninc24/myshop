const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellingProducts,
  getInventoryLogs
} = require('../controllers/productController');

// Debug middleware to log request details
const debugMiddleware = (req, res, next) => {
  console.log('=== ROUTE DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Body before multer:', req.body);
  console.log('Files before multer:', req.files);
  console.log('Route hit successfully!');
  next();
};

// Debug middleware after multer
const debugAfterMulter = (req, res, next) => {
  console.log('=== AFTER MULTER DEBUG ===');
  console.log('Body after multer:', req.body);
  console.log('Files after multer:', req.files);
  console.log('Cloudinary URLs:', req.files?.map(f => f.path));
  console.log('Multer processed successfully!');
  next();
};

// Upload middleware to process Cloudinary URLs
const processUpload = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      // Add Cloudinary URLs to request body
      req.body.images = req.files.map(file => file.path);
      console.log('Processed image URLs:', req.body.images);
    } else {
      console.log('No files uploaded');
    }
    next();
  } catch (error) {
    console.error('Upload processing error:', error);
    res.status(500).json({ error: 'Failed to process uploaded files' });
  }
};

// Public routes
router.get('/', getAllProducts);
router.get('/best-selling', getBestSellingProducts);

// Test route to verify routing is working
router.get('/test', (req, res) => {
  console.log('=== TEST ROUTE HIT ===');
  res.json({ message: 'Test route working' });
});

// Test route for image upload
router.post('/test-upload', 
  auth, 
  admin,
  uploadMultiple.array('images', 5), 
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No files uploaded' 
        });
      }
      const urls = req.files.map(file => file.path);
      res.json({ 
        success: true,
        message: 'Upload successful',
        urls: urls,
        files: req.files
      });
    } catch (error) {
      console.error('Test upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Admin/manager: Get inventory logs
router.get('/logs/:productId?', auth, admin, getInventoryLogs);

// Get single product
router.get('/:id', getProduct);

// Admin routes
router.post(
  '/',
  auth,
  admin,
  debugMiddleware,
  uploadMultiple.array('images', 5),
  debugAfterMulter,
  processUpload,
  createProduct
);

router.put(
  '/:id',
  auth,
  admin,
  debugMiddleware,
  uploadMultiple.array('images', 5),
  debugAfterMulter,
  processUpload,
  updateProduct
);

router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;
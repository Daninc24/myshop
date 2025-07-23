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



// Upload middleware to process Cloudinary URLs
const processUpload = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      // Add Cloudinary URLs to request body
      req.body.images = req.files.map(file => file.path);
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





// Admin/manager: Get inventory logs
router.get('/logs/:productId?', auth, admin, getInventoryLogs);

// Get single product
router.get('/:id', getProduct);

// Admin routes
router.post(
  '/',
  auth,
  admin,
  uploadMultiple.array('images', 5),
  processUpload,
  createProduct
);

router.put(
  '/:id',
  auth,
  admin,
  uploadMultiple.array('images', 5),
  processUpload,
  updateProduct
);

router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;
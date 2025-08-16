const express = require('express');
const router = express.Router();
const { 
  createCategory, 
  getCategories, 
  getCategory, 
  updateCategory, 
  deleteCategory,
  testCategories 
} = require('../controllers/categoryController');
const { auth, admin } = require('../middleware/auth');

// Test endpoint
router.get('/test', testCategories);

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.post('/', auth, admin, createCategory);
router.put('/:id', auth, admin, updateCategory);
router.delete('/:id', auth, admin, deleteCategory);

module.exports = router;

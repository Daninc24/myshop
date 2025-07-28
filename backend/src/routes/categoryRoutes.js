const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, admin } = require('../middleware/auth');

// Admin CRUD
router.post('/', auth, admin, categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.put('/:id', auth, admin, categoryController.updateCategory);
router.delete('/:id', auth, admin, categoryController.deleteCategory);

module.exports = router;

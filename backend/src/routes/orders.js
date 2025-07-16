const express = require('express');
const router = express.Router();
const { 
  placeOrder, 
  getUserOrders, 
  getAllOrders, 
  updateOrderStatus 
} = require('../controllers/orderController');
const { auth, orderProcessor } = require('../middleware/auth');

// User routes
router.post('/', auth, placeOrder);
router.get('/', auth, getUserOrders);

// Order processing routes - admin, staff, cashier, manager
router.get('/all', auth, orderProcessor, getAllOrders);
router.put('/:id/status', auth, orderProcessor, updateOrderStatus);

module.exports = router; 
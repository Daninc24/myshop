const express = require('express');
const router = express.Router();
const posController = require('../controllers/posController');
const { auth, orderProcessor } = require('../middleware/auth');

// POS access middleware: admin, shopkeeper, staff, cashier, manager
const posAccess = async (req, res, next) => {
  await auth(req, res, () => {
    const allowedRoles = ['admin', 'shopkeeper', 'staff', 'cashier', 'manager'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. POS access allowed for admin, shopkeeper, staff, cashier, or manager only.' });
    }
    next();
  });
};

// Create a sale (shopkeeper or admin)
router.post('/sales', auth, posController.createSale);

// List sales (admin: all, shopkeeper: own)
router.get('/sales', auth, posController.listSales);

// Sales reporting (admin only)
router.get('/sales/summary', posAccess, posController.getSalesSummary);
router.get('/sales/by-shopkeeper', posAccess, posController.getSalesByShopkeeper);
router.get('/sales/by-product', posAccess, posController.getSalesByProduct);
router.get('/sales/by-payment-method', posAccess, posController.getSalesByPaymentMethod);
router.get('/sales/:id', auth, posController.getSaleById);
router.post('/sales/return', auth, posController.processReturn);

// Z-report (daily sales summary)
router.get('/z-report', posController.getZReport);

// Performance dashboard
router.get('/performance-dashboard', posController.getPerformanceDashboard);

module.exports = router; 
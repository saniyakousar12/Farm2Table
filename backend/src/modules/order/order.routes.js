const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Buyer routes
router.post('/',
  restrictTo('buyer'),
  orderController.createOrder
);

router.get('/my-orders',
  restrictTo('buyer'),
  orderController.getMyOrders
);

router.put('/:id/cancel',
  restrictTo('buyer'),
  orderController.cancelOrder
);

// Farmer routes
router.get('/farmer/orders',
  restrictTo('farmer'),
  orderController.getFarmerOrders
);

router.put('/:id/status',
  restrictTo('farmer', 'admin'),
  orderController.updateOrderStatus
);

// Common routes (both buyer and farmer can view)
router.get('/:id',
  orderController.getOrderById
);

module.exports = router;
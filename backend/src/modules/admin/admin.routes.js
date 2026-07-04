const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Listing management
router.get('/listings', adminController.getAllListings);
router.delete('/listings/:id', adminController.deleteListing);

// Order management
router.get('/orders', adminController.getAllOrders);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

module.exports = router;
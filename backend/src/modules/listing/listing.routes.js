const express = require('express');
const router = express.Router();
const listingController = require('./listing.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

// ========== PUBLIC ROUTES (No authentication required) ==========
// IMPORTANT: Specific routes MUST come BEFORE parameter routes
router.get('/active', listingController.getActiveListings);
router.get('/my-listings', protect, restrictTo('farmer'), listingController.getMyListings);  // Move this BEFORE :id

// ========== PARAMETER ROUTE (Must come AFTER specific routes) ==========
router.get('/:id', listingController.getListingById);

// ========== PROTECTED ROUTES ==========
router.use(protect);

// Farmer CRUD operations
router.post('/', restrictTo('farmer'), listingController.createListing);
router.put('/:id', restrictTo('farmer'), listingController.updateListing);
router.delete('/:id', restrictTo('farmer'), listingController.deleteListing);

// Admin only route
router.post('/admin/update-prices', restrictTo('admin'), listingController.updatePrices);

module.exports = router;
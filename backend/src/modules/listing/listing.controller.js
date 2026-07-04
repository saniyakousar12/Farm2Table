const listingService = require('./listing.service');
const { AppError } = require('../../middleware/error.middleware');

class ListingController {
  async createListing(req, res, next) {
    try {
      const farmerId = req.user._id;
      
      if (req.user.role !== 'farmer') {
        throw new AppError('Only farmers can create listings', 403);
      }
      
      const listing = await listingService.createListing(farmerId, req.body);
      
      res.status(201).json({
        status: 'success',
        message: 'Product listed successfully',
        data: { listing }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getActiveListings(req, res, next) {
    try {
      const filters = {
        produceType: req.query.produceType,
        produceName: req.query.produceName,
        organic: req.query.organic === 'true',
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        minFreshness: req.query.minFreshness ? parseFloat(req.query.minFreshness) : undefined
      };
      
      const listings = await listingService.getActiveListings(filters);
      
      res.status(200).json({
        status: 'success',
        results: listings.length,
        data: { listings }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getMyListings(req, res, next) {
    try {
      const farmerId = req.user._id;
      const listings = await listingService.getFarmerListings(farmerId);
      
      res.status(200).json({
        status: 'success',
        results: listings.length,
        data: { listings }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getListingById(req, res, next) {
    try {
      const { id } = req.params;
      const listing = await listingService.getListingById(id);
      
      res.status(200).json({
        status: 'success',
        data: { listing }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateListing(req, res, next) {
    try {
      const { id } = req.params;
      const farmerId = req.user._id;
      
      const listing = await listingService.updateListing(id, farmerId, req.body);
      
      res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: { listing }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteListing(req, res, next) {
    try {
      const { id } = req.params;
      const farmerId = req.user._id;
      
      await listingService.deleteListing(id, farmerId);
      
      res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async cancelListing(req, res, next) {
    try {
      const { id } = req.params;
      const farmerId = req.user._id;
      
      const listing = await listingService.cancelListing(id, farmerId);
      
      res.status(200).json({
        status: 'success',
        message: 'Listing cancelled successfully',
        data: { listing }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updatePrices(req, res, next) {
    try {
      if (req.user.role !== 'admin') {
        throw new AppError('Only admins can manually trigger price updates', 403);
      }
      
      const count = await listingService.updateAllListingsPrices();
      
      res.status(200).json({
        status: 'success',
        message: `Updated prices for ${count} listings`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ListingController();
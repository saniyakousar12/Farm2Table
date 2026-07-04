const Listing = require('./listing.model');
const { AppError } = require('../../middleware/error.middleware');

class ListingService {
  // Create new listing
  async createListing(farmerId, listingData) {
    const listing = await Listing.create({
      farmerId,
      ...listingData
    });
    return listing;
  }
  
  // Get all active listings
  async getActiveListings(filters = {}) {
    const query = {
      status: 'active',
      expiryTime: { $gt: new Date() }
    };
    
    if (filters.produceType) {
      query.produceType = filters.produceType;
    }
    
    if (filters.produceName) {
      query.produceName = { $regex: filters.produceName, $options: 'i' };
    }
    
    if (filters.organic) {
      query.organic = true;
    }
    
    if (filters.maxPrice) {
      query.currentPrice = { $lte: filters.maxPrice };
    }
    
    if (filters.minFreshness) {
      query.freshnessScore = { $gte: filters.minFreshness };
    }
    
    const listings = await Listing.find(query)
      .populate('farmerId', 'name email phone')
      .sort({ freshnessScore: -1, createdAt: -1 });
    
    return listings;
  }
  
  // Get farmer's listings
  async getFarmerListings(farmerId) {
    const listings = await Listing.find({ farmerId })
      .sort({ createdAt: -1 });
    
    return listings;
  }
  
  // Get single listing
  async getListingById(listingId) {
    const listing = await Listing.findById(listingId)
      .populate('farmerId', 'name email phone');
    
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }
    
    return listing;
  }
  
  // Update listing
  async updateListing(listingId, farmerId, updateData) {
    const listing = await Listing.findOne({ _id: listingId, farmerId });
    
    if (!listing) {
      throw new AppError('Listing not found or unauthorized', 404);
    }
    
    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.farmerId;
    delete updateData.createdAt;
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        listing[key] = updateData[key];
      }
    });
    
    await listing.save();
    return listing;
  }
  
  // Delete listing
  async deleteListing(listingId, farmerId) {
    const listing = await Listing.findOneAndDelete({ _id: listingId, farmerId });
    
    if (!listing) {
      throw new AppError('Listing not found or unauthorized', 404);
    }
    
    return listing;
  }
  
  // Cancel listing
  async cancelListing(listingId, farmerId) {
    const listing = await Listing.findOne({ _id: listingId, farmerId });
    
    if (!listing) {
      throw new AppError('Listing not found or unauthorized', 404);
    }
    
    listing.status = 'cancelled';
    await listing.save();
    
    return listing;
  }
  
  // Update listing quantity
  async updateQuantity(listingId, quantityOrdered) {
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }
    
    if (listing.quantity < quantityOrdered) {
      throw new AppError(`Only ${listing.quantity} ${listing.unit} available`, 400);
    }
    
    listing.quantity -= quantityOrdered;
    
    if (listing.quantity === 0) {
      listing.status = 'sold_out';
    }
    
    await listing.save();
    return listing;
  }
  
  // Update all listings prices
  async updateAllListingsPrices() {
    const listings = await Listing.find({ status: 'active', expiryTime: { $gt: new Date() } });
    
    for (const listing of listings) {
      const now = new Date();
      const harvestTime = new Date(listing.harvestDateTime);
      const hoursSinceHarvest = Math.max(0, (now - harvestTime) / (1000 * 60 * 60));
      
      listing.freshnessScore = Math.max(0, Math.min(100, 100 - (hoursSinceHarvest * 4)));
      
      const discountRate = Math.min(0.9, Math.floor(hoursSinceHarvest / 6) * 0.10);
      listing.discountApplied = Math.round(discountRate * 100);
      listing.currentPrice = Math.round((listing.basePrice * (1 - discountRate)) * 100) / 100;
      
      if (now > listing.expiryTime) {
        listing.status = 'expired';
      }
      
      await listing.save();
    }
    
    return listings.length;
  }
}

module.exports = new ListingService();
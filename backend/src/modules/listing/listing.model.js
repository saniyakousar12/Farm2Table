const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  produceType: {
    type: String,
    required: [true, 'Please specify the produce type'],
    trim: true,
    lowercase: true,
    enum: ['vegetables', 'fruits', 'dairy', 'herbs', 'grains', 'other']
  },
  produceName: {
    type: String,
    required: [true, 'Please specify the produce name'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify quantity'],
    min: [0.1, 'Quantity must be at least 0.1']
  },
  unit: {
    type: String,
    required: [true, 'Please specify unit'],
    enum: ['kg', 'gram', 'liter', 'bunch', 'piece', 'dozen']
  },
  basePrice: {
    type: Number,
    required: [true, 'Please set base price'],
    min: [1, 'Price must be at least 1']
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  harvestDateTime: {
    type: Date,
    required: [true, 'Please provide harvest date and time'],
    default: Date.now
  },
  expiryTime: {
    type: Date,
    default: function() {
      return new Date(this.harvestDateTime.getTime() + (24 * 60 * 60 * 1000));
    }
  },
  freshnessScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  discountApplied: {
    type: Number,
    default: 0,
    min: 0,
    max: 90
  },
  images: [{
    type: String
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  organic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'sold_out', 'cancelled'],
    default: 'active'
  },
  location: {
    farmName: String,
    address: String,
    city: String,
    pincode: String
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate freshness score and current price
listingSchema.pre('save', function(next) {
  if (this.isModified('harvestDateTime') || this.isModified('basePrice')) {
    const now = new Date();
    const harvestTime = new Date(this.harvestDateTime);
    const hoursSinceHarvest = Math.max(0, (now - harvestTime) / (1000 * 60 * 60));
    
    // Calculate freshness score (100 - 4 points per hour, min 0)
    this.freshnessScore = Math.max(0, Math.min(100, 100 - (hoursSinceHarvest * 4)));
    
    // Calculate discount (10% every 6 hours, max 90%)
    const discountRate = Math.min(0.9, Math.floor(hoursSinceHarvest / 6) * 0.10);
    this.discountApplied = Math.round(discountRate * 100);
    
    // Calculate current price
    this.currentPrice = Math.round((this.basePrice * (1 - discountRate)) * 100) / 100;
    
    // Set expiry time if not set
    if (!this.expiryTime) {
      this.expiryTime = new Date(harvestTime.getTime() + (24 * 60 * 60 * 1000));
    }
  }
  next();
});

// Method to check if listing is expired
listingSchema.methods.isExpired = function() {
  return new Date() > this.expiryTime;
};

// Method to get freshness category
listingSchema.methods.getFreshnessCategory = function() {
  if (this.freshnessScore >= 80) return 'Just Harvested';
  if (this.freshnessScore >= 50) return 'Today\'s Fresh';
  if (this.freshnessScore >= 20) return 'Evening Deal';
  return 'Flash Sale';
};

// Indexes
listingSchema.index({ status: 1, expiryTime: 1 });
listingSchema.index({ farmerId: 1 });
listingSchema.index({ produceType: 1 });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
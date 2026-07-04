const User = require('../user/user.model');
const Listing = require('../listing/listing.model');
const Order = require('../order/order.model');
const { AppError } = require('../../middleware/error.middleware');

class AdminController {
  // Get all users
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find().select('-password');
      
      res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req, res, next) {
    try {
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user status (activate/deactivate)
  async updateUserStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      res.status(200).json({
        status: 'success',
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  async deleteUser(req, res, next) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all listings
  async getAllListings(req, res, next) {
    try {
      const listings = await Listing.find()
        .populate('farmerId', 'name email phone');
      
      res.status(200).json({
        status: 'success',
        results: listings.length,
        data: { listings }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete any listing
  async deleteListing(req, res, next) {
    try {
      const listing = await Listing.findByIdAndDelete(req.params.id);
      
      if (!listing) {
        throw new AppError('Listing not found', 404);
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Listing deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all orders
  async getAllOrders(req, res, next) {
    try {
      const orders = await Order.find()
        .populate('buyerId', 'name email phone')
        .populate('farmerId', 'name email phone')
        .populate('items.listingId', 'produceName images');
      
      res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get dashboard stats
  async getDashboardStats(req, res, next) {
    try {
      const totalUsers = await User.countDocuments();
      const totalFarmers = await User.countDocuments({ role: 'farmer' });
      const totalBuyers = await User.countDocuments({ role: 'buyer' });
      const totalListings = await Listing.countDocuments({ status: 'active' });
      const totalOrders = await Order.countDocuments();
      const deliveredOrders = await Order.find({ orderStatus: 'delivered' });
      
      const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.grandTotal, 0);
      const pendingOrders = await Order.countDocuments({ 
        orderStatus: { $in: ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'] }
      });
      
      res.status(200).json({
        status: 'success',
        data: {
          stats: {
            totalUsers,
            totalFarmers,
            totalBuyers,
            totalListings,
            totalOrders,
            totalRevenue,
            pendingOrders,
            deliveredOrders: deliveredOrders.length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
const orderService = require('./order.service');
const { AppError } = require('../../middleware/error.middleware');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const buyerId = req.user._id;
      
      if (req.user.role !== 'buyer') {
        throw new AppError('Only buyers can place orders', 403);
      }
      
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      
      const order = await orderService.createOrder(buyerId, req.body, io, onlineUsers);
      
      res.status(201).json({
        status: 'success',
        message: 'Order placed successfully',
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getMyOrders(req, res, next) {
    try {
      const buyerId = req.user._id;
      const { status } = req.query;
      
      const orders = await orderService.getBuyerOrders(buyerId, status);
      
      res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getFarmerOrders(req, res, next) {
    try {
      const farmerId = req.user._id;
      const { status } = req.query;
      
      if (req.user.role !== 'farmer') {
        throw new AppError('Only farmers can access this', 403);
      }
      
      const orders = await orderService.getFarmerOrders(farmerId, status);
      
      res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;
      
      const order = await orderService.getOrderById(id, userId, userRole);
      
      res.status(200).json({
        status: 'success',
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;
      
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      
      const order = await orderService.updateOrderStatus(id, userId, userRole, status, note, io, onlineUsers);
      
      res.status(200).json({
        status: 'success',
        message: `Order status updated to ${status}`,
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const buyerId = req.user._id;
      
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      
      const order = await orderService.cancelOrder(id, buyerId, io, onlineUsers);
      
      res.status(200).json({
        status: 'success',
        message: 'Order cancelled successfully',
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
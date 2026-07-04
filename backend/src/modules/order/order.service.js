const Order = require('./order.model');
const Listing = require('../listing/listing.model');
const { AppError } = require('../../middleware/error.middleware');

class OrderService {
  // Create new order
  async createOrder(buyerId, orderData, io = null, onlineUsers = null) {
    const { items, deliveryAddress, paymentMethod, specialInstructions } = orderData;
    
    if (!items || items.length === 0) {
      throw new AppError('No items in order', 400);
    }
    
    let totalAmount = 0;
    const orderItems = [];
    let farmerId = null;
    
    // Process each item
    for (const item of items) {
      const listing = await Listing.findById(item.listingId);
      
      if (!listing) {
        throw new AppError(`Listing ${item.listingId} not found`, 404);
      }
      
      if (listing.status !== 'active') {
        throw new AppError(`${listing.produceName} is no longer available`, 400);
      }
      
      if (listing.quantity < item.quantity) {
        throw new AppError(`Only ${listing.quantity} ${listing.unit} of ${listing.produceName} available`, 400);
      }
      
      farmerId = listing.farmerId;
      
      const subtotal = listing.currentPrice * item.quantity;
      totalAmount += subtotal;
      
      orderItems.push({
        listingId: listing._id,
        produceName: listing.produceName,
        quantity: item.quantity,
        unit: listing.unit,
        priceAtPurchase: listing.currentPrice,
        subtotal: subtotal
      });
      
      listing.quantity -= item.quantity;
      if (listing.quantity === 0) {
        listing.status = 'sold_out';
      }
      await listing.save();
    }
    
    const deliveryFee = totalAmount > 500 ? 0 : 40;
    const grandTotal = totalAmount + deliveryFee;
    
    const order = new Order({
      buyerId,
      farmerId,
      items: orderItems,
      totalAmount,
      deliveryFee,
      grandTotal,
      deliveryAddress,
      paymentMethod,
      specialInstructions: specialInstructions || '',
      orderStatus: 'pending',
      paymentStatus: 'pending',
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed successfully'
      }]
    });
    
    await order.save();
    
    // Populate order with user details
    await order.populate('buyerId', 'name phone');
    await order.populate('farmerId', 'name phone');
    
    // Send real-time notification to farmer
    if (io && onlineUsers) {
      await this.notifyFarmerNewOrder(order, io, onlineUsers);
      await this.notifyBuyerOrderPlaced(order, io, onlineUsers);
    }
    
    return order;
  }
  
  // Notify farmer about new order
  async notifyFarmerNewOrder(order, io, onlineUsers) {
    const farmerSocketId = onlineUsers.get(order.farmerId._id.toString());
    if (farmerSocketId) {
      io.to(farmerSocketId).emit('new-order', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        buyerName: order.buyerId.name,
        totalAmount: order.grandTotal,
        items: order.items,
        message: `🛒 New order #${order.orderNumber} from ${order.buyerId.name}!`,
        timestamp: new Date()
      });
      console.log(`🔔 New order notification sent to farmer: ${order.farmerId.name}`);
    }
  }
  
  // Notify buyer that order is placed
  async notifyBuyerOrderPlaced(order, io, onlineUsers) {
    const buyerSocketId = onlineUsers.get(order.buyerId._id.toString());
    if (buyerSocketId) {
      io.to(buyerSocketId).emit('order-placed', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        message: `✅ Order #${order.orderNumber} placed successfully!`,
        timestamp: new Date()
      });
    }
  }
  
  // Get orders for a buyer
  async getBuyerOrders(buyerId, status = null) {
    const query = { buyerId };
    if (status) {
      query.orderStatus = status;
    }
    
    const orders = await Order.find(query)
      .populate('farmerId', 'name phone')
      .sort({ createdAt: -1 });
    
    return orders;
  }
  
  // Get orders for a farmer
  async getFarmerOrders(farmerId, status = null) {
    const query = { farmerId };
    if (status) {
      query.orderStatus = status;
    }
    
    const orders = await Order.find(query)
      .populate('buyerId', 'name phone address')
      .sort({ createdAt: -1 });
    
    return orders;
  }
  
  // Get single order
  async getOrderById(orderId, userId, userRole) {
    const order = await Order.findById(orderId)
      .populate('buyerId', 'name phone email address')
      .populate('farmerId', 'name phone email');
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    if (order.buyerId._id.toString() !== userId && 
        order.farmerId._id.toString() !== userId && 
        userRole !== 'admin') {
      throw new AppError('You do not have permission to view this order', 403);
    }
    
    return order;
  }
  
  // Update order status with notifications
  // Update order status (Farmer or Admin)
async updateOrderStatus(orderId, userId, userRole, newStatus, note = '', io = null, onlineUsers = null) {
  const order = await Order.findById(orderId)
    .populate('buyerId', 'name phone')
    .populate('farmerId', 'name phone');
  
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  
  console.log('Order farmerId:', order.farmerId._id.toString());
  console.log('Current userId:', userId.toString());
  console.log('User role:', userRole);
  
  // Check permission - Convert both to strings for comparison
  if (order.farmerId._id.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('Only the farmer or admin can update order status', 403);
  }
  
  // Define valid status transitions
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready_for_pickup'],
    'ready_for_pickup': ['out_for_delivery'],
    'out_for_delivery': ['delivered']
  };
  
  if (!validTransitions[order.orderStatus]?.includes(newStatus)) {
    throw new AppError(`Cannot change status from ${order.orderStatus} to ${newStatus}`, 400);
  }
  
  order.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Order status changed to ${newStatus}`
  });
  order.orderStatus = newStatus;
  
  await order.save();
  
  // Send notifications
  if (io && onlineUsers) {
    await this.notifyStatusUpdate(order, newStatus, io, onlineUsers);
  }
  
  return order;
}
  
  // Notify about status update
  async notifyStatusUpdate(order, newStatus, io, onlineUsers) {
    const statusMessages = {
      'confirmed': '✅ Your order has been confirmed by the farmer!',
      'preparing': '👨‍🌾 Farmer is preparing your order!',
      'ready_for_pickup': '📦 Your order is ready for pickup!',
      'out_for_delivery': '🚚 Your order is out for delivery!',
      'delivered': '🎉 Your order has been delivered! Enjoy your fresh produce!',
      'cancelled': '❌ Your order has been cancelled.'
    };
    
    // Notify buyer
    const buyerSocketId = onlineUsers.get(order.buyerId._id.toString());
    if (buyerSocketId) {
      io.to(buyerSocketId).emit('order-status-updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: newStatus,
        message: statusMessages[newStatus] || `Order status updated to ${newStatus}`,
        timestamp: new Date()
      });
    }
    
    // Notify farmer
    const farmerSocketId = onlineUsers.get(order.farmerId._id.toString());
    if (farmerSocketId) {
      io.to(farmerSocketId).emit('farmer-order-updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: newStatus,
        message: `Order #${order.orderNumber} status changed to ${newStatus}`,
        timestamp: new Date()
      });
    }
  }
  
  // Cancel order (Buyer)
  async cancelOrder(orderId, buyerId, io = null, onlineUsers = null) {
    const order = await Order.findOne({ _id: orderId, buyerId })
      .populate('buyerId', 'name phone')
      .populate('farmerId', 'name phone');
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    if (order.orderStatus !== 'pending' && order.orderStatus !== 'confirmed') {
      throw new AppError(`Cannot cancel order in ${order.orderStatus} status`, 400);
    }
    
    // Restore listing quantities
    for (const item of order.items) {
      const listing = await Listing.findById(item.listingId);
      if (listing) {
        listing.quantity += item.quantity;
        if (listing.status === 'sold_out' && listing.quantity > 0) {
          listing.status = 'active';
        }
        await listing.save();
      }
    }
    
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Order cancelled by buyer'
    });
    order.orderStatus = 'cancelled';
    await order.save();
    
    // Notify farmer about cancellation
    if (io && onlineUsers) {
      const farmerSocketId = onlineUsers.get(order.farmerId._id.toString());
      if (farmerSocketId) {
        io.to(farmerSocketId).emit('order-cancelled', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          buyerName: order.buyerId.name,
          message: `❌ Order #${order.orderNumber} has been cancelled by ${order.buyerId.name}`,
          timestamp: new Date()
        });
      }
    }
    
    return order;
  }
  
  // Add rating to order
  async addRating(orderId, buyerId, ratingData) {
    const order = await Order.findOne({ _id: orderId, buyerId });
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    if (order.orderStatus !== 'delivered') {
      throw new AppError('Can only rate delivered orders', 400);
    }
    
    if (order.rating && order.rating.score) {
      throw new AppError('Order already rated', 400);
    }
    
    order.rating = {
      score: ratingData.score,
      review: ratingData.review,
      reviewedAt: new Date()
    };
    
    await order.save();
    
    return order;
  }
}

module.exports = new OrderService();
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { formatPrice, formatDate } from '../utils/format';
import { 
  FaShoppingCart, FaBox, FaClock, FaRupeeSign, FaTrash, 
  FaCheckCircle, FaSignOutAlt, FaLeaf, FaEye, FaPlus, FaMinus,
  FaSyncAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import NotificationBell from '../components/common/NotificationBell';

const BuyerDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [checkoutData, setCheckoutData] = useState({
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      phone: user?.phone || ''
    },
    paymentMethod: 'cash'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      navigate('/dashboard');
      return;
    }
    fetchOrders();
    loadCart();
  }, [user]);

  useEffect(() => {
    const shouldOpenCart = sessionStorage.getItem('openCart');
    if (shouldOpenCart === 'true') {
      setShowCart(true);
      sessionStorage.removeItem('openCart');
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadCart();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Socket.io connection
  useEffect(() => {
    if (token && user) {
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });
      
      newSocket.on('connect', () => {
        console.log('Buyer socket connected');
        newSocket.emit('authenticate', user._id);
      });
      
      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
      });
      
      newSocket.on('order-status-updated', (data) => {
        console.log('Order status update:', data);
        toast.success(data.message);
        setNotifications(prev => [{
          id: Date.now(),
          message: data.message,
          time: new Date().toLocaleTimeString(),
          read: false,
          orderId: data.orderId
        }, ...prev]);
        fetchOrders();
      });
      
      newSocket.on('order-placed', (data) => {
        toast.success(data.message);
      });
      
      setSocket(newSocket);
      
      return () => {
        if (newSocket) {
          newSocket.close();
        }
      };
    }
  }, [token, user]);

  const clearNotification = (id) => {
    if (id === 'all') {
      setNotifications([]);
    } else {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
    toast.success('Orders refreshed');
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (listingId) => {
    const newCart = cart.filter(item => item.listingId !== listingId);
    saveCart(newCart);
    toast.success('Item removed from cart');
  };

  const updateQuantity = (listingId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(listingId);
      return;
    }
    const newCart = cart.map(item =>
      item.listingId === listingId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!checkoutData.deliveryAddress.street || !checkoutData.deliveryAddress.city || !checkoutData.deliveryAddress.pincode) {
      toast.error('Please fill complete delivery address');
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          listingId: item.listingId,
          quantity: item.quantity
        })),
        deliveryAddress: checkoutData.deliveryAddress,
        paymentMethod: checkoutData.paymentMethod
      };

      await axios.post('/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Order placed successfully!');
      localStorage.removeItem('cart');
      setCart([]);
      setShowCart(false);
      fetchOrders();
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await axios.put(`/orders/${orderId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Order cancelled successfully');
        fetchOrders();
      } catch (error) {
        toast.error('Failed to cancel order');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length,
    deliveredOrders: orders.filter(o => o.orderStatus === 'delivered').length,
    totalSpent: orders.filter(o => o.orderStatus === 'delivered').reduce((sum, o) => sum + (o.grandTotal || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaLeaf className="text-2xl" />
              <div>
                <h1 className="text-xl font-bold">Buyer Dashboard</h1>
                <p className="text-xs opacity-90">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition flex items-center gap-2"
              >
                <FaShoppingCart />
                Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </button>
              <button 
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition"
              >
                <FaSyncAlt className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <NotificationBell notifications={notifications} onClear={clearNotification} />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="bg-blue-500 text-white p-2 rounded-lg inline-block mb-2">
              <FaBox />
            </div>
            <h3 className="text-gray-500 text-xs">Total Orders</h3>
            <p className="text-lg font-bold">{stats.totalOrders}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="bg-yellow-500 text-white p-2 rounded-lg inline-block mb-2">
              <FaClock />
            </div>
            <h3 className="text-gray-500 text-xs">Pending Orders</h3>
            <p className="text-lg font-bold">{stats.pendingOrders}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="bg-green-500 text-white p-2 rounded-lg inline-block mb-2">
              <FaCheckCircle />
            </div>
            <h3 className="text-gray-500 text-xs">Delivered Orders</h3>
            <p className="text-lg font-bold">{stats.deliveredOrders}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="bg-purple-500 text-white p-2 rounded-lg inline-block mb-2">
              <FaRupeeSign />
            </div>
            <h3 className="text-gray-500 text-xs">Total Spent</h3>
            <p className="text-lg font-bold">{formatPrice(stats.totalSpent)}</p>
          </div>
        </div>

        {/* Browse Products Button */}
        <div className="mb-6">
          <Link to="/listings" className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg inline-flex items-center gap-2 transition text-sm">
            <FaEye /> Browse Fresh Produce
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h2 className="text-lg font-bold">My Orders ({orders.length})</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <FaLeaf className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <Link to="/listings" className="btn-primary mt-4 inline-block text-sm">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            {item.quantity} {item.unit} × {item.produceName}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3 font-semibold text-sm">
                        {formatPrice(order.grandTotal)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${
                          order.orderStatus === 'delivered' ? 'badge-success' :
                          order.orderStatus === 'cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {order.orderStatus?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(order.orderStatus === 'pending' || order.orderStatus === 'confirmed') && (
                          <button
                            onClick={() => cancelOrder(order._id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Cancel
                          </button>
                        )}
                        {order.orderStatus === 'out_for_delivery' && (
                          <div className="flex items-center gap-2">
                            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">On the way!</span>
                          </div>
                        )}
                        {order.orderStatus === 'delivered' && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <FaCheckCircle size={10} /> Delivered
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="px-5 py-3 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FaShoppingCart /> Your Cart ({cart.length} items)
              </h2>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Your cart is empty</p>
                  <Link to="/listings" className="btn-primary mt-4 inline-block text-sm" onClick={() => setShowCart(false)}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.listingId} className="flex justify-between items-center border-b pb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.produceName}</h3>
                        <p className="text-xs text-gray-500">{formatPrice(item.price)} per {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                            className="w-7 h-7 bg-gray-100 rounded-full hover:bg-gray-200 flex items-center justify-center"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                            className="w-7 h-7 bg-gray-100 rounded-full hover:bg-gray-200 flex items-center justify-center"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                        <div className="font-semibold w-20 text-right text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.listingId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold text-base">
                      <span>Subtotal:</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm mt-1">
                      <span>Delivery Fee:</span>
                      <span>{formatPrice(getCartTotal() > 500 ? 0 : 40)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-primary-600">{formatPrice(getCartTotal() + (getCartTotal() > 500 ? 0 : 40))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t p-5 space-y-3 sticky bottom-0 bg-white">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Delivery Address</h3>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={checkoutData.deliveryAddress.street}
                    onChange={(e) => setCheckoutData({
                      ...checkoutData,
                      deliveryAddress: { ...checkoutData.deliveryAddress, street: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={checkoutData.deliveryAddress.city}
                      onChange={(e) => setCheckoutData({
                        ...checkoutData,
                        deliveryAddress: { ...checkoutData.deliveryAddress, city: e.target.value }
                      })}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={checkoutData.deliveryAddress.pincode}
                      onChange={(e) => setCheckoutData({
                        ...checkoutData,
                        deliveryAddress: { ...checkoutData.deliveryAddress, pincode: e.target.value }
                      })}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm mb-2">Payment Method</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="cash"
                        checked={checkoutData.paymentMethod === 'cash'}
                        onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})}
                      />
                      Cash on Delivery
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="upi"
                        checked={checkoutData.paymentMethod === 'upi'}
                        onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})}
                      />
                      UPI / Card
                    </label>
                  </div>
                </div>
                
                <button onClick={handleCheckout} className="btn-primary w-full text-sm py-2">
                  Place Order • {formatPrice(getCartTotal() + (getCartTotal() > 500 ? 0 : 40))}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { formatPrice, formatDate } from '../utils/format';
import { PRODUCE_TYPES, UNITS, getFreshnessCategory } from '../utils/constants';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaChartLine, FaBox, 
  FaShoppingCart, FaMoneyBillWave, FaSignOutAlt, FaTractor,
  FaCheck, FaTimes, FaSpinner, FaLeaf, FaSyncAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import NotificationBell from '../components/common/NotificationBell';

const FarmerDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [formData, setFormData] = useState({
    produceType: 'vegetables',
    produceName: '',
    quantity: '',
    unit: 'kg',
    basePrice: '',
    harvestDateTime: new Date().toISOString().slice(0, 16),
    organic: false,
    description: ''
  });
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'farmer') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  // Socket.io connection for real-time notifications
  useEffect(() => {
    if (token && user) {
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });
      
      newSocket.on('connect', () => {
        console.log('Farmer socket connected');
        newSocket.emit('authenticate', user._id);
      });
      
      newSocket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
      });
      
      newSocket.on('new-order', (data) => {
        console.log('New order received:', data);
        toast.success(`🛒 ${data.message}`, {
          duration: 5000,
          position: 'top-right',
        });
        setNotifications(prev => [{
          id: Date.now(),
          message: data.message,
          time: new Date().toLocaleTimeString(),
          read: false,
          orderId: data.orderId
        }, ...prev]);
        fetchData();
      });
      
      newSocket.on('farmer-order-updated', (data) => {
        console.log('Order status update:', data);
        toast.info(data.message);
        fetchData();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching farmer data...');
      
      const [listingsRes, ordersRes] = await Promise.all([
        axios.get('/listings/my-listings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/orders/farmer/orders', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      console.log('Listings response:', listingsRes.data);
      console.log('Orders response:', ordersRes.data);
      
      const listingsData = listingsRes.data.data.listings || [];
      const ordersData = ordersRes.data.data.orders || [];
      
      setListings(listingsData);
      setOrders(ordersData);
      
      const activeListings = listingsData.filter(l => l.status === 'active');
      const deliveredOrders = ordersData.filter(o => o.orderStatus === 'delivered');
      const pendingOrders = ordersData.filter(o => 
        o.orderStatus === 'pending' || o.orderStatus === 'confirmed'
      );
      const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
      
      setStats({
        totalListings: listingsData.length,
        activeListings: activeListings.length,
        totalOrders: ordersData.length,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders.length
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingListing) {
        await axios.put(`/listings/${editingListing._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post('/listings', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product added successfully');
      }
      setShowAddModal(false);
      setEditingListing(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const resetForm = () => {
    setFormData({
      produceType: 'vegetables',
      produceName: '',
      quantity: '',
      unit: 'kg',
      basePrice: '',
      harvestDateTime: new Date().toISOString().slice(0, 16),
      organic: false,
      description: ''
    });
  };

  const handleDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/listings/${listingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setFormData({
      produceType: listing.produceType,
      produceName: listing.produceName,
      quantity: listing.quantity,
      unit: listing.unit,
      basePrice: listing.basePrice,
      harvestDateTime: listing.harvestDateTime.slice(0, 16),
      organic: listing.organic,
      description: listing.description || ''
    });
    setShowAddModal(true);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/orders/${orderId}/status`, 
        { status, note: `Order ${status} by farmer` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order ${status} successfully`);
      fetchData();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Listings', value: stats.totalListings, icon: <FaBox />, color: 'bg-blue-500' },
    { title: 'Active Listings', value: stats.activeListings, icon: <FaEye />, color: 'bg-green-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <FaShoppingCart />, color: 'bg-purple-500' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: <FaSpinner />, color: 'bg-orange-500' },
    { title: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: <FaMoneyBillWave />, color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaTractor className="text-2xl" />
              <div>
                <h1 className="text-xl font-bold">Farmer Dashboard</h1>
                <p className="text-xs opacity-90">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-3">
              <div className={`${stat.color} text-white p-2 rounded-lg inline-block mb-2`}>
                {stat.icon}
              </div>
              <h3 className="text-gray-500 text-xs">{stat.title}</h3>
              <p className="text-lg font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Add Product Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingListing(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <FaPlus /> Add New Product
          </button>
        </div>

        {/* Orders Received Section */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaShoppingCart className="text-primary-500" />
              Orders Received ({orders.length})
            </h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <FaShoppingCart className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <p className="text-xs text-gray-400 mt-1">When customers place orders, they will appear here</p>
              <button 
                onClick={refreshData}
                className="mt-4 text-primary-500 text-sm hover:underline flex items-center gap-1 mx-auto"
              >
                <FaSyncAlt /> Refresh
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
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
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm">{order.buyerId?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{order.buyerId?.phone || 'No phone'}</div>
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
                        {order.orderStatus === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateOrderStatus(order._id, 'confirmed')}
                              className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 flex items-center gap-1"
                            >
                              <FaCheck size={10} /> Accept
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order._id, 'cancelled')}
                              className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 flex items-center gap-1"
                            >
                              <FaTimes size={10} /> Reject
                            </button>
                          </div>
                        )}
                        {order.orderStatus === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'preparing')}
                            className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.orderStatus === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'ready_for_pickup')}
                            className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs hover:bg-purple-200"
                          >
                            Ready for Pickup
                          </button>
                        )}
                        {order.orderStatus === 'ready_for_pickup' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'out_for_delivery')}
                            className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-xs hover:bg-indigo-200"
                          >
                            Out for Delivery
                          </button>
                        )}
                        {order.orderStatus === 'out_for_delivery' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                            className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {order.orderStatus === 'delivered' && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <FaCheck size={10} /> Completed
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

        {/* My Products Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h2 className="text-lg font-bold">My Products ({listings.length})</h2>
          </div>
          
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <FaLeaf className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products listed yet</p>
              <button
                onClick={() => {
                  setEditingListing(null);
                  resetForm();
                  setShowAddModal(true);
                }}
                className="btn-primary mt-4 inline-block text-sm"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Freshness</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listings.map((listing) => {
                    const freshness = getFreshnessCategory(listing.freshnessScore);
                    return (
                      <tr key={listing._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{listing.produceName}</div>
                          <div className="text-xs text-gray-500 capitalize">{listing.produceType}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-primary-600 text-sm">{formatPrice(listing.currentPrice)}</div>
                          {listing.discountApplied > 0 && (
                            <div className="text-xs text-green-600">-{listing.discountApplied}% off</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {listing.quantity} {listing.unit}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs ${freshness.color}`}>
                            {freshness.label} ({Math.round(listing.freshnessScore)}%)
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs ${
                            listing.status === 'active' ? 'badge-success' :
                            listing.status === 'sold_out' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {listing.status === 'active' ? 'Active' : listing.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(listing)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(listing._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-5 py-3 border-b">
              <h2 className="text-lg font-bold">{editingListing ? 'Edit Product' : 'Add New Product'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Product Type *</label>
                <select
                  value={formData.produceType}
                  onChange={(e) => setFormData({...formData, produceType: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {PRODUCE_TYPES.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  value={formData.produceName}
                  onChange={(e) => setFormData({...formData, produceName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Spinach, Tomatoes, Cow Milk"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Base Price (₹ per {formData.unit}) *</label>
                <input
                  type="number"
                  step="1"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="40"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Harvest Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.harvestDateTime}
                  onChange={(e) => setFormData({...formData, harvestDateTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.organic}
                    onChange={(e) => setFormData({...formData, organic: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Organic Certified</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="2"
                  placeholder="Describe your product..."
                />
              </div>
              
              <div className="flex gap-3 pt-3">
                <button type="submit" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition text-sm">
                  {editingListing ? 'Update' : 'Add'} Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingListing(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { 
  FaUsers, FaBox, FaShoppingCart, FaMoneyBillWave, 
  FaCheckCircle, FaTimesCircle, FaEye, FaTrash,
  FaChartLine, FaTractor, FaUserCheck
} from 'react-icons/fa';
import { formatPrice } from '../utils/format';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all users
      const usersRes = await axios.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data.data.users);

      // Fetch all listings
      const listingsRes = await axios.get('/admin/listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentListings(listingsRes.data.data.listings.slice(0, 10));

      // Fetch all orders
      const ordersRes = await axios.get('/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentOrders(ordersRes.data.data.orders.slice(0, 10));

      // Calculate stats
      const farmers = usersRes.data.data.users.filter(u => u.role === 'farmer');
      const buyers = usersRes.data.data.users.filter(u => u.role === 'buyer');
      const activeListings = listingsRes.data.data.listings.filter(l => l.status === 'active');
      const orders = ordersRes.data.data.orders;
      const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered');
      const pendingOrders = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed');
      
      const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.grandTotal, 0);

      setStats({
        totalUsers: usersRes.data.data.users.length,
        totalFarmers: farmers.length,
        totalBuyers: buyers.length,
        totalListings: activeListings.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders.length,
        deliveredOrders: deliveredOrders.length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      await axios.put(`/admin/users/${userId}/status`, 
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User ${isActive ? 'deactivated' : 'activated'} successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const deleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(`/admin/listings/${listingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Listing deleted successfully');
        fetchDashboardData();
      } catch (error) {
        toast.error('Failed to delete listing');
      }
    }
  };

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: <FaUsers />, color: 'bg-blue-500' },
    { title: 'Farmers', value: stats.totalFarmers, icon: <FaTractor />, color: 'bg-green-500' },
    { title: 'Buyers', value: stats.totalBuyers, icon: <FaUserCheck />, color: 'bg-purple-500' },
    { title: 'Active Listings', value: stats.totalListings, icon: <FaBox />, color: 'bg-yellow-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <FaShoppingCart />, color: 'bg-indigo-500' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: <FaTimesCircle />, color: 'bg-orange-500' },
    { title: 'Delivered Orders', value: stats.deliveredOrders, icon: <FaCheckCircle />, color: 'bg-green-600' },
    { title: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: <FaMoneyBillWave />, color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-lg opacity-90 mt-1">Manage users, listings, and orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="container-custom">
          <div className="flex space-x-8">
            {['overview', 'users', 'listings', 'orders'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {activeTab === 'overview' && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} text-white p-3 rounded-full`}>
                      {stat.icon}
                    </div>
                    <FaChartLine className="text-gray-300 text-2xl" />
                  </div>
                  <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-semibold">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{formatPrice(order.grandTotal)}</p>
                      </div>
                      <span className={`badge ${
                        order.orderStatus === 'delivered' ? 'badge-success' :
                        order.orderStatus === 'cancelled' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Listings */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Recent Listings</h2>
                <div className="space-y-3">
                  {recentListings.map((listing) => (
                    <div key={listing._id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-semibold">{listing.produceName}</p>
                        <p className="text-sm text-gray-500">{formatPrice(listing.currentPrice)}</p>
                      </div>
                      <span className={`badge ${
                        listing.status === 'active' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          user.role === 'admin' ? 'badge-danger' :
                          user.role === 'farmer' ? 'badge-info' : 'badge-success'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => updateUserStatus(user._id, user.isActive)}
                          className={`px-3 py-1 rounded text-sm ${
                            user.isActive 
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentListings.map((listing) => (
                    <tr key={listing._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{listing.produceName}</div>
                        <div className="text-sm text-gray-500 capitalize">{listing.produceType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {listing.farmerId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-primary-600">{formatPrice(listing.currentPrice)}</div>
                        {listing.discountApplied > 0 && (
                          <div className="text-xs text-gray-400">-{listing.discountApplied}%</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {listing.quantity} {listing.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          listing.status === 'active' ? 'badge-success' :
                          listing.status === 'sold_out' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => deleteListing(listing._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {order.buyerId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {order.farmerId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold">
                        {formatPrice(order.grandTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${
                          order.orderStatus === 'delivered' ? 'badge-success' :
                          order.orderStatus === 'cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { formatPrice, formatTimeAgo } from '../utils/format';
import { getFreshnessCategory } from '../utils/constants';
import { FaLeaf, FaClock, FaMapMarkerAlt, FaFilter, FaTimes, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Listings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [addedItems, setAddedItems] = useState({});
  const [filters, setFilters] = useState({
    produceType: '',
    organic: false,
    minFreshness: 0,
    maxPrice: 1000
  });

  useEffect(() => {
    fetchListings();
    syncCartCount();
    
    window.addEventListener('storage', syncCartCount);
    return () => window.removeEventListener('storage', syncCartCount);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, listings]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/v1/listings/active');
      setListings(response.data.data.listings || []);
      setFilteredListings(response.data.data.listings || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const syncCartCount = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      const cart = savedCart ? JSON.parse(savedCart) : [];
      const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  const addToCart = (listing) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    try {
      const savedCart = localStorage.getItem('cart');
      let cart = savedCart ? JSON.parse(savedCart) : [];

      const existingItem = cart.find(item => item.listingId === listing._id);

      if (existingItem) {
        if (existingItem.quantity >= listing.quantity) {
          toast.error(`Only ${listing.quantity} ${listing.unit} available!`);
          return;
        }
        existingItem.quantity += 1;
      } else {
        cart.push({
          listingId: listing._id,
          produceName: listing.produceName,
          produceType: listing.produceType,
          price: listing.currentPrice,
          basePrice: listing.basePrice,
          discountApplied: listing.discountApplied || 0,
          quantity: 1,
          maxQuantity: listing.quantity,
          unit: listing.unit,
          farmerId: listing.farmerId?._id || listing.farmerId,
          farmerName: listing.farmerId?.name || 'Local Farmer',
          image: listing.images?.[0] || null,
          organic: listing.organic || false,
          harvestDateTime: listing.harvestDateTime,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      syncCartCount();

      setAddedItems(prev => ({ ...prev, [listing._id]: true }));
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [listing._id]: false }));
      }, 1500);

      toast.success(`${listing.produceName} added to cart!`);
    } catch (error) {
      console.error('Cart error:', error);
      toast.error('Could not add to cart. Please try again.');
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    if (filters.produceType) {
      filtered = filtered.filter(l => l.produceType === filters.produceType);
    }

    if (filters.organic) {
      filtered = filtered.filter(l => l.organic === true);
    }

    filtered = filtered.filter(l => l.freshnessScore >= filters.minFreshness);
    filtered = filtered.filter(l => l.currentPrice <= filters.maxPrice);

    setFilteredListings(filtered);
  };

  const clearFilters = () => {
    setFilters({
      produceType: '',
      organic: false,
      minFreshness: 0,
      maxPrice: 1000
    });
  };

  const goToCart = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to view cart');
      navigate('/login');
    } else {
      navigate('/buyer/dashboard');
      sessionStorage.setItem('openCart', 'true');
    }
  };

  const produceTypes = [
    { value: '', label: 'All Types' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'grains', label: 'Grains' }
  ];

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fresh produce...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-12">
          <div className="container-custom flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Fresh Produce Available</h1>
              <p className="text-lg opacity-90">
                Directly from local farms, harvested within 24 hours
              </p>
            </div>

            <button
              onClick={goToCart}
              className="relative flex items-center gap-2 bg-white text-primary-600 px-5 py-2.5 rounded-full font-semibold shadow hover:shadow-md transition"
            >
              <FaShoppingCart className="text-lg" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="container-custom py-12">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">{filteredListings.length}</span> products found
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <FaFilter />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 mb-8"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Filter Products</h3>
                  <button onClick={clearFilters} className="text-gray-500 hover:text-primary-500">
                    <FaTimes />
                  </button>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Produce Type</label>
                    <select
                      value={filters.produceType}
                      onChange={(e) => setFilters({ ...filters, produceType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {produceTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Organic</label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.organic}
                        onChange={(e) => setFilters({ ...filters, organic: e.target.checked })}
                        className="mr-2 w-4 h-4"
                      />
                      <span>Only Organic</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Min Freshness: <span className="text-primary-600">{filters.minFreshness}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minFreshness}
                      onChange={(e) => setFilters({ ...filters, minFreshness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Price (₹)</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="0"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products match your filters</p>
              <button onClick={clearFilters} className="btn-primary mt-4 inline-block">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing, index) => {
                const freshness = getFreshnessCategory(listing.freshnessScore);
                const isAdded = addedItems[listing._id];

                return (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative">
                      <img
                        src={listing.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop'}
                        alt={listing.produceName}
                        className="w-full h-48 object-cover"
                      />
                      {listing.discountApplied > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                          {listing.discountApplied}% OFF
                        </div>
                      )}
                      {listing.organic && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                          <FaLeaf className="text-xs" /> Organic
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{listing.produceName}</h3>
                          <p className="text-gray-500 text-sm capitalize">{listing.produceType}</p>
                        </div>
                        <div className={`badge ${freshness.color}`}>
                          {freshness.label}
                        </div>
                      </div>

                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <FaClock className="mr-1" />
                        <span>Harvested {formatTimeAgo(listing.harvestDateTime)}</span>
                      </div>

                      {listing.farmerId?.name && (
                        <div className="flex items-center text-gray-400 text-xs mb-2">
                          <FaMapMarkerAlt className="mr-1" />
                          <span>{listing.farmerId.name}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-3">
                        <div>
                          <span className="text-2xl font-bold text-primary-600">
                            {formatPrice(listing.currentPrice)}
                          </span>
                          {listing.discountApplied > 0 && (
                            <span className="text-sm text-gray-400 line-through ml-2">
                              {formatPrice(listing.basePrice)}
                            </span>
                          )}
                          <p className="text-xs text-gray-500">per {listing.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{listing.quantity} {listing.unit} left</p>
                          <div className="w-20 h-1 bg-gray-200 rounded-full mt-1">
                            <div
                              className="h-full bg-primary-500 rounded-full transition-all"
                              style={{ width: `${Math.min((listing.quantity / (listing.quantity + 10)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(listing)}
                        disabled={listing.quantity === 0}
                        className={`w-full mt-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300
                          ${listing.quantity === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : isAdded
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-primary-500 text-white hover:bg-primary-600'
                          }`}
                      >
                        {listing.quantity === 0 ? (
                          'Out of Stock'
                        ) : isAdded ? (
                          <>
                            <FaCheck className="text-xs" />
                            Added to Cart!
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="text-xs" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Listings;
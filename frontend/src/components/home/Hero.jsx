import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLeaf, FaClock, FaTruck, FaStar } from 'react-icons/fa';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center pt-20 bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <FaLeaf className="text-primary-500 text-3xl" />
              <span className="text-primary-600 font-semibold">Farm Fresh Since 2024</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Fresh from the
              <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent"> Farm</span>
              <br />
              to Your Table
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Get the freshest produce directly from local farmers. Harvested within 24 hours,
              priced by freshness, delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary flex items-center justify-center gap-2 group">
                Start Shopping
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/listings" className="btn-secondary text-center">
                Browse Produce
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-gray-500 text-sm">Local Farmers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">24h</div>
                <div className="text-gray-500 text-sm">Max Harvest Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">10k+</div>
                <div className="text-gray-500 text-sm">Happy Customers</div>
              </div>
            </div>
          </motion.div>

          {/* Right Image with Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=600&fit=crop" 
                alt="Fresh Vegetables"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            
            {/* Floating Cards */}
            <motion.div 
              className="absolute -top-10 -left-10 bg-white rounded-lg shadow-xl p-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">Harvested 2h ago</span>
              </div>
              <div className="text-xs text-gray-500">Freshness Score: 96%</div>
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-5 -right-5 bg-white rounded-lg shadow-xl p-4"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
            >
              <div className="text-2xl font-bold text-primary-600">-20%</div>
              <div className="text-xs text-gray-500">Evening Deal</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
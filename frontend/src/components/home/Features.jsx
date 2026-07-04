import { motion } from 'framer-motion';
import { FaClock, FaLeaf, FaTruck, FaStar, FaShieldAlt, FaChartLine } from 'react-icons/fa';

const features = [
  {
    icon: <FaClock className="text-4xl text-primary-500" />,
    title: "Freshness Guaranteed",
    description: "Produce harvested within 24 hours of delivery. Real-time freshness tracking with timestamp.",
    color: "bg-green-50"
  },
  {
    icon: <FaChartLine className="text-4xl text-primary-500" />,
    title: "Dynamic Pricing",
    description: "Prices drop every 6 hours. The fresher you buy, the more you save! Up to 50% off.",
    color: "bg-blue-50"
  },
  {
    icon: <FaLeaf className="text-4xl text-primary-500" />,
    title: "Support Local Farmers",
    description: "95% of your payment goes directly to farmers. No middlemen, fair prices for everyone.",
    color: "bg-yellow-50"
  },
  {
    icon: <FaTruck className="text-4xl text-primary-500" />,
    title: "Fast Delivery",
    description: "Same-day delivery in your area. Real-time tracking from farm to your doorstep.",
    color: "bg-purple-50"
  },
  {
    icon: <FaShieldAlt className="text-4xl text-primary-500" />,
    title: "Quality Checked",
    description: "Every product is quality checked before dispatch. 100% satisfaction guaranteed.",
    color: "bg-red-50"
  },
  {
    icon: <FaStar className="text-4xl text-primary-500" />,
    title: "Farmer Rated",
    description: "Transparent ratings from real customers. Know exactly who grows your food.",
    color: "bg-indigo-50"
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Why Choose Farm2Table?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're revolutionizing the way you buy fresh produce with transparency, fairness, and quality.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card p-6 text-center group hover:transform hover:-translate-y-2 transition-all duration-300"
            >
              <div className={`${feature.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
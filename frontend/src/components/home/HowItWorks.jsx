import { motion } from 'framer-motion';
import { FaUserPlus, FaSearch, FaShoppingCart, FaTruck, FaStar } from 'react-icons/fa';

const steps = [
  {
    icon: <FaUserPlus className="text-4xl" />,
    title: "Create Account",
    description: "Sign up as a buyer or farmer in minutes",
    color: "bg-primary-500"
  },
  {
    icon: <FaSearch className="text-4xl" />,
    title: "Browse & Select",
    description: "See harvest time and real-time prices",
    color: "bg-primary-500"
  },
  {
    icon: <FaShoppingCart className="text-4xl" />,
    title: "Order & Pay",
    description: "Choose delivery or pickup option",
    color: "bg-primary-500"
  },
  {
    icon: <FaTruck className="text-4xl" />,
    title: "Fast Delivery",
    description: "Get fresh produce within hours",
    color: "bg-primary-500"
  },
  {
    icon: <FaStar className="text-4xl" />,
    title: "Enjoy & Rate",
    description: "Share your experience",
    color: "bg-primary-500"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Getting fresh farm produce is just 5 simple steps away
          </p>
        </div>
        
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/3 left-0 right-0 h-0.5 bg-primary-200 -z-10"></div>
          
          <div className="grid lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10 border-4 border-primary-500">
                  <div className="text-primary-500">{step.icon}</div>
                </div>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -mt-2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold z-20">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
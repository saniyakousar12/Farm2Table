import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaArrowRight } from 'react-icons/fa';

const CTASection = () => {
  return (
    <section className="py-20 bg-primary-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-white"
        >
          <FaLeaf className="text-6xl mx-auto mb-6 animate-bounce-slow" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Taste the Difference?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of happy customers who trust Farm2Table for their daily fresh produce.
            Fresh, transparent, and fair - that's our promise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2">
              Get Started Free
              <FaArrowRight />
            </Link>
            <Link to="/listings" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2">
              Browse Produce
              <FaArrowRight />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
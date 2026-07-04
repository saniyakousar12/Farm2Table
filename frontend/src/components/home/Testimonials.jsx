import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Regular Customer",
    content: "The freshness is unbelievable! I can actually see when my vegetables were harvested. This transparency is amazing. The prices are fair and the quality is consistently excellent.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    location: "Mumbai"
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Local Farmer",
    content: "Farm2Table helped me get fair prices for my produce. No more middlemen taking huge cuts! I can now focus on farming while they handle sales and delivery.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    location: "Pune"
  },
  {
    id: 3,
    name: "Anita Desai",
    role: "Restaurant Owner",
    content: "Finally a reliable source for fresh vegetables. The 24-hour harvest guarantee makes all the difference for our restaurant. Our customers love the freshness!",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    location: "Delhi"
  },
  {
    id: 4,
    name: "Vikram Singh",
    role: "Health Coach",
    content: "I recommend Farm2Table to all my clients. The transparency in pricing and harvest time helps people make informed choices about their food.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    location: "Bangalore"
  }
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent((current + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Farm2Table for their daily fresh produce
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
            >
              <FaQuoteLeft className="text-primary-500 text-4xl mb-6 opacity-50" />
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                "{testimonials[current].content}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonials[current].image} 
                    alt={testimonials[current].name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{testimonials[current].name}</h3>
                    <p className="text-gray-500 text-sm">{testimonials[current].role}</p>
                    <p className="text-gray-400 text-xs">{testimonials[current].location}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(testimonials[current].rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation Buttons */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
          >
            <FaChevronLeft className="text-primary-500" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
          >
            <FaChevronRight className="text-primary-500" />
          </button>
        </div>
        
        {/* Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                current === index ? 'w-8 bg-primary-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
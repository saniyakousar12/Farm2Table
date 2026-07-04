import { Link } from 'react-router-dom';
import { FaLeaf, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FaLeaf className="text-primary-400 text-2xl" />
              <span className="text-xl font-bold">Farm2Table</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fresh produce directly from local farmers to your table. Supporting sustainable agriculture and local communities.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/listings" className="hover:text-primary-400 transition">Browse Produce</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary-400 transition">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-primary-400 transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition">Contact</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/faq" className="hover:text-primary-400 transition">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-primary-400 transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400 transition">Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-primary-400 transition">Shipping Info</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Contact Us</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-3">
                <FaEnvelope />
                <span className="text-sm">support@farm2table.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt />
                <span className="text-sm">Mumbai, India</span>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition text-xl">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition text-xl">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition text-xl">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition text-xl">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; 2024 Farm2Table. All rights reserved. Fresh from the farm to your table.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
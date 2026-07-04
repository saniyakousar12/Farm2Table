import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaLeaf, FaUser, FaShoppingBag, FaTractor, FaBars, FaTimes, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: null },
    { path: '/about', label: 'About', icon: <FaInfoCircle className="mr-1" /> },
    { path: '/listings', label: 'Browse Produce', icon: null },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'farmer') return '/farmer/dashboard';
    if (user.role === 'buyer') return '/buyer/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/dashboard';
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <FaLeaf className="text-primary-500 text-3xl group-hover:rotate-12 transition-transform" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Farm2Table
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center text-gray-700 hover:text-primary-500 transition-colors ${
                  location.pathname === link.path ? 'text-primary-500 font-semibold' : ''
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 transition-colors"
                >
                  {user.role === 'farmer' ? <FaTractor /> : <FaShoppingBag />}
                  <span>Dashboard</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-primary-100 px-4 py-2 rounded-full">
                    <FaUser className="text-primary-600" />
                    <span className="text-primary-700 font-semibold">{user.name.split(' ')[0]}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-500 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:block lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white rounded-lg shadow-lg mt-4 p-6">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center text-gray-700 hover:text-primary-500"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary-500">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary text-center">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary-500">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary text-center">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
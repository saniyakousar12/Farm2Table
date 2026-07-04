import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FaLeaf, FaTractor, FaUsers, FaGlobe, FaHeart, FaStar } from 'react-icons/fa';

const About = () => {
  const values = [
    {
      icon: <FaLeaf className="text-4xl text-primary-500" />,
      title: "Freshness First",
      description: "We guarantee that all produce is harvested within 24 hours of delivery."
    },
    {
      icon: <FaTractor className="text-4xl text-primary-500" />,
      title: "Support Farmers",
      description: "95% of your payment goes directly to local farmers."
    },
    {
      icon: <FaUsers className="text-4xl text-primary-500" />,
      title: "Community First",
      description: "Building strong local food systems and communities."
    },
    {
      icon: <FaGlobe className="text-4xl text-primary-500" />,
      title: "Sustainable",
      description: "Reducing food waste with dynamic pricing and local delivery."
    }
  ];

  const team = [
    {
      name: "Ramesh Kumar",
      role: "Founder & CEO",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      bio: "Former farmer turned entrepreneur"
    },
    {
      name: "Priya Sharma",
      role: "Head of Operations",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      bio: "Supply chain expert"
    },
    {
      name: "Amit Patel",
      role: "Tech Lead",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      bio: "Full-stack developer"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20 mt-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4">About Farm2Table</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Bridging the gap between local farmers and urban consumers
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container-custom py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            To create a transparent, fair, and sustainable food system where farmers get fair prices 
            and consumers get the freshest produce directly from local farms.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {values.map((value, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4 text-center">Our Story</h2>
          <div className="space-y-4 text-gray-600 max-w-3xl mx-auto">
            <p>
              Farm2Table was born from a simple observation: farmers were throwing away perfectly good 
              produce because they couldn't get it to market fast enough, while city dwellers were 
              paying high prices for "fresh" produce that was often days old.
            </p>
            <p>
              In 2024, we set out to change that. Our platform connects local farmers directly with 
              consumers, eliminating middlemen and ensuring transparency in pricing and freshness.
            </p>
            <p>
              Today, we've partnered with over 500 local farmers and served more than 10,000 happy 
              customers. But we're just getting started.
            </p>
          </div>
        </div>

        {/* Team */}
        <h2 className="text-3xl font-bold mb-8 text-center">Meet Our Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden text-center">
              <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full mx-auto mt-6 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-primary-600 mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-primary-600 text-white rounded-lg p-8 mt-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">500+</div>
              <div className="text-sm opacity-90">Local Farmers</div>
            </div>
            <div>
              <div className="text-4xl font-bold">10,000+</div>
              <div className="text-sm opacity-90">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50,000+</div>
              <div className="text-sm opacity-90">kg Food Saved</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
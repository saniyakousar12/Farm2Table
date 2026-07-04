import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === 'farmer') {
    return <Navigate to="/farmer/dashboard" />;
  } else {
    return <Navigate to="/buyer/dashboard" />;
  }
};

export default Dashboard;
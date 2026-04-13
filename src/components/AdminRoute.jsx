import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from '../Context/UserContext';
import { checkAdminAccess } from '../utils/adminAuth';

const AdminRoute = ({ children }) => {
  const { userDetails } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = checkAdminAccess(userDetails);
  
  useEffect(() => {
    // Give time for userDetails to load
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!userDetails) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
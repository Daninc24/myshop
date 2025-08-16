import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SuperAdminRoute = ({ children }) => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only admin role has access
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SuperAdminRoute;

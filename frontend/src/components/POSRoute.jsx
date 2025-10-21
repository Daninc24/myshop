import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const POSRoute = ({ children }) => {
  const { user, isAuthenticated, isAdmin, isShopkeeper, isWarehouseManager, loading } = useAuth();

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

  // Check if user has POS access (admin, shopkeeper, warehouse manager, store manager, manager, staff, cashier)
  const allowedRoles = ['admin', 'shopkeeper', 'warehouse_manager', 'store_manager', 'manager', 'staff', 'cashier', 'employee'];
  const hasPOSAccess = user && allowedRoles.includes(user.role);
  
  if (!hasPOSAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the POS system.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Current role: {user?.role || 'None'}<br/>
            Required roles: Admin, Shopkeeper, Manager, Staff, or Cashier
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default POSRoute;

import React from 'react';

// Lazy load all major page components for better performance
const Home = React.lazy(() => import('../pages/Home'));
const Products = React.lazy(() => import('../pages/Products'));
const ProductDetail = React.lazy(() => import('../pages/ProductDetail'));
const Cart = React.lazy(() => import('../pages/Cart'));
const Checkout = React.lazy(() => import('../pages/Checkout'));
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const Profile = React.lazy(() => import('../pages/Profile'));
const AdminDashboard = React.lazy(() => import('../pages/AdminDashboard'));
const AdminProducts = React.lazy(() => import('../pages/AdminProducts'));
const AdminOrders = React.lazy(() => import('../pages/AdminOrders'));
const AdminUsers = React.lazy(() => import('../pages/AdminUsers'));
const AdminCategories = React.lazy(() => import('../pages/AdminCategories'));
const AdminSalesReport = React.lazy(() => import('../pages/AdminSalesReport'));
const AdminAdverts = React.lazy(() => import('../pages/AdminAdverts'));
const AdminEvents = React.lazy(() => import('../pages/AdminEvents'));
const AdminPaymentSettings = React.lazy(() => import('../pages/AdminPaymentSettings'));
const AdminInventoryLogs = React.lazy(() => import('../pages/AdminInventoryLogs'));
const AdminPerformanceDashboard = React.lazy(() => import('../pages/AdminPerformanceDashboard'));
const FAQ = React.lazy(() => import('../pages/FAQ'));
const Contact = React.lazy(() => import('../pages/Contact'));
const About = React.lazy(() => import('../pages/About'));
const Messages = React.lazy(() => import('../pages/Messages'));
const POS = React.lazy(() => import('../pages/POS'));
const Events = React.lazy(() => import('../pages/Events'));
const Wishlist = React.lazy(() => import('../pages/Wishlist'));

// Higher-order component for consistent Suspense fallback
export const withSuspense = (Component) => {
  return (props) => (
    <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <Component {...props} />
    </React.Suspense>
  );
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be accessed soon
  const criticalComponents = [Home, Products, Cart, Login];
  criticalComponents.forEach(component => {
    if (component.preload) {
      component.preload();
    }
  });
};

export {
  Home,
  Products,
  ProductDetail,
  Cart,
  Checkout,
  Login,
  Register,
  Profile,
  AdminDashboard,
  AdminProducts,
  AdminOrders,
  AdminUsers,
  AdminCategories,
  AdminSalesReport,
  AdminAdverts,
  AdminEvents,
  AdminPaymentSettings,
  AdminInventoryLogs,
  AdminPerformanceDashboard,
  FAQ,
  Contact,
  About,
  Messages,
  POS,
  Events,
  Wishlist
};

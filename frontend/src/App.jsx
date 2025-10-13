import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import POSRoute from './components/POSRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import GoogleAnalytics from './components/GoogleAnalytics';
import PerformanceOptimizer from './components/PerformanceOptimizer';

// Lazy-loaded components
import {
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
} from './components/LazyComponents';

// Import CSS
import './index.css';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-20 pb-16 md:pb-0">
        {children}
      </main>
      {!isAuthPage && <Footer />}
      <MobileBottomNav />
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      {/* Google Analytics */}
      <GoogleAnalytics />
      
      {/* Performance Optimizer */}
      <PerformanceOptimizer />
      
      <AppLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/events" element={<Events />} />

                      {/* Protected Routes */}
                      <Route path="/checkout" element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/messages" element={
                        <ProtectedRoute>
                          <Messages />
                        </ProtectedRoute>
                      } />
                      <Route path="/pos" element={
                        <POSRoute>
                          <POS />
                        </POSRoute>
                      } />

                      {/* Admin Routes */}
                      <Route path="/admin" element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      } />
                      <Route path="/admin/products" element={
                        <AdminRoute>
                          <AdminProducts />
                        </AdminRoute>
                      } />
                      <Route path="/admin/orders" element={
                        <AdminRoute>
                          <AdminOrders />
                        </AdminRoute>
                      } />
                      <Route path="/admin/users" element={
                        <SuperAdminRoute>
                          <AdminUsers />
                        </SuperAdminRoute>
                      } />
                      <Route path="/admin/categories" element={
                        <AdminRoute>
                          <AdminCategories />
                        </AdminRoute>
                      } />
                      <Route path="/admin/sales" element={
                        <AdminRoute>
                          <AdminSalesReport />
                        </AdminRoute>
                      } />
                      <Route path="/admin/adverts" element={
                        <AdminRoute>
                          <AdminAdverts />
                        </AdminRoute>
                      } />
                      <Route path="/admin/events" element={
                        <AdminRoute>
                          <AdminEvents />
                        </AdminRoute>
                      } />
                      <Route path="/admin/payment-settings" element={
                        <SuperAdminRoute>
                          <AdminPaymentSettings />
                        </SuperAdminRoute>
                      } />
                      <Route path="/admin/inventory-logs" element={
                        <AdminRoute>
                          <AdminInventoryLogs />
                        </AdminRoute>
                      } />
                      <Route path="/admin/performance" element={
                        <AdminRoute>
                          <AdminPerformanceDashboard />
                        </AdminRoute>
                      } />

                      {/* 404 Route */}
                      <Route path="*" element={
                        <div className="flex items-center justify-center min-h-screen">
                          <div className="text-center">
                            <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
                            <p className="text-xl text-text-secondary mb-8">Page not found</p>
                            <a href="/" className="btn-primary">
                              Go Home
                            </a>
                          </div>
                        </div>
                                            } />
            </Routes>
          </Suspense>
        </AppLayout>
      </ErrorBoundary>
  );
};

export default App;

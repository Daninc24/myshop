import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { recordPageView } from './utils/pageViewTracker';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
const Messages = lazy(() => import('./pages/Messages'));
const AdminPaymentSettings = lazy(() => import('./pages/AdminPaymentSettings'));
import Footer from './components/Footer';
const Events = lazy(() => import('./pages/Events'));
const AdminEvents = lazy(() => import('./pages/AdminEvents'));
const POS = lazy(() => import('./pages/POS'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminSalesReport = lazy(() => import('./pages/AdminSalesReport'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminInventoryLogs = lazy(() => import('./pages/AdminInventoryLogs'));
const AdminPerformanceDashboard = lazy(() => import('./pages/AdminPerformanceDashboard'));
const AdminAdverts = lazy(() => import('./pages/AdminAdverts'));
import SEO from './components/SEO';
import FAQ from './pages/FAQ';

function App() {
  const location = useLocation();

  useEffect(() => {
    recordPageView(location.pathname);
  }, [location.pathname]);

  return (
    <ErrorBoundary>

        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen bg-gray-50">
                <ErrorBoundary>
  <Navbar />
</ErrorBoundary>
                <main className="container mx-auto px-4 py-8">
                  <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading…</div>}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={
                      <>
                        <SEO title="My Shop - Home" description="Welcome to My Shop, your one-stop shop for all your needs." name="My Shop" type="website" />
                        <Home />
                      </>
                    } />
                    <Route path="/products" element={
                      <>
                        <SEO title="My Shop - Products" description="Browse our wide range of products at My Shop." name="My Shop" type="website" />
                        <Products />
                      </>
                    } />
                    <Route path="/category/:categoryId" element={
                      <>
                        <SEO title="My Shop - Products" description="Browse our wide range of products at My Shop." name="My Shop" type="website" />
                        <Products />
                      </>
                    } />
                    <Route path="/category/:categoryId/:subcategoryId" element={
                      <>
                        <SEO title="My Shop - Products" description="Browse our wide range of products at My Shop." name="My Shop" type="website" />
                        <Products />
                      </>
                    } />
                    <Route path="/products/:id" element={
                      <>
                        <SEO title="My Shop - Product Detail" description="View details of a product at My Shop." name="My Shop" type="website" />
                        <ProductDetail />
                      </>
                    } />
                    <Route path="/login" element={
                      <>
                        <SEO title="My Shop - Login" description="Log in to your My Shop account." name="My Shop" type="website" />
                        <Login />
                      </>
                    } />
                    <Route path="/register" element={
                      <>
                        <SEO title="My Shop - Register" description="Create a new account at My Shop." name="My Shop" type="website" />
                        <Register />
                      </>
                    } />
                    
                    {/* Protected Routes */}
                    <Route path="/cart" element={
                      <ProtectedRoute>
                        <SEO title="My Shop - Cart" description="Review your shopping cart at My Shop." name="My Shop" type="website" />
                        <Cart />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <SEO title="My Shop - Checkout" description="Complete your purchase at My Shop." name="My Shop" type="website" />
                        <Checkout />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <SEO title="My Shop - Profile" description="Manage your My Shop profile." name="My Shop" type="website" />
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/pos" element={
                      <ProtectedRoute requiredRole={["admin", "employee", "shopkeeper", "delivery", "moderator", "store_manager", "warehouse_manager", "manager"]}>
                        <SEO title="My Shop - POS" description="Point of Sale system for My Shop." name="My Shop" type="website" />
                        <POS />
                      </ProtectedRoute>
                    } />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Dashboard" description="Admin dashboard for My Shop." name="My Shop" type="website" />
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/admin/products" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Products" description="Manage products in My Shop." name="My Shop" type="website" />
                        <AdminProducts />
                      </AdminRoute>
                    } />
                    <Route path="/admin/categories" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Categories" description="Manage categories and subcategories in My Shop." name="My Shop" type="website" />
                        <AdminCategories />
                      </AdminRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Orders" description="Manage orders in My Shop." name="My Shop" type="website" />
                        <AdminOrders />
                      </AdminRoute>
                    } />
                    <Route path="/admin/payment-settings" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Payment Settings" description="Manage payment settings for My Shop." name="My Shop" type="website" />
                        <AdminPaymentSettings />
                      </AdminRoute>
                    } />
                    <Route path="/admin/events" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Events" description="Manage events in My Shop." name="My Shop" type="website" />
                        <AdminEvents />
                      </AdminRoute>
                    } />
                    <Route path="/admin/users" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Users" description="Manage users in My Shop." name="My Shop" type="website" />
                        <AdminUsers />
                      </AdminRoute>
                    } />
                    <Route path="/admin/sales-report" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Sales Report" description="View sales reports for My Shop." name="My Shop" type="website" />
                        <AdminSalesReport />
                      </AdminRoute>
                    } />
                    <Route path="/admin/inventory-logs" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Inventory Logs" description="View inventory logs for My Shop." name="My Shop" type="website" />
                        <AdminInventoryLogs />
                      </AdminRoute>
                    } />
                    <Route path="/admin/performance-dashboard" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Performance Dashboard" description="View performance metrics for My Shop." name="My Shop" type="website" />
                        <AdminPerformanceDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/admin/adverts" element={
                      <AdminRoute>
                        <SEO title="My Shop - Admin Adverts" description="Manage advertisements for My Shop." name="My Shop" type="website" />
                        <AdminAdverts />
                      </AdminRoute>
                    } />
                    <Route path="/messages" element={
                      <>
                        <SEO title="My Shop - Messages" description="View your messages at My Shop." name="My Shop" type="website" />
                        <Messages />
                      </>
                    } />
                    <Route path="/events" element={
                      <>
                        <SEO title="My Shop - Events" description="Browse upcoming events at My Shop." name="My Shop" type="website" />
                        <Events />
                      </>
                    } />
                  </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>

    </ErrorBoundary>
  );
}

export default App;

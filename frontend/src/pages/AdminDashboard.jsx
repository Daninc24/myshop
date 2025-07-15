import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  PresentationChartBarIcon,
  MegaphoneIcon,
  BoxIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { saveAs } from 'file-saver';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    topProducts: [],
    monthlyRevenue: [],
    orderStatusCounts: {},
    usersByMonth: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const { user } = useAuth();
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (tab === 'dashboard') fetchAnalytics();
    if (tab === 'users') fetchUsers();
    // Re-fetch analytics when timeRange changes
  }, [tab, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/analytics?timeRange=${timeRange}`);
      const monthlyRevenue = (res.data.salesByMonth || []).map(item => ({
        month: item._id,
        revenue: item.total || 0
      }));
      setStats({
        ...stats,
        totalOrders: res.data.totalOrders,
        totalProducts: res.data.totalProducts,
        totalUsers: res.data.totalUsers,
        totalRevenue: res.data.totalSales,
        monthlyRevenue,
        usersByMonth: res.data.usersByMonth
      });
    } catch (error) {
      // Use toast error handler
      if (typeof error === 'function') error('Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/users');
      setUsers(res.data.users);
    } catch (error) {
      error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyRevenue = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 10000) + 1000
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === 'up' ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}% from last month
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-100 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const filteredOrders = (stats.recentOrders || []).filter(order =>
    (currencyFilter === 'ALL' || order.currency === currencyFilter) &&
    (statusFilter === 'ALL' || order.status === statusFilter)
  );

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Total (Local)', 'Currency', 'Total (USD)', 'Status'];
    const rows = filteredOrders.map(order => [
      order._id,
      new Date(order.createdAt).toLocaleDateString(),
      order.userId?.name || '',
      order.localAmount || order.totalAmount,
      order.currency || 'USD',
      order.usdAmount || order.totalAmount,
      order.status
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `orders_${Date.now()}.csv`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-10 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-secondary mb-8">Admin Dashboard</h1>
        {/* Admin Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
          <Link to="/pos" className="card flex flex-col items-center gap-2 p-4 hover:shadow-strong transition">
            <BuildingStorefrontIcon className="h-8 w-8 text-primary mb-1" />
            <span className="font-medium text-secondary text-sm">POS</span>
          </Link>
          <Link to="/admin/products" className="card flex flex-col items-center gap-2 p-4 hover:shadow-strong transition">
            <BoxIcon className="h-8 w-8 text-primary mb-1" />
            <span className="font-medium text-secondary text-sm">Products</span>
          </Link>
          <Link to="/admin/orders" className="card flex flex-col items-center gap-2 p-4 hover:shadow-strong transition">
            <ClipboardDocumentListIcon className="h-8 w-8 text-primary mb-1" />
            <span className="font-medium text-secondary text-sm">Orders</span>
          </Link>
          <Link to="/admin/users" className="card flex flex-col items-center gap-2 p-4 hover:shadow-strong transition">
            <UserIcon className="h-8 w-8 text-primary mb-1" />
            <span className="font-medium text-secondary text-sm">Users</span>
          </Link>
          <Link to="/admin/payment-settings" className="card flex flex-col items-center gap-2 p-4 hover:shadow-strong transition">
            <CreditCardIcon className="h-8 w-8 text-primary mb-1" />
            <span className="font-medium text-secondary text-sm">Payment Settings</span>
          </Link>
          <Link to="/admin/events" className="card flex flex-col items-center gap-2 p-4 hover:shadow-strong transition">
            <MegaphoneIcon className="h-8 w-8 text-primary mb-1" />
            <span className="font-medium text-secondary text-sm">Events</span>
          </Link>
          <Link to="/admin/sales-report" className="card flex flex-col items-center gap-2 p-4 hover:shadow-strong transition">
            <DocumentChartBarIcon className="h-8 w-8 text-primary mb-1" />
            <span className="font-medium text-secondary text-sm">Sales Report</span>
          </Link>
          <Link to="/admin/inventory-logs" className="card flex flex-col items-center gap-2 p-4 hover:shadow-strong transition">
            <ExclamationTriangleIcon className="h-8 w-8 text-primary mb-1" />
            <span className="font-medium text-secondary text-sm">Inventory Logs</span>
          </Link>
          <Link to="/admin/performance-dashboard" className="card flex flex-col items-center gap-2 p-4 hover:shadow-strong transition">
            <PresentationChartBarIcon className="h-8 w-8 text-primary mb-1" />
            <span className="font-medium text-secondary text-sm">Performance</span>
          </Link>
          <Link to="/admin/adverts" className="card flex flex-col items-center gap-2 p-4 hover:shadow-strong transition">
            <MegaphoneIcon className="h-8 w-8 text-primary mb-1" />
            <span className="font-medium text-secondary text-sm">Adverts</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Stats Cards */}
          <div className="card flex flex-col items-center gap-2">
            <ShoppingCartIcon className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-heading font-bold text-secondary">{stats.totalOrders}</span>
            <span className="text-gray-500">Orders</span>
          </div>
          <div className="card flex flex-col items-center gap-2">
            <UserIcon className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-heading font-bold text-secondary">{stats.totalUsers}</span>
            <span className="text-gray-500">Users</span>
          </div>
          <div className="card flex flex-col items-center gap-2">
            <CurrencyDollarIcon className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-heading font-bold text-secondary">${stats.totalRevenue.toLocaleString()}</span>
            <span className="text-gray-500">Revenue</span>
          </div>
        </div>
        {/* Charts and Recent Activity */}
        <div className="card mb-8">
          <h2 className="text-xl font-heading font-bold text-secondary mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#ff6600" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="text-xl font-heading font-bold text-secondary mb-4">Recent Orders</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500">No recent orders.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map(order => (
                <div key={order._id} className="bg-primary-light/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 shadow-soft">
                  <div className="font-mono text-primary font-bold">#{order._id.slice(-6)}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-secondary">{order.userId?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-secondary">{order.items.length} item(s)</div>
                  <div className="text-sm font-semibold text-primary">{order.localAmount && order.currency && order.currency !== 'USD' ? `${order.localAmount} ${order.currency}` : `$${order.usdAmount || order.totalAmount}`}</div>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(order.status)}`}>{order.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 
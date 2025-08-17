import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb, Dropdown, Avatar, Button, Space } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: '/admin', label: 'Dashboard', path: '/admin', icon: '📊' },
  { key: '/admin/products', label: 'Products', path: '/admin/products', icon: '📦' },
  { key: '/admin/categories', label: 'Categories', path: '/admin/categories', icon: '🏷️' },
  { key: '/admin/orders', label: 'Orders', path: '/admin/orders', icon: '📋' },
  { key: '/admin/users', label: 'Users', path: '/admin/users', icon: '👥' },
  { key: '/admin/payment-settings', label: 'Payment Settings', path: '/admin/payment-settings', icon: '💳' },
  { key: '/admin/events', label: 'Events', path: '/admin/events', icon: '🎉' },
  { key: '/admin/sales-report', label: 'Sales Report', path: '/admin/sales-report', icon: '📈' },
  { key: '/admin/inventory-logs', label: 'Inventory Logs', path: '/admin/inventory-logs', icon: '📝' },
  { key: '/admin/performance-dashboard', label: 'Performance', path: '/admin/performance-dashboard', icon: '⚡' },
  { key: '/admin/adverts', label: 'Adverts', path: '/admin/adverts', icon: '📢' },
];

function AdminLayout({ children, breadcrumb = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { success } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedKey = menuItems.find((i) => location.pathname.startsWith(i.key))?.key || '/admin';

  const handleLogout = async () => {
    try {
      await logout();
      success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <Link to="/profile" className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          Profile
        </Link>
      ),
    },
    {
      key: 'settings',
      label: (
        <Link to="/admin/settings" className="flex items-center gap-2">
          <Cog6ToothIcon className="w-4 h-4" />
          Settings
        </Link>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 w-full text-left text-red-600 hover:text-red-700"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Logout
        </button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Header */}
      <Header style={{ 
        background: '#fff', 
        borderBottom: '1px solid #eee',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}>
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
            
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="font-bold text-xl text-gray-900 hidden sm:block">Admin Panel</h1>
            </Link>
          </div>

          {/* Right side - User Menu and Notifications */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 rounded-md hover:bg-gray-100 relative">
              <BellIcon className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <button className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
                <Avatar 
                  size={32}
                  src={user?.profileImage}
                  className="bg-orange-500"
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.name || 'Admin User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.role || 'Administrator'}
                  </div>
                </div>
              </button>
            </Dropdown>
          </div>
        </div>
      </Header>

      <Layout>
        {/* Sidebar */}
        <Sider 
          width={220} 
          style={{ 
            background: '#fff', 
            borderRight: '1px solid #f0f0f0',
            position: 'fixed',
            left: 0,
            top: 64,
            bottom: 0,
            zIndex: 20,
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out'
          }}
          className="lg:relative lg:translate-x-0"
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ 
              height: '100%', 
              borderRight: 0,
              paddingTop: '16px'
            }}
            items={menuItems.map((item) => ({
              key: item.key,
              label: (
                <Link 
                  to={item.path} 
                  className="flex items-center gap-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ),
            }))}
          />
        </Sider>

        {/* Main Content */}
        <Layout style={{ 
          marginLeft: collapsed ? 80 : 220,
          transition: 'margin-left 0.2s'
        }} className="lg:ml-0">
          <Content style={{ 
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            minHeight: 'calc(100vh - 112px)'
          }}>
            {/* Breadcrumb */}
            {breadcrumb.length > 0 && (
              <Breadcrumb style={{ margin: '0 0 24px 0' }}>
                {breadcrumb.map((bc, index) => (
                  <Breadcrumb.Item key={index}>{bc}</Breadcrumb.Item>
                ))}
              </Breadcrumb>
            )}
            
            {/* Page Content */}
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;


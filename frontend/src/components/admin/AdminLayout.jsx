import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const menuItems = [
  { key: '/admin', label: 'Dashboard', path: '/admin' },
  { key: '/admin/products', label: 'Products', path: '/admin/products' },
  { key: '/admin/categories', label: 'Categories', path: '/admin/categories' },
  { key: '/admin/orders', label: 'Orders', path: '/admin/orders' },
  { key: '/admin/users', label: 'Users', path: '/admin/users' },
  { key: '/admin/payment-settings', label: 'Payment Settings', path: '/admin/payment-settings' },
  { key: '/admin/events', label: 'Events', path: '/admin/events' },
  { key: '/admin/sales-report', label: 'Sales Report', path: '/admin/sales-report' },
  { key: '/admin/inventory-logs', label: 'Inventory Logs', path: '/admin/inventory-logs' },
  { key: '/admin/performance-dashboard', label: 'Performance', path: '/admin/performance-dashboard' },
  { key: '/admin/adverts', label: 'Adverts', path: '/admin/adverts' },
];

function AdminLayout({ children, breadcrumb = [] }) {
  const location = useLocation();
  const selectedKey = menuItems.find((i) => location.pathname.startsWith(i.key))?.key || '/admin';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14">
            <h1 className="font-heading font-bold text-xl text-secondary">Admin</h1>
          </div>
        </div>
      </Header>
      <Layout>
        <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems.map((item) => ({
              key: item.key,
              label: <Link to={item.path}>{item.label}</Link>,
            }))}
          />
        </Sider>
        <Layout style={{ padding: '16px 24px' }}>
          {breadcrumb.length > 0 && (
            <Breadcrumb style={{ margin: '8px 0' }}>
              {breadcrumb.map((bc) => (
                <Breadcrumb.Item key={bc}>{bc}</Breadcrumb.Item>
              ))}
            </Breadcrumb>
          )}
          <Content style={{ margin: 0 }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;


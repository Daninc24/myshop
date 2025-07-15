import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders/all');
      setOrders(response.data || []);
    } catch (error) {
      showToast('Error fetching orders', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      showToast('Order status updated successfully', 'success');
      fetchOrders(); // Refresh the list
    } catch (error) {
      showToast('Error updating order status', 'error');
    }
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

  // Helper for currency formatting
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  };

  // Sales breakdown by currency
  const salesByCurrency = orders.reduce((acc, order) => {
    if (!order.currency) return acc;
    acc[order.currency] = (acc[order.currency] || 0) + (order.localAmount || order.totalAmount || 0);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card max-w-7xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading font-bold text-secondary">Order Management</h1>
        <div className="text-sm text-gray-600">
          Welcome, {user?.name}
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-secondary">All Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm rounded-2xl">
            <thead className="bg-primary-light text-primary-dark">
              <tr>
                <th className="p-3 font-semibold text-left">Order ID</th>
                <th className="font-semibold text-left">Customer</th>
                <th className="font-semibold text-left">Items</th>
                <th className="font-semibold text-left">Total</th>
                <th className="font-semibold text-left">Shipping Address</th>
                <th className="font-semibold text-left">Status</th>
                <th className="font-semibold text-left">Date</th>
                <th className="font-semibold text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface">
              {orders.map((order) => (
                <tr key={order._id} className="border-t border-gray-100 hover:bg-primary-light/30 transition-colors">
                  <td className="p-3 font-mono font-medium text-secondary">#{order._id.slice(-6)}</td>
                  <td className="p-3">{order.userId.name}</td>
                  <td className="p-3">{order.items.length} item(s)</td>
                  <td className="p-3">
                    {order.localAmount && order.currency && order.currency !== 'USD' ? (
                      <>
                        <span>{formatCurrency(order.localAmount, order.currency)} </span>
                        <span className="text-xs text-gray-500">/ {formatCurrency(order.usdAmount || order.totalAmount, 'USD')}</span>
                      </>
                    ) : (
                      <span>{formatCurrency(order.usdAmount || order.totalAmount, 'USD')}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {order.shippingAddress ? (
                      <div>
                        <div>{order.shippingAddress.street}</div>
                        <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                        <div>{order.shippingAddress.country}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No address</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(order.status)}`}>{order.status}</span>
                  </td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="input-field max-w-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        {Object.entries(salesByCurrency).map(([cur, amt]) => (
          <div key={cur} className="bg-primary-light text-primary-dark px-4 py-2 rounded-2xl shadow-soft text-sm font-semibold">
            {formatCurrency(amt, cur)} {cur}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders; 
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'shopkeeper', label: 'Shopkeeper' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'employee', label: 'Employee' },
  { value: 'store_manager', label: 'Store Manager' },
  { value: 'warehouse_manager', label: 'Warehouse Manager' },
  { value: 'manager', label: 'Manager' },
];

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    setError('');
    setSuccess('');
    try {
      await axios.put(`/users/${id}/role`, { role: newRole });
      setSuccess('Role updated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const handleSalaryChange = async (id, salary) => {
    if (isNaN(salary) || salary < 0) {
      setError('Invalid salary amount');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await axios.put(`/users/${id}/salary`, { salary: Number(salary) });
      setSuccess('Salary updated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to update salary');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/users/${id}`);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <div className="card max-w-6xl mx-auto mt-8">
      <h1 className="text-3xl font-heading font-bold mb-6 text-secondary">User Management</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-3 animate-slide-in">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 mb-3 animate-slide-in">{success}</div>}

      {loading ? (
        <div className="flex justify-center items-center py-8 text-secondary">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm rounded-2xl shadow-soft bg-surface">
            <thead>
              <tr className="bg-primary-light text-primary-dark">
                <th className="p-3 font-semibold text-left">Name</th>
                <th className="font-semibold text-left">Email</th>
                <th className="font-semibold text-left">Role</th>
                <th className="font-semibold text-left">Salary</th>
                <th className="font-semibold text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-gray-100 hover:bg-primary-light/30 transition-colors">
                  <td className="p-3">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="input-field max-w-xs"
                      disabled={u._id === user._id}
                    >
                      {roleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {(user.role === 'admin' ||
                      user.role === 'store_manager' ||
                      user.role === 'warehouse_manager') ? (
                      <input
                        type="number"
                        min="0"
                        value={u.salary || ''}
                        onChange={(e) => handleSalaryChange(u._id, e.target.value)}
                        className="input-field max-w-[6rem]"
                        disabled={u._id === user._id}
                      />
                    ) : (
                      <span>Ksh {u.salary || 0}</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-danger text-xs px-3 py-1"
                      onClick={() => handleDelete(u._id)}
                      disabled={u._id === user._id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

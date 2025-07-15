import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { io } from 'socket.io-client';
import { UserIcon } from '@heroicons/react/24/solid';


const Profile = () => {
  const { user, setUser } = useAuth();
  const { success, error } = useToast();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [editing, setEditing] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [imageFile, setImageFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) setProfile({ name: user.name, email: user.email });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (socketRef.current) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://myshop-hhfv.onrender.com', {
      withCredentials: true,
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });
    socket.emit('get_online_users');
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      axios.get('/orders/my').then(res => setOrders(res.data || []));
    }
  }, [user]);

  const handleProfileChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setProfileImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProfileSave = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = profileImage;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const res = await axios.post(`/users/${user.id}/profile-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = res.data.profileImage;
      }
      await axios.put(`/users/${user.id}`, { ...profile, profileImage: imageUrl });
      setUser({ ...user, ...profile, profileImage: imageUrl });
      success('Profile updated');
      setEditing(false);
    } catch (err) {
      err('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = e => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSave = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/users/${user.id}/password`, passwords);
      success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (error) {
      error('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Modernize profile container and sections */}
      <div className="max-w-3xl mx-auto py-10 animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-secondary mb-8">My Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Info */}
          <div className="card flex flex-col gap-6 items-center">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-32 h-32 object-cover rounded-full shadow-strong mb-4" />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center rounded-full shadow-strong mb-4 bg-gray-100">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="32" fill="#F3F4F6" />
                  <circle cx="32" cy="26" r="12" fill="#D1D5DB" />
                  <ellipse cx="32" cy="48" rx="16" ry="8" fill="#D1D5DB" />
                </svg>
              </div>
            )}
            <h2 className="text-xl font-heading font-bold text-secondary mb-1">{user?.name}</h2>
            <p className="text-gray-500 mb-1">{user?.email}</p>
            <span className="text-sm text-primary font-medium">{user?.role}</span>
          </div>
          {/* Edit Profile Form */}
          <form className="card flex flex-col gap-6">
            <h2 className="text-lg font-heading font-bold text-secondary mb-2">Edit Profile</h2>
            <input type="text" placeholder="Name" className="input-field" value={profile.name} onChange={handleProfileChange} />
            <input type="email" placeholder="Email" className="input-field" value={profile.email} onChange={handleProfileChange} />
            <input type="password" placeholder="New Password" className="input-field" value={passwords.newPassword} onChange={handlePasswordChange} />
            <button type="submit" className="btn-primary mt-2" onClick={handleProfileSave} disabled={loading}>Save Changes</button>
          </form>
        </div>
        {/* Order History */}
        <div className="card mt-10">
          <h2 className="text-xl font-heading font-bold text-secondary mb-4">Order History</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500">You have no orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-b-0 animate-fade-in">
                  <div>
                    <span className="font-medium text-secondary">Order #{order._id.slice(-6)}</span>
                    <span className="ml-4 text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-primary font-semibold">{formatCurrency(order.total, 'USD')}</span>
                    <span className="text-xs bg-primary-light text-primary px-3 py-1 rounded-xl">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { io } from 'socket.io-client';
import { UserIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

axios.defaults.withCredentials = true;

const isValidUserId = id => typeof id === 'string' && id.length > 0 && id !== 'undefined' && id !== 'null';

const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

const Messages = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [withUser, setWithUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messagedUsers, setMessagedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [adminId, setAdminId] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch users/conversations
  useEffect(() => {
    if (user?.role === 'admin') {
      axios.get('/users').then(res => {
        setUsers(res.data.users);
        axios.get(`/users/messages/all?ts=${Date.now()}`).then(msgRes => {
          const adminId = user.id?.toString();
          const messages = msgRes.data.messages;
          const uniqueUserIds = Array.from(new Set(
            messages
              .filter(m => m.sender === adminId || m.receiver === adminId)
              .map(m => m.sender === adminId ? m.receiver : m.sender)
          ));
          const filtered = res.data.users.filter(u => uniqueUserIds.includes(u._id));
          setMessagedUsers(filtered);
          if (filtered.length > 0) setWithUser(filtered[0]._id);
        });
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      axios.get('/users/admin-user')
        .then(res => {
          if (res.data.admin && res.data.admin._id) {
            setAdminId(res.data.admin._id);
            setWithUser(res.data.admin._id);
            setAdminError('');
          } else {
            setAdminId('');
            setWithUser('');
            setAdminError('No admin available for messaging.');
          }
        })
        .catch(() => {
          setAdminId('');
          setWithUser('');
          setAdminError('No admin available for messaging.');
        });
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin' && messagedUsers.length > 0 && !isValidUserId(withUser)) {
      setWithUser(messagedUsers[0]._id);
    }
  }, [messagedUsers, user, withUser]);

  const fetchMessages = () => {
    if (!isValidUserId(withUser)) {
      setMessages([]);
      return;
    }
    setLoading(true);
    axios.get(`/users/messages?with=${withUser}`)
      .then(res => setMessages(res.data.messages))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isValidUserId(withUser)) {
      setMessages([]);
      return;
    }
    fetchMessages();
  }, [withUser]);

  useEffect(() => {
    if (!isValidUserId(withUser)) return;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [withUser]);

  useEffect(() => {
    if (!user) return;
    if (socketRef.current) return;
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://myshop-hhfv.onrender.com', {
      withCredentials: true,
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.on('new_message', (msg) => {
      if (
        (msg.sender === user._id && msg.receiver === withUser) ||
        (msg.sender === withUser && msg.receiver === user._id)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });
    socket.on('typing', ({ from, to }) => {
      if (to === user._id && from === withUser) setOtherTyping(true);
    });
    socket.on('stop_typing', ({ from, to }) => {
      if (to === user._id && from === withUser) setOtherTyping(false);
    });
    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });
    socket.on('messages_read', ({ from, to }) => {
      if (from === withUser && to === user._id) {
        setMessages(prev =>
          prev.map(m =>
            m.sender === user._id && m.receiver === withUser ? { ...m, read: true } : m
          )
        );
      }
    });
    socket.emit('get_online_users');
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, withUser]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!socketRef.current || !withUser) return;
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', { to: withUser });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current.emit('stop_typing', { to: withUser });
    }, 1200);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      const receiver = withUser;
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('send_message', { receiver, content: message });
      }
      const res = await axios.post('/users/messages', { receiver, content: message });
      setMessages([...messages, res.data.data]);
      setMessage('');
      success('Message sent');
    } catch {
      error('Failed to send message');
    }
  };

  // Sidebar: conversations (admin: all users, user: just admin)
  const sidebarConversations = user?.role === 'admin' ? messagedUsers : users.filter(u => u._id === adminId);
  const currentContact = user?.role === 'admin'
    ? messagedUsers.find(u => u._id === withUser)
    : users.find(u => u._id === adminId);

  return (
    <div className="flex flex-col md:flex-row max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden min-h-[70vh] my-8 border border-orange-100">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-gradient-to-b from-orange-50 to-white border-r border-orange-100 p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <ChatBubbleLeftRightIcon className="h-7 w-7 text-orange-500" />
          <span className="font-bold text-lg text-orange-700">Conversations</span>
        </div>
        <ul className="space-y-2">
          {sidebarConversations && sidebarConversations.length > 0 ? (
            sidebarConversations.map(u => (
              <li key={u._id}>
                <button
                  onClick={() => setWithUser(u._id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors text-left
                    ${withUser === u._id ? 'bg-orange-100 text-orange-900 font-semibold' : 'hover:bg-orange-50 text-gray-700'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-lg shadow">
                    {u.avatar ? <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" /> : getInitials(u.name)}
                  </div>
                  <div className="flex-1">
                    <div className="truncate">{u.name}</div>
                    <div className="text-xs text-gray-400 truncate">{u.email}</div>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${onlineUsers.includes(u._id) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                </button>
              </li>
            ))
          ) : (
            <li className="text-gray-400 text-sm">No conversations yet.</li>
          )}
        </ul>
      </aside>
      {/* Main Chat Window */}
      <main className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center gap-4 border-b border-orange-100 px-6 py-4 bg-gradient-to-r from-orange-50 to-white">
          <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-xl shadow">
            {currentContact?.avatar ? <img src={currentContact.avatar} alt={currentContact.name} className="w-12 h-12 rounded-full object-cover" /> : getInitials(currentContact?.name)}
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg text-orange-900">{currentContact?.name || 'No Contact'}</div>
            <div className="text-xs text-gray-500">{currentContact?.email}</div>
          </div>
          <span className={`h-3 w-3 rounded-full ${onlineUsers.includes(withUser) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          <span className="text-xs text-gray-500 ml-2">{onlineUsers.includes(withUser) ? 'Online' : 'Offline'}</span>
        </div>
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-white" style={{ minHeight: 0 }}>
          {loading ? <div>Loading...</div> : (
            messages.length === 0 ? <div className="text-gray-400 text-center mt-12">No messages yet.</div> : (
              <div className="flex flex-col gap-2">
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender === user._id;
                  return (
                    <div key={msg._id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-4 py-2 rounded-2xl shadow max-w-xs md:max-w-md text-sm
                        ${isOwn
                          ? 'bg-orange-600 text-white rounded-br-none'
                          : 'bg-orange-100 text-orange-900 rounded-bl-none'}`}
                      >
                        <div>{msg.content}</div>
                        <div className="text-xs text-right text-orange-300 mt-1">
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {otherTyping && <div className="text-left text-xs text-orange-500 animate-pulse">Typing...</div>}
              </div>
            )
          )}
        </div>
        {/* Message Input */}
        <form onSubmit={handleSend} className="flex gap-2 border-t border-orange-100 px-6 py-4 bg-white">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            className="flex-1 border rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Type your message..."
            disabled={!isValidUserId(withUser) || !!adminError}
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-700 transition-colors"
            disabled={!isValidUserId(withUser) || !message.trim() || !!adminError}
          >
            Send
          </button>
        </form>
        {adminError && <div className="text-red-500 font-semibold text-center py-2">{adminError}</div>}
      </main>
    </div>
  );
};

export default Messages;

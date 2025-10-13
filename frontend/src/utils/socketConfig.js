// Socket.IO Configuration Utility
// Ensures proper URL handling for development and production

export const getSocketUrl = () => {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:5002';
  }
  
  // In production, use the API URL from environment
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (!apiUrl) {
    console.error('⚠️ VITE_API_URL is not set! Socket.IO connection may fail.');
    // Fallback to current origin
    return window.location.origin;
  }
  
  // Remove /api path from URL for Socket.IO connection
  return apiUrl.replace('/api', '');
};

export const getSocketOptions = () => {
  return {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  };
};

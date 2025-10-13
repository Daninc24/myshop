// API Configuration utility
export const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  let raw = import.meta.env.VITE_API_URL || 'https://myshop-hhfv.onrender.com';
  
  // If VITE_API_URL already includes /api, use it as is
  // If not, add /api to the base URL
  if (raw && !raw.includes('/api')) {
    raw = raw.replace(/\/+$/, '') + '/api';
  }
  
  return raw.replace(/\/+$/, ''); // remove trailing slashes
};

export const logApiConfig = () => {
  const baseUrl = getApiBaseUrl();
  if (import.meta.env.DEV) {
    console.log('Environment:', import.meta.env.MODE);
    console.log('API Base URL:', baseUrl);
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  }
  return baseUrl;
};

// Test API connectivity
export const testApiConnection = async () => {
  const baseUrl = getApiBaseUrl();
  try {
    // Try the main health endpoint first, fallback to categories if not available
    let response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok && response.status === 404) {
      // Health endpoint doesn't exist, try categories endpoint
      response = await fetch(`${baseUrl}/categories`, {
        method: 'GET',
        credentials: 'include'
      });
    }
    
    if (response.ok) {
      console.log('✅ API connection successful');
      return true;
    } else {
      console.warn('⚠️ API responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};
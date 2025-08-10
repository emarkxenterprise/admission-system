import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost/prtl/backend/public/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increase timeout to 15 seconds
  withCredentials: false, // Disable credentials for now
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // List of public endpoints that don't require authentication
    const publicEndpoints = ['/settings', '/test', '/payments/verify'];
    
    // Only add Authorization header for non-public endpoints
    if (!publicEndpoints.includes(config.url)) {
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Debug: Log the request data safely
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      isNetworkError: !error.response,
      isTimeout: error.code === 'ECONNABORTED'
    });
    
    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        console.error('API Request timed out');
      } else {
        console.error('Network error - server might be down');
      }
    }
    
    if (error.response?.status === 401) {
      // List of public endpoints that shouldn't trigger logout
      const publicEndpoints = ['/settings', '/test', '/payments/verify'];
      
      // Only logout if it's not a public endpoint
      if (!publicEndpoints.includes(error.config?.url)) {
        // Check which token was being used before removing them
        const hadAdminToken = !!localStorage.getItem('admin_token');
        
        // Remove both tokens on 401 error
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        
        // Redirect based on which token was being used
        if (hadAdminToken) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Send password reset link
export const sendResetLinkEmail = (email) =>
  api.post('/password/email', { email });

// Reset password
export const resetPassword = (data) =>
  api.post('/password/reset', data);

export default api; 
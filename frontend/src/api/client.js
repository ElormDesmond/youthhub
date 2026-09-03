// api/client.js
// API client for communicating with the backend

import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_URL || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : null) || '/api';

// Create axios instance
const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth (if needed in future)
instance.interceptors.request.use(
  config => {
    // Add auth token if available
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('authToken')
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
instance.interceptors.response.use(
  response => response,
  error => {
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        // Optional redirect logic
      }
    }
    
    return Promise.reject(new Error(error.response?.data?.error || error.message || 'API Request Failed'));
  }
);

// Export instance and helper methods
export const apiClient = {
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  patch: (url, data, config) => instance.patch(url, data, config),
  delete: (url, config) => instance.delete(url, config),
  // Helper for bulk operations
  request: (config) => instance(config),
};

export default instance;

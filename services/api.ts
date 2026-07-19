import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject auth token
api.interceptors.request.use(
  (config) => {
    // Zustand persist stores data in localStorage under 'auth-storage' key.
    // We can read it directly here to ensure the interceptor always has the latest token.
    try {
      const storageValue = localStorage.getItem('auth-storage');
      if (storageValue) {
        const { state } = JSON.parse(storageValue);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch (error) {
      console.error('Error reading auth token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 and we are not already on the login page, we can redirect or clear token
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        // We'll dispatch a global auth event or redirect to login here
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

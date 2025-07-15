// src/lib/api.ts
import axios from 'axios';

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Use an interceptor to add the auth token to every request
api.interceptors.request.use((config) => {
  // Make sure this code runs only in the browser
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// In dev, use proxy (relative /api) to avoid CORS; in prod use env var
const baseURL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add tenantId to URL for tenant-specific routes
  if (user?.tenantId && config.url && !config.url.startsWith('/auth')) {
    config.url = `/${user.tenantId}${config.url}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

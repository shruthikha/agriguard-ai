import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 90000  // 90s to handle ML inference latency
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agriguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on optional routes
      const isAuthRoute = error.config.url.includes('/auth/me');
      if (isAuthRoute) {
        localStorage.removeItem('agriguard_token');
        localStorage.removeItem('agriguard_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

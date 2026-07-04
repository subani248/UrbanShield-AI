import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),

  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const incidentAPI = {
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
  resolve: (id) => api.patch(`/incidents/${id}/resolve`),
  getStats: () => api.get('/incidents/stats'),
};

export const alertAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.put(`/alerts/${id}`, data),
  delete: (id) => api.delete(`/alerts/${id}`),
  getActive: () => api.get('/alerts/active'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getCitizen: () => api.get('/dashboard/citizen'),
};

export const weatherAPI = {
  getByCoords: (lat, lon) => api.get('/weather', { params: { lat, lon } }),
  getByCity: (city) => api.get('/weather/city', { params: { city } }),
};

export const aiAPI = {
  getPrediction: () => api.get('/ai/prediction'),
  getSummary: (text) => api.post('/ai/summary', { text }),
};

export const geocodeAPI = {
  search: (q) => api.get('/geocode/search', { params: { q } }),
  reverse: (lat, lon) => api.get('/geocode/reverse', { params: { lat, lon } }),
};

export default api;

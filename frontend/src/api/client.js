import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:5000',
  baseURL: 'https://illegal-claudina-saransathish-2ce282b0.koyeb.app/',

  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;



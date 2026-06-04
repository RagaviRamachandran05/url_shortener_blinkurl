import axios from 'axios';

const normalizeBaseUrl = (value) => {
  if (!value) return 'https://url-shortener-blinkurl.onrender.com';
  return value.trim().replace(/\/+$/, '').replace(/\/api$/, '');
};

const API = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
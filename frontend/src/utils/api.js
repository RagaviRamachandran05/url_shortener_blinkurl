// // src/utils/api.js
// // Configures axios with the base URL and JWT token injection.

// import axios from 'axios';

// // Use the environment variable set in .env
// const API = axios.create({
//   baseURL: import.meta.env.FRONTEND_URL || 'http://',
// });

// // ─── Request Interceptor ──────────────────────────────────────────────────────
// // Automatically attach the JWT token to every request

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // ─── Response Interceptor ─────────────────────────────────────────────────────
// // If the server returns 401, clear the stored token (session expired)

// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token expired or invalid — clear storage
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       // Redirect to login if not already there
//       if (window.location.pathname !== '/login') {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default API;


import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
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

export default API;

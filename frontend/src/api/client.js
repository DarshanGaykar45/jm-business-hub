import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';


/**
 * Central Axios Instance
 * withCredentials: true ensures httpOnly session & auth cookies are transmitted safely.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response Interceptor for handling global session/error events
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Pass error through for caller handling
    return Promise.reject(error);
  }
);

export default api;

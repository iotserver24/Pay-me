import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Check for token in localStorage on client side
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('adminToken');
  if (token) {
    setAuthToken(token);
  }
}

export default api;

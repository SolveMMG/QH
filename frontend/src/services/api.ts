import axios from 'axios';

// Create an axios instance
const api = axios.create({
  // Use relative URL which will work in both development and production
  baseURL: import.meta.env.VITE_API_BASE_URL ||'/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('quickhire_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle case conversion for consistent API communication
    if (config.data) {
      // Convert role from lowercase in frontend to uppercase for backend
      if (config.data.role && typeof config.data.role === 'string') {
        config.data.role = config.data.role.toUpperCase();
      }
      
      // Convert status from lowercase in frontend to uppercase for backend
      if (config.data.status && typeof config.data.status === 'string') {
        config.data.status = config.data.status.toUpperCase();
      }
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to standardize data from backend to frontend
api.interceptors.response.use(
  response => {
    if (response.data) {
      // Convert user role from backend uppercase to frontend lowercase
      if (response.data.user && response.data.user.role) {
        response.data.user.role = response.data.user.role.toLowerCase();
      }
      
      // Convert job or jobs status from backend uppercase to frontend lowercase
      if (response.data.job) {
        if (response.data.job.status) {
          response.data.job.status = response.data.job.status.toLowerCase();
        }
      }
      
      if (response.data.jobs && Array.isArray(response.data.jobs)) {
        response.data.jobs = response.data.jobs.map(job => ({
          ...job,
          status: job.status ? job.status.toLowerCase() : job.status
        }));
      }
    }
    return response;
  },
  error => Promise.reject(error)
);

export default api;

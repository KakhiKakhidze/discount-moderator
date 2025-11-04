import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://admin.discount.com.ge/en/api';

// Get auth token from localStorage with fallback to cookies
const getAuthToken = () => {
  const localToken = localStorage.getItem('moderatorToken');
  if (localToken) {
    return localToken;
  }
  
  const cookieToken = Cookies.get('moderatorToken');
  return cookieToken;
};

// Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 60000, // Increased to 60 seconds for image uploads
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response.data;
  },
  (error) => {
    console.error('API request failed:', error);
    
    if (error.response) {
      console.log(`Error Response: ${error.response.status} ${error.response.statusText}`);
      console.log('Error data:', error.response.data);
      console.log('Error headers:', error.response.headers);
      console.log('Full error response:', error.response);
      
      // Handle specific error statuses
      if (error.response.status === 401) {
        console.log('Authentication failed (401), clearing token and redirecting...');
        localStorage.removeItem('moderatorToken');
        localStorage.removeItem('moderatorUser');
        Cookies.remove('moderatorToken');
        Cookies.remove('moderatorUser');
        window.location.href = '/login';
      } else if (error.response.status === 500) {
        console.error('Server Error (500):', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        });
      }
    } else if (error.request) {
      console.log('No response received:', error.request);
      console.log('Request config:', error.config);
    } else {
      console.log('Error setting up request:', error.message);
    }
    
    throw error;
  }
);

// Staff API endpoints
export const staffApi = {
  login: (credentials) => {
    console.log('=== STAFF LOGIN API CALL ===');
    console.log('Credentials:', credentials);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Endpoint:', '/v2/auth/login');
    console.log('Full URL will be:', `${API_BASE_URL}/v2/auth/login`);
    console.log('Request method: POST');
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': getAuthToken() ? `Bearer ${getAuthToken()}` : 'None'
    });
    console.log('Request body:', JSON.stringify(credentials, null, 2));
    console.log('==========================');
    
    return axiosInstance.post('/v2/auth/login', credentials);
  },
};

// Event API endpoints
export const eventApi = {
  getAll: () => axiosInstance.get('/v1/event/list'),
  getById: (id) => axiosInstance.get(`/v1/event/${id}`),
  create: (data) => axiosInstance.post('/v1/event/create', data),
  update: (id, data) => axiosInstance.put(`/v1/event/update/${id}`, data),
  delete: (id) => axiosInstance.delete(`/v1/event/delete/${id}`),
  getDetails: (id) => axiosInstance.get(`/v1/event/details/${id}`),
  uploadImage: (eventId, formData) => axiosInstance.post(`/v1/event/${eventId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000 // 60 seconds for image upload
  }),
  updateImage: (eventId, imageId, data) => axiosInstance.put(`/v1/event/${eventId}/image/${imageId}`, data),
  deleteImage: (eventId, imageId) => axiosInstance.delete(`/v1/event/${eventId}/image/${imageId}`)
};

// Event API v2 endpoints
export const eventApiV2 = {
  getAll: () => axiosInstance.get('/v2/event/admin/event/list'),
  getById: (id) => axiosInstance.get(`/v2/event/admin/event/${id}`),
  create: (data) => axiosInstance.post('/v2/event/admin/event/create', data),
  update: (id, data) => axiosInstance.patch(`/v2/event/admin/event/update/${id}`, data),
  delete: (id) => axiosInstance.delete(`/v2/event/admin/event/delete/${id}`),
  getDetails: (id) => axiosInstance.get(`/v2/event/admin/event/details/${id}`),
  uploadImage: (eventId, formData) => axiosInstance.post(`/v2/event/admin/event/${eventId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000 // 60 seconds for image upload
  }),
  updateImage: (eventId, imageId, data) => axiosInstance.put(`/v2/event/admin/event/${eventId}/image/${imageId}`, data),
  deleteImage: (eventId, imageId) => axiosInstance.delete(`/v2/event/admin/event/${eventId}/image/${imageId}`)
};

// Company API endpoints
export const companyApi = {
  getAll: () => axiosInstance.get('/v1/staff/company/list'),
  getById: (id) => axiosInstance.get(`/v1/staff/company/${id}`),
  create: (data) => axiosInstance.post('/v1/staff/company/create', data),
  update: (id, data) => axiosInstance.patch(`/v1/staff/company/update/${id}`, data),
  delete: (id) => axiosInstance.delete(`/v1/staff/company/delete/${id}`)
};

// Category API endpoints
export const categoryApi = {
  getAll: () => axiosInstance.get('/v1/category/list'),
  getById: (id) => axiosInstance.get(`/v1/category/${id}`),
  create: (data) => axiosInstance.post('/v1/category/create', data),
  update: (id, data) => axiosInstance.put(`/v1/category/update/${id}`, data),
  delete: (id) => axiosInstance.delete(`/v1/category/delete/${id}`)
};

// City API endpoints
export const cityApi = {
  getAll: () => axiosInstance.get('/v1/city/list'),
  getById: (id) => axiosInstance.get(`/v1/city/${id}`),
  create: (data) => axiosInstance.post('/v1/city/create', data),
  update: (id, data) => axiosInstance.put(`/v1/city/update/${id}`, data),
  delete: (id) => axiosInstance.delete(`/v1/city/delete/${id}`)
};

export default axiosInstance;

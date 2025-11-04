import axios from 'axios';
import Cookies from 'js-cookie';
import { getConfig, isDevelopment } from '../config/environment';

const createAxiosInstance = () => {
  const config = getConfig();
  
  // Fallback URLs in case the primary fails
  const fallbackUrls = [
    config.API_BASE_URL,
    'https://admin.discount.com.ge/en/api/v2',
  ];
  
  const instance = axios.create({
    baseURL: config.API_BASE_URL,
    withCredentials: true,
    timeout: 60000, // 60 second timeout for image uploads
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Debug: Log the configuration being used
  console.log('=== AXIOS INSTANCE CREATED ===');
  console.log('Config API_BASE_URL:', config.API_BASE_URL);
  console.log('Instance baseURL:', instance.defaults.baseURL);
  console.log('Full login URL will be:', `${instance.defaults.baseURL}/v2/auth/login`);
  console.log('=============================');

  instance.interceptors.request.use(
    (config) => {
      // Get auth token from localStorage or cookies (prioritize localStorage)
      const authToken = localStorage.getItem('moderatorToken') || Cookies.get('moderatorToken');
      if (authToken) {
        config.headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Get CSRF token from cookies (if available)
      const csrftoken = Cookies.get("csrftoken");
      if (csrftoken) {
        config.headers["X-CSRFToken"] = csrftoken;
      }

      // Ensure baseURL is set correctly
      config.baseURL = getConfig().API_BASE_URL;

      // Only log in development
      if (isDevelopment) {
        console.log('=== Axios Request Debug ===');
        console.log('URL:', config.url);
        console.log('Method:', config.method);
        console.log('Base URL:', config.baseURL);
        console.log('Full URL:', `${config.baseURL}${config.url}`);
        console.log('Headers:', config.headers);
        console.log('CSRF Token:', csrftoken ? 'Present' : 'Missing');
        console.log('Auth Token:', authToken ? 'Present' : 'Missing');
        console.log('Cookies available:', document.cookie);
        console.log('========================');
      }

      return config; 
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for better error handling
  instance.interceptors.response.use(
    (response) => {
      if (isDevelopment) {
        console.log('=== Axios Response Success ===');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        console.log('Response Headers:', response.headers);
        console.log('Cookies after response:', document.cookie);
        console.log('========================');
      }
      
      // Check if the server set any cookies in the response
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader && isDevelopment) {
        console.log('Server set cookies:', setCookieHeader);
      }
      
      return response;
    },
    (error) => {
      console.error('=== Axios Response Error ===');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
      console.error('Config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        baseURL: error.config?.baseURL
      });
      console.error('========================');
      
      // Handle 401/403 errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication error, clearing tokens...');
        localStorage.removeItem('moderatorToken');
        localStorage.removeItem('moderatorUser');
        localStorage.removeItem('moderatorPermissions');
        Cookies.remove('moderatorToken');
        Cookies.remove('moderatorUser');
        Cookies.remove('moderatorPermissions');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

export const testAuth = async () => {
  try {
    console.log('Testing moderator authentication...');
    const instance = createAxiosInstance();
    
    // Test a simple GET request first
    const response = await instance.get('/v2/auth/login');
    console.log('Test response:', response);
    return response;
  } catch (error) {
    console.error('Auth test failed:', error.response?.status, error.response?.data);
    return { error: error.response?.status, data: error.response?.data };
  }
};

// Function to check cookie availability
export const checkCookies = () => {
  console.log('=== Cookie Check ===');
  console.log('All cookies:', document.cookie);
  console.log('moderatorToken cookie:', Cookies.get('moderatorToken'));
  console.log('moderatorUser cookie:', Cookies.get('moderatorUser'));
  console.log('moderatorPermissions cookie:', Cookies.get('moderatorPermissions'));
  console.log('csrftoken cookie:', Cookies.get('csrftoken'));
  console.log('LocalStorage moderatorToken:', localStorage.getItem('moderatorToken'));
  console.log('LocalStorage moderatorUser:', localStorage.getItem('moderatorUser'));
  console.log('==================');
};

// Function to set cookies with proper domain
export const setCookieWithDomain = (name, value, options = {}) => {
  const cookieOptions = {
    expires: 7, // 7 days
    path: '/',
    ...options
  };
  
  // Try to set with domain if we're not on localhost
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    cookieOptions.domain = window.location.hostname;
  }
  
  Cookies.set(name, value, cookieOptions);
  console.log(`Cookie ${name} set with options:`, cookieOptions);
};

// Function to manually set moderator session token
export const setModeratorSessionToken = (token) => {
  if (token) {
    setCookieWithDomain('moderatorToken', token);
    localStorage.setItem('moderatorToken', token);
    console.log('Moderator session token set:', token);
  } else {
    console.warn('No token provided to setModeratorSessionToken');
  }
};

export default createAxiosInstance;

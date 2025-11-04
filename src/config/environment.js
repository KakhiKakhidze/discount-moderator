// Environment configuration for moderator app
const ENV = process.env.NODE_ENV || 'development';

// Check if we're running locally or on the production domain
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('localhost');

const config = {
  development: {
    API_BASE_URL: 'https://admin.discount.com.ge/en/api',
    COOKIE_DOMAIN: '.admin.discount.com.ge',
    DEBUG: true
  },
  production: {
    API_BASE_URL: 'https://admin.discount.com.ge/en/api',
    COOKIE_DOMAIN: '.admin.discount.com.ge',
    DEBUG: false
  }
};

export const getConfig = () => {
  const baseConfig = config[ENV] || config.development;
  
  // Override with environment variables if available
  if (process.env.REACT_APP_API_BASE_URL) {
    baseConfig.API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  }
  
  // Debug: Log what configuration is being returned
  console.log('=== ENVIRONMENT CONFIG ===');
  console.log('Current ENV:', ENV);
  console.log('Base config:', baseConfig);
  console.log('Final API_BASE_URL:', baseConfig.API_BASE_URL);
  console.log('Timestamp:', new Date().toISOString());
  console.log('==========================');
  
  return baseConfig;
};

export const isDevelopment = ENV === 'development';
export const isProduction = ENV === 'production';
export { isLocalhost };

// Error handling utility for moderator app
import { getConfig } from '../config/environment';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error) => {
  console.error('API Error:', error);

  // Network errors
  if (!error.response) {
    return {
      success: false,
      error: 'Network error. Please check your internet connection.',
      type: 'network'
    };
  }

  const { status, data } = error.response;
  
  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      return {
        success: false,
        error: data?.detail || data?.message || 'Invalid request. Please check your input.',
        type: 'validation',
        details: data
      };
    
    case 401:
      return {
        success: false,
        error: 'Authentication failed. Please log in again.',
        type: 'auth',
        shouldRedirect: true
      };
    
    case 403:
      return {
        success: false,
        error: 'Access denied. You don\'t have permission to perform this action.',
        type: 'permission'
      };
    
    case 404:
      return {
        success: false,
        error: 'Resource not found. Please check the URL or contact support.',
        type: 'not_found'
      };
    
    case 500:
      return {
        success: false,
        error: 'Server error. Please try again later or contact support.',
        type: 'server',
        shouldRetry: true
      };
    
    case 502:
    case 503:
    case 504:
      return {
        success: false,
        error: 'Service temporarily unavailable. Please try again later.',
        type: 'service_unavailable',
        shouldRetry: true
      };
    
    default:
      return {
        success: false,
        error: `Unexpected error (${status}). Please try again or contact support.`,
        type: 'unknown'
      };
  }
};

export const shouldRetryRequest = (error) => {
  if (!error.response) return true; // Network errors
  const status = error.response?.status;
  return [500, 502, 503, 504].includes(status);
};

export const getRetryDelay = (attempt) => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attempt), 16000);
};

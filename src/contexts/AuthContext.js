import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  setModeratorCookie, 
  getModeratorCookie, 
  removeModeratorCookie, 
  setModeratorSession 
} from '../utils/cookies';
import createAxiosInstance from '../services/axios';
import { handleApiError, shouldRetryRequest, getRetryDelay } from '../utils/errorHandler';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  permissions: [],
  login: () => {},
  logout: () => {},
  loading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  // Create axios instance
  const axiosInstance = createAxiosInstance();

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('moderatorToken') || getModeratorCookie('moderatorToken');
      if (token) {
        // Try to get user profile to validate token
        const userData = await axiosInstance.get('/v2/auth/profile');
        setUser(userData.data);
        setPermissions(userData.data.permissions || []);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens
      clearStoredData();
    } finally {
      setLoading(false);
    }
  };

  const clearStoredData = () => {
    removeModeratorCookie('moderatorToken');
    removeModeratorCookie('moderatorUser');
    removeModeratorCookie('moderatorPermissions');
    localStorage.removeItem('moderatorToken');
    localStorage.removeItem('moderatorUser');
    localStorage.removeItem('moderatorPermissions');
    setUser(null);
    setPermissions([]);
  };

  const login = async (credentials, retryCount = 0) => {
    try {
      console.log('Login attempt with:', { email: credentials.email, password: '***' });
      
      const response = await axiosInstance.post('/v2/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data;
      console.log('Login response received:', data);
      console.log('Response data keys:', data ? Object.keys(data) : 'No data');
      
      // Check if response has the expected structure
      if (!data) {
        console.error('No response data received');
        return { 
          success: false, 
          error: 'No response data from server' 
        };
      }
      
      // Handle different token field names - be more flexible
      const token = data.token || data.access_token || data.auth_token || data.access || data.jwt;
      const userData = data.user || data.user_data || data.profile || data;
      
      console.log('Token found:', !!token, 'Token value:', token ? token.substring(0, 20) + '...' : 'None');
      console.log('User data found:', !!userData, 'User data keys:', userData ? Object.keys(userData) : 'None');
      
      console.log('Extracted token and user data:', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        userDataKeys: userData ? Object.keys(userData) : []
      });
      
      if (!token) {
        console.error('No token found in response. Available fields:', Object.keys(data));
        
        // Check if this might be a session-based auth (no token needed)
        if (userData && (userData.id || userData.email)) {
          console.log('No token but user data found, trying session-based auth');
          // For session-based auth, we might not need a token
          // Store user data and use a placeholder token
          const sessionToken = 'session_' + Date.now();
          localStorage.setItem('moderatorToken', sessionToken);
          localStorage.setItem('moderatorUser', JSON.stringify(userData));
          
          setModeratorCookie('moderatorToken', sessionToken);
          setModeratorCookie('moderatorUser', JSON.stringify(userData));
          
          const userPermissions = userData.permissions || ['read', 'update'];
          setModeratorCookie('moderatorPermissions', JSON.stringify(userPermissions));
          localStorage.setItem('moderatorPermissions', JSON.stringify(userPermissions));
          
          setUser(userData);
          setPermissions(userPermissions);
          
          console.log('Session-based auth successful');
          return { success: true, user: userData };
        }
        
        return { 
          success: false, 
          error: 'No authentication token received from server. Response fields: ' + Object.keys(data).join(', ') 
        };
      }
      
      // Store in localStorage (primary) and cookies (fallback)
      localStorage.setItem('moderatorToken', token);
      localStorage.setItem('moderatorUser', JSON.stringify(userData));
      
      // Also store in cookies for persistence
      setModeratorCookie('moderatorToken', token);
      setModeratorCookie('moderatorUser', JSON.stringify(userData));
      
      // Set permissions
      const userPermissions = userData.permissions || ['read', 'update'];
      setModeratorCookie('moderatorPermissions', JSON.stringify(userPermissions));
      localStorage.setItem('moderatorPermissions', JSON.stringify(userPermissions));
      
      // Update state immediately
      setUser(userData);
      setPermissions(userPermissions);
      
      console.log('AuthContext state updated:', { user: userData, permissions: userPermissions });
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle retry logic for server errors
      if (shouldRetryRequest(error) && retryCount < 3) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying login in ${delay}ms (attempt ${retryCount + 1}/3)`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return login(credentials, retryCount + 1);
      }
      
      // Use centralized error handling
      const errorResult = handleApiError(error);
      
      // Handle authentication errors that should redirect
      if (errorResult.shouldRedirect) {
        clearStoredData();
      }
      
      return { 
        success: false, 
        error: errorResult.error,
        type: errorResult.type,
        details: errorResult.details
      };
    }
  };

  const logout = () => {
    clearStoredData();
    // Redirect to login
    window.location.href = '/login';
  };

  const isAuthenticated = !!user;

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  // Check if user can perform specific actions
  const canCreate = hasPermission('create') || hasPermission('admin');
  const canRead = hasPermission('read') || hasPermission('admin');
  const canUpdate = hasPermission('update') || hasPermission('admin');
  const canDelete = hasPermission('delete') || hasPermission('admin');

  const debugSessionTokens = () => {
    console.log('Moderator Token:', localStorage.getItem('moderatorToken'));
    console.log('Moderator User:', localStorage.getItem('moderatorUser'));
    console.log('Moderator Permissions:', localStorage.getItem('moderatorPermissions'));
    console.log('Cookie Token:', getModeratorCookie('moderatorToken'));
    console.log('Cookie User:', getModeratorCookie('moderatorUser'));
    console.log('Cookie Permissions:', getModeratorCookie('moderatorPermissions'));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      permissions,
      hasPermission,
      canCreate,
      canRead,
      canUpdate,
      canDelete,
      login, 
      logout, 
      debugSessionTokens,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

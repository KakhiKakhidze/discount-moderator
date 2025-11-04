import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Lock,
  BugReport,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { testApiConnectivity, testSpecificEndpoint } from '../utils/apiTester';
import createAxiosInstance from '../services/axios';
const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [testing, setTesting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the AuthContext login function
      console.log('Attempting login with AuthContext...');
      const result = await login(credentials);
      
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, navigating to dashboard...');
        // Force navigation with a small delay to ensure state is updated
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        console.log('Login failed:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTestConnectivity = async () => {
    setTesting(true);
    setDebugInfo('Testing API connectivity...');
    
    try {
      const results = await testApiConnectivity();
      setDebugInfo(JSON.stringify(results, null, 2));
    } catch (error) {
      setDebugInfo(`Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleTestEndpoint = async () => {
    setTesting(true);
    setDebugInfo('Testing specific endpoint...');
    
    try {
      const result = await testSpecificEndpoint('/v2/auth/login');
      setDebugInfo(JSON.stringify(result, null, 2));
    } catch (error) {
      setDebugInfo(`Endpoint test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };



  const handleAxiosTest = async () => {
    setTesting(true);
    setDebugInfo('Testing with Axios...');
    
    try {
      const axiosInstance = createAxiosInstance();
      
      // Test 1: Basic GET request
      const response = await axiosInstance.get('/v2/auth/login');
      setDebugInfo(`✅ Axios GET successful: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      if (error.response) {
        setDebugInfo(`❌ Axios error: ${error.response.status} - ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        setDebugInfo(`❌ Axios network error: ${error.message}`);
      } else {
        setDebugInfo(`❌ Axios error: ${error.message}`);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleAxiosLoginTest = async () => {
    setTesting(true);
    setDebugInfo('Testing Axios login endpoint...');
    
    try {
      const axiosInstance = createAxiosInstance();
      
      // Test with dummy credentials
      const response = await axiosInstance.post('/v2/auth/login', {
        email: 'test@example.com',
        password: 'testpassword'
      });
      
      setDebugInfo(`✅ Axios login test successful: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      if (error.response) {
        setDebugInfo(`❌ Axios login error: ${error.response.status} - ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        setDebugInfo(`❌ Axios login network error: ${error.message}`);
      } else {
        setDebugInfo(`❌ Axios login error: ${error.message}`);
      }
    } finally {
      setTesting(false);
    }
  };

  const handleAxiosConfig = () => {
    const config = createAxiosInstance();
    const envConfig = require('../config/environment').getConfig();
    const debugInfo = {
      axios: {
        baseURL: config.defaults?.baseURL,
        timeout: config.defaults?.timeout,
        headers: config.defaults?.headers,
        withCredentials: config.defaults?.withCredentials
      },
      environment: envConfig,
      currentHostname: window.location.hostname,
      fullLoginURL: `${config.defaults?.baseURL}/v2/auth/login`
    };
    setDebugInfo(JSON.stringify(debugInfo, null, 2));
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          {/* Logo/Icon */}
          <Box sx={{ mb: 3 }}>
            <AdminPanelSettings
              sx={{
                fontSize: 64,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Staff Login
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Access the Discount Staff Panel
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AdminPanelSettings color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>

          {/* Debug Section */}
          <Divider sx={{ my: 2 }} />

          {/* Footer */}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            © 2024 Discount Moderator Panel
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;

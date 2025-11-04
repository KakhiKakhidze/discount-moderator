import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Main app content (protected)
const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('AppContent - Auth state:', { isAuthenticated, loading, user });

  if (loading) {
    return null; // Loading is handled by ProtectedRoute
  }

  if (!isAuthenticated) {
    console.log('AppContent - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('AppContent - Authenticated, rendering protected content');

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  );
};

// Main app component
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;

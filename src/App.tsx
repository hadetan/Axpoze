import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Container } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/auth/AuthCallback';
import Expenses from './pages/Expenses';
import Profile from './pages/Profile';
import './App.css';

const App: React.FC = () => {
  const { authState } = useAuth();

  if (authState.loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={
          !authState.isAuthenticated ? <Login /> : <Navigate to="/" replace />
        } />
        <Route path="/signup" element={
          !authState.isAuthenticated ? <Signup /> : <Navigate to="/" replace />
        } />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/expenses" element={
          <PrivateRoute>
            <Expenses />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
      </Route>
    </Routes>
  );
};

export default App;

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
import Notifications from './pages/Notifications';
import Savings from './pages/Savings';
import { AppProvider } from './providers/AppProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { AnimationProvider } from './contexts/AnimationContext';
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
    <ThemeProvider>
      <AnimationProvider>
        <AppProvider>
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
            <Route path="/" element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="savings" element={<Savings />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </AppProvider>
      </AnimationProvider>
    </ThemeProvider>
  );
};

export default App;

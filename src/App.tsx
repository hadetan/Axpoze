import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Container } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
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
      <Route path="/login" element={!authState.isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!authState.isAuthenticated ? <Signup /> : <Navigate to="/" />} />
      <Route path="/" element={authState.isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default App;

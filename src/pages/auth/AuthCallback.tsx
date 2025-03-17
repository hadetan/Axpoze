import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, CircularProgress, Typography, Box } from '@mui/material';
import { supabase } from '../../services/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from URL
        const hashFragment = window.location.hash;
        const searchParams = new URLSearchParams(hashFragment.substring(1));
        
        // Handle the OAuth callback
        await supabase.auth.exchangeCodeForSession(searchParams.get('code') || '');
        
        // Redirect to login with success message
        navigate('/login', { 
          state: { message: 'Email verified successfully! Please login.' },
          replace: true 
        });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { 
          state: { error: 'Verification failed. Please try again.' },
          replace: true 
        });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}>
        <CircularProgress />
        <Typography>
          Verifying your email...
        </Typography>
      </Box>
    </Container>
  );
};

export default AuthCallback;

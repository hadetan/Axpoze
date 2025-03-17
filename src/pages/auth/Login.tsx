import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container, Paper, Avatar, Typography, TextField,
  Button, FormControlLabel, Checkbox, Link, Alert,
  Box,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../contexts/AuthContext';
import { authStyles } from '../../styles/auth.styles';

const Login: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle messages from callback
    if (location.state) {
      const state = location.state as { message?: string; error?: string };
      if (state.message) setSuccessMessage(state.message);
      if (state.error) setError(state.error);
      // Clean up location state
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const from = (location.state as any)?.from?.pathname || '/';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        const { error } = await signIn(values.email, values.password);
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setError('Please verify your email before logging in.');
          } else {
            setError(error.message);
          }
          return;
        }
        
        navigate(from, { replace: true });
      } catch (err: any) {
        setError(err.message || 'An error occurred during sign in');
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs" sx={authStyles.container}>
      <Paper elevation={3} sx={authStyles.paper}>
        <Avatar sx={authStyles.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            {successMessage}
          </Alert>
        )}
        <Box component="form" onSubmit={formik.handleSubmit} sx={authStyles.form}>
          <TextField
            fullWidth
            margin="normal"
            name="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            margin="normal"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                color="primary"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
              />
            }
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={authStyles.submit}
            disabled={formik.isSubmitting}
          >
            Sign In
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/signup" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;

import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container, Paper, Avatar, Typography, TextField,
  Button, Link, Alert, Box, Stack,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuth } from '../../contexts/AuthContext';
import { authStyles } from '../../styles/auth.styles';

const Signup: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [verificationSent, setVerificationSent] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .required('Full name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        const { user, error } = await signUp(
          values.email,
          values.password,
          values.fullName
        );

        if (error) {
          setError(error.message);
          return;
        }

        if (user && !user.confirmed_at) {
          setVerificationSent(true);
          return;
        }

        navigate('/login');
      } catch (err: any) {
        setError(err.message || 'An error occurred during sign up');
      }
    },
  });

  if (verificationSent) {
    return (
      <Container component="main" maxWidth="xs" sx={authStyles.container}>
        <Paper elevation={3} sx={authStyles.paper}>
          <Avatar sx={authStyles.avatar}>
            <EmailIcon />
          </Avatar>
          <Typography component="h1" variant="h5" gutterBottom>
            Verify Your Email
          </Typography>
          <Typography align="center" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
            A verification link has been sent to your email address.
            Please check your inbox (and spam folder) and click the link to complete your registration.
          </Typography>
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<OpenInNewIcon />}
              href="https://gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Gmail
            </Button>
            <Button
              fullWidth
              variant="outlined"
              component={RouterLink}
              to="/login"
            >
              Back to Login
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            Didn't receive the email? Check your spam folder or{' '}
            <Link 
              component="button"
              variant="body2"
              onClick={() => formik.handleSubmit()}
            >
              click here to resend
            </Link>
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs" sx={authStyles.container}>
      <Paper elevation={3} sx={authStyles.paper}>
        <Avatar sx={authStyles.avatar}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={formik.handleSubmit} sx={authStyles.form}>
          <TextField
            fullWidth
            margin="normal"
            name="fullName"
            label="Full Name"
            autoComplete="name"
            autoFocus
            value={formik.values.fullName}
            onChange={formik.handleChange}
            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
            helperText={formik.touched.fullName && formik.errors.fullName}
          />
          <TextField
            fullWidth
            margin="normal"
            name="email"
            label="Email Address"
            autoComplete="email"
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
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            fullWidth
            margin="normal"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={authStyles.submit}
            disabled={formik.isSubmitting}
          >
            Sign Up
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;

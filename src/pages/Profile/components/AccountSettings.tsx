import React from 'react';
import { Paper, Stack, Typography, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../../contexts/AuthContext';

const AccountSettings: React.FC = () => {
  const { authState } = useAuth();

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <AccountCircleIcon color="primary" />
              <Typography variant="h6">Account Information</Typography>
            </Stack>
            <Typography>Email: {authState.user?.email}</Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default AccountSettings;

import React from 'react';
import { Paper, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SavingsIcon from '@mui/icons-material/Savings';

const QuickActions: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Stack spacing={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
        >
          Add Expense
        </Button>
        <Button
          variant="outlined"
          startIcon={<SavingsIcon />}
          fullWidth
        >
          Add Savings
        </Button>
      </Stack>
    </Paper>
  );
};

export default QuickActions;

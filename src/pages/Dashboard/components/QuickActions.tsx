import React from 'react';
import { Paper, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SavingsIcon from '@mui/icons-material/Savings';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const handleAddExpense = () => {
    navigate('/expenses', { state: { openAddModal: true } });
  };

  const handleAddSavings = () => {
    navigate('/savings', { state: { openAddModal: true } });
  };

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
          onClick={handleAddExpense}
        >
          Add Expense
        </Button>
        <Button
          variant="outlined"
          startIcon={<SavingsIcon />}
          fullWidth
          onClick={handleAddSavings}
        >
          Add Savings
        </Button>
      </Stack>
    </Paper>
  );
};

export default QuickActions;

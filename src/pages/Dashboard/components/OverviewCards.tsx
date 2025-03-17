import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';

const OverviewCard = ({ title, amount, icon, color }: any) => (
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ 
      backgroundColor: `${color}15`, 
      borderRadius: '50%', 
      p: 1,
      display: 'flex' 
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6">
        ₹{amount.toLocaleString()}
      </Typography>
    </Box>
  </Paper>
);

const OverviewCards: React.FC = () => {
  // This will be replaced with real data later
  const mockData = {
    income: 50000,
    expense: 30000,
    savings: 20000,
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <OverviewCard
          title="Monthly Income"
          amount={mockData.income}
          icon={<TrendingUpIcon sx={{ color: 'success.main' }} />}
          color="#4caf50"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <OverviewCard
          title="Monthly Expense"
          amount={mockData.expense}
          icon={<TrendingDownIcon sx={{ color: 'error.main' }} />}
          color="#f44336"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <OverviewCard
          title="Total Savings"
          amount={mockData.savings}
          icon={<SavingsIcon sx={{ color: 'primary.main' }} />}
          color="#1976d2"
        />
      </Grid>
    </Grid>
  );
};

export default OverviewCards;

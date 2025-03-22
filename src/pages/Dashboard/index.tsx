import React from 'react';
import { Grid, Container } from '@mui/material';
import OverviewCards from './components/OverviewCards';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import RecentTransactions from './components/RecentTransactions';
import MonthlyTrends from './components/MonthlyTrends';
import QuickActions from './components/QuickActions';
import MonthlyStats from './components/MonthlyStats';
import { Stack } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12}>
          <OverviewCards />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <QuickActions />
            <MonthlyStats />
          </Stack>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} md={8}>
          <ExpenseBreakdown />
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12} md={8}>
          <MonthlyTrends />
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={4}>
          <RecentTransactions />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

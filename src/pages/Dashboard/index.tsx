import React, { useEffect } from 'react';
import { Grid, Container, CircularProgress, Box } from '@mui/material';
import { useExpense } from '../../contexts/ExpenseContext';
import { useSavings } from '../../contexts/SavingsContext';
import OverviewCards from './components/OverviewCards';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import RecentTransactions from './components/RecentTransactions';
import MonthlyTrends from './components/MonthlyTrends';
import QuickActions from './components/QuickActions';
import MonthlyStats from './components/MonthlyStats';
import { Stack } from '@mui/material';
import FinancialInsights from './components/FinancialInsights';

const Dashboard: React.FC = () => {
  const { fetchExpenses, loading: expensesLoading } = useExpense();
  const { fetchGoals, loading: savingsLoading } = useSavings();

  useEffect(() => {
    const initializeDashboard = async () => {
      await Promise.all([
        fetchExpenses(),
        fetchGoals()
      ]);
    };

    initializeDashboard();
  }, [fetchExpenses, fetchGoals]);

  if (expensesLoading || savingsLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12}>
          <OverviewCards />
        </Grid>

        {/* Quick Actions and Insights */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <QuickActions />
            <FinancialInsights />
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

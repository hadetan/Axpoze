import React from 'react';
import { Grid, Paper, Typography, Box, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SavingsIcon from '@mui/icons-material/Savings';
import { useExpense } from '../../../contexts/ExpenseContext';
import { useSavings } from '../../../contexts/SavingsContext';
import { startOfMonth, endOfMonth } from 'date-fns';

const OverviewCard = ({ title, amount, icon, color, loading = false }: any) => (
  <Paper 
    sx={{ 
      p: { xs: 1.5, sm: 2 },
      display: 'flex', 
      alignItems: 'center', 
      gap: { xs: 1.5, sm: 2 }
    }}
  >
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
      {loading ? (
        <Skeleton width={100} height={32} />
      ) : (
        <Typography variant="h6">
          ₹{amount.toLocaleString()}
        </Typography>
      )}
    </Box>
  </Paper>
);

const OverviewCards: React.FC = () => {
  const { expenses, loading: expenseLoading } = useExpense();
  const { goals, history, loading: savingsLoading } = useSavings();

  // Calculate total monthly expenses
  const currentMonthExpenses = React.useMemo(() => {
    if (!expenses.length) return 0;
    
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    
    return expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= start && expDate <= end;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  // Calculate total savings from all goals
  const totalSavings = React.useMemo(() => {
    if (!goals.length) return 0;
    return goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  }, [goals]);

  // Calculate current month's savings contributions
  const currentMonthSavings = React.useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    // Flatten all history entries and sum up current month's contributions
    return Object.values(history)
      .flat()
      .filter(contribution => {
        const contribDate = new Date(contribution.date);
        return contribDate >= start && contribDate <= end;
      })
      .reduce((total, contribution) => total + contribution.amount, 0);
  }, [history]);

  // Calculate monthly income (expenses + savings)
  const monthlyIncome = React.useMemo(() => {
    return Math.abs(currentMonthExpenses) + currentMonthSavings;
  }, [currentMonthExpenses, currentMonthSavings]);

  return (
    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
      <Grid item xs={12} sm={4}>
        <OverviewCard
          title="Monthly Income"
          amount={monthlyIncome}
          icon={<TrendingUpIcon sx={{ color: 'success.main' }} />}
          color="#4caf50"
          loading={expenseLoading || savingsLoading}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <OverviewCard
          title="Monthly Expense"
          amount={currentMonthExpenses}
          icon={<TrendingDownIcon sx={{ color: 'error.main' }} />}
          color="#f44336"
          loading={expenseLoading}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <OverviewCard
          title="Total Savings"
          amount={totalSavings}
          icon={<SavingsIcon sx={{ color: 'primary.main' }} />}
          color="#1976d2"
          loading={savingsLoading}
        />
      </Grid>
    </Grid>
  );
};

export default OverviewCards;

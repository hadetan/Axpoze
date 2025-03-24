import React, { useMemo } from 'react';
import { Paper, Typography, Stack, Box, Chip, Button } from '@mui/material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { useExpense } from '../../../contexts/ExpenseContext';
import { useSavings } from '../../../contexts/SavingsContext';
import { useNavigate } from 'react-router-dom';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const FinancialInsights: React.FC = () => {
  const { expenses } = useExpense();
  const { goals } = useSavings();
  const navigate = useNavigate();

  const insights = useMemo(() => {
    const currentMonth = format(new Date(), 'MMMM');
    const insights = [];

    // Calculate monthly spending
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= monthStart && expDate <= monthEnd;
    });

    const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Get top spending category
    const categorySpending = monthlyExpenses.reduce((acc, exp) => {
      const catId = exp.category_id;
      acc[catId] = (acc[catId] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)[0];

    if (topCategory) {
      const category = expenses.find(e => e.category_id === topCategory[0])?.category;
      insights.push({
        message: `Highest spending in ${currentMonth}: ${category?.name}`,
        action: () => navigate('/expenses', { state: { category: topCategory[0] } }),
        actionText: 'View Details'
      });
    }

    // Check savings goals progress
    const urgentGoals = goals.filter(goal => {
      if (!goal.deadline) return false;
      const daysLeft = Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const progress = (goal.current_amount / goal.target_amount) * 100;
      return daysLeft < 30 && progress < 80;
    });

    if (urgentGoals.length > 0) {
      insights.push({
        message: `${urgentGoals.length} savings ${urgentGoals.length === 1 ? 'goal needs' : 'goals need'} attention`,
        action: () => navigate('/savings'),
        actionText: 'Check Goals'
      });
    }

    // Add spending trend insight
    if (monthlyExpenses.length > 0) {
      const dailyAverage = totalSpent / monthlyExpenses.length;
      if (dailyAverage > 1000) {
        insights.push({
          message: `Daily spending average is high: ₹${dailyAverage.toFixed(0)}`,
          action: () => navigate('/expenses'),
          actionText: 'Review Expenses'
        });
      }
    }

    return insights;
  }, [expenses, goals, navigate]);

  if (insights.length === 0) {
    return null; // Don't render if no insights
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TipsAndUpdatesIcon color="primary" />
          <Typography variant="h6">Financial Insights</Typography>
        </Stack>

        {insights.map((insight, index) => (
          <Box key={index} sx={{ 
            p: 1.5,
            bgcolor: 'background.default',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" gutterBottom>
              {insight.message}
            </Typography>
            <Button
              size="small"
              onClick={insight.action}
              sx={{ mt: 1 }}
            >
              {insight.actionText}
            </Button>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default FinancialInsights;

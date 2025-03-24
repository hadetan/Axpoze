import React, { useMemo } from 'react';
import { Paper, Typography, Box, CircularProgress, Stack } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useExpense } from '../../../contexts/ExpenseContext';
import { startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrency } from '../../../utils/currency';

const ExpenseBreakdown: React.FC = () => {
  const { expenses, categories, loading } = useExpense();

  const chartData = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    // Get current month's expenses
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= start && expDate <= end;
    });

    // Group by category
    const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
      const category = categories.find(c => c.id === expense.category_id);
      if (!category) return acc;

      if (!acc[category.id]) {
        acc[category.id] = {
          name: category.name,
          value: 0,
          color: category.color
        };
      }
      acc[category.id].value += expense.amount;
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);

    // Convert to array and sort by value
    return Object.values(categoryTotals)
      .sort((a, b) => b.value - a.value)
      .filter(item => item.value > 0); // Only show categories with expenses
  }, [expenses, categories]);

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const isSmallScreen = window.innerWidth < 600;
  const outerRadius = isSmallScreen ? 70 : 80;

  if (loading) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (chartData.length === 0) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          No expenses recorded this month
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: { xs: 1.5, sm: 2 }, 
      height: { xs: 350, sm: 400 } 
    }}>
      <Stack spacing={1}>
        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Expense Breakdown
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {formatCurrency(total)}
        </Typography>
      </Stack>
      
      <Box sx={{ 
        width: '100%', 
        height: { xs: 270, sm: 320 },
        mt: { xs: 1, sm: 2 } 
      }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={outerRadius}
              paddingAngle={2}
              label={({ name, percent }) => 
                window.innerWidth < 600 
                  ? `${(percent * 100).toFixed(0)}%`
                  : `${name} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke={entry.color}
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ExpenseBreakdown;

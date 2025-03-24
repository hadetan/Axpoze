import React, { useMemo } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useExpense } from '../../../contexts/ExpenseContext';
import { useSavings } from '../../../contexts/SavingsContext';
import { 
  startOfMonth, endOfMonth, subMonths, 
  format, isSameMonth, parseISO 
} from 'date-fns';
import { formatCurrency } from '../../../utils/currency';

const MonthlyTrends: React.FC = () => {
  const { expenses, loading: expenseLoading } = useExpense();
  const { history: savingsHistory, loading: savingsLoading } = useSavings();

  const chartData = useMemo(() => {
    // Get last 6 months including current month
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        date,
        month: format(date, 'MMM yyyy'),
        startDate: startOfMonth(date),
        endDate: endOfMonth(date)
      };
    }).reverse();

    return months.map(({ date, month, startDate, endDate }) => {
      // Calculate expenses for the month
      const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = parseISO(expense.date);
        return isSameMonth(expenseDate, date);
      }).reduce((sum, exp) => sum + exp.amount, 0);

      // Calculate savings contributions for the month
      const monthlySavings = Object.values(savingsHistory)
        .flat()
        .filter(contribution => {
          const contribDate = parseISO(contribution.date);
          return isSameMonth(contribDate, date);
        })
        .reduce((sum, contrib) => sum + contrib.amount, 0);

      // Calculate income (expenses + savings)
      const monthlyIncome = monthlyExpenses + monthlySavings;

      return {
        name: month,
        Income: monthlyIncome || 0,
        Expenses: monthlyExpenses || 0,
        Savings: monthlySavings || 0
      };
    });
  }, [expenses, savingsHistory]);

  if (expenseLoading || savingsLoading) {
    return (
      <Paper sx={{ 
        p: 2, 
        height: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
      </Paper>
    );
  }

  const hasData = chartData.some(data => 
    data.Income > 0 || data.Expenses > 0 || data.Savings > 0
  );

  if (!hasData) {
    return (
      <Paper sx={{ 
        p: 2, 
        height: 400, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography color="text.secondary">
          No data available for the last 6 months
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      p: { xs: 1.5, sm: 2 }, 
      height: { xs: 350, sm: 400 } 
    }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
      >
        Monthly Trends
      </Typography>
      <Box sx={{ 
        width: '100%', 
        height: { xs: 270, sm: 320 }
      }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ 
              top: 10, 
              right: 5, 
              left: -20, 
              bottom: 0 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={(value) => 
                window.innerWidth < 600 
                  ? `${(value / 1000)}k`
                  : `₹${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: '0.75rem',
                paddingTop: '10px' 
              }} 
            />
            <Area
              type="monotone"
              dataKey="Income"
              stackId="1"
              stroke="#4caf50"
              fill="#4caf5020"
            />
            <Area
              type="monotone"
              dataKey="Expenses"
              stackId="2"
              stroke="#f44336"
              fill="#f4433620"
            />
            <Area
              type="monotone"
              dataKey="Savings"
              stackId="3"
              stroke="#1976d2"
              fill="#1976d220"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default MonthlyTrends;

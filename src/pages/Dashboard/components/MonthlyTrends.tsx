import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MonthlyTrends: React.FC = () => {
  // Mock data - will be replaced with real data
  const data = [
    { month: 'Jan', income: 45000, expenses: 30000, savings: 15000 },
    { month: 'Feb', income: 48000, expenses: 32000, savings: 16000 },
    { month: 'Mar', income: 50000, expenses: 29000, savings: 21000 },
    { month: 'Apr', income: 47000, expenses: 28000, savings: 19000 },
    { month: 'May', income: 52000, expenses: 31000, savings: 21000 },
    { month: 'Jun', income: 49000, expenses: 30000, savings: 19000 },
  ];

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Monthly Trends
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#4caf50" 
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#f44336" 
              name="Expenses"
            />
            <Line 
              type="monotone" 
              dataKey="savings" 
              stroke="#2196f3" 
              name="Savings"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default MonthlyTrends;

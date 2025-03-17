import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ExpenseBreakdown: React.FC = () => {
  // Mock data - will be replaced with real data
  const data = [
    { name: 'Food', value: 12000, color: '#FF6384' },
    { name: 'Transport', value: 8000, color: '#36A2EB' },
    { name: 'Shopping', value: 5000, color: '#FFCE56' },
    { name: 'Bills', value: 4000, color: '#4BC0C0' },
    { name: 'Entertainment', value: 3000, color: '#9966FF' },
  ];

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Expense Breakdown
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `₹${value.toLocaleString()}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ExpenseBreakdown;

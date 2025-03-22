import React from 'react';
import {
  Paper, Typography, Box, Stack,
  LinearProgress, Tooltip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatCurrency } from '../../../utils/currency';

const MonthlyStats: React.FC = () => {
  // Mock data - replace with real data later
  const stats = {
    topCategory: { name: 'Food', amount: 12000, percentage: 40 },
    monthlyLimit: 30000,
    currentSpend: 24500,
    trend: 'up', // or 'down'
    changePercentage: 15
  };

  const spendPercentage = (stats.currentSpend / stats.monthlyLimit) * 100;
  const remaining = stats.monthlyLimit - stats.currentSpend;

  return (
    <Paper sx={{ p: 1.4, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Monthly Stats
      </Typography>

      <Stack spacing={2}>
        {/* Spending Progress */}
        <Box>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
            mb={0.5}
          >
            <Typography variant="body2" color="text.secondary">
              Monthly Spend
            </Typography>
            <Typography 
              variant="body2" 
              color={spendPercentage > 80 ? 'error.main' : 'success.main'}
            >
              {formatCurrency(remaining)} left
            </Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(spendPercentage, 100)}
            color={spendPercentage > 80 ? 'error' : 'primary'}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        {/* Top Category */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Top Category
          </Typography>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
          >
            <Typography variant="subtitle2">
              {stats.topCategory.name}
            </Typography>
            <Typography>
              {formatCurrency(stats.topCategory.amount)}
            </Typography>
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={stats.topCategory.percentage}
            sx={{ 
              height: 6, 
              borderRadius: 1,
              mt: 1,
              backgroundColor: 'primary.light'
            }}
          />
        </Box>

        {/* Month over Month Trend */}
        <Box sx={{ pt: 1 }}>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
          >
            <Typography variant="body2" color="text.secondary">
              vs Last Month
            </Typography>
            <Tooltip title="Month over month change">
              <Stack 
                direction="row" 
                spacing={0.5} 
                alignItems="center"
                sx={{ 
                  color: stats.trend === 'up' ? 'error.main' : 'success.main'
                }}
              >
                {stats.trend === 'up' ? (
                  <TrendingUpIcon fontSize="small" />
                ) : (
                  <TrendingDownIcon fontSize="small" />
                )}
                <Typography variant="body2">
                  {stats.changePercentage}%
                </Typography>
              </Stack>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default MonthlyStats;

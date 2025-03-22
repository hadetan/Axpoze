import React from 'react';
import {
  Box, Typography, Stack, Card,
  LinearProgress, Tooltip, Grid, IconButton,
  useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoIcon from '@mui/icons-material/Info';
import { formatCurrency } from '../../../utils/currency';
import { ISavingsHistory } from '../../../types/savings.types';
import ContributionChart from '../../../components/shared/ContributionChart';

interface ContributionSummaryProps {
  history: ISavingsHistory[];
  targetAmount: number;
  currentAmount: number;
}

const ContributionSummary: React.FC<ContributionSummaryProps> = ({
  history,
  targetAmount,
  currentAmount
}) => {
  const theme = useTheme();
  const totalContributions = history.reduce((sum, item) => sum + item.amount, 0);
  const progress = (currentAmount / targetAmount) * 100;
  const averageContribution = history.length > 0 ? totalContributions / history.length : 0;
  
  // Calculate monthly trends
  const monthlyContributions = getMonthlyContributions(history);
  const trend = calculateTrend(monthlyContributions);

  return (
    <Stack spacing={3}>
      {/* Progress Section */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Contribution Progress
          </Typography>
          <Typography variant="body2" color={progress >= 100 ? 'success.main' : 'text.secondary'}>
            {formatCurrency(currentAmount)} of {formatCurrency(targetAmount)}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          sx={{
            height: 8,
            borderRadius: 1,
            mb: 1,
            backgroundColor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              backgroundColor: progress >= 100 ? 'success.main' : 'primary.main',
            }
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {progress.toFixed(1)}% achieved
        </Typography>
      </Box>

      {/* Add Chart */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="subtitle2" gutterBottom>
          Progress Over Time
        </Typography>
        <ContributionChart 
          history={history}
          targetAmount={targetAmount}
        />
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Contributions"
            value={formatCurrency(totalContributions)}
            subtitle={`${history.length} contributions`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Contribution"
            value={formatCurrency(averageContribution)}
            subtitle="Per contribution"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Average"
            value={formatCurrency(calculateMonthlyAverage(history))}
            subtitle="Per month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Trend"
            value={
              <Stack direction="row" spacing={1} alignItems="center">
                {trend.direction === 'up' ? (
                  <TrendingUpIcon color="success" />
                ) : (
                  <TrendingDownIcon color="error" />
                )}
                <Typography variant="h6" color={trend.direction === 'up' ? 'success.main' : 'error.main'}>
                  {trend.percentage}%
                </Typography>
              </Stack>
            }
            subtitle="vs last month"
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => (
  <Card sx={{ p: 2, height: '100%' }}>
    <Stack spacing={1}>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {typeof value === 'string' ? (
          <Typography variant="h6">{value}</Typography>
        ) : (
          value
        )}
      </Box>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </Stack>
  </Card>
);

const getMonthlyContributions = (history: ISavingsHistory[]): Record<string, number> => {
  return history.reduce((acc, item) => {
    const monthYear = new Date(item.date).toISOString().slice(0, 7);
    acc[monthYear] = (acc[monthYear] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);
};

const calculateMonthlyAverage = (history: ISavingsHistory[]): number => {
  if (history.length === 0) return 0;
  const monthly = getMonthlyContributions(history);
  const total = Object.values(monthly).reduce((sum, amount) => sum + amount, 0);
  return total / Object.keys(monthly).length;
};

const calculateTrend = (monthlyContributions: Record<string, number>) => {
  const months = Object.keys(monthlyContributions).sort();
  if (months.length < 2) return { direction: 'up' as const, percentage: 0 };

  const currentMonth = monthlyContributions[months[months.length - 1]];
  const previousMonth = monthlyContributions[months[months.length - 2]];
  
  const percentageChange = ((currentMonth - previousMonth) / previousMonth) * 100;
  
  return {
    direction: percentageChange >= 0 ? 'up' as const : 'down' as const,
    percentage: Math.abs(percentageChange).toFixed(1)
  };
};

export default ContributionSummary;

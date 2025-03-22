import React from 'react';
import {
  Paper, Typography, Stack, Box,
  LinearProgress, Divider
} from '@mui/material';
import { useSavings } from '../../../contexts/SavingsContext';
import { formatCurrency } from '../../../utils/currency';

const SavingsOverview: React.FC = () => {
  const { goals } = useSavings();

  const totalSaved = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const byType = goals.reduce((acc, goal) => {
    acc[goal.type] = (acc[goal.type] || 0) + goal.current_amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Total Savings
          </Typography>
          <Typography variant="h4" color="primary.main">
            {formatCurrency(totalSaved)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            of {formatCurrency(totalTarget)} target
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{ mt: 1, height: 8, borderRadius: 1 }}
          />
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Breakdown by Type
          </Typography>
          <Stack spacing={2}>
            {Object.entries(byType).map(([type, amount]) => (
              <Box key={type}>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">{type}</Typography>
                  <Typography variant="body2">
                    {formatCurrency(amount)}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(amount / totalSaved) * 100}
                  sx={{ height: 4, borderRadius: 1 }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default SavingsOverview;

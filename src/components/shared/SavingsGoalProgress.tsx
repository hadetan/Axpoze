import React from 'react';
import { Box, Typography, Stack, Tooltip } from '@mui/material';
import { formatCurrency } from '../../utils/currency';
import { ISavingsGoal } from '../../types/savings.types';

interface SavingsGoalProgressProps {
  goal: ISavingsGoal;
}

const SavingsGoalProgress: React.FC<SavingsGoalProgressProps> = ({ goal }) => {
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const remaining = goal.target_amount - goal.current_amount;
  
  // Calculate time-based metrics if deadline exists
  const deadlineInfo = goal.deadline ? calculateDeadlineInfo(goal) : null;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={1}>
        {/* Progress Bar */}
        <Box sx={{ position: 'relative', height: 24, bgcolor: 'background.default', borderRadius: 2 }}>
          <Tooltip title={`${progress.toFixed(1)}% Complete`}>
            <Box
              sx={{
                position: 'absolute',
                height: '100%',
                width: `${Math.min(progress, 100)}%`,
                bgcolor: getProgressColor(progress),
                borderRadius: 2,
                transition: 'width 0.5s ease-in-out',
              }}
            />
          </Tooltip>
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: progress > 50 ? 'white' : 'text.primary',
              fontWeight: 'medium',
              zIndex: 1,
            }}
          >
            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
          </Box>
        </Box>

        {/* Stats */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
          spacing={2}
          sx={{ px: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            {remaining > 0 
              ? `${formatCurrency(remaining)} remaining`
              : 'Goal Achieved! 🎉'}
          </Typography>
          {deadlineInfo && (
            <Tooltip title={deadlineInfo.tooltip}>
              <Typography 
                variant="body2"
                color={deadlineInfo.isOnTrack ? 'success.main' : 'error.main'}
              >
                {deadlineInfo.message}
              </Typography>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

const getProgressColor = (progress: number) => {
  if (progress >= 100) return 'success.main';
  if (progress >= 75) return 'success.light';
  if (progress >= 50) return 'primary.main';
  if (progress >= 25) return 'warning.main';
  return 'error.light';
};

const calculateDeadlineInfo = (goal: ISavingsGoal) => {
  if (!goal.deadline) return null;

  const now = new Date();
  const deadline = new Date(goal.deadline);
  const createdAt = new Date(goal.created_at);
  
  // Calculate days properly
  const totalDays = Math.ceil(
    (deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const remainingDays = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const expectedProgress = ((totalDays - remainingDays) / totalDays) * 100;
  const actualProgress = (goal.current_amount / goal.target_amount) * 100;
  const isOnTrack = actualProgress >= expectedProgress;

  return {
    isOnTrack,
    message: remainingDays > 0 
      ? `${remainingDays} days left` 
      : 'Deadline passed',
    tooltip: isOnTrack 
      ? 'You are on track to meet your goal!'
      : 'You are falling behind your target',
  };
};

export default SavingsGoalProgress;

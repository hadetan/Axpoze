import React from 'react';
import {
  Paper, Box, Typography, Grid, LinearProgress,
  Card, Stack, Tooltip, Chip
} from '@mui/material';
import { 
  Timeline, TimelineItem, TimelineContent, 
  TimelineSeparator, TimelineDot, TimelineConnector 
} from '@mui/lab';
import { ISavingsMilestone } from '../../types/savings.types';
import { formatCurrency } from '../../utils/currency';
import { format, differenceInDays } from 'date-fns';

interface MilestoneAnalyticsProps {
  milestones: ISavingsMilestone[];
  currentAmount: number;
}

const MilestoneAnalytics: React.FC<MilestoneAnalyticsProps> = ({
  milestones,
  currentAmount
}) => {
  const achievedMilestones = milestones.filter(m => m.achieved);
  const pendingMilestones = milestones.filter(m => !m.achieved);
  const completionRate = (achievedMilestones.length / milestones.length) * 100;

  const calculateAverageCompletionTime = () => {
    if (achievedMilestones.length === 0) return null;
    
    const completionTimes = achievedMilestones.map(m => 
      differenceInDays(
        new Date(m.achieved_at!),
        new Date(m.created_at)
      )
    );
    
    return Math.round(
      completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
    );
  };

  const averageCompletionTime = calculateAverageCompletionTime();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Milestone Analytics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Completion Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Completion Rate
            </Typography>
            <Typography variant="h4" gutterBottom>
              {completionRate.toFixed(0)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={completionRate}
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Card>
        </Grid>

        {/* Average Time */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Avg. Completion Time
            </Typography>
            <Typography variant="h4">
              {averageCompletionTime ? `${averageCompletionTime}d` : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              days to achieve milestone
            </Typography>
          </Card>
        </Grid>

        {/* Progress Summary */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Progress
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                size="small" 
                color="success" 
                label={`${achievedMilestones.length} completed`}
              />
              <Chip 
                size="small" 
                color="warning" 
                label={`${pendingMilestones.length} pending`}
              />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Timeline */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Achievement Timeline
        </Typography>
        <Timeline position="right">
          {milestones
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((milestone, index) => (
              <TimelineItem key={milestone.id}>
                <TimelineSeparator>
                  <TimelineDot 
                    color={milestone.achieved ? 'success' : 'grey'}
                  />
                  {index < milestones.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">
                      {milestone.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Target: {formatCurrency(milestone.target_amount)}
                    </Typography>
                    {milestone.achieved && milestone.achieved_at && (
                      <Typography variant="caption" color="success.main">
                        Achieved on {format(new Date(milestone.achieved_at), 'MMM d, yyyy')}
                      </Typography>
                    )}
                    {milestone.deadline && !milestone.achieved && (
                      <Typography 
                        variant="caption" 
                        color={new Date() > new Date(milestone.deadline) ? 'error.main' : 'warning.main'}
                      >
                        Due by {format(new Date(milestone.deadline), 'MMM d, yyyy')}
                      </Typography>
                    )}
                  </Stack>
                </TimelineContent>
              </TimelineItem>
            ))}
        </Timeline>
      </Box>
    </Paper>
  );
};

export default MilestoneAnalytics;

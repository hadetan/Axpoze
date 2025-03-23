import React from 'react';
import {
  Card, CardContent, Typography, Box,
  LinearProgress, Stack, Chip, IconButton,
  Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import { formatCurrency } from '../../utils/currency';
import { ContributionStrategy } from '../../utils/savings';

interface ContributionSuggestionCardProps {
  strategy: ContributionStrategy;
  onSelect?: () => void;
  selected?: boolean;
}

const ContributionSuggestionCard: React.FC<ContributionSuggestionCardProps> = ({
  strategy,
  onSelect,
  selected
}) => {
  return (
    <Card
      sx={{
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.2s',
        transform: selected ? 'scale(1.02)' : 'none',
        border: theme => selected ? `2px solid ${theme.palette.primary.main}` : 'none',
        '&:hover': onSelect ? {
          transform: 'translateY(-4px)',
          boxShadow: 4
        } : {}
      }}
      onClick={onSelect}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary">
              {formatCurrency(strategy.amount)}
            </Typography>
            <Chip
              label={strategy.frequency}
              size="small"
              color={strategy.type === 'smart' ? 'success' : 'primary'}
              icon={strategy.type === 'smart' ? <SpeedIcon /> : <TrendingUpIcon />}
            />
          </Stack>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Confidence Score
              </Typography>
              <Tooltip title="Based on historical patterns and deadlines">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={strategy.confidence * 100}
              sx={{
                height: 6,
                borderRadius: 1,
                bgcolor: 'background.default',
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme => 
                    strategy.confidence > 0.8 ? 'success.main' :
                    strategy.confidence > 0.6 ? 'warning.main' :
                    'error.main'
                }
              }}
            />
          </Box>

          {strategy.description && (
            <Typography variant="body2" color="text.secondary">
              {strategy.description}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ContributionSuggestionCard;

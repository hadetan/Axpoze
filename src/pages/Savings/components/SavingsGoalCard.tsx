import React from 'react';
import { Card, IconButton, LinearProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { colors } from '../../../theme/colors';

interface SavingsGoalCardProps {
  goal: any;
  onEdit: (goal: any) => void;
  onDelete: (goal: any) => void;
}

const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({ goal, onEdit, onDelete }) => {
  const progress = (goal.current_amount / goal.target_amount) * 100;

  return (
    <Card>
      <IconButton
        size="small"
        onClick={() => onEdit(goal)}
        sx={{ 
          color: colors.primary.main,
          '&:hover': {
            bgcolor: colors.primary.alpha[8]
          }
        }}
      >
        <EditIcon />
      </IconButton>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: colors.primary.alpha[12],
          '& .MuiLinearProgress-bar': {
            bgcolor: colors.primary.main
          }
        }}
      />
    </Card>
  );
};

export default SavingsGoalCard;
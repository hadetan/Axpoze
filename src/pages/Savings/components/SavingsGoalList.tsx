import React from 'react';
import {
  Paper, Typography, Box, Grid, Skeleton,
  LinearProgress, IconButton, Stack, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ISavingsGoal } from '../../../types/savings.types';
import { formatCurrency } from '../../../utils/currency';
import { useSavings } from '../../../contexts/SavingsContext';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import SavingsGoalProgress from '../../../components/shared/SavingsGoalProgress';
import SavingsHistory from './SavingsHistory';

interface SavingsGoalListProps {
  goals: ISavingsGoal[];
  loading: boolean;
  onEdit: (goal: ISavingsGoal) => void;
}

const SavingsGoalList: React.FC<SavingsGoalListProps> = ({ goals, loading, onEdit }) => {
  const { deleteGoal } = useSavings();
  const [deleteConfirm, setDeleteConfirm] = React.useState<ISavingsGoal | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setDeleteLoading(true);
    try {
      await deleteGoal(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3].map((n) => (
          <Grid item xs={12} key={n}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (goals.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography color="text.secondary" gutterBottom>
          No savings goals yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start by adding your first savings goal
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={2}>
        {goals.map((goal) => (
          <Grid item xs={12} key={goal.id}>
            <Paper
              sx={{
                p: 2,
                borderLeft: 6,
                borderColor: (theme) => {
                  switch (goal.priority) {
                    case 'High': return theme.palette.error.main;
                    case 'Medium': return theme.palette.warning.main;
                    default: return theme.palette.info.main;
                  }
                }
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography variant="h6">{goal.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {goal.type}
                      {goal.deadline && ` · Due by ${new Date(goal.deadline).toLocaleDateString()}`}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      size="small"
                      onClick={() => onEdit(goal)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => setDeleteConfirm(goal)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>

                <SavingsGoalProgress goal={goal} />

                {goal.notes && (
                  <Typography variant="body2" color="text.secondary">
                    {goal.notes}
                  </Typography>
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <SavingsHistory goal={goal} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Savings Goal"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteLoading}
        type="danger"
      />
    </>
  );
};

export default SavingsGoalList;

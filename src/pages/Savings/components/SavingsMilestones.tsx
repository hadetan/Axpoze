import React, { useState } from 'react';
import {
  Box, Stack, Typography, LinearProgress, 
  Button, IconButton, Card, Tooltip,
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid
} from '@mui/material';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatCurrency } from '../../../utils/currency';
import { ISavingsGoal, ISavingsHistory, ISavingsMilestone, ISavingsMilestoneFormData } from '../../../types/savings.types';
import { calculateRequiredContribution, ContributionStrategy } from '../../../utils/savings';
import ContributionSuggestionCard from '../../../components/shared/ContributionSuggestionCard';

interface SavingsMilestonesProps {
  goal: ISavingsGoal;
  milestones: ISavingsMilestone[];
  history: ISavingsHistory[]; // Add this prop
  onAddMilestone: (data: ISavingsMilestoneFormData) => Promise<void>;
  onUpdateMilestone: (id: string, data: ISavingsMilestoneFormData) => Promise<void>;
  onDeleteMilestone: (id: string) => Promise<void>;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .max(50, 'Title is too long'),
  target_amount: Yup.number()
    .required('Target amount is required')
    .min(1, 'Must be greater than 0')
    .max(Yup.ref('$goalAmount'), 'Cannot exceed goal amount')
    .test('is-number', 'Must be a valid number', value => 
      !isNaN(value) && value !== null && value !== undefined
    ),
  deadline: Yup.date()
    .min(new Date(), 'Must be in the future')
    .nullable(),
  description: Yup.string()
    .max(200, 'Description is too long'),
});

const SavingsMilestones: React.FC<SavingsMilestonesProps> = ({
  goal,
  milestones,
  history, // Add this prop
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ISavingsMilestone | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSubmit = async (values: ISavingsMilestoneFormData) => {
    try {
      if (editingMilestone) {
        await onUpdateMilestone(editingMilestone.id, values);
      } else {
        await onAddMilestone(values);
      }
      setOpenModal(false);
      setEditingMilestone(null);
    } catch (error) {
      console.error('Failed to save milestone:', error);
    }
  };

  const formik = useFormik<ISavingsMilestoneFormData>({
    initialValues: {
      title: '',
      target_amount: 1, // Change initial value to 1 instead of 0
      deadline: undefined,
      description: ''
    },
    validationSchema: validationSchema.shape({
      target_amount: Yup.number()
        .max(goal.target_amount, `Cannot exceed goal amount of ${formatCurrency(goal.target_amount)}`)
        .min(1, 'Must be greater than 0')
    }),
    onSubmit: handleSubmit
  });

  const sortedMilestones = [...milestones].sort((a, b) => a.target_amount - b.target_amount);

  const getMilestoneSuggestion = (milestone: ISavingsMilestone): ContributionStrategy[] | null => {
    if (milestone.achieved) return null;

    const remaining = milestone.target_amount - goal.current_amount;
    if (remaining <= 0) return null;

    const daysRemaining = milestone.deadline
      ? Math.ceil((new Date(milestone.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const suggestions = calculateRequiredContribution(remaining, daysRemaining, history);
    return suggestions.length > 0 ? suggestions : null;
  };

  const handleEdit = (milestone: ISavingsMilestone) => {
    setEditingMilestone(milestone);
    setOpenModal(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setDeleteLoading(true);
    try {
      await onDeleteMilestone(deleteConfirm);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const suggestMilestones = () => {
    const targetAmount = goal.target_amount;
    return [
      { title: "First 25%", amount: targetAmount * 0.25 },
      { title: "Halfway there!", amount: targetAmount * 0.5 },
      { title: "75% Complete", amount: targetAmount * 0.75 },
      { title: "Almost there (90%)", amount: targetAmount * 0.9 },
      { title: "Goal achieved!", amount: targetAmount }
    ];
  };

  const calculateProgress = (milestone: ISavingsMilestone) => {
    const currentProgress = (goal.current_amount / milestone.target_amount) * 100;
    return {
      percentage: Math.min(currentProgress, 100),
      amount: goal.current_amount,
      remaining: Math.max(milestone.target_amount - goal.current_amount, 0)
    };
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Progress Milestones</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          size="small"
          variant="outlined"
        >
          Set Custom Milestone
        </Button>
      </Stack>

      {milestones.length === 0 && (
        <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            No milestones set yet
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Track your progress by setting milestone targets
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Suggested milestones:
            </Typography>
            <Grid container spacing={2}>
              {suggestMilestones().map((suggestion, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">{suggestion.title}</Typography>
                      <Typography color="text.secondary">
                        Target: {formatCurrency(suggestion.amount)}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          onAddMilestone({
                            title: suggestion.title,
                            target_amount: suggestion.amount,
                            description: `${((suggestion.amount / goal.target_amount) * 100).toFixed(0)}% of goal`
                          });
                        }}
                      >
                        Add This Milestone
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      <Stack spacing={2}>
        {sortedMilestones.map((milestone) => (
          <Card
            key={milestone.id}
            sx={{
              p: 2,
              bgcolor: milestone.achieved ? 'success.light' : 'background.paper',
              position: 'relative',
            }}
          >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">{milestone.title}</Typography>
                  {milestone.achieved && (
                    <Tooltip title="Achieved">
                      <CheckCircleIcon color="success" />
                    </Tooltip>
                  )}
                </Stack>

                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Target: {formatCurrency(milestone.target_amount)}
                  </Typography>
                  {milestone.deadline && (
                    <Typography variant="caption" color="text.secondary">
                      Due by {new Date(milestone.deadline).toLocaleDateString()}
                    </Typography>
                  )}
                </Stack>

                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Current: {formatCurrency(goal.current_amount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Target: {formatCurrency(milestone.target_amount)}
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(milestone).percentage}
                    sx={{ height: 8, borderRadius: 1 }}
                  />

                  <Stack direction="row" justifyContent="space-between" mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Progress: {calculateProgress(milestone).percentage.toFixed(1)}%
                    </Typography>
                    {!milestone.achieved && (
                      <Typography variant="body2" color="text.secondary">
                        Remaining: {formatCurrency(calculateProgress(milestone).remaining)}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {milestone.description && (
                  <Typography variant="body2" color="text.secondary">
                    {milestone.description}
                  </Typography>
                )}

                {!milestone.achieved && (
                  <>
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <InfoIcon color="info" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          {(() => {
                            const suggestions = getMilestoneSuggestion(milestone);
                            if (!suggestions || suggestions.length === 0) return null;

                            const bestSuggestion = suggestions[0];
                            return formatCurrency(bestSuggestion.amount) + 
                                   (bestSuggestion.frequency ? ` ${bestSuggestion.frequency}` : '');
                          })()}
                        </Typography>
                      </Stack>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Suggested Contributions
                      </Typography>
                      <Grid container spacing={2}>
                        {(() => {
                          const suggestions = getMilestoneSuggestion(milestone);
                          if (!suggestions || suggestions.length === 0) return null;

                          return suggestions.map((strategy, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <ContributionSuggestionCard
                                strategy={strategy}
                                onSelect={() => {
                                  console.log('Selected strategy:', strategy);
                                }}
                              />
                            </Grid>
                          ));
                        })()}
                      </Grid>
                    </Box>
                  </>
                )}
              </Stack>

              <Stack direction="row" spacing={1} sx={{ p: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(milestone)}
                  disabled={milestone.achieved}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setDeleteConfirm(milestone.id)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Card>
        ))}

        {milestones.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography color="text.secondary">
              No milestones set yet
            </Typography>
          </Box>
        )}
      </Stack>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />

              <TextField
                fullWidth
                label="Target Amount"
                name="target_amount"
                type="number"
                value={formik.values.target_amount}
                onChange={formik.handleChange}
                error={formik.touched.target_amount && Boolean(formik.errors.target_amount)}
                helperText={formik.touched.target_amount && formik.errors.target_amount}
              />

              <TextField
                fullWidth
                label="Deadline (Optional)"
                name="deadline"
                type="date"
                value={formik.values.deadline || ''}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
                error={formik.touched.deadline && Boolean(formik.errors.deadline)}
                helperText={formik.touched.deadline && formik.errors.deadline}
              />

              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Milestone</Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Milestone"
        message="Are you sure you want to delete this milestone? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteLoading}
        type="danger"
      />
    </Box>
  );
};

export default SavingsMilestones;

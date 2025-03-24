import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, MenuItem, Box, InputAdornment, Typography, LinearProgress
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSavings } from '../../../contexts/SavingsContext';
import { ISavingsFormData, SavingType, ISavingsGoal } from '../../../types/savings.types';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import { parseCurrency, formatCurrency } from '../../../utils/currency';
import { colors } from '../../../theme/colors';

interface AddSavingsGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal?: ISavingsGoal | null;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Goal name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must not exceed 50 characters'),
  target_amount: Yup.number()
    .required('Target amount is required')
    .min(1, 'Amount must be greater than 0')
    .max(999999999, 'Amount is too large'),
  current_amount: Yup.number()
    .required('Current amount is required')
    .min(0, 'Amount cannot be negative')
    .test('max', 'Cannot exceed target amount', function(value) {
      return value <= this.parent.target_amount;
    }),
  type: Yup.string()
    .required('Type is required')
    .oneOf(['Emergency', 'Investment', 'Goal'] as SavingType[]),
  priority: Yup.string()
    .required('Priority is required')
    .oneOf(['High', 'Medium', 'Low']),
  deadline: Yup.date()
    .min(new Date(), 'Deadline must be in the future')
    .nullable(),
  notes: Yup.string()
    .max(200, 'Notes must not exceed 200 characters'),
});

const AddSavingsGoalModal: React.FC<AddSavingsGoalModalProps> = ({ open, onClose, goal }) => {
  const [error, setError] = useState<string | null>(null);
  const { addGoal, updateGoal } = useSavings();

  const formik = useFormik<ISavingsFormData>({
    initialValues: goal ? {
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      type: goal.type,
      priority: goal.priority,
      deadline: goal.deadline,
      notes: goal.notes || '',
    } : {
      name: '',
      target_amount: 0,
      current_amount: 0,
      type: 'Goal',
      priority: 'Medium',
      deadline: undefined,
      notes: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setError(null);
        if (goal) {
          await updateGoal(goal.id, values);
        } else {
          await addGoal(values);
        }
        resetForm();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to save savings goal');
        setSubmitting(false);
      }
    },
  });

  const handleAmountChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseCurrency(e.target.value);
    formik.setFieldValue(field, value);
  };

  const calculateMonthlyTarget = (total: number, deadline?: string) => {
    if (!deadline) return null;
    const months = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    return months > 0 ? total / months : total;
  };

  const monthlyAmount = calculateMonthlyTarget(
    formik.values.target_amount - formik.values.current_amount,
    formik.values.deadline
  );

  return (
    <Dialog 
      open={open} 
      onClose={() => !formik.isSubmitting && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {goal ? 'Edit Savings Goal' : 'Add New Savings Goal'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <ErrorAlert
                error={error}
                onClose={() => setError(null)}
              />
            )}

            <TextField
              fullWidth
              label="Goal Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={formik.isSubmitting}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Target Amount"
                name="target_amount"
                value={formik.values.target_amount || ''}
                onChange={handleAmountChange('target_amount')}
                error={formik.touched.target_amount && Boolean(formik.errors.target_amount)}
                helperText={formik.touched.target_amount && formik.errors.target_amount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      ₹
                    </InputAdornment>
                  ),
                }}
                disabled={formik.isSubmitting}
              />

              <TextField
                fullWidth
                label="Current Amount"
                name="current_amount"
                value={formik.values.current_amount || ''}
                onChange={handleAmountChange('current_amount')}
                error={formik.touched.current_amount && Boolean(formik.errors.current_amount)}
                helperText={formik.touched.current_amount && formik.errors.current_amount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      ₹
                    </InputAdornment>
                  ),
                }}
                disabled={formik.isSubmitting}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Goal Type"
                name="type"
                value={formik.values.type}
                onChange={formik.handleChange}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
                disabled={formik.isSubmitting}
              >
                <MenuItem value="Emergency">Emergency Fund</MenuItem>
                <MenuItem value="Investment">Investment</MenuItem>
                <MenuItem value="Goal">Specific Goal</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                label="Priority"
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                error={formik.touched.priority && Boolean(formik.errors.priority)}
                helperText={formik.touched.priority && formik.errors.priority}
                disabled={formik.isSubmitting}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </TextField>
            </Stack>

            <TextField
              fullWidth
              type="date"
              label="Target Date (Optional)"
              name="deadline"
              value={formik.values.deadline || ''}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
              error={formik.touched.deadline && Boolean(formik.errors.deadline)}
              helperText={
                (formik.touched.deadline && formik.errors.deadline) ||
                (monthlyAmount && `Monthly savings needed: ${formatCurrency(monthlyAmount)}`)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarTodayIcon color={formik.errors.deadline ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                inputProps: {
                  min: new Date().toISOString().split('T')[0]
                }
              }}
              disabled={formik.isSubmitting}
            />

            {formik.values.target_amount > 0 && (
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Progress Preview
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(formik.values.current_amount / formik.values.target_amount) * 100}
                  sx={{ height: 8, borderRadius: 1, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(formik.values.current_amount)} of {formatCurrency(formik.values.target_amount)}
                  {' '}({((formik.values.current_amount / formik.values.target_amount) * 100).toFixed(1)}%)
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (Optional)"
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
              disabled={formik.isSubmitting}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onClose}
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={formik.isSubmitting}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            sx={{ 
              bgcolor: colors.primary.main,
              '&:hover': {
                bgcolor: colors.primary.dark
              }
            }}
          >
            {goal ? 'Update Goal' : 'Create Goal'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddSavingsGoalModal;

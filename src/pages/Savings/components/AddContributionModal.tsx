import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ISavingsHistoryFormData } from '../../../types/savings.types';

interface AddContributionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ISavingsHistoryFormData) => Promise<void>;
  loading?: boolean;
}

const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .min(1, 'Amount must be positive'),
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Cannot be in the future'),
  notes: Yup.string()
    .max(200, 'Notes too long')
});

const AddContributionModal: React.FC<AddContributionModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading
}) => {
  const formik = useFormik<ISavingsHistoryFormData>({
    initialValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
      onClose();
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Add Contribution</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              name="amount"
              label="Amount"
              type="number"
              value={formik.values.amount}
              onChange={formik.handleChange}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
            />
            
            <TextField
              fullWidth
              name="date"
              label="Date"
              type="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              name="notes"
              label="Notes (Optional)"
              multiline
              rows={3}
              value={formik.values.notes}
              onChange={formik.handleChange}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton 
            loading={loading}
            type="submit"
            variant="contained"
          >
            Add Contribution
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddContributionModal;

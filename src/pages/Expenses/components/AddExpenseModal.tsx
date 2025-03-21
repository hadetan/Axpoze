import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Stack, InputAdornment, Box
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import { useFormik, FormikState } from 'formik';
import * as Yup from 'yup';
import { useExpense } from '../../../contexts/ExpenseContext';
import { IExpenseFormData, PaymentMode, IExpense } from '../../../types/expense.types';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import { currencySymbol, parseCurrency } from '../../../utils/currency';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expense?: IExpense | null;
}

const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .min(1, 'Amount must be greater than 0')
    .test('maxDigits', 'Amount cannot exceed 999,999,999', (value) => {
      if (!value) return true;
      return value <= 999999999;
    })
    .typeError('Please enter a valid amount'),
  category_id: Yup.string()
    .required('Please select a category'),
  description: Yup.string()
    .required('Description is required')
    .min(3, 'Description must be at least 3 characters')
    .max(200, 'Description must not exceed 200 characters')
    .matches(/^[a-zA-Z0-9\s,.!?-]+$/, 'Description contains invalid characters'),
  date: Yup.string()
    .required('Date is required')
    .test('not-future', 'Date cannot be in the future', (value) => {
      if (!value) return true;
      return new Date(value) <= new Date();
    })
    .test('not-too-old', 'Date cannot be older than 1 year', (value) => {
      if (!value) return true;
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return new Date(value) >= oneYearAgo;
    }),
  payment_mode: Yup.string()
    .required('Please select a payment mode')
    .oneOf(['Cash', 'Card', 'UPI', 'Other'], 'Invalid payment mode'),
});

const PAYMENT_MODES: { value: PaymentMode; label: string; icon: string }[] = [
  { value: 'Cash', label: 'Cash', icon: '💵' },
  { value: 'Card', label: 'Card', icon: '💳' },
  { value: 'UPI', label: 'UPI', icon: '📱' },
  { value: 'Other', label: 'Other', icon: '💰' },
];

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ open, onClose, expense }) => {
  const amountInputRef = useRef<HTMLInputElement>(null);
  const { categories, addExpense, updateExpense } = useExpense();
  const [error, setError] = useState<string | null>(null);

  const initialValues: IExpenseFormData = {
    amount: 0,
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_mode: 'Cash',
  };

  const formik = useFormik<IExpenseFormData>({
    initialValues: expense ? {
      amount: expense.amount,
      category_id: expense.category_id,
      description: expense.description,
      date: expense.date,
      payment_mode: expense.payment_mode,
    } : initialValues,
    enableReinitialize: true,
    validationSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm, setSubmitting, setFieldError }) => {
      try {
        setError(null);
        if (expense) {
          await updateExpense(expense.id, values);
        } else {
          await addExpense(values);
        }
        
        // Show success feedback before closing
        setTimeout(() => {
          handleResetAndClose(resetForm);
        }, 500);

      } catch (err: any) {
        if (err.message.includes('category')) {
          setFieldError('category_id', err.message);
        } else if (err.message.includes('amount')) {
          setFieldError('amount', err.message);
        } else {
          setError(err.message || 'Failed to add expense');
        }
        setSubmitting(false);
      }
    },
  });

  const handleResetAndClose = (resetForm?: (nextState?: Partial<FormikState<IExpenseFormData>>) => void) => {
    setError(null);
    
    // Reset with fresh initial values
    if (resetForm) {
      resetForm({
        values: {
          ...initialValues,
          date: new Date().toISOString().split('T')[0], // Always use current date
        }
      });
    }

    // Reset touched and error states
    formik.setTouched({});
    formik.setErrors({});
    
    // Ensure parent components are notified after state is updated
    setTimeout(() => {
      onClose();
    }, 0);
  };

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!open) {
      handleResetAndClose(formik.resetForm);
    }
  }, [open]);

  // Focus amount field when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        amountInputRef.current?.focus();
        // Select any existing text
        amountInputRef.current?.select();
      }, 100);
    }
  }, [open]);

  const handleClose = () => {
    // Prevent closing while submitting
    if (formik.isSubmitting) return;
    handleResetAndClose(formik.resetForm);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseCurrency(rawValue);
    formik.setFieldValue('amount', numericValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={(event, reason) => {
        // Prevent closing by backdrop click during submission
        if (formik.isSubmitting && reason === "backdropClick") return;
        handleClose();
      }}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          minHeight: '60vh',
          maxHeight: '90vh'
        }
      }}
      // Prevent closing by clicking outside while submitting
      disableEscapeKeyDown={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <DialogTitle 
          sx={{ 
            pb: 2,
            pt: 3,
            px: 3,
            borderBottom: 1,
            borderColor: 'divider',
            typography: 'h6'
          }}
        >
          {expense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Stack spacing={3}>
            <ErrorAlert
              error={error}
              onClose={() => setError(null)}
              title="Failed to Add Expense"
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                name="amount"
                label="Amount"
                type="text"
                value={formik.values.amount || ''}
                onChange={handleAmountChange}
                onBlur={formik.handleBlur}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {currencySymbol}
                    </InputAdornment>
                  ),
                  inputMode: 'numeric'
                }}
                inputProps={{
                  pattern: '[0-9]*'
                }}
                inputRef={amountInputRef}
                autoFocus={false} // Remove autoFocus prop as we're handling it with ref
                onFocus={(e) => e.target.select()} // Select text when focused
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                    }
                  }
                }}
                disabled={formik.isSubmitting}
              />
              
              <TextField
                fullWidth
                select
                name="category_id"
                label="Category"
                value={formik.values.category_id}
                onChange={formik.handleChange}
                error={formik.touched.category_id && Boolean(formik.errors.category_id)}
                helperText={formik.touched.category_id && formik.errors.category_id}
                sx={{ flex: 1 }}
                disabled={formik.isSubmitting}
              >
                {categories.map((category) => (
                  <MenuItem 
                    key={category.id} 
                    value={category.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: category.color,
                        border: 1,
                        borderColor: `${category.color}50`
                      }}
                    />
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              fullWidth
              name="description"
              label="Description"
              placeholder="Enter expense details"
              multiline
              minRows={3}
              maxRows={5}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={
                (formik.touched.description && formik.errors.description) ||
                `${formik.values.description.length}/200 characters`
              }
              InputProps={{
                sx: {
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
              sx={{
                '& .MuiFormHelperText-root': {
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 1,
                  mx: 0
                },
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }
              }}
              disabled={formik.isSubmitting}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="date"
                name="date"
                label="Date"
                value={formik.values.date}
                onChange={formik.handleChange}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={
                  (formik.touched.date && formik.errors.date) ||
                  format(new Date(formik.values.date), 'EEEE, MMMM d, yyyy')
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  flex: 1,
                  '& .MuiFormHelperText-root': {
                    mx: 0,
                    mt: 1,
                    color: theme => 
                      formik.touched.date && formik.errors.date 
                        ? 'error.main' 
                        : 'text.secondary'
                  }
                }}
                disabled={formik.isSubmitting}
              />

              <TextField
                fullWidth
                select
                name="payment_mode"
                label="Payment Mode"
                value={formik.values.payment_mode}
                onChange={formik.handleChange}
                error={formik.touched.payment_mode && Boolean(formik.errors.payment_mode)}
                helperText={formik.touched.payment_mode && formik.errors.payment_mode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaymentIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1 }}
                disabled={formik.isSubmitting}
              >
                {PAYMENT_MODES.map(mode => (
                  <MenuItem 
                    key={mode.value} 
                    value={mode.value}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1
                    }}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        fontSize: '1.2rem',
                        width: 24,
                        textAlign: 'center'
                      }}
                    >
                      {mode.icon}
                    </Box>
                    {mode.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3, 
            py: 2.5,
            borderTop: 1,
            borderColor: 'divider',
            gap: 1
          }}
        >
          <Button 
            onClick={handleClose} 
            disabled={formik.isSubmitting}
            color="inherit"
            sx={{
              minWidth: 100,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            Cancel
          </Button>
          <LoadingButton 
            type="submit"
            variant="contained"
            loading={formik.isSubmitting}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
            sx={{
              minWidth: 120,
              px: 3
            }}
          >
            {formik.isSubmitting ? 'Saving...' : expense ? 'Update Expense' : 'Save Expense'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddExpenseModal;

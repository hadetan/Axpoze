import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Box, Typography,
  IconButton, Tooltip
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { IExpenseCategory } from '../../../types/expense.types';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import { categoryService } from '../../../services/category.service';
import { useAuth } from '../../../contexts/AuthContext';
import { useExpense } from '../../../contexts/ExpenseContext';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  category?: IExpenseCategory | null;
  onError?: (error: string) => void;  // Add this prop
}

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
  '#E67E22', '#1ABC9C', '#F1C40F', '#34495E'
];

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Category name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(20, 'Name must not exceed 20 characters')
    .matches(/^[a-zA-Z0-9\s&-]+$/, 'Name contains invalid characters'),
  color: Yup.string()
    .required('Color is required')
    .matches(/^#([A-Fa-f0-9]{6})$/, 'Invalid color format'),
});

const CategoryModal: React.FC<CategoryModalProps> = ({ 
  open, 
  onClose, 
  category,
  onError 
}) => {
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  const { fetchExpenses } = useExpense();

  const generateRandomColor = () => {
    const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    formik.setFieldValue('color', randomColor);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);  // Call onError if provided
  };

  const formik = useFormik({
    initialValues: {
      name: category?.name || '',
      color: category?.color || PRESET_COLORS[0],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (!authState.user?.id) return;

      try {
        setError(null);
        
        if (category) {
          await categoryService.updateCategory(category.id, values);
        } else {
          await categoryService.createCategory(values, authState.user.id);
        }
        
        // Refresh the categories list
        await fetchExpenses();
        
        resetForm();
        onClose();
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to save category';
        handleError(errorMessage);
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm();
      setError(null);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={() => !formik.isSubmitting && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {category ? 'Edit Category' : 'Add New Category'}
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
              name="name"
              label="Category Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={formik.isSubmitting}
            />

            <Box>
              <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category Color
                </Typography>
                <Tooltip title="Generate random color">
                  <IconButton 
                    size="small" 
                    onClick={generateRandomColor}
                    disabled={formik.isSubmitting}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {PRESET_COLORS.map((color) => (
                  <Box
                    key={color}
                    onClick={() => !formik.isSubmitting && formik.setFieldValue('color', color)}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      backgroundColor: color,
                      cursor: formik.isSubmitting ? 'not-allowed' : 'pointer',
                      border: theme => `2px solid ${
                        formik.values.color === color 
                          ? theme.palette.primary.main
                          : 'transparent'
                      }`,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Box sx={{ 
              p: 2, 
              borderRadius: 1,
              bgcolor: 'background.default',
              border: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview
              </Typography>
              <Box sx={{ 
                p: 2,
                borderRadius: 1,
                bgcolor: `${formik.values.color}15`,
                border: 1,
                borderColor: `${formik.values.color}30`,
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: formik.values.color,
                    }}
                  />
                  <Typography>
                    {formik.values.name || 'Category Name'}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
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
            disabled={!formik.isValid || !formik.dirty}
          >
            {category ? 'Update Category' : 'Add Category'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryModal;

import React, { useState } from 'react';
import {
  Paper, Typography, List, ListItem, ListItemText,
  IconButton, Button, Box, Stack, Dialog,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryModal from './CategoryModal';
import { useExpense } from '../../../contexts/ExpenseContext';
import { IExpenseCategory } from '../../../types/expense.types';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import { categoryService } from '../../../services/category.service';
import ErrorAlert from '../../../components/shared/ErrorAlert';
import { colors } from '../../../theme/colors';

interface CategorySettingsState {
  openModal: boolean;
  editingCategory: IExpenseCategory | null;
  deleteConfirm: string | null;
  deleteLoading: boolean;
  error: string | null;
}

const CategorySettings: React.FC = () => {
  const theme = useTheme();
  const { categories, fetchExpenses } = useExpense();
  const [openModal, setOpenModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IExpenseCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out Uncategorized category from display
  const visibleCategories = categories.filter(category => category.name !== 'Uncategorized');

  const handleEdit = (category: IExpenseCategory) => {
    setEditingCategory(category);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingCategory(null);
  };

  const handleDelete = (categoryId: string) => {
    setDeleteConfirm(categoryId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    setDeleteLoading(true);
    try {
      // Check if trying to delete Uncategorized
      const categoryToDelete = categories.find(c => c.id === deleteConfirm);
      if (categoryToDelete?.name === 'Uncategorized') {
        throw new Error('Cannot delete the Uncategorized category');
      }

      await categoryService.deleteCategory(deleteConfirm);
      await fetchExpenses(); // Refresh categories and expenses
      setDeleteConfirm(null);
    } catch (error: any) {
      setError(error.message || 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleError = (error: string) => {
    setError(error);
  };

  const handleModalError = (error: string) => {
    setError(error);
  };

  return (
    <>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        {error && (
          <ErrorAlert
            error={error}
            onClose={() => setError(null)}
            onError={handleError}
          />
        )}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          justifyContent="space-between" 
          mb={3}
          spacing={2}
        >
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                color: colors.primary.main,
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Expense Categories
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ textAlign: { xs: 'center', sm: 'left' } }}
            >
              Manage your expense categories and their colors
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ 
              bgcolor: colors.primary.main,
              '&:hover': {
                bgcolor: colors.primary.dark
              },
              minHeight: { xs: 45, sm: 'auto' },
              alignSelf: { xs: 'stretch', sm: 'auto' }
            }}
          >
            Add Category
          </Button>
        </Stack>

        <List sx={{ 
          mx: { xs: -2, sm: 0 },  // Negative margin on mobile to extend list items
          px: { xs: 2, sm: 0 } 
        }}>
          {visibleCategories.map((category) => (
            <ListItem
              key={category.id}
              sx={{
                borderRadius: { xs: 0, sm: 1 }, // No border radius on mobile
                mb: 1,
                border: 1,
                borderColor: 'divider',
                px: { xs: 2, sm: 3 },
                py: { xs: 2, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 },
                '&:hover': {
                  bgcolor: colors.primary.alpha[8],
                }
              }}
            >
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={2}
                width="100%"
              >
                <Box
                  sx={{
                    width: { xs: 32, sm: 24 },
                    height: { xs: 32, sm: 24 },
                    borderRadius: '50%',
                    backgroundColor: category.color,
                    border: 1,
                    borderColor: `${category.color}50`,
                  }}
                />
                <ListItemText 
                  primary={
                    <Typography variant="subtitle2">
                      {category.name}
                    </Typography>
                  }
                  secondary={category.color}
                  sx={{
                    m: 0,
                    flex: 1
                  }}
                />
                <Stack 
                  direction="row" 
                  spacing={1}
                  sx={{
                    mt: { xs: 1, sm: 0 }
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(category)}
                    sx={{ 
                      color: colors.primary.main,
                      '&:hover': {
                        bgcolor: colors.primary.alpha[12]
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(category.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </ListItem>
          ))}
        </List>

        {visibleCategories.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 6, sm: 8 },
              px: { xs: 2, sm: 3 },
              backgroundColor: 'action.hover',
              borderRadius: { xs: 0, sm: 1 },
              mx: { xs: -2, sm: 0 }
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              No categories found
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{ 
                mt: 2,
                minHeight: { xs: 45, sm: 'auto' },
                minWidth: { xs: '100%', sm: 'auto' }
              }}
            >
              Add Your First Category
            </Button>
          </Box>
        )}
      </Paper>

      <CategoryModal
        open={openModal}
        onClose={handleCloseModal}
        category={editingCategory}
        onError={handleModalError}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? All expenses in this category will be set to uncategorized."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteLoading}
        type="danger"
        onError={handleError}
      />
    </>
  );
};

export default CategorySettings;

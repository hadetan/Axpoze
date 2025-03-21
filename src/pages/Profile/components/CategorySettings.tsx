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
      <Paper sx={{ p: 3 }}>
        {error && (
          <ErrorAlert
            error={error}
            onClose={() => setError(null)}
            onError={handleError}
          />
        )}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Expense Categories
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your expense categories and their colors
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Category
          </Button>
        </Stack>

        <List>
          {visibleCategories.map((category) => (
            <ListItem
              key={category.id}
              sx={{
                borderRadius: 1,
                mb: 1,
                border: 1,
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: category.color,
                  mr: 2,
                  border: 1,
                  borderColor: `${category.color}50`,
                }}
              />
              <ListItemText 
                primary={category.name}
                secondary={`${category.color}`}
              />
              <IconButton
                size="small"
                onClick={() => handleEdit(category)}
                sx={{ mr: 1 }}
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
            </ListItem>
          ))}
        </List>

        {visibleCategories.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              backgroundColor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <Typography color="text.secondary" gutterBottom>
              No categories found
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              sx={{ mt: 1 }}
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

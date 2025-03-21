import React, { useMemo, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip,
  TablePagination, Box, Typography, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useExpense } from '../../../contexts/ExpenseContext';
import { format } from 'date-fns';
import { formatCurrency } from '../../../utils/currency';
import CategoryChip from '../../../components/shared/CategoryChip';
import { IExpense, IExpenseCategory } from '../../../types/expense.types';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';

interface GroupedExpense {
  categoryId: string;
  category: IExpenseCategory | undefined;
  expenses: IExpense[];
  totalAmount: number;
}

interface ExpenseListProps {
  pagination: {
    page: number;
    rowsPerPage: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
  };
  onEdit: (expense: IExpense) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ pagination, onEdit }) => {
  const { expenses, deleteExpense } = useExpense();
  const { page, rowsPerPage, onPageChange, onRowsPerPageChange } = pagination;

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; amount: number } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredExpenses = useMemo(() => {
    return expenses.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses]);

  const paginatedExpenses = useMemo(() => {
    return filteredExpenses.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredExpenses, page, rowsPerPage]);

  const groupedExpenses = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const categoryId = expense.category_id;
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: expense.category,
          expenses: [],
          totalAmount: 0
        };
      }
      acc[categoryId].expenses.push(expense);
      acc[categoryId].totalAmount += expense.amount;
      return acc;
    }, {} as Record<string, { 
      category: IExpenseCategory | undefined, 
      expenses: IExpense[], 
      totalAmount: number 
    }>);
  }, [expenses]);

  const sortedCategories = useMemo(() => {
    return Object.entries(groupedExpenses)
      .sort((a, b) => b[1].totalAmount - a[1].totalAmount);
  }, [groupedExpenses]);

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  const handleDeleteClick = (expense: IExpense) => {
    setDeleteConfirm({ id: expense.id, amount: expense.amount });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    setDeleteLoading(true);
    try {
      await deleteExpense(deleteConfirm.id);
      // Success handled by real-time update
    } catch (error) {
      console.error('Failed to delete expense:', error);
      // Show error through context or toast
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (expense: IExpense) => {
    onEdit(expense);
  };

  return (
    <>
      <Paper sx={{ width: '100%' }}>
        {sortedCategories.map(([categoryId, { category, expenses, totalAmount }]) => (
          <Box 
            key={categoryId}
            sx={{ 
              mb: 3,
              backgroundColor: theme => category ? `${category.color}08` : 'transparent'
            }}
          >
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: theme => category ? `${category.color}30` : 'divider'
              }}
            >
              <CategoryChip 
                category={category}
                size="medium"
                showAmount={true}
                amount={totalAmount}
                count={expenses.length}
              />
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Payment Mode</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map(expense => (
                    <TableRow 
                      key={expense.id} 
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <TableCell>
                        {format(new Date(expense.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <CategoryChip category={expense.category} />
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>
                        <Box 
                          component="span" 
                          sx={{ 
                            fontSize: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {expense.payment_mode === 'Cash' && '💵'}
                          {expense.payment_mode === 'Card' && '💳'}
                          {expense.payment_mode === 'UPI' && '📱'}
                          {expense.payment_mode === 'Other' && '💰'}
                          {expense.payment_mode}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(expense)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText',
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(expense)}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'error.light',
                                color: 'error.contrastText',
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
        <TablePagination
          component="div"
          count={filteredExpenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: 1,
            borderColor: 'divider',
          }}
        />
      </Paper>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense of ${deleteConfirm ? formatCurrency(deleteConfirm.amount) : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteLoading}
        type="danger"
      />
    </>
  );
};

export default ExpenseList;
